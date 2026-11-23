<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Filament\Resources\Documents\RelationManagers\TasksRelationManager;
use App\Models\Document;
use App\Models\Task;
use App\Models\User;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Actions\Testing\TestAction;
use Illuminate\Support\Facades\Event;
use Livewire\Livewire;
use SolutionForest\FilamentCollaboration\Broadcasting\RoomChanged;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Rooms\RelationVersions;
use SolutionForest\FilamentCollaboration\Rooms\RoomResolver;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeRelations(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'First', 'excerpt' => 'Summary']);
    $test->actingAs($test->alice);
}

function checklist(TestCase $test): mixed
{
    return Livewire::test(TasksRelationManager::class, ['ownerRecord' => $test->article, 'pageClass' => EditDocument::class]);
}

function relationVersion(TestCase $test): int
{
    return app(RelationVersions::class)->version(app(RoomResolver::class)->forRecord($test->article));
}

it('raises the relation version when somebody creates, edits, toggles or deletes a related record', function (): void {
    arrangeRelations($this);

    checklist($this)->callAction(TestAction::make(CreateAction::class)->table(), ['title' => 'Check the links']);
    expect(relationVersion($this))->toBe(1);

    $task = Task::query()->sole();

    checklist($this)->callAction(TestAction::make(EditAction::class)->table($task), ['title' => 'Check every link']);
    checklist($this)->call('updateTableColumnState', 'done', (string) $task->getKey(), true);
    checklist($this)->callAction(TestAction::make(DeleteAction::class)->table($task));

    expect(relationVersion($this))->toBe(4)
        ->and(Task::query()->count())->toBe(0);
});

it('tells the others through their next sync, and their relation manager renders the new records', function (): void {
    arrangeRelations($this);
    $bob = Editor::open($this, $this->bob, $this->article);

    expect($bob->sync()->json('relations'))->toBe(0);

    $this->actingAs($this->alice);
    checklist($this)->callAction(TestAction::make(CreateAction::class)->table(), ['title' => 'Add a cover image']);

    expect($bob->sync()->json('relations'))->toBe(1);

    $this->actingAs($this->bob);
    $stale = checklist($this);

    Task::query()->update(['title' => 'Add a better cover image']);

    $stale->dispatch('filament-collaboration-relations-changed')->assertSee('Add a better cover image');
});

it('leaves a validation error alone', function (): void {
    arrangeRelations($this);

    checklist($this)->callAction(TestAction::make(CreateAction::class)->table(), ['title' => ''])->assertHasActionErrors(['title' => 'required']);

    expect(relationVersion($this))->toBe(0);
});

it('pushes the new version to everybody in the room when the panel broadcasts', function (): void {
    arrangeRelations($this);
    CollaborationPlugin::get()->broadcasting();
    $bob = Editor::open($this, $this->bob, $this->article);
    $bob->sync();

    Event::fake([RoomChanged::class]);
    $this->actingAs($this->alice);
    checklist($this)->callAction(TestAction::make(CreateAction::class)->table(), ['title' => 'Pushed']);

    $push = collect(Event::dispatched(RoomChanged::class))->flatten()->first(fn (RoomChanged $event): bool => $event->channel === $bob->config['channel']);

    expect($push?->payload)->toBe(['relations' => 1]);
});
