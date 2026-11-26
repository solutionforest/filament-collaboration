<?php

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use SolutionForest\Collaboration\Broadcasting\RoomChanged;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\FilamentCollaborationServiceProvider;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeBroadcasting(TestCase $test, bool $enabled = true): void
{
    CollaborationPlugin::get()->broadcasting($enabled);

    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary']);
}

/** @return list<RoomChanged> */
function pushes(string $channel): array
{
    return Event::dispatched(RoomChanged::class, fn (RoomChanged $event): bool => $event->channel === $channel)->flatten()->all();
}

it('pushes new operations to the audience that can read them', function (): void {
    arrangeBroadcasting($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();

    Event::fake([RoomChanged::class]);
    $alice->type('title', 'Shared live')->sync();

    $push = collect(pushes($bob->config['channel']))->last(fn (RoomChanged $event): bool => isset($event->payload['operations']));

    expect($push->payload['operations'][0]['v'])->toBe(' live')
        ->and($push->payload['from'])->toBe($bob->sequence)
        ->and($push->payload['to'])->toBe($alice->sequence)
        ->and($push->payload['dirty'])->toBe(['title']);
});

it('pushes no field content to a viewer', function (): void {
    arrangeBroadcasting($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $viewer = Editor::open($this, $this->bob, $this->article, 'view');
    $alice->sync();
    $viewer->sync();

    expect($viewer->config['channel'])->not->toBe($alice->config['channel']);

    Event::fake([RoomChanged::class]);
    $alice->type('title', 'Shared secret')->sync(['field' => 'title', 'cursor' => ['anchor' => null, 'head' => [1, 0]]]);

    foreach (pushes($viewer->config['channel']) as $push) {
        expect($push->payload['operations'] ?? [])->toBe([])
            ->and($push->payload['person']['field'] ?? null)->toBeNull()
            ->and($push->payload['person']['cursor'] ?? null)->toBeNull();
    }
});

it('pushes a moved caret so others need not fetch it', function (): void {
    arrangeBroadcasting($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();

    Event::fake([RoomChanged::class]);
    $alice->sync(['field' => 'title', 'cursor' => ['anchor' => [1, 0], 'head' => [2, 0]]]);

    expect(pushes($bob->config['channel'])[0]->payload['person'])->toBe([
        'client' => $alice->config['client'],
        'field' => 'title',
        'cursor' => ['anchor' => [1, 0], 'head' => [2, 0]],
        'idle' => false,
    ]);
});

it('asks the list page to refresh when somebody arrives', function (): void {
    arrangeBroadcasting($this);
    $list = Editor::open($this, $this->bob, $this->article, 'index');
    $list->sync();

    Event::fake([RoomChanged::class]);
    Editor::open($this, $this->alice, $this->article)->sync();

    expect(pushes($list->config['channel'])[0]->payload)->toBe(['people' => true]);
});

it('sends a sync request instead of a payload that is too large', function (): void {
    arrangeBroadcasting($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();

    Event::fake([RoomChanged::class]);
    $alice->type('excerpt', str_repeat('Long text. ', 2000))->sync();

    $push = pushes($bob->config['channel'])[0];

    expect($push->payload)->toHaveKey('sync', true)->not->toHaveKey('operations');
});

it('pushes nothing when broadcasting is off', function (): void {
    arrangeBroadcasting($this, enabled: false);
    $alice = Editor::open($this, $this->alice, $this->article);

    expect($alice->config['channel'])->toBeNull();

    Event::fake([RoomChanged::class]);
    $alice->type('title', 'Shared quietly')->sync();

    Event::assertNotDispatched(RoomChanged::class);
});

it('keeps syncing when the WebSocket server is down', function (): void {
    arrangeBroadcasting($this);
    config()->set('broadcasting.default', 'reverb');
    config()->set('broadcasting.connections.reverb', [
        'driver' => 'reverb', 'key' => 'key', 'secret' => 'secret', 'app_id' => 'app',
        'options' => ['host' => '127.0.0.1', 'port' => 1, 'scheme' => 'http', 'useTLS' => false],
    ]);

    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();
    $alice->type('title', 'Shared anyway')->sync();
    $bob->sync();

    expect($bob->value('title'))->toBe('Shared anyway');
});

it('admits only people in the room and audience to a channel', function (): void {
    arrangeBroadcasting($this);
    config()->set('broadcasting.default', 'reverb');
    config()->set('broadcasting.connections.reverb', [
        'driver' => 'reverb', 'key' => 'key', 'secret' => 'secret', 'app_id' => 'app',
        'options' => ['host' => '127.0.0.1', 'port' => 1, 'scheme' => 'http', 'useTLS' => false],
    ]);

    FilamentCollaborationServiceProvider::registerChannel();

    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $auth = fn (User $user, string $channel) => $this->actingAs($user)
        ->post('/broadcasting/auth', ['socket_id' => '1234.5678', 'channel_name' => 'private-'.$channel]);

    $auth($this->alice, $alice->config['channel'])->assertOk();
    $auth($this->bob, $alice->config['channel'])->assertForbidden();

    $viewer = Editor::open($this, $this->bob, $this->article, 'view');
    $viewer->sync();

    $auth($this->bob, $viewer->config['channel'])->assertOk();
    $auth($this->bob, $alice->config['channel'])->assertForbidden();

    $this->travel(21)->seconds();
    $auth($this->alice, $alice->config['channel'])->assertForbidden();
});
