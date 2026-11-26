<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use SolutionForest\Collaboration\Broadcasting\RoomChanged;
use SolutionForest\Collaboration\Rooms\RoomResolver;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeDeletion(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary']);
}

/** Bob deletes the article from its edit page, as a person would. */
function deleteAsBob(TestCase $test): void
{
    $test->actingAs($test->bob);
    Livewire::test(EditDocument::class, ['record' => $test->article->id])->callAction(DeleteAction::class);
}

it('tells everybody editing a record who deleted it, and keeps a soft-deleted draft', function (): void {
    arrangeDeletion($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared, edited')->sync();

    deleteAsBob($this);

    $alice->send()->assertNotFound()->assertExactJson(['error' => 'deleted', 'name' => 'Bob Martinez', 'restorable' => true]);

    expect($this->article->fresh()->trashed())->toBeTrue()
        ->and(DB::table('filament_collaboration_documents')->count())->toBe(1);
});

it('restores a soft-deleted record with its draft for someone who may', function (): void {
    arrangeDeletion($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared, edited')->sync();
    deleteAsBob($this);

    $alice->send(['restore' => true])->assertOk()->assertExactJson(['restored' => true]);

    expect($this->article->fresh()->trashed())->toBeFalse();

    $alice->sync();
    expect($alice->value('title'))->toBe('Shared, edited');
});

it('does not restore for someone whose policy says no', function (): void {
    arrangeDeletion($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    deleteAsBob($this);

    Gate::before(fn (User $user, string $ability): ?bool => $ability === 'restore' ? false : null);

    $alice->send(['restore' => true])->assertNotFound()->assertJsonPath('restorable', false);
    expect($this->article->fresh()->trashed())->toBeTrue();
});

it('deletes the draft and its unsaved images when a record is gone for good', function (): void {
    arrangeDeletion($this);
    Storage::fake('public');
    Storage::disk('public')->put('articles/unsaved.png', 'png');
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared, edited')->sync();
    DB::table('filament_collaboration_uploads')->insert([
        'room' => DB::table('filament_collaboration_documents')->value('room'),
        'field' => 'body_html', 'disk' => 'public', 'path' => 'articles/unsaved.png', 'created_at' => now()->getTimestamp(),
    ]);

    $this->actingAs($this->bob);
    $this->article->forceDelete();

    $alice->send()->assertNotFound()->assertExactJson(['error' => 'deleted', 'name' => 'Bob Martinez', 'restorable' => false]);

    expect(DB::table('filament_collaboration_documents')->count())->toBe(0)
        ->and(DB::table('filament_collaboration_updates')->count())->toBe(0)
        ->and(DB::table('filament_collaboration_uploads')->count())->toBe(0);
    Storage::disk('public')->assertMissing('articles/unsaved.png');
});

it('still says the record was deleted once the token has expired, but will not restore with it', function (): void {
    arrangeDeletion($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    deleteAsBob($this);

    $this->travel(16)->minutes();

    $alice->send(['restore' => true])->assertNotFound()->assertJsonPath('error', 'deleted');
    expect($this->article->fresh()->trashed())->toBeTrue();
});

it('pushes the deletion to the room at once', function (): void {
    arrangeDeletion($this);
    CollaborationPlugin::get()->broadcasting();
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();

    Event::fake([RoomChanged::class]);
    deleteAsBob($this);

    Event::assertDispatched(RoomChanged::class, fn (RoomChanged $event): bool => $event->channel === $alice->config['channel'] && $event->payload === ['refresh' => true]);
});

it('does nothing for a deleted model nobody was collaborating on', function (): void {
    arrangeDeletion($this);
    $other = Document::create(['title' => 'Alone']);

    $other->forceDelete();

    expect(DB::table('filament_collaboration_documents')->count())->toBe(0)
        ->and(cache()->get('filament-collaboration:deleted:'.app(RoomResolver::class)->forRecord($other)))->toBeNull();
});

it('does not tell someone who moved to another workspace that the record was deleted', function (): void {
    arrangeDeletion($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    deleteAsBob($this);

    $this->alice->forceFill(['workspace_id' => 2])->save();

    $alice->send()->assertNotFound()->assertExactJson(['error' => 'not_found']);
});
