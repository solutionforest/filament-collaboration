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
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Component;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;

/**
 * Repeaters and builders whose items hold simple values. Items with uploads,
 * rich text or nested lists merge on save instead.
 */
class ItemsType implements FieldType, UsesAdapter
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
        $fields = self::subFields($field);

        return $fields === null ? null : array_values(array_unique(array_keys($fields)));
    }

    /**
     * The sub-field paths that merge by character, as a text input or textarea
     * outside a list would. A path that is text in one block and not in
     * another takes the latest value instead.
     *
     * @return list<string>
     */
    public static function textPaths(Field $field): array
    {
        $texts = [];
        $values = [];

        foreach (self::subFieldList($field) ?? [] as [$path, $subField]) {
            $isText = $subField instanceof Textarea || ($subField !== null && (new TextInputType)->getKind($subField) === FieldKind::Text);

            if ($isText) {
                $texts[$path] = true;
            } else {
                $values[$path] = true;
            }
        }

        return array_map(strval(...), array_keys(array_diff_key($texts, $values)));
    }

    /** @return array<string, Field|null>|null */
    private static function subFields(Field $field): ?array
    {
        $list = self::subFieldList($field);

        return $list === null ? null : array_column($list, 1, 0);
    }

    /** @return list<array{string, Field|null}>|null the block type has no field of its own */
    private static function subFieldList(Field $field): ?array
    {
        if ($field instanceof Repeater) {
            $simple = $field->getSimpleField();

            if ($simple !== null) {
                return self::isShareable($simple) ? [['', $simple]] : null;
            }

            return self::childFields($field->getChildComponents(), '');
        }

        if (! $field instanceof Builder) {
            return null;
        }

        $fields = [];

        foreach ($field->getBlocks() as $block) {
            $blockFields = self::childFields($block->getChildComponents(), 'data.');

            if ($blockFields === null) {
                return null;
            }

            array_push($fields, ...$blockFields);
        }

        // The block type is picked, never typed.
        return [['type', null], ...$fields];
    }

    /**
     * @param  array<mixed>  $components
     * @return list<array{string, Field}>|null
     */
    private static function childFields(array $components, string $prefix): ?array
    {
        $fields = [];

        foreach ($components as $component) {
            if ($component instanceof Field) {
                if (! self::isShareable($component)) {
                    return null;
                }

                $fields[] = [$prefix.$component->getStatePath(isAbsolute: false), $component];

                continue;
            }

            if (! $component instanceof Component) {
                continue;
            }

            // A layout component, such as a grid or a group with its own state path.
            $nested = $component->getStatePath(isAbsolute: false);
            $childFields = self::childFields($component->getChildComponents(), $prefix.(blank($nested) ? '' : $nested.'.'));

            if ($childFields === null) {
                return null;
            }

            array_push($fields, ...$childFields);
        }

        return $fields === [] ? null : $fields;
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

    public function getAdapter(Field $field): string
    {
        return 'filament-repeater';
    }
}
