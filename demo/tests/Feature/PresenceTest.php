<?php

use App\Filament\Resources\Documents\Pages\ListDocuments;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Presence\Participant;
use SolutionForest\FilamentCollaboration\Rooms\RoomResolver;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangePresence(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared']);
}

it('shows who is here, in which field and where the caret is', function (): void {
    arrangePresence($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    $bob->sync(['field' => 'title', 'cursor' => ['anchor' => null, 'head' => [1, 0]]]);

    $alice->sync()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('people.0.name', 'Bob Martinez')
        ->assertJsonPath('people.0.initials', 'BM')
        ->assertJsonPath('people.0.field', 'title')
        ->assertJsonPath('people.0.cursor.head', [1, 0])
        ->assertJsonPath('people.0.self', false);
});

it('ignores a made-up field and a malformed cursor', function (): void {
    arrangePresence($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    $bob->sync(['field' => '<img src=x onerror=alert(1)>']);
    $alice->sync()->assertJsonPath('people.0.field', null);

    $bob->sync(['field' => 'title', 'cursor' => ['anchor' => 'x', 'head' => 'y']]);
    $alice->sync()->assertJsonPath('people.0.cursor', null);
});

it('does not count your other tab as another person', function (): void {
    arrangePresence($this);
    $one = Editor::open($this, $this->alice, $this->article);
    $two = Editor::open($this, $this->alice, $this->article);

    $one->sync();

    $two->sync()->assertJsonPath('total', 0)->assertJsonPath('people.0.self', true);
});

it('does not resend people who have not changed', function (): void {
    arrangePresence($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $etag = $alice->sync()->json('presence');

    $alice->sync(['presence' => $etag])->assertJsonPath('people', null);
});

it('forgets people who leave or go silent', function (): void {
    arrangePresence($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    $bob->sync();
    $alice->sync()->assertJsonPath('total', 1);

    $bob->send(['leave' => true])->assertOk();
    $alice->sync()->assertJsonPath('total', 0);

    $bob->sync();
    $this->travel(21)->seconds();
    $alice->sync()->assertJsonPath('total', 0);
});

it('shows editors to people on the list and create pages', function (string $page): void {
    arrangePresence($this);
    Editor::open($this, $this->bob, $this->article)->sync();

    Editor::open($this, $this->alice, $this->article, $page)->sync()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('people.0.mode', 'editing')
        ->assertJsonPath('people.0.field', null);
})->with(['index', 'create']);

it('never shows one workspace to another', function (): void {
    arrangePresence($this);
    $outsider = User::factory()->create(['name' => 'Secret Person']);
    $outsider->workspace_id = 2;
    $outsider->save();
    $private = Document::create(['title' => 'Private', 'workspace_id' => 2]);

    Editor::open($this, $outsider, $private)->sync();

    Editor::open($this, $this->alice, $this->article, 'index')->sync()
        ->assertJsonPath('total', 0)
        ->assertJsonMissing(['name' => 'Secret Person']);
});

it('ignores a room chosen by the browser', function (): void {
    arrangePresence($this);
    $private = Document::create(['title' => 'Private', 'workspace_id' => 2]);

    app(PresenceRepository::class)->touch(new Participant(
        room: $room = app(RoomResolver::class)->forRecord($private),
        scope: null,
        client: 5,
        userKey: 'secret',
        name: 'Secret Person',
    ));

    Editor::open($this, $this->alice, $this->article)->sync(['room' => $room])->assertJsonMissing(['name' => 'Secret Person']);
});

it('shows people in the table column', function (): void {
    arrangePresence($this);
    Editor::open($this, $this->bob, $this->article)->sync();

    $this->actingAs($this->alice);

    Livewire\Livewire::test(ListDocuments::class)
        ->assertSee('fi-collab-avatar', false)
        ->assertSee('Bob Martinez · Editing');
});

it('reads presence once for a whole table page', function (): void {
    arrangePresence($this);
    foreach (range(1, 8) as $number) {
        Document::create(['title' => "Article {$number}"]);
    }

    $this->actingAs($this->alice);
    DB::enableQueryLog();

    Livewire\Livewire::test(ListDocuments::class);

    $queries = collect(DB::getQueryLog())->filter(fn (array $query): bool => str_contains($query['query'], 'filament_collaboration_participants'));

    expect($queries)->toHaveCount(1);
});
