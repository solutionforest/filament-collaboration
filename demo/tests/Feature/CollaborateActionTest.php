<?php

use App\Filament\Resources\Documents\Pages\ListDocuments;
use App\Models\Document;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Livewire\Livewire;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeModal(TestCase $test): void
{
    $test->actingAs($test->alice = User::factory()->create());
    $test->article = Document::create(['title' => 'Original', 'excerpt' => 'Summary']);
    $test->modal = Livewire::test(ListDocuments::class)->mountAction(TestAction::make('edit')->table($test->article));
}

it('opens as a modal with a presence room', function (): void {
    arrangeModal($this);
    $this->modal->assertMountedActionModalSee('data-collaboration', escape: false);
});

it('saves', function (): void {
    arrangeModal($this);
    $this->modal->setActionData(['title' => 'Mine'])->callMountedAction()->assertHasNoActionErrors();

    expect($this->article->fresh()->title)->toBe('Mine');
});

it('merges a field someone else changed', function (): void {
    arrangeModal($this);
    $this->modal->setActionData(['title' => 'Mine']);
    $this->article->update(['excerpt' => 'Their summary']);
    $this->modal->callMountedAction();

    expect($this->article->fresh())->title->toBe('Mine')->excerpt->toBe('Their summary');
});

it('stops on a conflict without losing what was typed', function (): void {
    arrangeModal($this);
    $this->modal->setActionData(['title' => 'Mine']);
    $this->article->update(['title' => 'Theirs']);
    $this->modal->callMountedAction()->assertNotified();

    expect($this->article->fresh()->title)->toBe('Theirs')
        ->and(data_get($this->modal->instance()->mountedActions, '0.data.title'))->toBe('Mine');
});

it('keeps yours on a second submit', function (): void {
    arrangeModal($this);
    $this->modal->setActionData(['title' => 'Mine']);
    $this->article->update(['title' => 'Theirs']);
    $this->modal->callMountedAction();
    $this->modal->callMountedAction();

    expect($this->article->fresh()->title)->toBe('Mine');
});

it('asks again if the conflicting value changed again', function (): void {
    arrangeModal($this);
    $this->modal->setActionData(['title' => 'Mine']);
    $this->article->update(['title' => 'Theirs']);
    $this->modal->callMountedAction();
    $this->article->update(['title' => 'Theirs again']);
    $this->modal->callMountedAction();

    expect($this->article->fresh()->title)->toBe('Theirs again');
});

it('arrives in open editors', function (): void {
    arrangeModal($this);
    $bob = Editor::open($this, User::factory()->create(), $this->article);
    $bob->sync();

    $this->actingAs($this->alice);
    $this->modal->setActionData(['title' => 'From a modal'])->callMountedAction();

    Editor::open($this, $this->alice, $this->article);
    $bob->sync();

    expect($bob->value('title'))->toBe('From a modal');
});
