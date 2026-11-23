<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Contracts;

use SolutionForest\FilamentCollaboration\Broadcasting\Audience;
use SolutionForest\FilamentCollaboration\Enums\PresenceChange;
use SolutionForest\FilamentCollaboration\Presence\Participant;

/** Bind your own implementation to keep presence somewhere else, such as Redis. */
interface PresenceRepository
{
    public function touch(Participant $participant): PresenceChange;

    public function leave(string $room, int $client): void;

    /** @return list<Participant> */
    public function inRoom(string $room): array;

    /**
     * Everybody in a resource, whichever of its pages they are on.
     *
     * @return list<Participant>
     */
    public function inScope(string $scope): array;

    /**
     * @param  list<string>  $rooms
     * @return array<string, list<Participant>>
     */
    public function inRooms(array $rooms): array;

    public function hasRecentEditors(string $room, int $seconds): bool;

    /** Whether this person has a tab in this audience now. Authorises its broadcast channel. */
    public function isPresent(string $room, string $userKey, string $audience): bool;

    /** @return list<Audience> the distinct audiences of the tabs in a room */
    public function audiences(string $room): array;
}
