<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Contracts;

use Filament\Forms\Components\Field;

/**
 * A field type whose field is edited in the browser through a JavaScript
 * adapter, registered with `filamentCollaboration.registerAdapter(name, ...)`.
 * Filament's own types implement it too: `filament-text-input`,
 * `filament-rich-editor`, `filament-value`.
 */
interface UsesAdapter
{
    /** The adapter's name, or null for the default adapter of the field's kind. */
    public function getAdapter(Field $field): ?string;
}
