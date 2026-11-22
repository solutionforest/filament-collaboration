<?php

namespace App\Providers;

use App\Models\Document;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\ServiceProvider;
use ThirdParty\Collab\Presence\PresenceStore;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        PresenceStore::resolveRoomUsing(function (Model $record): string {
            $database = $record->getConnection()->getDatabaseName();
            if (! $record instanceof Document) {
                throw new \LogicException('No collaboration room is configured for this model.');
            }
            $workspace = $record->workspace_id;

            $key = $record->getKey();
            if (! is_int($key) && ! is_string($key)) {
                throw new \LogicException('A persisted record with a scalar key is required.');
            }

            return $database.'|'.$workspace.'|'.$record->getMorphClass().':'.$key;
        });
    }
}
