<?php

use App\Models\Document;
use App\Models\User;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use SolutionForest\Collaboration\Documents\DraftHeads;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeDraftHeads(TestCase $test): void
{
    config()->set('filament-collaboration.draft_cache', true);
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary']);
}

/**
 * The queries a callback makes on the drafts table.
 *
 * @return list<string>
 */
function draftQueries(Closure $callback): array
{
    $queries = [];
    DB::listen(function (QueryExecuted $query) use (&$queries): void {
        if (str_contains($query->sql, 'filament_collaboration_documents')) {
            $queries[] = $query->sql;
        }
    });

    $callback();

    return $queries;
}

it('answers a poll with nothing new without reading the draft from the database', function (): void {
    arrangeDraftHeads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared story')->sync();
    $bob->sync();
    $bob->sync();

    $queries = draftQueries(fn () => $bob->sync());

    expect($queries)->toBe([])
        ->and($bob->value('title'))->toBe('Shared story');
});

it('still reads the draft from the database when the cache is off', function (): void {
    arrangeDraftHeads($this);
    config()->set('filament-collaboration.draft_cache', false);
    $bob = Editor::open($this, $this->bob, $this->article);
    $bob->sync();
    $bob->sync();

    expect(draftQueries(fn () => $bob->sync()))->not->toBe([]);
});

it('sends a change to the next poll, though the head before it was cached', function (): void {
    arrangeDraftHeads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();
    $bob->sync();

    $alice->type('title', 'Shared and changed')->sync();
    $bob->sync();

    expect($bob->value('title'))->toBe('Shared and changed');
});

it('reads the database again when the cache lost the draft\'s token', function (): void {
    arrangeDraftHeads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();
    $alice->type('title', 'Shared and changed')->sync();

    Cache::flush();

    expect(draftQueries(fn () => $bob->sync()))->not->toBe([])
        ->and($bob->value('title'))->toBe('Shared and changed');
});

it('turns itself on only for a cache that every server shares', function (?string $setting, string $driver, bool $enabled): void {
    config()->set('cache.stores.drafts', ['driver' => $driver]);
    config()->set('filament-collaboration.cache_store', 'drafts');
    config()->set('filament-collaboration.draft_cache', $setting);

    expect(DraftHeads::enabled())->toBe($enabled);
})->with([
    'Redis' => [null, 'redis', true],
    'Memcached' => [null, 'memcached', true],
    'database' => [null, 'database', false],
    'file' => [null, 'file', false],
    'array, one per process' => [null, 'array', false],
    'turned off on Redis' => ['false', 'redis', false],
    'turned on by hand' => ['true', 'database', true],
]);
