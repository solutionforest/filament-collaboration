<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        PresenceStore::resolveRoomUsing(function (Model $record): string {
            $workspace = $record->getAttribute('workspace_id');
            $workspaceKey = is_string($workspace) || is_int($workspace) || is_float($workspace)
                ? (string) $workspace
                : 'central';

            return $workspaceKey.':'.$record->getMorphClass().':'.PresenceStore::stringifyKey($record->getKey());
        });
    }
}
