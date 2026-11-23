<?php

declare(strict_types=1);

// Deployment settings. Behaviour and appearance are set fluently on
// `CollaborationPlugin` in each panel provider.
return [

    // Where shared drafts and presence are stored. `null` is the default connection.
    'connection' => env('FILAMENT_COLLABORATION_CONNECTION'),

    // Serialises saves. Every application server must share it and it must support locks.
    'cache_store' => env('FILAMENT_COLLABORATION_CACHE_STORE'),

    // Where presence is kept: `database`, or `redis` for many servers and many people.
    'presence' => env('FILAMENT_COLLABORATION_PRESENCE', 'database'),

    // The Redis connection for `redis` presence, from `config/database.php`. `null` is `default`.
    'redis_connection' => env('FILAMENT_COLLABORATION_REDIS_CONNECTION'),

    // Seconds without a heartbeat before someone disappears.
    'presence_timeout' => (int) env('FILAMENT_COLLABORATION_PRESENCE_TIMEOUT', 20),

    // A clean draft's edit history is discarded once nobody was seen for this many seconds.
    'compact_after' => (int) env('FILAMENT_COLLABORATION_COMPACT_AFTER', 1800),

    // How long an issued room token is valid. Tokens renew themselves while a page is open.
    'token_lifetime' => (int) env('FILAMENT_COLLABORATION_TOKEN_LIFETIME', 900),

    // Hours before an image inserted into a draft, but never saved, is deleted daily. `null` turns this off.
    'prune_uploads_after' => env('FILAMENT_COLLABORATION_PRUNE_UPLOADS_AFTER', 24),

    // Sync requests per user per minute, across all of their tabs.
    'rate_limit' => (int) env('FILAMENT_COLLABORATION_RATE_LIMIT', 2400),
];
