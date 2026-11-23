<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use Illuminate\Contracts\Cache\Repository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomNotifier;
use SolutionForest\FilamentCollaboration\Rooms\RoomResolver;
use SolutionForest\FilamentCollaboration\Support\Data;

/**
 * Call `Permissions::changed()` when who may edit which field changes, for
 * example after changing a role. Open tabs re-render and get a new token on
 * their next sync, instead of when the old one expires.
 */
final class Permissions
{
    private const KEY = 'filament-collaboration:permissions';

    /** Pass a record to refresh only the people editing it. */
    public static function changed(?Model $record = null): void
    {
        $room = $record === null ? null : app(RoomResolver::class)->forRecord($record);
        $cache = self::cache();

        $cache->forever(self::key($room), Data::int($cache->get(self::key($room))) + 1);

        if ($room !== null) {
            app(RoomNotifier::class)->refresh($room);
        }
    }

    /** What a token issued now must still match. */
    public static function version(string $room): string
    {
        $cache = self::cache();

        return Data::int($cache->get(self::key(null))).'.'.Data::int($cache->get(self::key($room)));
    }

    private static function key(?string $room): string
    {
        return self::KEY.($room === null ? '' : ':'.$room);
    }

    private static function cache(): Repository
    {
        return Cache::store(Data::nullableString(config('filament-collaboration.cache_store')));
    }
}
