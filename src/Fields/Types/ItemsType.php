<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Builder;
use Filament\Forms\Components\CodeEditor;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Component;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;

/**
 * Repeaters and builders whose items hold simple values. Items with uploads,
 * rich text or nested lists merge on save instead.
 */
class ItemsType implements FieldType
{
    /** @var list<class-string<Field>> */
    private const NOT_SHAREABLE = [Builder::class, CodeEditor::class, FileUpload::class, KeyValue::class, MarkdownEditor::class, Repeater::class, RichEditor::class];

    public function supports(Field $field): bool
    {
        return $field instanceof Repeater || $field instanceof Builder;
    }

    public function getKind(Field $field): ?FieldKind
    {
        return self::paths($field) === null ? null : FieldKind::Items;
    }

    /**
     * The sub-field paths an item may have, or null if they cannot be shared.
     *
     * @return list<string>|null
     */
    public static function paths(Field $field): ?array
    {
        if ($field instanceof Repeater) {
            if ($field->getSimpleField() !== null) {
                return self::isShareable($field->getSimpleField()) ? [''] : null;
            }

            return self::childPaths($field->getChildComponents(), '');
        }

        if (! $field instanceof Builder) {
            return null;
        }

        $paths = ['type'];

        foreach ($field->getBlocks() as $block) {
            $blockPaths = self::childPaths($block->getChildComponents(), 'data.');

            if ($blockPaths === null) {
                return null;
            }

            array_push($paths, ...$blockPaths);
        }

        return array_values(array_unique($paths));
    }

    /**
     * @param  array<mixed>  $components
     * @return list<string>|null
     */
    private static function childPaths(array $components, string $prefix): ?array
    {
        $paths = [];

        foreach ($components as $component) {
            if ($component instanceof Field) {
                if (! self::isShareable($component)) {
                    return null;
                }

                $paths[] = $prefix.$component->getStatePath(isAbsolute: false);

                continue;
            }

            if (! $component instanceof Component) {
                continue;
            }

            // A layout component, such as a grid or a group with its own state path.
            $nested = $component->getStatePath(isAbsolute: false);
            $childPaths = self::childPaths($component->getChildComponents(), $prefix.(blank($nested) ? '' : $nested.'.'));

            if ($childPaths === null) {
                return null;
            }

            array_push($paths, ...$childPaths);
        }

        return $paths === [] ? null : $paths;
    }

    private static function isShareable(Field $field): bool
    {
        foreach (self::NOT_SHAREABLE as $class) {
            if ($field instanceof $class) {
                return false;
            }
        }

        return ! ($field instanceof TextInput && $field->isPassword());
    }
}
