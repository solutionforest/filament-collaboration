<?php

use Carbon\CarbonImmutable;
use SolutionForest\FilamentCollaboration\Broadcasting\Audience;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Enums\PresenceChange;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Presence\DatabasePresenceRepository;
use SolutionForest\FilamentCollaboration\Presence\Participant;
use SolutionForest\FilamentCollaboration\Presence\RedisPresenceRepository;
use Tests\TestCase;

// The same behaviour from every presence store.

dataset('stores', [
    'database' => [DatabasePresenceRepository::class],
    'redis' => [RedisPresenceRepository::class],
]);

function store(string $class): PresenceRepository
{
    if ($class === RedisPresenceRepository::class) {
        if (! TestCase::redisIsAvailable()) {
            test()->markTestSkipped('Redis is not reachable.');
        }

        TestCase::useRedisForTests();
    }

    return new $class;
}

function tab(string $room, int $client, array $overrides = []): Participant
{
    return new Participant(...[
        'room' => $room,
        'scope' => 'articles',
        'client' => $client,
        'userKey' => "user-{$client}",
        'name' => "Person {$client}",
        'mode' => PresenceMode::Editing,
        ...$overrides,
    ]);
}

it('says who came, who moved and who only sent a heartbeat', function (string $class): void {
    $presence = store($class);

    expect($presence->touch(tab('room-a', 1)))->toBe(PresenceChange::People)
        ->and($presence->touch(tab('room-a', 1)))->toBe(PresenceChange::None)
        ->and($presence->touch(tab('room-a', 1, ['field' => 'title', 'cursor' => ['anchor' => [1, 1]]])))->toBe(PresenceChange::State)
        ->and($presence->touch(tab('room-a', 1, ['field' => 'title', 'cursor' => ['anchor' => [1, 1]], 'name' => 'Renamed'])))->toBe(PresenceChange::People);
})->with('stores');

it('lists a room in the order people came, with where they are', function (string $class): void {
    $presence = store($class);

    $presence->touch(tab('room-a', 2));
    $presence->touch(tab('room-a', 1, ['field' => 'title', 'cursor' => ['anchor' => [3, 2], 'head' => [3, 2]], 'idle' => true]));
    $presence->touch(tab('room-b', 3));
    $presence->touch(tab('room-a', 2));

    $people = $presence->inRoom('room-a');

    expect(array_map(fn (Participant $person) => $person->client, $people))->toBe([2, 1])
        ->and($people[1])->toMatchArray(['field' => 'title', 'cursor' => ['anchor' => [3, 2], 'head' => [3, 2]], 'idle' => true, 'name' => 'Person 1', 'mode' => PresenceMode::Editing])
        ->and(array_map(fn (array $people) => count($people), $presence->inRooms(['room-a', 'room-b', 'room-c'])))->toBe(['room-a' => 2, 'room-b' => 1, 'room-c' => 0])
        ->and($presence->inRooms([]))->toBe([]);
})->with('stores');

it('lists everybody in a resource, whichever record they are on', function (string $class): void {
    $presence = store($class);

    $presence->touch(tab('room-a', 1));
    $presence->touch(tab('room-b', 2));
    $presence->touch(tab('room-c', 3, ['scope' => 'pages']));
    // Moved to another resource.
    $presence->touch(tab('room-b', 2, ['scope' => 'pages']));

    expect(array_map(fn (Participant $person) => $person->client, $presence->inScope('articles')))->toBe([1])
        ->and(array_map(fn (Participant $person) => $person->client, $presence->inScope('pages')))->toEqualCanonicalizing([2, 3]);
})->with('stores');

it('forgets people who leave, and people who go silent', function (string $class): void {
    $presence = store($class);

    $presence->touch(tab('room-a', 1));
    $presence->touch(tab('room-a', 2));
    $presence->leave('room-a', 1);

    expect(array_map(fn (Participant $person) => $person->client, $presence->inRoom('room-a')))->toBe([2]);

    $this->travel(21)->seconds();

    expect($presence->inRoom('room-a'))->toBe([])
        ->and($presence->inScope('articles'))->toBe([])
        ->and($presence->touch(tab('room-a', 2)))->toBe(PresenceChange::People);
})->with('stores');

it('knows whether somebody edited recently, and who may hear a room', function (string $class): void {
    $presence = store($class);
    $audience = new Audience('room-a', ['title'], ['title', 'excerpt']);

    $presence->touch(tab('room-a', 1, ['mode' => PresenceMode::Viewing]));

    expect($presence->hasRecentEditors('room-a', 60))->toBeFalse();

    $presence->touch(tab('room-a', 2, ['audience' => $audience]));

    expect($presence->hasRecentEditors('room-a', 60))->toBeTrue()
        ->and($presence->isPresent('room-a', 'user-2', $audience->key()))->toBeTrue()
        ->and($presence->isPresent('room-a', 'user-1', $audience->key()))->toBeFalse()
        ->and(array_map(fn (Audience $item) => $item->key(), $presence->audiences('room-a')))->toBe([$audience->key()]);
})->with('stores');

it('writes an unchanged heartbeat only now and then', function (string $class): void {
    $presence = store($class);
    CarbonImmutable::setTestNow(now());

    $presence->touch(tab('room-a', 1));
    $this->travel(19)->seconds();
    $presence->touch(tab('room-a', 1));
    $this->travel(19)->seconds();

    // Still here: the heartbeat after five seconds was written.
    expect($presence->inRoom('room-a'))->toHaveCount(1);
})->with('stores');
