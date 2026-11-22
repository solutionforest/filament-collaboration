<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Rooms;

use Filament\Facades\Filament;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Support\Data;

/** Room ids are opaque and include the database, so tenant databases cannot collide. */
final class RoomResolver
{
    public function forRecord(Model $record): string
    {
        return hash('sha256', Data::encode([
            'record',
            CollaborationPlugin::find()?->getRoomScope($record),
            $record->getConnection()->getDatabaseName(),
            $record->getTable(),
            $record->getMorphClass(),
            Data::string($record->getKey()),
        ]));
    }

    /** @param class-string $subject a resource or a page */
    public function forScope(string $subject): string
    {
        $tenant = Filament::getTenant();

        return hash('sha256', Data::encode([
            'scope',
            CollaborationPlugin::find()?->getRoomScope(),
            $subject,
            $tenant === null ? null : Data::string($tenant->getKey()),
        ]));
    }
}
