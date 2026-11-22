<?php

declare(strict_types=1);

namespace App\Support;

final class ArticleMerge
{
    /**
     * @param  array<string, string|null>  $base
     * @param  array<string, string|null>  $mine
     * @param  array<string, string|null>  $current
     * @return array{values: array<string, string|null>, conflicts: list<string>}
     */
    public static function compare(array $base, array $mine, array $current): array
    {
        $values = [];
        $conflicts = [];
        foreach ($base as $field => $original) {
            $local = $mine[$field] ?? null;
            $remote = $current[$field] ?? null;
            if ($local !== $original && $remote !== $original && $local !== $remote) {
                $conflicts[] = $field;
            }
            $values[$field] = $local === $original ? $remote : $local;
        }

        return ['values' => $values, 'conflicts' => $conflicts];
    }
}
