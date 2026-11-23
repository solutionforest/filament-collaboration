<?php

use App\Filament\Resources\Documents\DocumentResource;
use App\Filament\Resources\Documents\Pages\CreateDocument;
use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Filament\Resources\Documents\Pages\ListDocuments;
use App\Models\Document;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use Tests\Support\Editor;

it('requires authentication for collaboration endpoints', function (): void {
    $this->postJson('/admin/_collaboration/sync', ['batches' => []])->assertUnauthorized();
    $this->postJson('/admin/_collaboration/sync', ['field' => 'title'])->assertUnauthorized();
});

it('stores document updates independently and returns them in order', function (): void {
    $user = User::factory()->create();
    $one = Document::create(['title' => 'One']);
    $two = Document::create(['title' => 'Two']);
    $writer = Editor::open($this, $user, $one);
    $reader = Editor::open($this, $user, $one);
    $other = Editor::open($this, $user, $two);
    $writer->sync();
    $reader->sync();
    $writer->type('title', 'One a')->sync();
    $writer->type('title', 'One ab')->sync();
    $other->type('title', 'Two b')->sync();
    $reader->sync()->assertJsonCount(2, 'operations')->assertJsonPath('operations.0.v', ' a')->assertJsonPath('operations.1.v', 'b');
    $writer->send(['batches' => [['n' => 3, 'ops' => 'not operations']]])->assertConflict();
});

it('shows fresh presence and prevents another user claiming a tab', function (): void {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $article = Document::create(['title' => 'Presence']);
    $tab = Editor::open($this, $first, $article, 'index');
    $tab->sync();
    Editor::open($this, $second, $article, 'create')->sync()->assertJsonPath('people.0.name', $first->name);
    $tab->user = $second;
    $tab->send()->assertForbidden();
    $this->travel(1)->minutes();
    Editor::open($this, $second, $article, 'create')->sync()->assertJsonCount(0, 'people');
});

it('does not disclose or modify another workspace document or presence', function (): void {
    $alice = User::factory()->create(['name' => 'Alice']);
    $bob = User::factory()->create(['name' => 'Bob']);
    $bob->workspace_id = 2;
    $bob->save();
    $document = Document::create(['title' => 'Private', 'workspace_id' => 2]);
    $theirs = Editor::open($this, $bob, $document);
    $theirs->sync();
    $updates = DB::table('filament_collaboration_updates')->count();

    $this->actingAs($alice)->get(DocumentResource::getUrl('edit', ['record' => $document]))->assertNotFound();
    $this->get(DocumentResource::getUrl('view', ['record' => $document]))->assertNotFound();
    $theirs->type('title', 'Changed');
    $theirs->user = $alice;
    $theirs->send()->assertForbidden();
    Editor::open($this, $alice, $document, 'index')->sync()->assertJsonMissing(['name' => 'Bob']);
    $this->assertDatabaseCount('filament_collaboration_updates', $updates);
});

it('rechecks access after a user moves to another workspace', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Draft']);
    $editor = Editor::open($this, $user, $document);
    $editor->sync();
    $user->workspace_id = 2;
    $user->save();
    $editor->send()->assertNotFound();
});

it('accepts retries once and rejects a reused update id with different content', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Draft']);
    $editor = Editor::open($this, $user, $document);
    $editor->sync();
    $before = DB::table('filament_collaboration_updates')->count();
    $editor->type('title', 'Draft one');
    $editor->send()->assertOk();
    $editor->send()->assertOk();
    $this->assertDatabaseCount('filament_collaboration_updates', $before + 1);
    $editor->pending[0]['ops'][0]['v'] = ' other';
    $editor->send()->assertConflict();
    $this->assertDatabaseCount('filament_collaboration_updates', $before + 1);
});

it('only lists documents in the signed-in workspace', function (): void {
    $user = User::factory()->create();
    $own = Document::create(['title' => 'Own workspace', 'workspace_id' => 1]);
    $other = Document::create(['title' => 'Other workspace', 'workspace_id' => 2]);

    $this->actingAs($user);
    Livewire\Livewire::test(ListDocuments::class)
        ->assertCanSeeTableRecords([$own])
        ->assertCanNotSeeTableRecords([$other]);
});

it('creates a workspace document and opens the shared draft', function (): void {
    $user = User::factory()->create();
    $user->workspace_id = 2;
    $user->save();
    $this->actingAs($user);

    $page = Livewire\Livewire::test(CreateDocument::class)
        ->fillForm(['title' => 'New shared draft'])
        ->call('create')
        ->assertHasNoFormErrors();
    $document = Document::query()->where('title', 'New shared draft')->firstOrFail();
    expect($document->workspace_id)->toBe(2);
    $page->assertRedirect(DocumentResource::getUrl('edit', ['record' => $document]));
});

it('rejects stale form saves rather than overwriting a newer title', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Original']);
    $this->actingAs($user);
    $first = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $second = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $first->fillForm(['title' => 'First'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $second->fillForm(['title' => 'Second'])->call('save', shouldRedirect: false)->assertActionMounted('resolveCollaborationConflict');
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'First']);
});

it('shows current presence beside its record in the resource table', function (): void {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $colleague = User::factory()->create();
    $document = Document::create(['title' => 'Visible record']);
    Editor::open($this, $viewer, $document, 'view')->sync();
    $this->actingAs($colleague);
    Livewire\Livewire::test(ListDocuments::class)->assertSee('Viewer · Viewing');
});

it('identifies the current user and keeps stable identities across tabs', function (): void {
    $alice = User::factory()->create(['name' => 'Alice']);
    $bob = User::factory()->create(['name' => 'Bob']);
    $article = Document::create(['title' => 'Tabs']);
    Editor::open($this, $bob, $article, 'index')->sync();
    Editor::open($this, $bob, $article, 'index')->sync();
    Editor::open($this, $alice, $article, 'index')->sync();
    $response = Editor::open($this, $alice, $article, 'index')->sync();
    $people = $response->json('people');
    $bobs = array_values(array_filter($people, fn ($person) => $person['name'] === 'Bob'));
    $self = array_values(array_filter($people, fn ($person) => $person['name'] === 'Alice'));
    expect($bobs)->toHaveCount(2)
        ->and($bobs[0]['key'])->toBe($bobs[1]['key'])
        ->and($bobs[0]['self'])->toBeFalse()
        ->and($self[0]['self'])->toBeTrue()
        ->and($self[0])->not->toHaveKey('id');
});

it('reports allowed focused fields only for an edit page', function (): void {
    $user = User::factory()->create();
    $observer = User::factory()->create();
    $document = Document::create(['title' => 'Focus']);
    $edit = Editor::open($this, $user, $document);
    $watch = Editor::open($this, $observer, $document);
    $edit->sync(['field' => 'title']);
    $watch->sync()->assertJsonPath('people.0.field', 'title');
    $edit->sync(['field' => 'seo_title']);
    $watch->sync()->assertJsonPath('people.0.field', 'seo_title');
    $edit->sync(['field' => str_repeat('x', 101)]);
    $watch->sync()->assertJsonPath('people.0.field', null);
    $edit->send(['leave' => true]);
    Editor::open($this, $user, $document, 'view')->sync(['field' => 'title']);
    $watch->sync()->assertJsonPath('people.0.field', null);
});

it('renders a private article summary preview and escapes its content', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => '<script>unsafe</script>', 'excerpt' => 'A summary', 'status' => 'review']);
    $this->get(route('articles.preview', $document))->assertRedirect();
    $this->actingAs($user)->get(route('articles.preview', $document))
        ->assertOk()->assertSee('A summary')->assertSee('&lt;script&gt;unsafe&lt;/script&gt;', false)
        ->assertDontSee('<script>unsafe</script>', false)
        ->assertSee('shared draft is not published');
});

it('prevents another workspace from viewing an article preview', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Private', 'workspace_id' => 2]);
    $this->actingAs($user)->get(route('articles.preview', $document))->assertForbidden();
});

it('saves article details and rejects stale edits to them', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Article']);
    $this->actingAs($user);
    $first = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $stale = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $first->fillForm(['title' => 'Article', 'category' => 'Guides', 'status' => 'review', 'slug' => 'article-guide', 'excerpt' => 'Editorial summary'])
        ->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $stale->fillForm(['title' => 'Article', 'status' => 'published'])->call('save', shouldRedirect: false)->assertActionMounted('resolveCollaborationConflict');
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'category' => 'Guides', 'status' => 'review', 'slug' => 'article-guide', 'excerpt' => 'Editorial summary']);
});

it('seeds sample article drafts without duplicating them on repeat runs', function (): void {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);
    $this->assertDatabaseCount('documents', 15);
    $this->assertDatabaseCount('users', 100);
    $this->assertDatabaseCount('filament_collaboration_updates', 0);
    $this->assertDatabaseHas('documents', ['title' => 'Team planning', 'status' => 'published']);
    $this->assertDatabaseCount('document_relations', 1);
    $this->assertDatabaseCount('filament_collaboration_participants', 0);
});

it('merges different article fields changed by two editors', function (): void {
    $alice = User::factory()->create(['name' => 'Alice']);
    $bob = User::factory()->create(['name' => 'Bob']);
    $document = Document::create(['title' => 'Original', 'status' => 'draft', 'category' => 'News']);
    $this->actingAs($alice);
    $alicePage = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $this->actingAs($bob);
    $bobPage = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $bobPage->fillForm(['status' => 'review'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->actingAs($alice);
    $alicePage->fillForm(['title' => 'Revised'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Revised', 'status' => 'review']);
});

it('blocks a conflicting save while preserving the latest title and local form data', function (): void {
    $alice = User::factory()->create();
    $bob = User::factory()->create();
    $document = Document::create(['title' => 'Original']);
    $this->actingAs($alice);
    $alicePage = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $this->actingAs($bob);
    Livewire\Livewire::test(EditDocument::class, ['record' => $document->id])
        ->fillForm(['title' => 'Bob title'])->call('save', shouldRedirect: false);
    $this->actingAs($alice);
    $alicePage->fillForm(['title' => 'Alice title'])->call('save', shouldRedirect: false)
        ->assertActionMounted('resolveCollaborationConflict')->assertSet('data.title', 'Alice title');
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Bob title']);
    $alicePage->setActionData(['choices' => ['title' => 'theirs']])->callMountedAction()->assertHasNoActionErrors();
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Bob title']);
});

it('merges edits made from the article list and edit page', function (): void {
    $alice = User::factory()->create();
    $bob = User::factory()->create();
    $document = Document::create(['title' => 'Original', 'status' => 'draft', 'category' => 'News']);
    $this->actingAs($alice);
    $alicePage = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $this->actingAs($bob);
    Livewire\Livewire::test(ListDocuments::class)->assertCanSeeTableRecords([$document]);
    Livewire\Livewire::test(EditDocument::class, ['record' => $document->id])
        ->fillForm(['status' => 'review'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->actingAs($alice);
    $alicePage->fillForm(['title' => 'Revised'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Revised', 'status' => 'review']);
});

it('keeps the shared draft unchanged during an article form save', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Original']);
    $draft = ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'draft-state']]]]];
    $editor = Editor::open($this, $user, $document);
    $editor->type('body_html', $draft)->sync();
    $this->actingAs($user);
    Livewire\Livewire::test(EditDocument::class, ['record' => $document->id])
        ->fillForm(['title' => 'Revised'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $fresh = Editor::open($this, $user, $document);
    $fresh->sync()->assertJsonPath('dirty', ['body_html']);
    expect($fresh->value('body_html'))->toEqual($draft);
});

it('does not allow a user in another workspace to reuse a presence session', function (): void {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $second->workspace_id = 2;
    $second->save();
    $tab = Editor::open($this, $first, Document::create(['title' => 'Session']), 'index');
    $tab->sync();
    $tab->user = $second;
    $tab->send()->assertForbidden();
});

it('shows article presence in the table', function (): void {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $editor = User::factory()->create(['name' => 'Editor']);
    $document = Document::create(['title' => 'Record']);
    Editor::open($this, $editor, $document)->sync();
    $this->actingAs($viewer);
    Livewire\Livewire::test(ListDocuments::class)->assertSee('Editor · Editing');
});

it('does not apply a conflict choice if the saved value changes again', function (): void {
    $alice = User::factory()->create();
    $bob = User::factory()->create();
    $document = Document::create(['title' => 'Original']);
    $this->actingAs($alice);
    $alicePage = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $this->actingAs($bob);
    $bobPage = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $bobPage->fillForm(['title' => 'Bob one'])->call('save', shouldRedirect: false);
    $this->actingAs($alice);
    $alicePage->fillForm(['title' => 'Alice'])->call('save', shouldRedirect: false)->assertActionMounted('resolveCollaborationConflict');
    $this->actingAs($bob);
    $bobPage->fillForm(['title' => 'Bob two'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Bob two']);
    $this->actingAs($alice);
    $alicePage->setActionData(['choices' => ['title' => 'mine']])->callMountedAction()->assertHasErrors(['choices.title']);
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Bob two']);
});

it('can keep the local value after resolving an article conflict', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Original']);
    $this->actingAs($user);
    $first = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $second = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $first->fillForm(['title' => 'First'])->call('save', shouldRedirect: false);
    $second->fillForm(['title' => 'Second'])->call('save', shouldRedirect: false)
        ->assertActionMounted('resolveCollaborationConflict')
        ->setActionData(['choices' => ['title' => 'mine']])->callMountedAction()->assertHasNoActionErrors();
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Second']);
});

it('accepts identical concurrent changes without showing a conflict', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Original']);
    $this->actingAs($user);
    $first = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $second = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $first->fillForm(['title' => 'Same'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $second->fillForm(['title' => 'Same'])->call('save', shouldRedirect: false)->assertActionNotMounted('resolveCollaborationConflict');
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Same']);
});

it('keeps merged remote field values on a later save by the same editor', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Original', 'status' => 'draft']);
    $this->actingAs($user);
    $first = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $second = Livewire\Livewire::test(EditDocument::class, ['record' => $document->id]);
    $first->fillForm(['status' => 'review'])->call('save', shouldRedirect: false);
    $second->fillForm(['title' => 'Revised'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $second->fillForm(['excerpt' => 'Follow-up'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'Revised', 'status' => 'review', 'excerpt' => 'Follow-up']);
});

it('shows the collaborative Filament rich editor on edit and accepts body focus', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Rich body']);
    $this->actingAs($user);
    Livewire\Livewire::test(EditDocument::class, ['record' => $document->id])
        ->assertSee('richEditorFormComponent', false)
        ->assertSee('SEO', false)
        ->assertSee('Related posts', false);
    $editor = Editor::open($this, $user, $document);
    expect($editor->config['fields']['body_html'])->toBe('rich');
    $editor->sync(['field' => 'body_html']);
    Editor::open($this, User::factory()->create(), $document)->sync()->assertJsonPath('people.0.field', 'body_html');
});

it('publishes a public blog index and article page', function (): void {
    $this->seed(DatabaseSeeder::class);
    $this->get('/blog')->assertOk()->assertSee('Spring product update')->assertSee('Fieldnotes');
    $this->get('/blog/spring-product-update')
        ->assertOk()
        ->assertSee('Spring product update | Fieldnotes', false)
        ->assertSee('Welcome to the public Fieldnotes blog')
        ->assertSee('Team planning');
    $this->get('/blog/better-collaboration')->assertNotFound();
});

it('assigns the creating editor as author by default', function (): void {
    $user = User::factory()->create(['name' => 'Casey']);
    $this->actingAs($user);
    Livewire\Livewire::test(CreateDocument::class)
        ->fillForm(['title' => 'Authored piece', 'slug' => 'authored-piece', 'category' => 'News', 'status' => 'draft'])
        ->call('create')
        ->assertHasNoFormErrors();
    $document = Document::query()->where('slug', 'authored-piece')->firstOrFail();
    expect($document->author_id)->toBe($user->id);
});

it('shows which blog field another editor is working on', function (): void {
    $alice = User::factory()->create(['name' => 'Alice']);
    $bob = User::factory()->create(['name' => 'Bob']);
    $document = Document::create(['title' => 'Shared article']);
    $aliceTab = Editor::open($this, $alice, $document);
    $bobTab = Editor::open($this, $bob, $document);

    $aliceTab->sync(['field' => 'seo_title']);
    $bobTab->sync()->assertJsonPath('people.0.name', 'Alice')->assertJsonPath('people.0.field', 'seo_title');
    expect($bobTab->config['labels']['seo_title'])->toBe('Meta title');

    $aliceTab->sync(['field' => 'relatedPosts']);
    $bobTab->sync()->assertJsonPath('people.0.field', 'relatedPosts');
    expect($bobTab->config['labels']['relatedPosts'])->toBe('Related posts');
});

it('keeps presence usable with one hundred editors on the same article', function (): void {
    $document = Document::create(['title' => 'Busy desk', 'slug' => 'busy-desk', 'status' => 'draft']);
    $editors = User::factory()->count(100)->create();
    $fields = ['title', 'seo_title', 'body_html', 'relatedPosts', 'excerpt'];
    $tabs = [];

    foreach ($editors as $index => $editor) {
        $tabs[] = $tab = Editor::open($this, $editor, $document);
        $tab->sync(['field' => $fields[$index % count($fields)]]);
    }

    $response = $tabs[99]->sync();

    // The viewer is not one of "the others"; the header shows five and "+94".
    expect($response->json('people'))->toHaveCount(99)
        ->and($response->json('total'))->toBe(99)
        ->and($tabs[99]->config['avatarLimit'])->toBe(5)
        ->and(collect($response->json('people'))->pluck('field')->unique()->sort()->values()->all())
        ->toBe(collect($fields)->sort()->values()->all());
});
