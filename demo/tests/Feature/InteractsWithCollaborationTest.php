<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportLockedProperties\CannotUpdateLockedPropertyException;
use Livewire\Livewire;
use SolutionForest\Collaboration\Events\ChangesMerged;
use SolutionForest\Collaboration\Events\ConflictDetected;
use SolutionForest\Collaboration\Events\ConflictResolved;
use SolutionForest\Collaboration\Events\SharedDraftSaved;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeEditing(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Original', 'excerpt' => 'Summary', 'body_html' => '<p>Hello</p>']);
}

/** An edit page in Livewire that reports what a connected browser would. */
function connectedPage(Editor $editor, Document $article)
{
    test()->actingAs($editor->user);

    $page = Livewire::test(EditDocument::class, ['record' => $article->getKey()]);
    $editor->config['client'] = $page->get('collaborationClient');

    return $page;
}

describe('live', function (): void {
    it('saves everything in the shared draft', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $bob = Editor::open($this, $this->bob, $this->article);

        $alice->sync();
        $bob->sync();
        $bob->type('excerpt', 'Summary from Bob')->sync();
        $alice->type('title', 'Original, revised')->sync();

        connectedPage($alice, $this->article)
            ->set('collaborationSync', $alice->syncState())
            ->call('save', shouldRedirect: false)
            ->assertHasNoFormErrors();

        expect($this->article->fresh())
            ->title->toBe('Original, revised')
            ->excerpt->toBe('Summary from Bob');

        expect($bob->sync()->json('dirty'))->toBe([]);
    });

    it('saves what had not been sent yet', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();

        $page = connectedPage($alice, $this->article);
        $alice->type('title', 'Original!');

        $page->set('collaborationSync', $alice->syncState())->call('save', shouldRedirect: false);

        expect($this->article->fresh()->title)->toBe('Original!');
    });

    it('saves rich content as HTML', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();
        $alice->type('body_html', ['type' => 'doc', 'content' => [
            ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'Hello '], ['type' => 'text', 'text' => 'team', 'marks' => [['type' => 'bold']]]]],
        ]])->sync();

        connectedPage($alice, $this->article)->set('collaborationSync', $alice->syncState())->call('save', shouldRedirect: false);

        expect($this->article->fresh()->body_html)->toBe('<p>Hello <strong>team</strong></p>');
    });

    it('gives the browser its own state back, so typing during a save survives', function (): void {
        arrangeEditing($this);
        $bob = Editor::open($this, $this->bob, $this->article);
        $bob->sync();
        $bob->type('excerpt', 'Summary from Bob')->sync();

        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();

        connectedPage($alice, $this->article)
            ->set('collaborationSync', $alice->syncState())
            ->call('save', shouldRedirect: false)
            ->assertSet('data.excerpt', 'Summary');

        expect($this->article->fresh()->excerpt)->toBe('Summary from Bob');
    });

    it('still validates the shared draft', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();
        $alice->type('title', str_repeat('x', 256))->sync();

        connectedPage($alice, $this->article)
            ->set('collaborationSync', $alice->syncState())
            ->call('save', shouldRedirect: false)
            ->assertHasFormErrors(['title']);

        expect($this->article->fresh()->title)->toBe('Original');
    });

    it('falls back to merging when the browser\'s report is not valid', function (): void {
        arrangeEditing($this);
        $this->actingAs($this->alice);

        Livewire::test(EditDocument::class, ['record' => $this->article->id])
            ->fillForm(['title' => 'Typed'])
            ->set('collaborationSync', json_encode(['epoch' => 99, 'fields' => ['title'], 'batches' => [['n' => 1, 'ops' => []]]]))
            ->call('save', shouldRedirect: false)
            ->assertHasNoFormErrors();

        expect($this->article->fresh()->title)->toBe('Typed');
    });

    it('cannot be used to write a field that is not in the form', function (): void {
        arrangeEditing($this);
        $this->actingAs($this->alice);

        Livewire::test(EditDocument::class, ['record' => $this->article->id])
            ->set('collaborationSync', json_encode(['epoch' => 1, 'fields' => ['workspace_id'], 'batches' => []]))
            ->call('save', shouldRedirect: false);

        expect($this->article->fresh()->workspace_id)->toBe(1);
    });

    it('will not save an image that only its uploader has', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();
        $alice->type('body_html', ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [
            ['type' => 'image', 'attrs' => ['id' => '7f9c24e8-3b12-4fef-91e0-5f8e3a2b1c4d', 'src' => 'https://example.com/tmp.png']],
        ]]]])->sync();

        connectedPage($alice, $this->article)
            ->set('collaborationSync', $alice->syncState())
            ->call('save', shouldRedirect: false)
            ->assertNotified(__('filament-collaboration::collaboration.foreign_upload'));

        expect($this->article->fresh()->body_html)->toBe('<p>Hello</p>');
    });

    it('discards the draft for everybody', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();
        $alice->type('title', 'Original junk')->sync();

        $this->actingAs($this->bob);
        Livewire::test(EditDocument::class, ['record' => $this->article->id])
            ->callAction('discardSharedDraft')
            ->assertHasNoActionErrors();

        $response = $alice->sync();

        expect($alice->value('title'))->toBe('Original')->and($response->json('dirty'))->toBe([]);
    });

    it('announces what was published', function (): void {
        arrangeEditing($this);
        Event::fake([SharedDraftSaved::class]);

        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();
        $alice->type('title', 'Original!')->sync();

        connectedPage($alice, $this->article)->set('collaborationSync', $alice->syncState())->call('save', shouldRedirect: false);

        Event::assertDispatched(SharedDraftSaved::class, fn (SharedDraftSaved $event): bool => in_array('title', $event->fields, true));
    });

    it('lets a save without live editing win over the draft in the fields it changed', function (): void {
        arrangeEditing($this);
        $alice = Editor::open($this, $this->alice, $this->article);
        $alice->sync();
        $alice->type('title', 'Original draft')->sync();

        $this->actingAs($this->bob);
        Livewire::test(EditDocument::class, ['record' => $this->article->id])
            ->fillForm(['title' => 'Saved by Bob'])
            ->call('save', shouldRedirect: false);

        $alice->sync();

        expect($alice->value('title'))->toBe('Saved by Bob');
    });

    it('makes the demo\'s stock fields live', function (): void {
        arrangeEditing($this);
        $fields = Editor::open($this, $this->alice, $this->article)->config['fields'];

        expect($fields)->toMatchArray([
            'title' => 'text',
            'excerpt' => 'text',
            'body_html' => 'rich',
            'status' => 'value',
            'tags' => 'value',
            'robots_noindex' => 'value',
            'relatedPosts' => 'value',
        ]);
    });
});

describe('merge on save', function (): void {
    it('merges different fields changed by two editors', function (): void {
        arrangeEditing($this);
        Event::fake([ChangesMerged::class]);

        $this->actingAs($this->alice);
        $alice = Livewire::test(EditDocument::class, ['record' => $this->article->id]);

        $this->actingAs($this->bob);
        Livewire::test(EditDocument::class, ['record' => $this->article->id])
            ->fillForm(['status' => 'review'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();

        $this->actingAs($this->alice);
        $alice->fillForm(['title' => 'Revised'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();

        expect($this->article->fresh())->title->toBe('Revised')->status->toBe('review');
        Event::assertDispatched(ChangesMerged::class);
    });

    it('asks about a conflict and keeps what was typed', function (): void {
        arrangeEditing($this);
        Event::fake([ConflictDetected::class]);

        $this->actingAs($this->alice);
        $alice = Livewire::test(EditDocument::class, ['record' => $this->article->id]);

        $this->article->update(['title' => 'Theirs']);

        $alice->fillForm(['title' => 'Mine'])
            ->call('save', shouldRedirect: false)
            ->assertActionMounted('resolveCollaborationConflict')
            ->assertSet('data.title', 'Mine');

        expect($this->article->fresh()->title)->toBe('Theirs');
        Event::assertDispatched(ConflictDetected::class);
    });

    it('applies either choice', function (string $choice, string $expected): void {
        arrangeEditing($this);
        Event::fake([ConflictResolved::class]);

        $this->actingAs($this->alice);
        $page = Livewire::test(EditDocument::class, ['record' => $this->article->id]);

        $this->article->update(['title' => 'Theirs']);

        $page->fillForm(['title' => 'Mine'])->call('save', shouldRedirect: false)
            ->setActionData(['choices' => ['title' => $choice]])
            ->callMountedAction()
            ->assertHasNoActionErrors();

        expect($this->article->fresh()->title)->toBe($expected);
        Event::assertDispatched(ConflictResolved::class);
    })->with([['mine', 'Mine'], ['theirs', 'Theirs']]);

    it('does not overwrite another field changed while the dialog was open', function (): void {
        arrangeEditing($this);
        $this->actingAs($this->alice);
        $page = Livewire::test(EditDocument::class, ['record' => $this->article->id]);

        $this->article->update(['title' => 'Theirs']);
        $page->fillForm(['title' => 'Mine'])->call('save', shouldRedirect: false);
        $this->article->update(['excerpt' => 'Changed meanwhile']);

        $page->setActionData(['choices' => ['title' => 'mine']])->callMountedAction();

        expect($this->article->fresh())->title->toBe('Mine')->excerpt->toBe('Changed meanwhile');
    });

    it('pulls in what others saved', function (): void {
        arrangeEditing($this);
        $this->actingAs($this->alice);
        $page = Livewire::test(EditDocument::class, ['record' => $this->article->id])->fillForm(['title' => 'Mine']);

        $this->article->update(['status' => 'review']);

        $page->call('collaborationPull', true)->assertSet('data.status', 'review')->assertSet('data.title', 'Mine')->assertNotified();
    });

    it('works with live editing switched off', function (): void {
        arrangeEditing($this);
        CollaborationPlugin::get()->liveEditing(false);

        expect(Editor::open($this, $this->alice, $this->article)->config['fields'])->toBe([]);

        $this->actingAs($this->alice);
        Livewire::test(EditDocument::class, ['record' => $this->article->id])->fillForm(['title' => 'Saved'])->call('save', shouldRedirect: false);

        expect($this->article->fresh()->title)->toBe('Saved');
    });

    it('locks its bookkeeping against the browser', function (string $property, mixed $value): void {
        arrangeEditing($this);
        $this->actingAs($this->alice);

        Livewire::test(EditDocument::class, ['record' => $this->article->id])->set($property, $value);
    })->with([
        ['collaborationClient', 1],
        ['collaborationBase', []],
        ['collaborationTheirs', []],
    ])->throws(CannotUpdateLockedPropertyException::class);
});

it('stores an upload at once so anybody can save it', function (): void {
    arrangeEditing($this);
    Storage::fake('public');
    $this->actingAs($this->alice);

    $page = Livewire::test(EditDocument::class, ['record' => $this->article->id])
        ->set('componentFileAttachments.data.body_html.7f9c24e8-3b12-4fef-91e0-5f8e3a2b1c4d', UploadedFile::fake()->image('pixel.png'));

    $stored = $page->instance()->storeCollaborationAttachment('body_html', '7f9c24e8-3b12-4fef-91e0-5f8e3a2b1c4d');

    expect($stored['id'])->toStartWith('articles/')
        ->and($stored['src'])->toContain($stored['id']);
    Storage::disk('public')->assertExists($stored['id']);

    expect($page->instance()->storeCollaborationAttachment('body_html', 'not-an-upload'))->toBeNull()
        ->and($page->instance()->storeCollaborationAttachment('title', '7f9c24e8-3b12-4fef-91e0-5f8e3a2b1c4d'))->toBeNull();
});
