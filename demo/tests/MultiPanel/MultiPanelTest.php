<?php

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use App\Models\User;
use SolutionForest\FilamentCollaboration\FilamentCollaborationServiceProvider;
use Tests\MultiPanel\MultiPanelTestCase;
use Tests\Support\Editor;

uses(MultiPanelTestCase::class);

function arrangePanels(): array
{
    return [
        User::factory()->create(['name' => 'Alice Chen']),
        User::factory()->create(['name' => 'Bob Martinez']),
        Document::create(['title' => 'Shared', 'excerpt' => 'Summary']),
    ];
}

it('lets people on two panels edit the same record together, each through their own panel', function (): void {
    [$alice, $bob, $article] = arrangePanels();
    $inAdmin = Editor::open($this, $alice, $article);
    $inEditors = Editor::openUrl($this, $bob, DocumentResource::getUrl('edit', ['record' => $article], panel: 'editors'), 'editors');

    expect($inAdmin->config['url'])->toEndWith('/admin/_collaboration/sync')
        ->and($inEditors->config['url'])->toEndWith('/editors/_collaboration/sync');

    $inAdmin->sync();
    $inEditors->sync();
    $inAdmin->type('title', 'Shared story')->sync();
    $inEditors->sync();
    $inEditors->type('title', 'Shared story, edited')->sync();
    $inAdmin->sync();

    expect($inAdmin->value('title'))->toBe('Shared story, edited')
        ->and($inEditors->value('title'))->toBe('Shared story, edited')
        ->and(collect($inAdmin->sync()->json('people'))->pluck('name')->all())->toContain('Bob Martinez');
});

it('refuses a token from one panel on another panel\'s endpoint', function (): void {
    [$alice, , $article] = arrangePanels();
    $inAdmin = Editor::open($this, $alice, $article);

    $this->actingAs($alice, 'editors')
        ->postJson('/editors/_collaboration/sync', ['token' => $inAdmin->config['token']])
        ->assertNotFound();
});

it('renders a panel without the plugin as usual, with no room', function (): void {
    [$alice, , $article] = arrangePanels();

    $html = (string) $this->actingAs($alice)->get(DocumentResource::getUrl('edit', ['record' => $article], panel: 'plain'))->assertOk()->getContent();

    expect($html)->not->toContain('data-collaboration=');
});

it('admits someone signed in with another panel\'s guard to the room\'s channel', function (): void {
    [$alice, $bob, $article] = arrangePanels();
    config()->set('broadcasting.default', 'reverb');
    config()->set('broadcasting.connections.reverb', [
        'driver' => 'reverb', 'key' => 'key', 'secret' => 'secret', 'app_id' => 'app',
        'options' => ['host' => '127.0.0.1', 'port' => 1, 'scheme' => 'http', 'useTLS' => false],
    ]);
    FilamentCollaborationServiceProvider::registerChannel();

    $inEditors = Editor::openUrl($this, $bob, DocumentResource::getUrl('edit', ['record' => $article], panel: 'editors'), 'editors');
    $inEditors->sync();
    // As in a browser: signed in on the panel's guard, while `web` stays the default.
    $auth = function (array $signedIn) use ($inEditors) {
        $this->app['auth']->forgetGuards();
        $this->app['auth']->shouldUse('web');

        foreach ($signedIn as $guard => $user) {
            $this->app['auth']->guard($guard)->setUser($user);
        }

        return $this->post('/broadcasting/auth', ['socket_id' => '1234.5678', 'channel_name' => 'private-'.$inEditors->config['channel']]);
    };

    $auth(['editors' => $bob])->assertOk();
    $auth(['editors' => $alice])->assertForbidden();

    // Signed in to both panels as different people: whoever of them is in the room may listen.
    $auth(['web' => $alice, 'editors' => $bob])->assertOk();
});
