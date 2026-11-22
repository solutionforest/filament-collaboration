<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Support;

final class PresenceColor
{
    /** Google-Docs-like accent palette for remote editors. */
    private const PALETTE = [
        '#1a73e8',
        '#d93025',
        '#f9ab00',
        '#188038',
        '#e37400',
        '#a142f4',
        '#12b5cb',
        '#c5221f',
        '#1967d2',
        '#f09300',
        '#137333',
        '#9334e6',
        '#007b83',
        '#c5221f',
        '#174ea6',
        '#e8710a',
    ];

    public static function for(string|int $seed): string
    {
        $hash = crc32((string) $seed);

        return self::PALETTE[$hash % count(self::PALETTE)];
    }

    public static function initials(string $name): string
    {
        $parts = preg_split('/\s+/', trim($name)) ?: [];
        $letters = '';
        foreach (array_slice($parts, 0, 2) as $part) {
            if ($part !== '') {
                $letters .= mb_strtoupper(mb_substr($part, 0, 1));
            }
        }

        return $letters !== '' ? $letters : '?';
    }
}
