<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Support;

use Filament\Resources\Resource;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\Collaboration\Support\Data;

/**
 * Asks any Livewire component what it is showing.
 *
 * @internal
 */
final class PageInspector
{
    public static function record(object $page): ?Model
    {
        $callback = [$page, 'getRecord'];
        $record = method_exists($page, 'getRecord') && is_callable($callback) ? $callback() : null;

        return $record instanceof Model && $record->exists ? $record : null;
    }

    /** @return class-string<resource>|null */
    public static function resource(object $page): ?string
    {
        $callback = [$page, 'getResource'];
        $resource = method_exists($page, 'getResource') && is_callable($callback) ? Data::string($callback()) : '';

        return is_subclass_of($resource, Resource::class) ? $resource : null;
    }
}
