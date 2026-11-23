<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Presence;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Lottery;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Support\Database;

/** One row per tab, so many heartbeats at once never overwrite each other. */
class DatabasePresenceRepository implements PresenceRepository
{
    private const LIMIT = 500;

    public function touch(Participant $participant): void
    {
        $values = [
            'scope' => $participant->scope,
            'user_key' => $participant->userKey,
            'name' => mb_substr($participant->name, 0, 255),
            'avatar' => $participant->avatar,
            'mode' => $participant->mode->value,
            'field' => $participant->field,
            'cursor' => $participant->cursor === null ? null : Data::encode($participant->cursor),
            'idle' => $participant->idle,
        ];

        $row = Data::map(Database::table('participants')
            ->where('room', $participant->room)
            ->where('client', $participant->client)
            ->first());

        $now = now()->getTimestamp();
        $hasChanged = $row === [];

        foreach ($values as $column => $value) {
            $stored = $row[$column] ?? null;
            $hasChanged = $hasChanged || ($column === 'idle' ? (bool) $stored !== $value : $stored !== $value);
        }

        // An unchanged heartbeat only has to be written before it would time out.
        if (! $hasChanged && Data::int($row['seen_at'] ?? null) > $now - intdiv($this->timeout(), 4)) {
            return;
        }

        Database::table('participants')->upsert(
            [['room' => $participant->room, 'client' => $participant->client, ...$values, 'seen_at' => $now]],
            ['room', 'client'],
            [...array_keys($values), 'seen_at'],
        );

        Lottery::odds(1, 500)->winner(function () use ($now): void {
            Database::table('participants')->where('seen_at', '<', $now - 86400)->delete();
        })->choose();
    }

    public function leave(string $room, int $client): void
    {
        Database::table('participants')->where('room', $room)->where('client', $client)->delete();
    }

    public function inRoom(string $room): array
    {
        return $this->get($this->present()->where('room', $room));
    }

    public function inScope(string $scope): array
    {
        return $this->get($this->present()->where('scope', $scope));
    }

    public function inRooms(array $rooms): array
    {
        $people = array_fill_keys($rooms, []);

        if ($rooms === []) {
            return $people;
        }

        foreach ($this->get($this->present()->whereIn('room', $rooms), self::LIMIT * 4) as $participant) {
            $people[$participant->room][] = $participant;
        }

        return $people;
    }

    public function hasRecentEditors(string $room, int $seconds): bool
    {
        return Database::table('participants')
            ->where('room', $room)
            ->where('mode', PresenceMode::Editing->value)
            ->where('seen_at', '>=', now()->getTimestamp() - $seconds)
            ->exists();
    }

    private function present(): Builder
    {
        return Database::table('participants')->where('seen_at', '>=', now()->getTimestamp() - $this->timeout());
    }

    private function timeout(): int
    {
        return max(8, Data::int(config('filament-collaboration.presence_timeout'), 20));
    }

    /** @return list<Participant> */
    private function get(Builder $query, int $limit = self::LIMIT): array
    {
        $people = [];

        foreach ($query->orderBy('id')->limit($limit)->get() as $row) {
            $row = Data::map($row);
            $cursor = Data::decode($row['cursor'] ?? null);

            $people[] = new Participant(
                room: Data::string($row['room'] ?? null),
                scope: Data::nullableString($row['scope'] ?? null),
                client: Data::int($row['client'] ?? null),
                userKey: Data::string($row['user_key'] ?? null),
                name: Data::string($row['name'] ?? null),
                avatar: Data::nullableString($row['avatar'] ?? null),
                mode: PresenceMode::tryFrom(Data::string($row['mode'] ?? null)) ?? PresenceMode::Viewing,
                field: Data::nullableString($row['field'] ?? null),
                cursor: $cursor === [] ? null : $cursor,
                idle: (bool) ($row['idle'] ?? false),
            );
        }

        return $people;
    }
}
