<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Support;

use Filament\Forms\Components\Field;
use Filament\Schemas\Schema;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;

final class FormState
{
    /**
     * Normalize Schema::getRawState() (array|Arrayable) into a plain form bag.
     *
     * @return array<string, mixed>
     */
    public static function array(mixed $state): array
    {
        if ($state instanceof Arrayable) {
            $state = $state->toArray();
        }

        if (! is_array($state)) {
            return [];
        }

        $result = [];
        foreach ($state as $key => $value) {
            if (is_string($key)) {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    /**
     * @param  list<string>  $ignore
     * @return list<string>
     */
    public static function names(Schema $schema, array $ignore = []): array
    {
        $paths = array_values(array_unique(array_map(
            fn (Field $field): string => self::path($field),
            array_values($schema->getFlatFields(withHidden: true)),
        )));

        $ignored = array_flip($ignore);

        return array_values(array_filter(
            $paths,
            function (string $path) use ($paths, $ignored): bool {
                if (isset($ignored[$path])) {
                    return false;
                }

                foreach ($ignored as $ignoredPath => $_) {
                    if (str_starts_with($path, $ignoredPath.'.')) {
                        return false;
                    }
                }

                foreach ($paths as $other) {
                    if ($other !== $path && str_starts_with($path, $other.'.')) {
                        return false;
                    }
                }

                return true;
            },
        ));
    }

    /**
     * @param  array<string, mixed>  $state
     * @param  list<string>  $ignore
     * @return array<string, mixed>
     */
    public static function only(Schema $schema, array $state, array $ignore = []): array
    {
        $values = [];
        foreach (self::names($schema, $ignore) as $name) {
            $values[$name] = Arr::get($state, $name);
        }

        return $values;
    }

    /**
     * @param  array<string, mixed>  $state
     * @param  array<int, string>  $keys
     * @return array<string, mixed>
     */
    public static function onlyKeys(array $state, array $keys): array
    {
        $values = [];
        foreach ($keys as $key) {
            if (array_key_exists($key, $state)) {
                $values[$key] = $state[$key];
            }
        }

        return $values;
    }

    /**
     * @param  array<string, mixed>  $state
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    public static function write(array $state, array $values): array
    {
        foreach ($values as $path => $value) {
            $state = self::setPath($state, $path, $value);
        }

        return $state;
    }

    public static function key(string $name): string
    {
        return strtr($name, ['_' => '_u', '.' => '_d', '@' => '_a']);
    }

    public static function label(Schema $schema, string $path): string
    {
        $field = $schema->getFlatFields(withHidden: true)[$path] ?? null;

        if ($field instanceof Field) {
            $label = $field->getLabel();

            if (is_string($label) && $label !== '') {
                return $label;
            }
        }

        return str_replace(['.', '_'], ' ', $path);
    }

    public static function display(mixed $value): string
    {
        if ($value === null || $value === '' || $value === []) {
            return '(empty)';
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_scalar($value)) {
            return is_string($value) ? $value : (string) $value;
        }

        $encoded = json_encode($value);

        return is_string($encoded) ? $encoded : '(complex)';
    }

    /**
     * @param  array<string, mixed>  $state
     * @return array<string, mixed>
     */
    private static function setPath(array $state, string $path, mixed $value): array
    {
        if (! str_contains($path, '.')) {
            $state[$path] = $value;

            return $state;
        }

        $segments = explode('.', $path);
        $head = array_shift($segments);
        $rest = implode('.', $segments);
        $child = $state[$head] ?? [];

        $state[$head] = self::setPath(self::array($child), $rest, $value);

        return $state;
    }

    private static function path(Field $field): string
    {
        $statePath = $field->getStatePath(isAbsolute: false);

        return ($statePath !== null && $statePath !== '') ? $statePath : $field->getName();
    }
}
