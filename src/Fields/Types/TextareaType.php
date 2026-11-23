<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Field;
use Filament\Forms\Components\Textarea;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;

class TextareaType implements FieldType
{
    public function supports(Field $field): bool
    {
        return $field instanceof Textarea;
    }

    public function getKind(Field $field): FieldKind
    {
        return FieldKind::Text;
    }
}
