<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Contracts;

use Filament\Forms\Components\Field;
use SolutionForest\Collaboration\Enums\FieldKind;

/** Register with `CollaborationPlugin::make()->fieldTypes([...])`. */
interface FieldType
{
    public function supports(Field $field): bool;

    /** Null leaves the field to merge when the form is saved. */
    public function getKind(Field $field): ?FieldKind;
}
