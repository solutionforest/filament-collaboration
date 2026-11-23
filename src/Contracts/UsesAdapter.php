<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Contracts;

use Filament\Forms\Components\Field;

/**
 * A field type whose field is edited in the browser through a JavaScript
 * adapter, registered with `filamentCollaboration.registerAdapter(name, ...)`.
 */
interface UsesAdapter
{
    /** The adapter's name, or null to use the built-in bindings. */
    public function getAdapter(Field $field): ?string;
}
