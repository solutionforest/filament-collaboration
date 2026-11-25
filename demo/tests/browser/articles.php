<?php

// Test tooling only. Creates plain draft articles, so every browser scenario gets
// an article of its own however many scenarios there are.
// It refuses to run against anything but the harness's throwaway database.

use App\Models\Document;
use Illuminate\Contracts\Console\Kernel;

if (PHP_SAPI !== 'cli') {
    exit(1);
}

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$database = (string) config('database.connections.sqlite.database');

if (! $app->environment('local', 'testing') || ! str_starts_with($database, base_path('storage/framework/testing/'))) {
    fwrite(STDERR, "Refusing: this is not the browser harness's database.\n");
    exit(1);
}

// Plain, two paragraphs: the seeded articles are written for readers, and the scenarios should not depend on them.
foreach (range(1, max(1, (int) ($argv[1] ?? 60))) as $copy) {
    (new Document([
        'title' => "Browser scenario {$copy}",
        'slug' => "browser-test-{$copy}",
        'category' => 'News',
        'status' => 'draft',
        'excerpt' => 'A draft for one browser scenario.',
        'body_html' => '<p>Opening paragraph for the scenario.</p><p>Add reporting, quotes and context here.</p>',
        'tags' => ['desk'],
    ]))->saveQuietly();
}
