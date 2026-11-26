<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Field;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;

/**
 * Fields edited through a JavaScript adapter, such as a third-party editor:
 *
 *     AdapterType::make([TinyEditor::class], adapter: 'tinymce', kind: FieldKind::RichText)
 *
 * Text merges by character, RichText by character, block and mark (the
 * adapter reads and writes HTML), Value takes the latest change.
 */
class AdapterType implements FieldType, UsesAdapter
{
    /** @param list<class-string<Field>> $components */
    final public function __construct(
        private readonly array $components,
        private readonly string $adapter,
        private readonly FieldKind $kind,
    ) {}

    /** @param list<class-string<Field>> $components */
    public static function make(array $components, string $adapter, FieldKind $kind = FieldKind::Text): static
    {
        return new static($components, $adapter, $kind);
    }

    public function supports(Field $field): bool
    {
        foreach ($this->components as $component) {
            if ($field instanceof $component) {
                return true;
            }
        }

        return false;
    }

    public function getKind(Field $field): ?FieldKind
    {
        return $this->kind;
    }

    public function getAdapter(Field $field): ?string
    {
        return $this->adapter;
    }
}
