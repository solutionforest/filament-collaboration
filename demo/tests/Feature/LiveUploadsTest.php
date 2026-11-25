<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use SolutionForest\Collaboration\Documents\SharedUploads;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeGallery(TestCase $test): void
{
    Storage::fake('public');
    Storage::disk('public')->put('gallery/existing.png', 'png');
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->article = Document::create(['title' => 'Gallery', 'gallery' => ['gallery/existing.png']]);
}

/** Uploads a picture to the gallery the way the browser does, then stores it. */
function uploadToGallery(TestCase $test, ?UploadedFile $file = null): array
{
    $test->actingAs($test->alice);
    $key = (string) Str::uuid();

    return Livewire::test(EditDocument::class, ['record' => $test->article->id])
        ->set("data.gallery.{$key}", $file ?? UploadedFile::fake()->image('photo.png'))
        ->instance()
        ->storeCollaborationUpload('gallery');
}

it('makes upload fields live, as a list of files', function (): void {
    arrangeGallery($this);
    $editor = Editor::open($this, $this->alice, $this->article);

    expect($editor->config['fields'])->toMatchArray(['gallery' => 'items', 'cover_image' => 'items'])
        ->and($editor->config['uploads'])->toBe(['gallery', 'cover_image']);

    $editor->sync();

    expect(array_values($editor->value('gallery')))->toBe(['gallery/existing.png']);
});

it('stores a file as soon as it is uploaded, so everybody can have it', function (): void {
    arrangeGallery($this);

    $files = uploadToGallery($this);
    $stored = array_values(array_diff($files, ['gallery/existing.png']));

    expect($stored)->toHaveCount(1)
        ->and($stored[0])->toStartWith('gallery/');
    Storage::disk('public')->assertExists($stored[0]);
    expect(DB::table('filament_collaboration_uploads')->where('field', 'gallery')->value('path'))->toBe($stored[0]);
});

it('checks an upload with the field\'s own rules before storing it', function (): void {
    arrangeGallery($this);

    uploadToGallery($this, UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'));
})->throws(ValidationException::class);

it('accepts only files stored for the draft, or the record\'s own', function (): void {
    arrangeGallery($this);
    $stored = array_values(array_diff(uploadToGallery($this), ['gallery/existing.png']))[0];
    $editor = Editor::open($this, $this->alice, $this->article);
    $editor->sync();

    $items = $editor->value('gallery');
    $editor->type('gallery', [...$items, '0bd2a5a4-9f52-4c4b-8a5e-6f0a1b2c3d4e' => $stored])->sync()->assertOk();

    $editor->type('gallery', [...$editor->value('gallery'), '1bd2a5a4-9f52-4c4b-8a5e-6f0a1b2c3d4e' => 'private/someone-else.png']);
    $editor->send()->assertConflict();
});

it('saves the shared list of files to the record', function (): void {
    arrangeGallery($this);
    $stored = array_values(array_diff(uploadToGallery($this), ['gallery/existing.png']))[0];
    $editor = Editor::open($this, $this->alice, $this->article);
    $this->actingAs($this->alice);
    $page = Livewire::test(EditDocument::class, ['record' => $this->article->id]);
    $editor->config['client'] = $page->get('collaborationClient');
    $editor->sync();
    $editor->type('gallery', ['0bd2a5a4-9f52-4c4b-8a5e-6f0a1b2c3d4e' => $stored, ...$editor->value('gallery')]);

    $page->set('collaborationSync', $editor->syncState())->call('save', shouldRedirect: false)->assertHasNoFormErrors();

    expect($this->article->fresh()->gallery)->toBe([$stored, 'gallery/existing.png'])
        ->and(DB::table('filament_collaboration_uploads')->count())->toBe(0);
});

it('knows which files were stored for a draft, for file path checks', function (): void {
    arrangeGallery($this);
    $stored = array_values(array_diff(uploadToGallery($this), ['gallery/existing.png']))[0];

    expect(app(SharedUploads::class)->isStored($stored))->toBeTrue()
        ->and(app(SharedUploads::class)->isStored('gallery/other.png'))->toBeFalse();
});
