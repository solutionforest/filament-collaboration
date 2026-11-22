<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Presence;

use Closure;
use Illuminate\Contracts\Cache\LockProvider;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Contracts\Cache\Repository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use RuntimeException;

final class PresenceStore
{
    /** @var Closure(Model): string|null */
    private static ?Closure $roomResolver = null;

    public function __construct(
        private readonly ?string $store = null,
    ) {}

    public static function resolveRoomUsing(Closure $resolver): void
    {
        self::$roomResolver = $resolver;
    }

    public static function room(Model $record): string
    {
        if (self::$roomResolver !== null) {
            return (self::$roomResolver)($record);
        }

        $connection = $record->getConnectionName() ?? config('database.default');
        $connectionName = is_string($connection) ? $connection : 'default';

        return $connectionName.':'.$record->getMorphClass().':'.self::stringifyKey($record->getKey());
    }

    public static function opaque(string $room): string
    {
        $appKey = config('app.key');

        return hash_hmac('sha256', $room, is_string($appKey) ? $appKey : '');
    }

    public static function stringifyKey(mixed $key): string
    {
        if (is_string($key)) {
            return $key;
        }

        if (is_int($key)) {
            return (string) $key;
        }

        if (is_float($key)) {
            return (string) $key;
        }

        return '';
    }

    /**
     * @param  array{id: string|int, name: string, avatar?: ?string, field?: ?string, mode?: string, origin?: string}  $person
     */
    public function heartbeat(string $room, string $sessionId, array $person): void
    {
        $key = $this->key($room);
        $sessions = $this->readSessions($key);

        $sessions[$sessionId] = [
            ...$person,
            'seen_at' => now()->getTimestamp(),
        ];

        $this->cache()->put($key, $this->prune($sessions), $this->timeout() * 3);
    }

    public function leave(string $room, string $sessionId): void
    {
        $key = $this->key($room);
        $sessions = $this->readSessions($key);

        unset($sessions[$sessionId]);
        $this->cache()->put($key, $sessions, $this->timeout() * 3);
    }

    /**
     * @return list<array{id: string|int, name: string, avatar: ?string, field: ?string, mode: string, origin: string, seen_at: int}>
     */
    public function people(string $room, ?string $exceptOrigin = null): array
    {
        $people = [];
        foreach ($this->prune($this->readSessions($this->key($room))) as $session) {
            if (! is_array($session)) {
                continue;
            }
            if ($exceptOrigin !== null && ($session['origin'] ?? null) === $exceptOrigin) {
                continue;
            }

            $id = $session['id'] ?? null;
            if (! is_string($id) && ! is_int($id)) {
                continue;
            }

            $people[] = [
                'id' => $id,
                'name' => is_string($session['name'] ?? null) ? $session['name'] : 'Someone',
                'avatar' => isset($session['avatar']) && is_string($session['avatar']) ? $session['avatar'] : null,
                'field' => isset($session['field']) && is_string($session['field']) ? $session['field'] : null,
                'mode' => is_string($session['mode'] ?? null) ? $session['mode'] : 'viewing',
                'origin' => is_string($session['origin'] ?? null) ? $session['origin'] : '',
                'seen_at' => $this->intValue($session['seen_at'] ?? 0),
            ];
        }

        return $people;
    }

    /**
     * @param  array<string, string>  $roomsByRecord
     * @return array<string, list<array{id: string|int, name: string, avatar: ?string, field: ?string, mode: string}>>
     */
    public function peopleForRooms(array $roomsByRecord): array
    {
        $result = [];
        foreach ($roomsByRecord as $recordKey => $room) {
            $result[$recordKey] = array_map(
                fn (array $person): array => [
                    'id' => $person['id'],
                    'name' => $person['name'],
                    'avatar' => $person['avatar'],
                    'field' => $person['field'],
                    'mode' => $person['mode'],
                ],
                $this->people($room),
            );
        }

        return $result;
    }

    /**
     * @param  array{name?: string, fields?: list<string>, origin?: string, version?: int}  $save
     */
    public function rememberSave(string $room, array $save): void
    {
        $previous = $this->lastSave($room);
        $version = $save['version'] ?? (($previous['version'] ?? 0) + 1);

        $this->cache()->put(
            $this->saveKey($room),
            [...$save, 'version' => max(1, $version)],
            $this->intValue(config('filament-collaboration.remember_saves_for', 3600), 3600),
        );
    }

    /**
     * @return array{name?: string, fields?: list<string>, origin?: string, version?: int}|null
     */
    public function lastSave(string $room): ?array
    {
        $save = $this->cache()->get($this->saveKey($room));
        if (! is_array($save)) {
            return null;
        }

        $result = [];

        if (isset($save['name']) && is_string($save['name'])) {
            $result['name'] = $save['name'];
        }

        if (isset($save['fields']) && is_array($save['fields'])) {
            $fields = [];
            foreach ($save['fields'] as $field) {
                if (is_string($field)) {
                    $fields[] = $field;
                }
            }
            $result['fields'] = $fields;
        }

        if (isset($save['origin']) && is_string($save['origin'])) {
            $result['origin'] = $save['origin'];
        }

        if (array_key_exists('version', $save)) {
            $result['version'] = $this->intValue($save['version']);
        }

        return $result;
    }

    /**
     * @template T
     *
     * @param  Closure(): T  $callback
     * @return T
     *
     * @throws LockTimeoutException
     */
    public function whileSaving(string $room, Closure $callback): mixed
    {
        $store = $this->cache()->getStore();
        if (! $store instanceof LockProvider) {
            throw new RuntimeException('Filament collaboration requires a cache store that supports locks.');
        }

        return $store->lock('filament-collaboration:save:'.$room, 30)->block(10, $callback);
    }

    private function cache(): Repository
    {
        $store = $this->store ?? config('filament-collaboration.cache_store');

        return is_string($store) && $store !== '' ? Cache::store($store) : Cache::store();
    }

    private function key(string $room): string
    {
        return 'filament-collaboration:presence:'.$room;
    }

    private function saveKey(string $room): string
    {
        return 'filament-collaboration:save:'.$room;
    }

    private function timeout(): int
    {
        return max(5, $this->intValue(config('filament-collaboration.timeout', 20), 20));
    }

    /**
     * @return array<string, mixed>
     */
    private function readSessions(string $key): array
    {
        $sessions = $this->cache()->get($key, []);
        if (! is_array($sessions)) {
            return [];
        }

        $result = [];
        foreach ($sessions as $sessionId => $session) {
            if (is_string($sessionId)) {
                $result[$sessionId] = $session;
            }
        }

        return $result;
    }

    /**
     * @param  array<string, mixed>  $sessions
     * @return array<string, mixed>
     */
    private function prune(array $sessions): array
    {
        $cutoff = now()->getTimestamp() - $this->timeout();

        $result = [];
        foreach ($sessions as $sessionId => $session) {
            if (is_array($session) && $this->intValue($session['seen_at'] ?? 0) >= $cutoff) {
                $result[$sessionId] = $session;
            }
        }

        return $result;
    }

    private function intValue(mixed $value, int $default = 0): int
    {
        if (is_int($value)) {
            return $value;
        }

        if (is_float($value)) {
            return (int) $value;
        }

        if (is_string($value) && is_numeric($value)) {
            return (int) $value;
        }

        return $default;
    }
}
