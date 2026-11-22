<?php

declare(strict_types=1);

use Illuminate\Support\Str;
use SolutionForest\FilamentCollaboration\Merge\ThreeWayMerge;

it('sees edits inside repeaters, whose item keys are random', function (): void {
    $items = fn (string ...$names): array => collect($names)->mapWithKeys(fn (string $name): array => [(string) Str::uuid() => ['name' => $name]])->all();

    expect(ThreeWayMerge::untouched($items('a', 'b'), $items('a', 'b')))->toBeTrue()
        ->and(ThreeWayMerge::untouched($items('a', 'b'), $items('a', 'changed')))->toBeFalse()
        ->and(ThreeWayMerge::untouched($items('a', 'b'), $items('b', 'a')))->toBeFalse()
        ->and(ThreeWayMerge::merge(['rows' => $items('a')], ['rows' => $items('mine')], ['rows' => $items('theirs')])->conflicts)->toBe(['rows']);
});

it('sees a relationship repeater being reordered', function (): void {
    $base = ['record-1' => ['name' => 'a'], 'record-2' => ['name' => 'b']];

    expect(ThreeWayMerge::untouched($base, array_reverse($base, true)))->toBeFalse();
});

it('ignores attributes the browser adds to rich content', function (): void {
    $document = fn (array $attributes): array => ['type' => 'doc', 'content' => [
        ['type' => 'paragraph', ...$attributes, 'content' => [['type' => 'text', 'text' => 'Hi']]],
    ]];

    expect(ThreeWayMerge::untouched($document([]), $document(['attrs' => ['textAlign' => 'start']])))->toBeTrue();
});
