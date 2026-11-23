<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Presence;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Lottery;
use SolutionForest\FilamentCollaboration\Broadcasting\Audience;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Enums\PresenceChange;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Support\Database;

/** One row per tab, so many heartbeats at once never overwrite each other. */
class DatabasePresenceRepository implements PresenceRepository
{
    private const LIMIT = 500;

    public function touch(Participant $participant): PresenceChange
    {
        $identity = [
            'scope' => $participant->scope,
            'user_key' => $participant->userKey,
            'name' => mb_substr($participant->name, 0, 255),
            'avatar' => $participant->avatar,
            'mode' => $participant->mode->value,
            'audience' => $participant->audience?->key(),
            'readable' => $participant->audience === null ? null : Data::encode($participant->audience->toArray()),
        ];
        $state = [
            'field' => $participant->field,
            'cursor' => $participant->cursor === null ? null : Data::encode($participant->cursor),
            'idle' => $participant->idle,
        ];

        $row = Data::map(Database::table('participants')
            ->where('room', $participant->room)
            ->where('client', $participant->client)
            ->first());

        $now = now()->getTimestamp();
        $seenAt = Data::int($row['seen_at'] ?? null);

        $change = match (true) {
            $row === [] || $seenAt < $now - $this->timeout() || self::differs($row, $identity) => PresenceChange::People,
            self::differs($row, $state) => PresenceChange::State,
            default => PresenceChange::None,
        };

        // An unchanged heartbeat only has to be written before it would time out.
        if ($change === PresenceChange::None && $seenAt > $now - intdiv($this->timeout(), 4)) {
            return $change;
        }

        $values = [...$identity, ...$state];

        Database::table('participants')->upsert(
            [['room' => $participant->room, 'client' => $participant->client, ...$values, 'seen_at' => $now]],
            ['room', 'client'],
            [...array_keys($values), 'seen_at'],
        );

        Lottery::odds(1, 500)->winner(function () use ($now): void {
            Database::table('participants')->where('seen_at', '<', $now - 86400)->delete();
        })->choose();

        return $change;
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, mixed>  $values
     */
    private static function differs(array $row, array $values): bool
    {
        foreach ($values as $column => $value) {
            $stored = $row[$column] ?? null;

            if (is_bool($value) ? (bool) $stored !== $value : $stored !== $value) {
                return true;
            }
        }

        return false;
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

    public function isPresent(string $room, string $userKey, string $audience): bool
    {
        return $this->present()->where('room', $room)->where('user_key', $userKey)->where('audience', $audience)->exists();
    }

    public function audiences(string $room): array
    {
        $audiences = [];

        foreach ($this->present()->where('room', $room)->whereNotNull('audience')->distinct()->pluck('readable') as $encoded) {
            $lists = Data::decode($encoded);
            $audience = new Audience($room, Data::strings($lists['readable'] ?? null), Data::strings($lists['visible'] ?? null));
            $audiences[$audience->key()] = $audience;
        }

        return array_values($audiences);
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
