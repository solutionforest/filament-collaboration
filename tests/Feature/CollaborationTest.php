<?php

use App\Filament\Resources\Documents\DocumentResource;
use App\Filament\Resources\Documents\Pages\CreateDocument;
use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Filament\Resources\Documents\Pages\ListDocuments;
use App\Models\Document;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

it('requires authentication for collaboration endpoints', function (): void {
    $document = Document::create(['title' => 'Test']);
    $this->getJson("/collaboration/documents/{$document->id}/updates")->assertUnauthorized();
    $this->postJson('/collaboration/presence', [])->assertUnauthorized();
});

it('stores document updates independently and returns them in order', function (): void {
    $user = User::factory()->create();
    $one = Document::create(['title' => 'One']);
    $two = Document::create(['title' => 'Two']);
    $this->actingAs($user)->postJson("/collaboration/documents/{$one->id}/updates", ['update' => base64_encode('a')])->assertOk();
    $this->postJson("/collaboration/documents/{$two->id}/updates", ['update' => base64_encode('b')])->assertOk();
    $this->getJson("/collaboration/documents/{$one->id}/updates")->assertOk()->assertJsonCount(1, 'updates')->assertJsonPath('updates.0.update', base64_encode('a'));
    $this->postJson("/collaboration/documents/{$one->id}/updates", ['update' => 'not base64!'])->assertUnprocessable();
});

it('shows fresh presence and prevents another user claiming a tab', function (): void {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $session = (string) Str::uuid();
    $body = ['session_id' => $session, 'page' => 'list'];
    $this->actingAs($first)->postJson('/collaboration/presence', $body)->assertOk()->assertJsonPath('presence.0.name', $first->name);
    $this->actingAs($second)->postJson('/collaboration/presence', $body)->assertForbidden();
    DB::table('collaboration_presence')->update(['seen_at' => now()->subMinute()]);
    $this->postJson('/collaboration/presence', ['session_id' => (string) Str::uuid(), 'page' => 'create'])->assertJsonCount(1, 'presence');
});

it('does not disclose or modify another workspace document or presence', function (): void {
    $alice = User::factory()->create(['name' => 'Alice']);
    $bob = User::factory()->create(['name' => 'Bob']);
    $bob->workspace_id = 2;
    $bob->save();
    $document = Document::create(['title' => 'Private', 'workspace_id' => 2]);
    $this->actingAs($bob)->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(), 'page' => 'edit', 'document_id' => $document->id,
    ])->assertOk();

    $this->actingAs($alice)->getJson("/collaboration/documents/{$document->id}/updates")->assertNotFound();
    $this->postJson("/collaboration/documents/{$document->id}/updates", ['update' => base64_encode('x')])->assertNotFound();
    $this->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(), 'page' => 'view', 'document_id' => $document->id,
    ])->assertNotFound();
    $this->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(), 'page' => 'list',
    ])->assertOk()->assertJsonMissing(['name' => 'Bob']);
    $this->assertDatabaseCount('collaboration_updates', 0);
});

it('rechecks access after a user moves to another workspace', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Draft']);
    $this->actingAs($user)->getJson("/collaboration/documents/{$document->id}/updates")->assertOk();
    $user->workspace_id = 2;
    $user->save();
    $this->getJson("/collaboration/documents/{$document->id}/updates")->assertNotFound();
});

it('accepts retries once and rejects a reused update id with different content', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Draft']);
    $body = ['client_update_id' => (string) Str::uuid(), 'update' => base64_encode('one')];
    $endpoint = "/collaboration/documents/{$document->id}/updates";
    $this->actingAs($user)->postJson($endpoint, $body)->assertOk();
    $this->postJson($endpoint, $body)->assertOk();
    $this->assertDatabaseCount('collaboration_updates', 1);
    $this->postJson($endpoint, [...$body, 'update' => base64_encode('other')])->assertConflict();
    $this->assertDatabaseCount('collaboration_updates', 1);
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
    $document = Document::create(['title' => 'Visible record']);
    $this->actingAs($viewer)->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(), 'document_id' => $document->id, 'page' => 'view',
    ])->assertOk();
    Livewire\Livewire::test(ListDocuments::class)->assertSee('Viewer (viewing)');
});

it('identifies the current user and keeps stable identities across tabs', function (): void {
    $alice = User::factory()->create(['name' => 'Alice']);
    $bob = User::factory()->create(['name' => 'Bob']);
    $this->actingAs($bob)->postJson('/collaboration/presence', ['session_id' => (string) Str::uuid(), 'page' => 'list'])->assertOk();
    $this->postJson('/collaboration/presence', ['session_id' => (string) Str::uuid(), 'page' => 'list'])->assertOk();
    $response = $this->actingAs($alice)->postJson('/collaboration/presence', ['session_id' => (string) Str::uuid(), 'page' => 'list'])->assertOk();
    $people = $response->json('presence');
    $bobs = array_values(array_filter($people, fn ($person) => $person['name'] === 'Bob'));
    $self = array_values(array_filter($people, fn ($person) => $person['name'] === 'Alice'));
    expect($bobs)->toHaveCount(2)
        ->and($bobs[0]['user_key'])->toBe($bobs[1]['user_key'])
        ->and($bobs[0]['is_you'])->toBeFalse()
        ->and($self[0]['is_you'])->toBeTrue()
        ->and($self[0])->not->toHaveKey('id');
});

it('reports allowed focused fields only for an edit page', function (): void {
    $user = User::factory()->create();
    $document = Document::create(['title' => 'Focus']);
    $session = (string) Str::uuid();
    $this->actingAs($user)->postJson('/collaboration/presence', [
        'session_id' => $session, 'document_id' => $document->id, 'page' => 'edit', 'focused_field' => 'title',
    ])->assertOk()->assertJsonPath('presence.0.focused_field', 'title');
    $this->postJson('/collaboration/presence', [
        'session_id' => $session, 'document_id' => $document->id, 'page' => 'view', 'focused_field' => 'title',
    ])->assertUnprocessable();
    $this->postJson('/collaboration/presence', [
        'session_id' => $session, 'document_id' => $document->id, 'page' => 'edit', 'focused_field' => 'arbitrary',
    ])->assertUnprocessable();
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
    $this->assertDatabaseCount('documents', 3);
    $this->assertDatabaseCount('collaboration_updates', 3);
    $this->assertDatabaseHas('documents', ['title' => 'Team planning', 'status' => 'review']);
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
    $this->actingAs($user)->postJson("/collaboration/documents/{$document->id}/updates", ['update' => base64_encode('draft-state')])->assertOk();
    Livewire\Livewire::test(EditDocument::class, ['record' => $document->id])
        ->fillForm(['title' => 'Revised'])->call('save', shouldRedirect: false)->assertHasNoFormErrors();
    $this->assertDatabaseHas('collaboration_updates', ['document_id' => $document->id, 'update' => base64_encode('draft-state')]);
    $this->assertDatabaseCount('collaboration_updates', 1);
});

it('does not allow a user in another workspace to reuse a presence session', function (): void {
    $first = User::factory()->create();
    $second = User::factory()->create();
    $second->workspace_id = 2;
    $second->save();
    $session = (string) Str::uuid();
    $this->actingAs($first)->postJson('/collaboration/presence', ['session_id' => $session, 'page' => 'list'])->assertOk();
    $this->actingAs($second)->postJson('/collaboration/presence', ['session_id' => $session, 'page' => 'list'])->assertForbidden();
});

it('shows article presence in the table', function (): void {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $editor = User::factory()->create(['name' => 'Editor']);
    $document = Document::create(['title' => 'Record']);
    $this->actingAs($editor)->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(), 'document_id' => $document->id, 'page' => 'edit',
    ])->assertOk();
    $this->actingAs($viewer);
    Livewire\Livewire::test(ListDocuments::class)->assertSee('Editor (editing)');
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
        ->assertSee('data-collaborative-rich-editor', false)
        ->assertSee('Live collaborative rich text', false);
    $this->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(),
        'document_id' => $document->id,
        'page' => 'edit',
        'focused_field' => 'body',
    ])->assertOk()->assertJsonPath('presence.0.focused_field', 'body');
});
