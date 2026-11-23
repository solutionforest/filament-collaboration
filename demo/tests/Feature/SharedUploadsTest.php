<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeUploads(TestCase $test): void
{
    Storage::fake('public');
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Original', 'excerpt' => 'Summary', 'body_html' => '<p>Hello</p>']);
}

/** Stores an image the way the browser does as soon as it is inserted. */
function insertImage(TestCase $test, Editor $editor): string
{
    $test->actingAs($editor->user);
    $id = (string) Str::uuid();

    $stored = Livewire::test(EditDocument::class, ['record' => $test->article->id])
        ->set("componentFileAttachments.data.body_html.{$id}", UploadedFile::fake()->image('pixel.png'))
        ->instance()
        ->storeCollaborationAttachment('body_html', $id);

    $editor->type('body_html', ['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [
        ['type' => 'text', 'text' => 'Hello'],
        ['type' => 'image', 'attrs' => ['id' => $stored['id'], 'src' => $stored['src']]],
    ]]]])->sync();

    return $stored['id'];
}

function trackedUploads(): int
{
    return DB::table('filament_collaboration_uploads')->count();
}

it('leaves an image to the record once a save puts it there', function (): void {
    arrangeUploads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $path = insertImage($this, $alice);

    expect(trackedUploads())->toBe(1);

    $this->actingAs($this->bob);
    $bob = Editor::open($this, $this->bob, $this->article);
    $bob->sync();
    Livewire::test(EditDocument::class, ['record' => $this->article->id])
        ->set('collaborationSync', $bob->syncState())
        ->call('save', shouldRedirect: false);

    expect($this->article->fresh()->body_html)->toContain($path)
        ->and(trackedUploads())->toBe(0);
    Storage::disk('public')->assertExists($path);

    $this->artisan('filament-collaboration:prune-uploads', ['--hours' => 0])->assertSuccessful();
    Storage::disk('public')->assertExists($path);
});

it('deletes an image nobody saved when the draft is discarded', function (): void {
    arrangeUploads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $path = insertImage($this, $alice);

    $this->actingAs($this->bob);
    Livewire::test(EditDocument::class, ['record' => $this->article->id])->callAction('discardSharedDraft');

    Storage::disk('public')->assertMissing($path);
    expect(trackedUploads())->toBe(0);
});

it('prunes old images that neither a record nor a draft uses', function (): void {
    arrangeUploads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $removed = insertImage($this, $alice);
    $drafted = insertImage($this, $alice);

    // Too recent: the image may still be on its way to the draft.
    $this->artisan('filament-collaboration:prune-uploads')->assertSuccessful();
    Storage::disk('public')->assertExists($removed);

    $this->travel(25)->hours();
    $this->artisan('filament-collaboration:prune-uploads')
        ->expectsOutputToContain('Deleted 1 unused image.')
        ->assertSuccessful();

    Storage::disk('public')->assertMissing($removed);
    Storage::disk('public')->assertExists($drafted);
    expect(trackedUploads())->toBe(1);
});
