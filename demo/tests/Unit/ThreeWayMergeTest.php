<?php

use SolutionForest\Collaboration\Merge\ThreeWayMerge;

it('keeps remote fields the local editor did not touch', function (): void {
    $result = ThreeWayMerge::merge(
        ['title' => 'Original', 'status' => 'draft'],
        ['title' => 'Revised', 'status' => 'draft'],
        ['title' => 'Original', 'status' => 'review'],
    );

    expect($result->conflicts)->toBe([])
        ->and($result->taken)->toBe(['status'])
        ->and($result->data['title'])->toBe('Revised')
        ->and($result->data['status'])->toBe('review');
});

it('detects real conflicts and ignores identical concurrent edits', function (): void {
    $conflict = ThreeWayMerge::merge(
        ['title' => 'Original'],
        ['title' => 'Alice'],
        ['title' => 'Bob'],
    );
    $same = ThreeWayMerge::merge(
        ['title' => 'Original'],
        ['title' => 'Same'],
        ['title' => 'Same'],
    );

    expect($conflict->conflicts)->toBe(['title'])
        ->and($same->conflicts)->toBe([])
        ->and($same->data['title'])->toBe('Same');
});

it('treats empty string and null as the same form noise', function (): void {
    expect(ThreeWayMerge::untouched(null, ''))->toBeTrue()
        ->and(ThreeWayMerge::same(12, '12'))->toBeTrue()
        ->and(ThreeWayMerge::untouched('1.1', '1.10'))->toBeFalse();
});
