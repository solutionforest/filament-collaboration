<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Field;
use Filament\Forms\Components\TextInput;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;

class TextInputType implements FieldType, UsesAdapter
{
    public function supports(Field $field): bool
    {
        return $field instanceof TextInput;
    }

    public function getKind(Field $field): ?FieldKind
    {
        if (! $field instanceof TextInput || $field->isPassword()) {
            return null;
        }

        // Only these input types expose a caret, which merging by character needs.
        return match ($field->getType()) {
            'password', 'hidden', 'file' => null,
            'text', 'search', 'tel', 'url' => filled($field->getMask()) ? FieldKind::Value : FieldKind::Text,
            default => FieldKind::Value,
        };
    }

    /** Typed inputs through the text adapter, masked and other inputs through the value adapter. */
    public function getAdapter(Field $field): ?string
    {
        $kind = $this->getKind($field);

        return $kind === null ? null : FieldResolver::defaultAdapter($kind);
    }
}
