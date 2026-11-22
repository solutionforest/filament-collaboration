<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Support;

use Illuminate\Database\ConnectionInterface;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

/** @internal */
final class Database
{
    public static function connection(): ConnectionInterface
    {
        return DB::connection(Data::nullableString(config('filament-collaboration.connection')));
    }

    public static function table(string $table): Builder
    {
        return self::connection()->table('filament_collaboration_'.$table);
    }
}
