<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields\Types;

use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Slider;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ToggleButtons;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;

/**
 * Fields picked rather than typed. Share your own with
 * `ValueType::make([StarRating::class])`.
 */
class ValueType implements FieldType, UsesAdapter
{
    /** @param list<class-string<Field>> $components */
    final public function __construct(private readonly array $components) {}

    /** @param list<class-string<Field>> $components */
    public static function make(array $components): static
    {
        return new static($components);
    }

    public static function defaults(): static
    {
        return new static([
            Checkbox::class,
            CheckboxList::class,
            ColorPicker::class,
            DateTimePicker::class, // also DatePicker and TimePicker
            Radio::class,
            Select::class,
            Slider::class,
            TagsInput::class,
            Toggle::class,
            ToggleButtons::class,
        ]);
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
        return $this->dependsOnWhoIsLooking($field) ? null : FieldKind::Value;
    }

    /**
     * A draft must mean the same to every editor. If two people could load
     * different state for one value, each opening would "correct" the other's.
     */
    private function dependsOnWhoIsLooking(Field $field): bool
    {
        // A personal timezone changes the string that stands for one moment.
        if ($field instanceof DateTimePicker && $field->getTimezone() !== config('app.timezone')) {
            return true;
        }

        if ($field->getMeta(FieldResolver::META_KEY) !== null) {
            return false; // `->collaborative()` says it is the same for everybody.
        }

        // A many-to-many loads through `modifyQueryUsing()`, often scoped to the user.
        return ($field instanceof Select && $field->isMultiple() && $field->hasRelationship())
            || ($field instanceof CheckboxList && filled($field->getRelationshipName()));
    }

    public function getAdapter(Field $field): string
    {
        return 'filament-value';
    }
}
