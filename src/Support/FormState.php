<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Support;

use Filament\Forms\Components\Field;
use Filament\Schemas\Schema;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

/** @internal */
final class FormState
{
    /**
     * The outermost fields of a form, keyed by their path inside it. A repeater
     * or builder is one field; its items have no identity between two fills.
     *
     * @param  list<string>  $ignored
     * @return array<string, Field>
     */
    public static function fields(Schema $schema, array $ignored = [], bool $withHidden = true): array
    {
        $prefix = Data::string($schema->getStatePath());
        $found = [];

        foreach ($schema->getFlatFields(withHidden: $withHidden) as $field) {
            $path = Data::string($field->getStatePath());

            if ($prefix !== '') {
                $path = Str::after($path, $prefix.'.');
            }

            $found[$path] ??= $field;
        }

        $fields = [];

        foreach ($found as $path => $field) {
            $path = (string) $path;

            foreach ([...$ignored, ...array_map(strval(...), array_keys($found))] as $other) {
                if (str_starts_with($path, $other.'.')) {
                    continue 2;
                }
            }

            if (! in_array($path, $ignored, true)) {
                $fields[$path] = $field;
            }
        }

        return $fields;
    }

    /**
     * @param  list<string>  $ignored
     * @return array<string, mixed>
     */
    public static function values(Schema $schema, array $ignored = []): array
    {
        $state = Data::map($schema->getRawState());
        $values = [];

        foreach (array_keys(self::fields($schema, $ignored)) as $path) {
            $values[(string) $path] = Arr::get($state, (string) $path);
        }

        return $values;
    }

    /**
     * @param  array<string, mixed>  $values
     * @param  list<string>  $paths
     * @return array<string, mixed>
     */
    public static function only(array $values, array $paths): array
    {
        return array_intersect_key($values, array_flip($paths));
    }

    /**
     * @param  array<string, mixed>  $state
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    public static function write(array $state, array $values): array
    {
        foreach ($values as $path => $value) {
            data_set($state, (string) $path, $value);
        }

        return Data::map($state);
    }

    /** A path as a safe schema name. */
    public static function key(string $path): string
    {
        return strtr($path, ['_' => '_u', '.' => '_d', '@' => '_a']);
    }

    public static function label(Schema $schema, string $path): string
    {
        $label = (self::fields($schema)[$path] ?? null)?->getLabel();
        $label = trim(strip_tags($label instanceof Htmlable ? $label->toHtml() : (string) $label));

        return $label !== '' ? $label : str_replace(['.', '_'], ' ', $path);
    }

    /** A value as plain text, for a person choosing between two of them. */
    public static function display(mixed $value): string
    {
        $text = match (true) {
            $value === null || $value === '' || $value === [] => '',
            is_bool($value) => __('filament-collaboration::collaboration.values.'.($value ? 'yes' : 'no')),
            is_scalar($value) => trim(strip_tags((string) $value)),
            default => self::flatten(Data::decode(Data::encode(['value' => $value]))['value'] ?? null),
        };

        return $text === '' ? __('filament-collaboration::collaboration.values.empty') : Str::limit($text, 300);
    }

    private static function flatten(mixed $value): string
    {
        if (is_scalar($value)) {
            return (string) $value;
        }

        $node = Data::map($value);

        if (isset($node['type']) && (isset($node['content']) || isset($node['text']) || $node['type'] === 'doc')) {
            if (isset($node['text'])) {
                return Data::string($node['text']);
            }

            $separator = in_array($node['type'], ['paragraph', 'heading'], true) ? '' : ' ';

            return trim(implode($separator, array_map(self::flatten(...), Data::list($node['content'] ?? null))));
        }

        return implode(', ', array_filter(array_map(self::flatten(...), array_values($node)), static fn (string $item): bool => $item !== ''));
    }
}
