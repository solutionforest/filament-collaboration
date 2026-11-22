<?php

declare(strict_types=1);

return [
    'cache_store' => env('FILAMENT_COLLABORATION_CACHE_STORE'),
    'heartbeat' => (int) env('FILAMENT_COLLABORATION_HEARTBEAT', 4),
    'timeout' => (int) env('FILAMENT_COLLABORATION_TIMEOUT', 20),
    'idle' => env('FILAMENT_COLLABORATION_IDLE', 600),
    'track_fields' => (bool) env('FILAMENT_COLLABORATION_TRACK_FIELDS', true),
    'remember_saves_for' => (int) env('FILAMENT_COLLABORATION_REMEMBER_SAVES_FOR', 3600),
    'leave_middleware' => [],
];
