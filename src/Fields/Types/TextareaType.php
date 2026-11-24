<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Field;
use Filament\Forms\Components\Textarea;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;

class TextareaType implements FieldType, UsesAdapter
{
    public function supports(Field $field): bool
    {
        return $field instanceof Textarea;
    }

    public function getKind(Field $field): FieldKind
    {
        return FieldKind::Text;
    }

    public function getAdapter(Field $field): string
    {
        return 'filament-text-input';
    }
}
