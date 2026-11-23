<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Http\Controllers;

use Filament\Facades\Filament;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use SolutionForest\FilamentCollaboration\Broadcasting\Audience;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomNotifier;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Crdt\Id;
use SolutionForest\FilamentCollaboration\Crdt\InvalidOperation;
use SolutionForest\FilamentCollaboration\Documents\Contributor;
use SolutionForest\FilamentCollaboration\Documents\DocumentRepository;
use SolutionForest\FilamentCollaboration\Documents\DraftUpdate;
use SolutionForest\FilamentCollaboration\Documents\EditTrail;
use SolutionForest\FilamentCollaboration\Documents\Fingerprint;
use SolutionForest\FilamentCollaboration\Enums\PresenceChange;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Permissions;
use SolutionForest\FilamentCollaboration\Presence\Identity;
use SolutionForest\FilamentCollaboration\Presence\Participant;
use SolutionForest\FilamentCollaboration\Rooms\DeletedRecords;
use SolutionForest\FilamentCollaboration\Rooms\RoomAuthorizer;
use SolutionForest\FilamentCollaboration\Rooms\RoomContext;
use SolutionForest\FilamentCollaboration\Support\Data;

/** Push, pull and heartbeat in one request. */
final readonly class SyncController
{
    private const MAX_BYTES = 2_000_000;

    private const MAX_REPORTS = 3;

    private const MAX_REPORT_BYTES = 20_000;

    public function __construct(
        private RoomAuthorizer $authorizer,
        private DocumentRepository $documents,
        private PresenceRepository $presence,
        private RoomNotifier $notifier,
        private DeletedRecords $deletions,
        private EditTrail $trail,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        // One push per request, whatever changed.
        return $this->notifier->batch(fn (): JsonResponse => $this->sync($request));
    }

    private function sync(Request $request): JsonResponse
    {
        $body = $request->getContent();

        if (strlen($body) > self::MAX_BYTES) {
            return new JsonResponse(['error' => 'too_large'], 413);
        }

        // Not `$request->input()`: Laravel would trim typed spaces and turn "" into null.
        $input = Data::decode($body);
        $token = $input['token'] ?? null;

        // Not JSON PHP can read, or damaged on the way. The browser keeps its edits and retries.
        if (! is_string($token)) {
            return new JsonResponse(['error' => 'malformed'], 400);
        }

        $context = RoomContext::fromToken($token);

        if ($context === null || ! $context->belongsTo(Filament::auth()->user())) {
            return new JsonResponse(['error' => 'forbidden'], 403);
        }

        $access = $context->hasExpired() ? null : $this->authorizer->authorize($context);
        $identity = Identity::current();

        if ($access === null || ! $access->isGranted || $identity === null) {
            // The token proves this user could open the record, so they may learn it was deleted.
            $deleted = $this->deletions->lookup($context);

            if ($deleted !== null) {
                if ($access !== null && ($input['restore'] ?? false) === true && $this->deletions->restore($context)) {
                    return new JsonResponse(['restored' => true]);
                }

                return new JsonResponse(['error' => 'deleted', 'name' => $deleted['name'], 'restorable' => $deleted['restorable']], 404);
            }

            if ($access === null) {
                return new JsonResponse(['error' => 'expired'], 410);
            }

            // The same answer whether the record is gone from this user's reach or is somebody else's.
            return new JsonResponse(['error' => 'not_found'], 404);
        }

        $this->report($context, $identity, Data::list($input['problems'] ?? null));

        // The policy's `collaborate` ability changed: render again, without live fields.
        if ($context->fields !== [] && $access->record !== null && ! Permissions::mayCollaborate($access->record)) {
            return new JsonResponse(['error' => 'expired'], 410);
        }

        $resumed = $this->resume($context, $access->record, Data::map($input['resume'] ?? null));
        $epoch = Data::int($input['epoch'] ?? null);

        try {
            if ($context->mode === PresenceMode::Editing && $context->fields !== []) {
                $changed = $this->documents->receive($context->room, $context->client, $epoch, Data::list($input['batches'] ?? null), $context->fields, $context->allowed, $user = Filament::auth()->user());
                $this->audit($context, $access->record, $user, $changed);
            }
        } catch (InvalidOperation $exception) {
            return new JsonResponse(['error' => 'rejected', 'message' => $exception->getMessage()], 409);
        }

        if (($input['leave'] ?? false) === true) {
            $this->presence->leave($context->room, $context->client);
            $this->notifier->presenceChanged($context->room, $context->scope, PresenceChange::People);

            return new JsonResponse(['left' => true]);
        }

        $field = Data::nullableString($input['field'] ?? null);
        $field = in_array($field, $context->visible, true) ? $field : null;

        $change = $this->presence->touch($participant = new Participant(
            room: $context->room,
            scope: $context->scope,
            client: $context->client,
            userKey: $identity->key,
            name: $identity->name,
            avatar: $identity->avatar,
            mode: $context->mode,
            field: $field,
            cursor: $field !== null && isset($context->fields[$field]) ? $this->cursor($input['cursor'] ?? null) : null,
            idle: ($input['idle'] ?? false) === true,
            audience: Audience::of($context),
        ));

        $this->notifier->presenceChanged($context->room, $context->scope, $change, $participant);

        $update = $context->key === null
            ? new DraftUpdate
            : $this->documents->changesSince(
                $context->room,
                $context->client,
                $epoch,
                Data::int($input['since'] ?? null, -1),
                array_map(strval(...), array_keys($context->fields)),
            );

        [$people, $total] = $this->people($context, $identity);
        $etag = sha1(Data::encode([$people, $total]));

        return new JsonResponse([
            'resumed' => $resumed,
            'epoch' => $update->epoch,
            'sequence' => $update->sequence,
            'state' => $update->state,
            'acknowledged' => $update->acknowledged,
            'operations' => $update->operations,
            'dirty' => $update->dirty,
            'revision' => $access->record === null ? null : sha1($update->version.Fingerprint::record($access->record)),
            'saved' => ['version' => $update->version, 'name' => $update->savedByName, 'own' => $update->savedByClient === $context->client],
            'presence' => $etag,
            'people' => ($input['presence'] ?? null) === $etag ? null : $people,
            'total' => $total,
        ]);
    }

    /** @param list<string> $fields */
    private function audit(RoomContext $context, ?Model $record, ?Authenticatable $user, array $fields): void
    {
        if ($fields !== [] && $record !== null && $user !== null && CollaborationPlugin::get()->isAuditing()) {
            $this->trail->record($context->room, $record, Contributor::of($user), $fields);
        }
    }

    /**
     * Editor errors the browser recovered from, for developers to replay.
     *
     * @param  list<mixed>  $problems
     */
    private function report(RoomContext $context, Identity $identity, array $problems): void
    {
        if ($problems === [] || ! CollaborationPlugin::get()->reportsEditorErrors()) {
            return;
        }

        foreach (array_slice($problems, 0, self::MAX_REPORTS) as $problem) {
            $problem = Data::map($problem);
            $field = Data::string($problem['field'] ?? null);

            // Only fields this editor can write: the log must not take anything else.
            if (! isset($context->fields[$field]) || strlen(Data::encode($problem)) > self::MAX_REPORT_BYTES) {
                continue;
            }

            // A browser in a loop must not fill the log.
            if (! RateLimiter::attempt('filament-collaboration:report:'.$identity->key, 20, static fn (): bool => true, 3600)) {
                return;
            }

            Log::warning('[filament-collaboration] An editor recovered from an error.', [
                'room' => $context->room,
                'resource' => $context->resource,
                'record' => $context->key,
                'user' => $identity->key,
                'field' => $field,
                'error' => Data::string($problem['error'] ?? null),
                'pressed' => Data::nullableString($problem['key'] ?? null),
                'selection' => $problem['selection'] ?? null,
                'document' => $problem['doc'] ?? null,
            ]);
        }
    }

    /**
     * Edits that a previous page load could not send. The old token only
     * proves which editor made them; permissions are those of the new one.
     *
     * @param  array<string, mixed>  $resume
     */
    private function resume(RoomContext $context, ?Model $record, array $resume): ?bool
    {
        if ($resume === []) {
            return null;
        }

        $earlier = RoomContext::fromToken(Data::string($resume['token'] ?? null));

        if ($earlier === null || ! $context->canResume($earlier)) {
            return false;
        }

        try {
            $changed = $this->documents->receive(
                $context->room,
                $earlier->client,
                Data::int($resume['epoch'] ?? null),
                Data::list($resume['batches'] ?? null),
                array_intersect_key($context->fields, $earlier->fields),
                $context->allowed,
                $user = Filament::auth()->user(),
            );
        } catch (InvalidOperation) {
            return false;
        }

        $this->audit($context, $record, $user, $changed);

        return true;
    }

    /** @return array{list<array<string, mixed>>, int} */
    private function people(RoomContext $context, Identity $identity): array
    {
        $isRecord = $context->key !== null;
        $participants = $isRecord || $context->scope === null
            ? $this->presence->inRoom($context->room)
            : $this->presence->inScope($context->scope);

        $colors = CollaborationPlugin::get()->getPalette()->assign(
            array_map(static fn (Participant $participant): string => $participant->userKey, $participants),
        );
        $people = [];
        $users = [];

        foreach ($participants as $participant) {
            if ($participant->client === $context->client && $participant->room === $context->room) {
                continue;
            }

            $isSelf = $participant->userKey === $identity->key;

            if (! $isSelf) {
                $users[$participant->userKey] = true;
            }

            // A field or cursor in a field this user cannot see would give that field away.
            $canSeeField = $isRecord && in_array($participant->field, $context->visible, true);

            $people[] = [
                'client' => $participant->client,
                'key' => $participant->userKey,
                'name' => $participant->name,
                'initials' => $participant->initials(),
                'avatar' => $participant->avatar,
                'color' => $colors[$participant->userKey],
                'mode' => $participant->mode->value,
                'field' => $canSeeField ? $participant->field : null,
                'cursor' => $canSeeField && isset($context->fields[(string) $participant->field]) ? $participant->cursor : null,
                'idle' => $participant->idle,
                'self' => $isSelf,
            ];
        }

        return [$people, count($users)];
    }

    /** @return array<string, mixed>|null */
    private function cursor(mixed $cursor): ?array
    {
        if (! is_array($cursor) || ! array_key_exists('anchor', $cursor) || ! array_key_exists('head', $cursor)) {
            return null;
        }

        try {
            $clean = [
                'anchor' => $cursor['anchor'] === null ? null : Id::from($cursor['anchor'])->toArray(),
                'head' => $cursor['head'] === null ? null : Id::from($cursor['head'])->toArray(),
            ];
        } catch (InvalidOperation) {
            return null;
        }

        // In a list: which item's sub-field the caret is in.
        $item = $cursor['item'] ?? null;
        $path = $cursor['path'] ?? null;

        if (is_string($item) && is_string($path) && preg_match('/^[A-Za-z0-9_-]{1,64}$/D', $item) === 1 && preg_match('/^[A-Za-z0-9_.-]{0,255}$/D', $path) === 1) {
            $clean += ['item' => $item, 'path' => $path];
        }

        return $clean;
    }
}
