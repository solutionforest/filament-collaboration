<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Livewire;
use SolutionForest\Collaboration\Documents\DocumentRepository;
use SolutionForest\Collaboration\Documents\SharedUploads;
use SolutionForest\Collaboration\Rooms\RoomResolver;
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

it('keeps an image a discard removed while the history has it, so restoring finds it, and deletes it once nothing has it', function (): void {
    arrangeUploads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $path = insertImage($this, $alice);

    $this->actingAs($this->bob);
    Livewire::test(EditDocument::class, ['record' => $this->article->id])->callAction('discardSharedDraft');

    // The draft from before the discard is in the history, with the image.
    expect(DB::table('filament_collaboration_versions')->orderByDesc('id')->value('reason'))->toBe('discard');
    Storage::disk('public')->assertExists($path);

    DB::table('filament_collaboration_versions')->delete();
    $this->travel(25)->hours();
    $this->artisan('filament-collaboration:prune-uploads')->assertSuccessful();

    Storage::disk('public')->assertMissing($path);
    expect(trackedUploads())->toBe(0);
});

it("leaves a colleague's upload alone when somebody discards only the fields they may edit", function (): void {
    arrangeUploads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $path = insertImage($this, $alice);
    $room = app(RoomResolver::class)->forRecord($this->article);

    // Somebody for whom the article body is not live discards: only their fields go.
    app(DocumentRepository::class)->discard($room, ['title', 'excerpt']);
    app(SharedUploads::class)->discard($room, ['title', 'excerpt']);

    Storage::disk('public')->assertExists($path);
    expect(trackedUploads())->toBe(1);
});

it('prunes old images that neither a record, a draft nor the history uses', function (): void {
    arrangeUploads($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $removed = insertImage($this, $alice);
    $drafted = insertImage($this, $alice);

    // Too recent: the image may still be on its way to the draft.
    $this->artisan('filament-collaboration:prune-uploads')->assertSuccessful();
    Storage::disk('public')->assertExists($removed);

    $this->travel(25)->hours();

    // A kept version still has the removed image: restoring it must find the file.
    $this->artisan('filament-collaboration:prune-uploads')->assertSuccessful();
    Storage::disk('public')->assertExists($removed);

    DB::table('filament_collaboration_versions')->delete();
    $this->artisan('filament-collaboration:prune-uploads')
        ->expectsOutputToContain('Deleted 1 unused image.')
        ->assertSuccessful();

    Storage::disk('public')->assertMissing($removed);
    Storage::disk('public')->assertExists($drafted);
    expect(trackedUploads())->toBe(1);
});
