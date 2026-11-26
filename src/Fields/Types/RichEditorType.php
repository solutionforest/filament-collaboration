<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Field;
use Filament\Forms\Components\RichEditor;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;

class RichEditorType implements FieldType, UsesAdapter
{
    public function supports(Field $field): bool
    {
        return $field instanceof RichEditor;
    }

    public function getKind(Field $field): ?FieldKind
    {
        if (! $field instanceof RichEditor) {
            return null;
        }

        // These add nodes whose HTML would be rendered in other people's browsers.
        return $field->getPlugins() === [] && $field->getCustomBlocks() === [] && $field->getMentionProviders() === []
            ? FieldKind::RichText
            : null;
    }

    public function getAdapter(Field $field): string
    {
        return 'filament-rich-editor';
    }
}
