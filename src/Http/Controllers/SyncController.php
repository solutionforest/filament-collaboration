<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Http\Controllers;

use Filament\Facades\Filament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use SolutionForest\FilamentCollaboration\Broadcasting\Audience;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomNotifier;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Crdt\Id;
use SolutionForest\FilamentCollaboration\Crdt\InvalidOperation;
use SolutionForest\FilamentCollaboration\Documents\DocumentRepository;
use SolutionForest\FilamentCollaboration\Documents\DraftUpdate;
use SolutionForest\FilamentCollaboration\Documents\Fingerprint;
use SolutionForest\FilamentCollaboration\Enums\PresenceChange;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Presence\Identity;
use SolutionForest\FilamentCollaboration\Presence\Participant;
use SolutionForest\FilamentCollaboration\Rooms\RoomAuthorizer;
use SolutionForest\FilamentCollaboration\Rooms\RoomContext;
use SolutionForest\FilamentCollaboration\Support\Data;

/** Push, pull and heartbeat in one request. */
final readonly class SyncController
{
    private const MAX_BYTES = 2_000_000;

    public function __construct(
        private RoomAuthorizer $authorizer,
        private DocumentRepository $documents,
        private PresenceRepository $presence,
        private RoomNotifier $notifier,
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

        if ($context->hasExpired()) {
            return new JsonResponse(['error' => 'expired'], 410);
        }

        $access = $this->authorizer->authorize($context);
        $identity = Identity::current();

        if (! $access->isGranted || $identity === null) {
            // The same answer whether the record is missing or is somebody else's.
            return new JsonResponse(['error' => 'not_found'], 404);
        }

        $resumed = $this->resume($context, Data::map($input['resume'] ?? null));
        $epoch = Data::int($input['epoch'] ?? null);

        try {
            if ($context->mode === PresenceMode::Editing && $context->fields !== []) {
                $this->documents->receive($context->room, $context->client, $epoch, Data::list($input['batches'] ?? null), $context->fields, $context->allowed);
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

    /**
     * Edits that a previous page load could not send. The old token only
     * proves which editor made them; permissions are those of the new one.
     *
     * @param  array<string, mixed>  $resume
     */
    private function resume(RoomContext $context, array $resume): ?bool
    {
        if ($resume === []) {
            return null;
        }

        $earlier = RoomContext::fromToken(Data::string($resume['token'] ?? null));

        if ($earlier === null || ! $context->canResume($earlier)) {
            return false;
        }

        try {
            $this->documents->receive(
                $context->room,
                $earlier->client,
                Data::int($resume['epoch'] ?? null),
                Data::list($resume['batches'] ?? null),
                array_intersect_key($context->fields, $earlier->fields),
                $context->allowed,
            );
        } catch (InvalidOperation) {
            return false;
        }

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
            return [
                'anchor' => $cursor['anchor'] === null ? null : Id::from($cursor['anchor'])->toArray(),
                'head' => $cursor['head'] === null ? null : Id::from($cursor['head'])->toArray(),
            ];
        } catch (InvalidOperation) {
            return null;
        }
    }
}
