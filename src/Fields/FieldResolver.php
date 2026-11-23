<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields;

use Closure;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\Select;
use Filament\Schemas\Schema;
use Illuminate\Contracts\Support\Htmlable;
use LogicException;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Support\FormState;

/** Decides what is live in a form. */
final readonly class FieldResolver
{
    public const META_KEY = 'collaborative';

    /** @param list<FieldType> $types the first match wins */
    public function __construct(private array $types) {}

    /** Backs the `collaborative()` method on every field. */
    public static function markField(mixed $field, bool|Closure $condition): Field
    {
        if (! $field instanceof Field) {
            throw new LogicException('collaborative() may only be called on a field.');
        }

        return $field->meta(self::META_KEY, $condition);
    }

    /**
     * Every field with a live kind, visible or not, so the draft is complete.
     *
     * @param  list<string>  $ignored
     * @return array<string, FieldKind>
     */
    public function shareable(Schema $schema, array $ignored = []): array
    {
        $kinds = [];

        foreach (FormState::fields($schema, $ignored) as $path => $field) {
            if (($kind = $this->kindOf($field)) !== null) {
                $kinds[(string) $path] = $kind;
            }
        }

        return $kinds;
    }

    /**
     * What this user may read and write in the draft: only what they can edit.
     *
     * @param  list<string>  $ignored
     * @return array<string, FieldKind>
     */
    public function writable(Schema $schema, array $ignored = []): array
    {
        $kinds = [];

        foreach (FormState::fields($schema, $ignored, withHidden: false) as $path => $field) {
            if ($field->isDisabled() || ! self::isSaved($field)) {
                continue;
            }

            if (($kind = $this->kindOf($field)) !== null) {
                $kinds[(string) $path] = $kind;
            }
        }

        return $kinds;
    }

    /** @return array<string, string> */
    public function labels(Schema $schema): array
    {
        $labels = [];

        foreach (FormState::fields($schema, withHidden: false) as $path => $field) {
            $label = $field->getLabel();
            $labels[(string) $path] = trim(strip_tags($label instanceof Htmlable ? $label->toHtml() : (string) $label));
        }

        return $labels;
    }

    private static function isSaved(Field $field): bool
    {
        // A multiple select with a relationship is saved, but never dehydrated.
        return $field->isDehydrated() || ($field instanceof Select && $field->hasRelationship());
    }

    private function kindOf(Field $field): ?FieldKind
    {
        $condition = $field->getMeta(self::META_KEY);

        if ($condition !== null && ! (bool) $field->evaluate($condition)) {
            return null;
        }

        foreach ($this->types as $type) {
            if ($type->supports($field)) {
                return $type->getKind($field);
            }
        }

        return null;
    }
}
