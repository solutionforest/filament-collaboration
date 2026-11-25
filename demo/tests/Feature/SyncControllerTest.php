<?php

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use SolutionForest\Collaboration\Broadcasting\RoomChanged;
use SolutionForest\Collaboration\Documents\DocumentRepository;
use SolutionForest\Collaboration\Permissions;
use SolutionForest\Collaboration\Rooms\RoomResolver;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeSync(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary', 'body_html' => '<p>Hello</p>']);
}

it('shares typing between two editors', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    $alice->sync();
    $bob->sync();
    $alice->type('title', 'Big Shared')->sync();
    $bob->type('title', 'Shared story')->sync();
    $alice->sync();

    expect($alice->value('title'))->toBe('Big Shared story')
        ->and($bob->value('title'))->toBe('Big Shared story')
        ->and($this->article->fresh()->title)->toBe('Shared');
});

it('keeps typed spaces, which Laravel would trim from request input', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    $alice->sync();
    $alice->type('title', 'Shared ')->sync();
    $alice->type('title', 'Shared  ')->sync();
    $bob->sync();

    expect($bob->value('title'))->toBe('Shared  ');
});

it('returns 409 and stores nothing for a forged batch', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);

    $alice->sync();
    $alice->type('title', 'Shared!');
    $alice->pending[] = ['n' => 2, 'ops' => [['o' => 'set', 'f' => 'workspace_id', 'id' => [99999, $alice->config['client']], 'v' => 2]]];
    $alice->send()->assertConflict()->assertJsonPath('error', 'rejected');

    $fresh = Editor::open($this, $this->bob, $this->article);
    $fresh->sync();

    expect($fresh->value('title'))->toBe('Shared');
});

it('returns 403 for a tampered token', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->config['token'] = Crypt::encryptString('{"m":"root"}');
    $alice->send()->assertForbidden();

    $alice->config['token'] = 'not a token';
    $alice->send()->assertForbidden();
});

it('returns 404 when permission to update is withdrawn', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();

    Gate::before(fn (User $user, string $ability) => $ability === 'update' ? false : null);

    $alice->send()->assertNotFound();
});

it('returns 404 for an article that moved to another workspace', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $this->article->update(['workspace_id' => 2]);

    $alice->send()->assertNotFound();
});

it('returns 410 when a token has expired', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);

    $this->travel(16)->minutes();

    $alice->send()->assertStatus(410)->assertJsonPath('error', 'expired');
});

it('lets a viewer neither read nor write the draft', function (): void {
    arrangeSync($this);
    Editor::open($this, $this->bob, $this->article);
    $viewer = Editor::open($this, $this->alice, $this->article, 'view');

    expect($viewer->config['fields'])->toBe([]);

    $viewer->send(['batches' => [['n' => 1, 'ops' => [['o' => 'set', 'f' => 'status', 'id' => [999, $viewer->config['client']], 'v' => 'published']]]]])
        ->assertOk()
        ->assertJsonPath('state', null)
        ->assertJsonPath('operations', []);

    expect(DB::table('filament_collaboration_updates')->where('client', $viewer->config['client'])->count())->toBe(0);
});

it('returns a retryable 400 when the body cannot be read', function (): void {
    arrangeSync($this);

    $this->actingAs($this->alice)
        ->call('POST', '/admin/_collaboration/sync', server: ['CONTENT_TYPE' => 'application/json', 'HTTP_ACCEPT' => 'application/json'], content: '{"token":"abc')
        ->assertStatus(400)
        ->assertJsonPath('error', 'malformed');
});

it('returns 413 when the request is too large', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);

    $alice->send(['padding' => str_repeat('x', 2_000_001)])->assertStatus(413);
});

it('sends the whole state again once old updates are pruned', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    $alice->sync();
    $bob->sync();
    $alice->type('title', 'Shared and changed')->sync();

    DB::table('filament_collaboration_updates')->delete();
    DB::table('filament_collaboration_documents')->update(['floor' => $alice->sequence]);

    expect($bob->sync()->json('state'))->not->toBeNull()
        ->and($bob->value('title'))->toBe('Shared and changed');
});

it('merges a change made outside the form into what is being typed', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared by Alice')->sync();

    $this->article->update(['title' => 'Import: Shared']);
    Editor::open($this, $this->bob, $this->article);
    $alice->sync();

    expect($alice->value('title'))->toBe('Import: Shared by Alice');
});

it('does not double a change that the draft already contains', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared twice')->sync();

    $this->article->update(['title' => 'Shared twice']);
    Editor::open($this, $this->bob, $this->article);

    $response = $alice->sync();

    expect($alice->value('title'))->toBe('Shared twice')->and($response->json('dirty'))->toBe([]);
});

it('compacts history only when the draft is clean and nobody is editing', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();

    DB::table('filament_collaboration_documents')->update(['sequence' => 250]);

    Editor::open($this, $this->bob, $this->article);
    expect((int) DB::table('filament_collaboration_documents')->value('epoch'))->toBe(1);

    $this->travel(31)->minutes();

    Editor::open($this, $this->bob, $this->article);
    expect((int) DB::table('filament_collaboration_documents')->value('epoch'))->toBe(2);
});

it('never compacts an unsaved draft away', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared, unsaved')->sync();

    DB::table('filament_collaboration_documents')->update(['sequence' => 250]);
    $this->travel(31)->minutes();

    $bob = Editor::open($this, $this->bob, $this->article);
    $bob->sync();

    expect($bob->value('title'))->toBe('Shared, unsaved');
});

it('does not write the session while polling', function (): void {
    arrangeSync($this);
    config()->set('session.driver', 'file');
    $path = storage_path('framework/testing/sessions-'.uniqid());
    mkdir($path, recursive: true);
    config()->set('session.files', $path);
    app('session')->forgetDrivers();

    $alice = Editor::open($this, $this->alice, $this->article);
    array_map(unlink(...), glob($path.'/*') ?: []);

    $alice->sync();

    expect(glob($path.'/*'))->toBe([]);

    rmdir($path);
});

it('announces a save to everybody in the room', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $before = $alice->sync()->json('revision');

    app(DocumentRepository::class)->announceSave(app(RoomResolver::class)->forRecord($this->article), 'Bob Martinez');

    $response = $alice->sync();

    expect($response->json('revision'))->not->toBe($before)
        ->and($response->json('saved.name'))->toBe('Bob Martinez')
        ->and($response->json('saved.own'))->toBeFalse();
});

it('recovers edits a reload interrupted, once', function (): void {
    arrangeSync($this);
    $before = Editor::open($this, $this->alice, $this->article);
    $before->sync();
    $before->type('title', 'Shared, unsent');
    $resume = ['token' => $before->config['token'], 'epoch' => $before->epoch, 'batches' => $before->pending];

    $after = Editor::open($this, $this->alice, $this->article);
    $after->sync(['resume' => $resume])->assertJsonPath('resumed', true);
    $after->sync(['resume' => $resume])->assertJsonPath('resumed', true);

    expect($after->value('title'))->toBe('Shared, unsent');
});

it('does not let another user resume somebody\'s edits', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Not Bob\'s');

    $bob = Editor::open($this, $this->bob, $this->article);
    $bob->sync(['resume' => ['token' => $alice->config['token'], 'epoch' => $alice->epoch, 'batches' => $alice->pending]])
        ->assertJsonPath('resumed', false);

    expect($bob->value('title'))->toBe('Shared');
});

it('returns 410 to open tabs once permissions change, so they render a new token', function (): void {
    arrangeSync($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $other = Editor::open($this, $this->alice, Document::create(['title' => 'Other']));
    $alice->sync();
    $other->sync();

    Permissions::changed($this->article);

    $alice->send()->assertStatus(410);
    $other->send()->assertOk();

    Permissions::changed();

    $other->send()->assertStatus(410);
    Editor::open($this, $this->alice, $this->article)->sync();
});

it('pushes a refresh to the room when its permissions change', function (): void {
    arrangeSync($this);
    CollaborationPlugin::get()->broadcasting();
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();

    Event::fake([RoomChanged::class]);
    Permissions::changed($this->article);

    Event::assertDispatched(RoomChanged::class, fn (RoomChanged $event): bool => $event->channel === $alice->config['channel'] && $event->payload === ['refresh' => true]);
});

it('logs an editor error the browser recovered from, when reporting is on', function (): void {
    arrangeSync($this);
    CollaborationPlugin::get()->reportEditorErrors();
    Log::spy();
    $alice = Editor::open($this, $this->alice, $this->article);

    expect($alice->config['reportErrors'])->toBeTrue();

    $alice->sync(['problems' => [
        ['field' => 'body_html', 'error' => 'TransformError: Structure replace would overwrite content', 'key' => 'Enter', 'selection' => ['type' => 'text', 'anchor' => 3, 'head' => 3], 'doc' => ['type' => 'doc']],
        ['field' => 'workspace_id', 'error' => 'RangeError: not a field this editor can write'],
    ]]);

    Log::shouldHaveReceived('warning')->once()->withArgs(fn (string $message, array $context): bool => $context['field'] === 'body_html'
        && $context['pressed'] === 'Enter'
        && $context['document'] === ['type' => 'doc']
        && $context['record'] === (string) $this->article->getKey());
});

it('logs nothing about editor errors unless reporting is on', function (): void {
    arrangeSync($this);
    CollaborationPlugin::get()->reportEditorErrors(false);
    Log::spy();
    $alice = Editor::open($this, $this->alice, $this->article);

    expect($alice->config['reportErrors'])->toBeFalse();

    $alice->sync(['problems' => [['field' => 'body_html', 'error' => 'TransformError: x']]]);

    Log::shouldNotHaveReceived('warning');
});
