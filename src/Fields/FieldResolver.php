<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Fields;

use Closure;
use Filament\Forms\Components\Checkbox;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Facades\Gate;
use Livewire\Component;
use LogicException;
use ReflectionFunction;
use ReflectionNamedType;
use ReflectionObject;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Contracts\UsesAdapter;
use SolutionForest\FilamentCollaboration\Fields\Types\ItemsType;
use SolutionForest\FilamentCollaboration\Fields\Types\UploadType;
use SolutionForest\FilamentCollaboration\Support\FormState;
use Throwable;

/** Decides what is live in a form. */
final readonly class FieldResolver
{
    public const META_KEY = 'collaborative';

    public const LOCK_META_KEY = 'collaborationLock';

    public const ADAPTER_META_KEY = 'collaborationAdapter';

    private const MAX_OPTIONS = 500;

    /** @param list<FieldType> $types the first match wins */
    public function __construct(private array $types) {}

    /**
     * Backs the `collaborative()` method on every field. A string is a Gate
     * ability: the field is shared, but only those it allows edit it live.
     */
    public static function markField(mixed $field, bool|Closure|string $condition): Field
    {
        if (! $field instanceof Field) {
            throw new LogicException('collaborative() may only be called on a field.');
        }

        return $field->meta(self::META_KEY, $condition);
    }

    /**
     * `->collaborative(adapter: 'tinymce', as: FieldKind::RichText)`: edit this
     * field through a JavaScript adapter.
     */
    public static function markAdapter(Field $field, string $adapter, FieldKind $kind): Field
    {
        return $field->meta(self::ADAPTER_META_KEY, [$adapter, $kind]);
    }

    /**
     * The JavaScript adapter each live field is edited through, if any.
     *
     * @param  array<string, FieldKind>  $live
     * @return array<string, string>
     */
    public function adapters(Schema $schema, array $live): array
    {
        $adapters = [];

        foreach (FormState::fields($schema, withHidden: false) as $path => $field) {
            $path = (string) $path;

            // Every live field goes through an adapter, Filament's own too: named by its type, or by its kind.
            if (isset($live[$path])) {
                $adapters[$path] = $this->adapterOf($field) ?? self::defaultAdapter($live[$path]);
            }
        }

        return $adapters;
    }

    /**
     * The live fields whose items are uploaded files.
     *
     * @param  array<string, FieldKind>  $live
     * @return list<string>
     */
    public function uploads(Schema $schema, array $live): array
    {
        $uploads = [];

        foreach (FormState::fields($schema) as $path => $field) {
            if (($live[(string) $path] ?? null) === FieldKind::Items && $field instanceof FileUpload) {
                $uploads[] = (string) $path;
            }
        }

        return $uploads;
    }

    /**
     * Rich text fields edited through an adapter hold HTML; the draft holds a document.
     *
     * @param  array<string, FieldKind>  $kinds
     * @return list<string>
     */
    public function htmlFields(Schema $schema, array $kinds): array
    {
        $fields = [];

        foreach (FormState::fields($schema) as $path => $field) {
            $path = (string) $path;

            // Filament's own rich editor keeps its document; other editors' adapters hand over HTML.
            if (($kinds[$path] ?? null) === FieldKind::RichText && ! $field instanceof RichEditor && $this->adapterOf($field) !== null) {
                $fields[] = $path;
            }
        }

        return $fields;
    }

    private function adapterOf(Field $field): ?string
    {
        $marked = $field->getMeta(self::ADAPTER_META_KEY);

        if (is_array($marked) && is_string($marked[0] ?? null)) {
            return $marked[0];
        }

        foreach ($this->types as $type) {
            if ($type->supports($field)) {
                return $type instanceof UsesAdapter ? $type->getAdapter($field) : null;
            }
        }

        return null;
    }

    /** Backs the `lockWhileEditing()` method on every field. */
    public static function markLock(mixed $field, bool $condition): Field
    {
        if (! $field instanceof Field) {
            throw new LogicException('lockWhileEditing() may only be called on a field.');
        }

        return $field->meta(self::LOCK_META_KEY, $condition);
    }

    /**
     * The visible fields that are not live and lock while somebody is in them.
     *
     * @param  array<string, FieldKind>  $live
     * @return list<string>
     */
    public function lockable(Schema $schema, array $live, bool $byDefault): array
    {
        $locks = [];

        foreach (FormState::fields($schema, withHidden: false) as $path => $field) {
            $path = (string) $path;
            $lock = $field->getMeta(self::LOCK_META_KEY);

            if (! isset($live[$path]) && ! $field->isDisabled() && (is_bool($lock) ? $lock : $byDefault)) {
                $locks[] = $path;
            }
        }

        return $locks;
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
     * Each shared list's sub-fields that merge by character.
     *
     * @param  array<string, FieldKind>  $kinds  from `shareable()`
     * @param  list<string>  $ignored
     * @return array<string, list<string>>
     */
    public function texts(Schema $schema, array $kinds, array $ignored = []): array
    {
        $texts = [];

        foreach (FormState::fields($schema, $ignored) as $path => $field) {
            if (($kinds[(string) $path] ?? null) === FieldKind::Items) {
                $texts[(string) $path] = ItemsType::textPaths($field);
            }
        }

        return $texts;
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
            if ($field->isDisabled() || ! self::isSaved($field) || ! self::mayEditLive($field)) {
                continue;
            }

            if (($kind = $this->kindOf($field)) !== null) {
                $kinds[(string) $path] = $kind;
            }
        }

        return $kinds;
    }

    /**
     * The values a picked field may take for this user. A colleague's change is
     * refused unless the saving user could have picked it too.
     *
     * @param  array<string, FieldKind>  $writable
     * @return array<string, list<string>>
     */
    public function allowedValues(Schema $schema, array $writable): array
    {
        $allowed = [];

        foreach (FormState::fields($schema, withHidden: false) as $path => $field) {
            $path = (string) $path;

            if (($writable[$path] ?? null) === FieldKind::Items && $field instanceof FileUpload) {
                // Each item is one file; the server fills in which files it may be.
                $allowed[$path] = [''];
                $allowed[$path.UploadType::FILES] = [];

                continue;
            }

            if (($writable[$path] ?? null) === FieldKind::Items) {
                // For a list, what its items may contain.
                $allowed[$path] = ItemsType::paths($field) ?? [];

                continue;
            }

            if (($writable[$path] ?? null) !== FieldKind::Value) {
                continue;
            }

            if ($field instanceof Toggle || $field instanceof Checkbox) {
                $allowed[$path] = ['0', '1'];

                continue;
            }

            // A relationship's options are records, which Save's validation checks; loading
            // them on every render would run the query Filament otherwise runs on demand.
            $hasRelationship = method_exists($field, 'getRelationshipName') && filled($field->getRelationshipName());

            if (! method_exists($field, 'getEnabledOptions') || $hasRelationship || self::dependsOnOtherFields($field)) {
                continue;
            }

            try {
                $options = array_keys((array) $field->getEnabledOptions());
            } catch (Throwable) {
                continue;
            }

            // Searched remotely, or too many to carry: Save's validation still applies.
            if ($options === [] || count($options) > self::MAX_OPTIONS) {
                continue;
            }

            $allowed[$path] = array_map(strval(...), $options);
        }

        return $allowed;
    }

    /**
     * Options computed from other fields change while people edit, so a list
     * captured when the page rendered could refuse a valid choice.
     */
    private static function dependsOnOtherFields(Field $field): bool
    {
        $reflection = new ReflectionObject($field);

        foreach (['options', 'modifyRelationshipQueryUsing', 'getSearchResultsUsing'] as $property) {
            $callback = $reflection->hasProperty($property) ? $reflection->getProperty($property)->getValue($field) : null;

            if (! $callback instanceof Closure) {
                continue;
            }

            foreach ((new ReflectionFunction($callback))->getParameters() as $parameter) {
                $type = $parameter->getType();
                $typeName = $type instanceof ReflectionNamedType ? $type->getName() : '';

                if (in_array($parameter->getName(), ['get', 'state', 'livewire'], true) || in_array($typeName, [Get::class, Component::class], true) || is_subclass_of($typeName, Component::class)) {
                    return true;
                }
            }
        }

        return false;
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

    /** `->collaborative('ability')`: whether the Gate lets this user edit the field live. */
    private static function mayEditLive(Field $field): bool
    {
        $ability = $field->getMeta(self::META_KEY);

        if (! is_string($ability)) {
            return true;
        }

        $record = $field->getRecord();

        return Gate::allows($ability, $record ?? $field->getModel());
    }

    private function kindOf(Field $field): ?FieldKind
    {
        $condition = $field->getMeta(self::META_KEY);

        // A Gate ability decides per person, in `writable()`; the draft holds the field for everybody.
        if ($condition !== null && ! is_string($condition) && ! (bool) $field->evaluate($condition)) {
            return null;
        }

        $marked = $field->getMeta(self::ADAPTER_META_KEY);

        if (is_array($marked) && ($marked[1] ?? null) instanceof FieldKind) {
            return $marked[1];
        }

        foreach ($this->types as $type) {
            if ($type->supports($field)) {
                return $type->getKind($field);
            }
        }

        // A field no type knows, such as a third-party editor, marked `->collaborative()`:
        // its whole value is shared, and the latest change wins.
        return $condition !== null ? FieldKind::Value : null;
    }

    /** The JavaScript adapter of Filament's own fields of this kind, used when a field type names none. */
    public static function defaultAdapter(FieldKind $kind): string
    {
        return match ($kind) {
            FieldKind::Text => 'filament-text-input',
            FieldKind::RichText => 'filament-rich-editor',
            FieldKind::Value => 'filament-value',
            FieldKind::Items => 'filament-repeater',
        };
    }
}
