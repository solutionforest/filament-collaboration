<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Enums;

/** How a field is shared while several people edit it. */
enum FieldKind: string
{
    /** Characters merge individually. */
    case Text = 'text';

    /** Characters, blocks and formatting merge individually. */
    case RichText = 'rich';

    /** The whole value is replaced by the most recent change. */
    case Value = 'value';

    /** Repeaters and builders: items merge like text, each sub-field by latest value. */
    case Items = 'items';

    /**
     * The JavaScript adapter of Filament's own fields of this kind, used when a
     * field type names none.
     */
    public function defaultAdapter(): string
    {
        return match ($this) {
            self::Text => 'filament-text-input',
            self::RichText => 'filament-rich-editor',
            self::Value => 'filament-value',
            self::Items => 'filament-repeater',
        };
    }
}
