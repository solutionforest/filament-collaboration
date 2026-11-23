<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Redis;
use Predis\Client;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // FILAMENT_COLLABORATION_PRESENCE=redis runs every test on Redis presence, in a database of its own.
        if (config('filament-collaboration.presence') === 'redis') {
            self::useRedisForTests();
        }
    }

    /** A Redis database only the tests use, emptied before each test. */
    public static function useRedisForTests(): void
    {
        config([
            'database.redis.collaboration-tests' => [...config('database.redis.default'), 'database' => (int) env('REDIS_TEST_DB', 15)],
            'filament-collaboration.redis_connection' => 'collaboration-tests',
        ]);

        // The manager read its connections when it was made.
        app()->forgetInstance('redis');
        Redis::clearResolvedInstance('redis');

        Redis::connection('collaboration-tests')->command('flushdb');
    }

    public static function redisIsAvailable(): bool
    {
        if (! extension_loaded('redis') && ! class_exists(Client::class)) {
            return false;
        }

        try {
            return (bool) Redis::connection()->command('ping');
        } catch (\Throwable) {
            return false;
        }
    }
}
