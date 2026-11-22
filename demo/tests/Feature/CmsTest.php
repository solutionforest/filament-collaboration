<?php

use App\Models\Document;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;

it('seeds editors with distinct names', function (): void {
    $this->seed(DatabaseSeeder::class);

    expect(User::query()->distinct()->count('name'))->toBe(100);
});

it('sanitises the article body', function (): void {
    Document::create([
        'title' => 'Unsafe', 'slug' => 'unsafe', 'status' => 'published', 'published_at' => now()->subMinute(),
        'body_html' => '<p>Safe</p><script>bad()</script><a href="javascript:bad()">link</a><img src="x" onerror="bad()">',
    ]);

    $this->get('/blog/unsafe')->assertOk()->assertSee('Safe')->assertDontSee('bad()', false);
});
