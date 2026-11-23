<?php

// Test tooling only. Copies a seeded article, so every browser scenario gets
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

$template = Document::query()->findOrFail(4);

foreach (range(1, max(1, (int) ($argv[1] ?? 60))) as $copy) {
    $template->replicate()->fill(['slug' => "browser-test-{$copy}"])->saveQuietly();
}
