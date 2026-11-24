<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use SolutionForest\FilamentCollaboration\Actions\CollaborationPanelAction;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeHistory(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'First', 'excerpt' => 'Summary']);
}

it('keeps a version every few minutes while people edit, not every keystroke', function (): void {
    arrangeHistory($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();

    $alice->type('title', 'First!')->sync();
    $alice->type('title', 'First!!')->sync();

    $this->travel(6)->minutes();
    $alice->type('title', 'Second')->sync();

    expect(DB::table('filament_collaboration_versions')->pluck('reason')->all())->toBe(['edit', 'edit']);
});

it('lists versions newest first, with who and which fields changed since the one before', function (): void {
    arrangeHistory($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'First draft')->sync();
    $this->travel(6)->minutes();
    $alice->type('excerpt', 'Summary, longer')->sync();

    $this->actingAs($this->alice);
    $versions = Livewire::test(EditDocument::class, ['record' => $this->article->id])->instance()->getCollaborationVersions();

    expect($versions[0])->toMatchArray(['reason' => 'edit', 'name' => 'Alice Chen', 'changed' => ['excerpt']])
        // Where the history starts: nothing before it to compare with.
        ->and($versions[1]['changed'])->toBe([]);
});

it('restores the draft from a version for everybody, keeping the current one in the history', function (): void {
    arrangeHistory($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();
    $alice->type('title', 'Good title')->sync();
    $this->travel(6)->minutes();
    $alice->type('title', 'Bad title')->sync();

    $good = DB::table('filament_collaboration_versions')->orderBy('id')->value('id');

    $this->actingAs($this->bob);
    Livewire::test(EditDocument::class, ['record' => $this->article->id])
        ->call('restoreCollaborationVersion', $good)
        ->assertNotified(__('filament-collaboration::collaboration.panel.restored'));

    $alice->sync();

    expect($alice->value('title'))->toBe('Good title')
        ->and(DB::table('filament_collaboration_versions')->orderByDesc('id')->limit(2)->pluck('reason')->all())->toBe(['restore', 'before']);
});

it('shows the panel on the edit page, with the history', function (): void {
    arrangeHistory($this);
    $this->actingAs($this->alice);

    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'First draft')->sync();

    $page = Livewire::test(EditDocument::class, ['record' => $this->article->id])
        ->assertActionVisible(CollaborationPanelAction::class);

    expect(view('filament-collaboration::panel', ['page' => $page->instance()])->render())
        ->toContain('data-collaboration-history')
        ->toContain('Alice Chen');
});
