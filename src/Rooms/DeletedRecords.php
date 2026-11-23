<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Rooms;

use Illuminate\Contracts\Cache\Repository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomNotifier;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Documents\SharedUploads;
use SolutionForest\FilamentCollaboration\Presence\Identity;
use SolutionForest\FilamentCollaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Support\Database;
use Throwable;

/**
 * What happens to a room when its record is deleted.
 *
 * Everybody in the room is told at once, and learns who deleted it. A draft
 * of a record that is gone for good is deleted with its unsaved images; a
 * soft-deleted record keeps its draft, so restoring it loses nothing.
 */
final readonly class DeletedRecords
{
    private const KEY = 'filament-collaboration:deleted:';

    private const REMEMBER_FOR = 86_400;

    public function __construct(
        private RoomResolver $rooms,
        private RoomNotifier $notifier,
        private PresenceRepository $presence,
        private SharedUploads $uploads,
    ) {}

    /**
     * Listens to `eloquent.deleted: *`.
     *
     * @param  array<mixed>  $payload
     */
    public function handle(string $event, array $payload): void
    {
        foreach ($payload as $record) {
            if ($record instanceof Model) {
                $this->deleted($record);
            }
        }
    }

    public function deleted(Model $record): void
    {
        try {
            $room = $this->rooms->forRecord($record);
        } catch (Throwable) {
            // A model outside any panel: there is no room for it.
            return;
        }

        // Every deleted model passes here; only those with a room do anything.
        if (! Database::table('documents')->where('room', $room)->orWhere('parent_room', $room)->exists() && $this->presence->inRoom($room) === []) {
            return;
        }

        $isSoft = self::isSoftDeleting($record);

        self::cache()->put(self::KEY.$room, ['name' => Identity::current()?->name, 'soft' => $isSoft], self::REMEMBER_FOR);

        // After the commit, or a browser asking at once would still find the record.
        $record->getConnection()->afterCommit(function () use ($room, $isSoft): void {
            if (! $isSoft) {
                $this->forget($room);
            }

            $this->notifier->refresh($room);
        });
    }

    /**
     * Whether a room's record was deleted. Only called for a token that
     * proves its user had access to the record.
     *
     * @return array{name: string|null, restorable: bool}|null
     */
    public function lookup(RoomContext $context): ?array
    {
        $model = $context->model;

        if ($model === null || $context->key === null) {
            return null;
        }

        $remembered = Data::map(self::cache()->get(self::KEY.$context->room));
        // Without scopes: soft deletes and tenancy would hide it. The room check below stands in for them.
        $record = $model::query()->withoutGlobalScopes()->whereKey($context->key)->first();

        if ($record instanceof Model && ! self::isTrashed($record)) {
            return null;
        }

        if ($record instanceof Model && ! hash_equals($this->rooms->forRecord($record), $context->room)) {
            return null;
        }

        return [
            'name' => Data::nullableString($remembered['name'] ?? null),
            'restorable' => $record instanceof Model && $this->canRestore($context, $record),
        ];
    }

    /** Restores a soft-deleted record for someone who may. */
    public function restore(RoomContext $context): bool
    {
        $model = $context->model;

        if ($model === null || $context->key === null) {
            return false;
        }

        $record = $model::query()->withoutGlobalScopes()->whereKey($context->key)->first();

        if (! $record instanceof Model || ! self::isTrashed($record) || ! $this->canRestore($context, $record)) {
            return false;
        }

        if (! hash_equals($this->rooms->forRecord($record), $context->room) || ! method_exists($record, 'restore')) {
            return false;
        }

        $record->restore();
        self::cache()->forget(self::KEY.$context->room);
        $this->notifier->refresh($context->room);

        return true;
    }

    private function forget(string $room): void
    {
        // The record's draft and each of its languages', with the images only they had;
        // the record's own images are the application's to delete.
        $documents = Database::table('documents')->where('room', $room)->orWhere('parent_room', $room)->get(['id', 'room']);

        foreach ($documents as $document) {
            $document = Data::map($document);
            $this->uploads->discard(Data::string($document['room'] ?? null));
            Database::table('updates')->where('document_id', $document['id'] ?? null)->delete();
            Database::table('documents')->where('id', $document['id'] ?? null)->delete();
        }
    }

    private function canRestore(RoomContext $context, Model $record): bool
    {
        $resource = $context->resource;

        if ($resource !== null) {
            return $resource::canRestore($record);
        }

        return Gate::allows('restore', $record);
    }

    private static function isSoftDeleting(Model $record): bool
    {
        return in_array(SoftDeletes::class, class_uses_recursive($record), true)
            && method_exists($record, 'isForceDeleting')
            && ! $record->isForceDeleting();
    }

    private static function isTrashed(Model $record): bool
    {
        return method_exists($record, 'trashed') && $record->trashed() === true;
    }

    private static function cache(): Repository
    {
        return Cache::store(Data::nullableString(config('filament-collaboration.cache_store')));
    }
}
