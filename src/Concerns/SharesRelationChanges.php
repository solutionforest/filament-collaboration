<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Filament\Actions\ViewAction;
use Filament\Support\Components\Attributes\Exposed;
use Livewire\Attributes\On;
use SolutionForest\FilamentCollaboration\Rooms\RelationVersions;
use SolutionForest\FilamentCollaboration\Rooms\RoomResolver;
use Throwable;

/**
 * For a relation manager on a collaborative page: what one person changes in
 * it shows in everybody else's copy of the page, without reloading.
 */
trait SharesRelationChanges
{
    /** @param array<string, mixed> $arguments */
    public function callMountedAction(array $arguments = []): mixed
    {
        $action = $this->getMountedAction();
        $result = parent::callMountedAction($arguments);

        if ($action !== null && ! $action instanceof ViewAction) {
            $this->shareRelationChanges();
        }

        return $result;
    }

    public function updateTableColumnState(string $column, string $record, mixed $input): mixed
    {
        $result = parent::updateTableColumnState($column, $record, $input);

        $this->shareRelationChanges();

        return $result;
    }

    /** Somebody changed related records: render again, with the table's records fetched anew. */
    #[On('filament-collaboration-relations-changed')]
    #[Exposed]
    public function refreshSharedRelations(): void
    {
        $this->flushCachedTableRecords();
    }

    protected function shareRelationChanges(): void
    {
        try {
            $room = app(RoomResolver::class)->forRecord($this->getOwnerRecord());
        } catch (Throwable) {
            return;
        }

        app(RelationVersions::class)->touch($room);
    }
}
