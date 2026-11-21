<?php

use App\Filament\Resources\Documents\DocumentResource;
use App\Filament\Resources\Documents\Pages\CreateDocument;
use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Filament\Resources\Documents\Pages\ListDocuments;
use App\Models\Document;
use App\Models\User;
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
    $second->fillForm(['title' => 'Second'])->call('save', shouldRedirect: false)->assertHasFormErrors(['title']);
    $this->assertDatabaseHas('documents', ['id' => $document->id, 'title' => 'First', 'revision' => 1]);
});

it('shows current presence beside its record in the resource table', function (): void {
    $viewer = User::factory()->create(['name' => 'Viewer']);
    $document = Document::create(['title' => 'Visible record']);
    $this->actingAs($viewer)->postJson('/collaboration/presence', [
        'session_id' => (string) Str::uuid(), 'document_id' => $document->id, 'page' => 'view',
    ])->assertOk();
    Livewire\Livewire::test(ListDocuments::class)->assertSee('Viewer (view)');
});
