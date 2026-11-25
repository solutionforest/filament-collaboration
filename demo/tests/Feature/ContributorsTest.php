<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Livewire\Livewire;
use SolutionForest\Collaboration\Documents\Contributor;
use SolutionForest\Collaboration\Events\SharedDraftSaved;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeContributors(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->carol = User::factory()->create(['name' => 'Carol Diaz']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary']);
}

/** The edit page `$editor` types into, as its browser would. */
function pageOf(TestCase $test, Editor $editor): mixed
{
    $test->actingAs($editor->user);
    $page = Livewire::test(EditDocument::class, ['record' => $test->article->id]);
    $editor->config['client'] = $page->get('collaborationClient');

    return $page;
}

/** Saves, sending what the editor has not synced yet, as the browser does. */
function saveAs(TestCase $test, Editor $editor, mixed $page = null): void
{
    $page ??= pageOf($test, $editor);
    $test->actingAs($editor->user);
    $page->set('collaborationSync', $editor->syncState())->call('save', shouldRedirect: false)->assertHasNoFormErrors();
}

it('credits everybody who changed a field, not only whoever saved', function (): void {
    arrangeContributors($this);
    Event::fake([SharedDraftSaved::class]);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $carol = Editor::open($this, $this->carol, $this->article);
    $alice->sync();
    $bob->sync();
    $carol->sync();

    $alice->type('title', 'Shared by Alice')->sync();
    $bob->type('title', 'Shared by Alice and Bob')->sync();
    $bob->type('excerpt', 'Summary by Bob')->sync();
    $carol->sync();

    saveAs($this, $carol);

    Event::assertDispatched(SharedDraftSaved::class, function (SharedDraftSaved $event): bool {
        expect($event->user->is($this->carol))->toBeTrue()
            ->and($event->contributorNames())->toEqual(['title' => ['Alice Chen', 'Bob Martinez'], 'excerpt' => ['Bob Martinez']])
            ->and(array_map(fn (Contributor $person): string => $person->name, $event->contributors()))->toEqual(['Alice Chen', 'Bob Martinez'])
            ->and($event->contributors['title'][0]->user()?->is($this->alice))->toBeTrue()
            ->and($event->contributors['title'][0]->type)->toBe(User::class);

        return true;
    });
});

it('counts the person saving when they typed too, and starts afresh after each save', function (): void {
    arrangeContributors($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $page = pageOf($this, $alice);
    $alice->sync();
    $alice->type('title', 'Shared!');

    Event::fake([SharedDraftSaved::class]);
    saveAs($this, $alice, $page);

    Event::assertDispatched(SharedDraftSaved::class, fn (SharedDraftSaved $event): bool => $event->contributorNames() === ['title' => ['Alice Chen']]);

    // Saving again, with nothing new typed.
    Event::fake([SharedDraftSaved::class]);
    $alice->pending = [];
    saveAs($this, $alice, $page);

    Event::assertNotDispatched(SharedDraftSaved::class, fn (SharedDraftSaved $event): bool => $event->contributors !== []);
});

it('forgets the contributors of a discarded draft', function (): void {
    arrangeContributors($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared junk')->sync();

    $this->actingAs($this->bob);
    Livewire::test(EditDocument::class, ['record' => $this->article->id])->callAction('discardSharedDraft');

    $bob = Editor::open($this, $this->bob, $this->article);
    $page = pageOf($this, $bob);
    $bob->sync();
    $bob->type('excerpt', 'Summary by Bob');

    Event::fake([SharedDraftSaved::class]);
    saveAs($this, $bob, $page);

    Event::assertDispatched(SharedDraftSaved::class, fn (SharedDraftSaved $event): bool => $event->contributorNames() === ['excerpt' => ['Bob Martinez']]);
});
