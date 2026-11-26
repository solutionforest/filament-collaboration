<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Livewire\Livewire;
use SolutionForest\Collaboration\Documents\EditTrail;
use SolutionForest\Collaboration\Events\DraftEdited;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangeTrail(TestCase $test, bool $auditing = true): void
{
    CollaborationPlugin::get()->audit($auditing);
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary']);
}

it('keeps one row per person, field and minute, not one per keystroke', function (): void {
    arrangeTrail($this);
    Event::fake([DraftEdited::class]);
    $this->travelTo(now()->startOfMinute()->addSeconds(5));
    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);
    $alice->sync();
    $bob->sync();

    $alice->type('title', 'Shared!')->sync();
    $alice->type('title', 'Shared!!')->sync();
    $bob->type('excerpt', 'Summary by Bob')->sync();

    $this->travel(2)->minutes();
    $alice->type('title', 'Shared!!!')->sync();

    $trail = app(EditTrail::class)->for($this->article);

    expect(array_map(fn (array $row): string => "{$row['user_name']} {$row['field']}", $trail))->toBe([
        'Alice Chen title',
        'Bob Martinez excerpt',
        'Alice Chen title',
    ])->and($trail[0]['user_id'])->toBe((string) $this->alice->getKey())
        ->and($trail[0]['at']->getTimestamp() % 60)->toBe(0);

    Event::assertDispatchedTimes(DraftEdited::class, 3);
    Event::assertDispatched(DraftEdited::class, fn (DraftEdited $event): bool => $event->by->name === 'Bob Martinez' && $event->field === 'excerpt' && $event->record->is($this->article));
});

it('records the edits that only reached the server with a save', function (): void {
    arrangeTrail($this);
    $alice = Editor::open($this, $this->alice, $this->article);
    $this->actingAs($this->alice);
    $page = Livewire::test(EditDocument::class, ['record' => $this->article->id]);
    $alice->config['client'] = $page->get('collaborationClient');
    $alice->sync();
    $alice->type('excerpt', 'Summary, saved at once');

    $page->set('collaborationSync', $alice->syncState())->call('save', shouldRedirect: false);

    expect(array_column(app(EditTrail::class)->for($this->article), 'field'))->toBe(['excerpt']);
});

it('keeps no trail unless auditing is on', function (): void {
    arrangeTrail($this, auditing: false);
    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();
    $alice->type('title', 'Shared!')->sync();

    expect(DB::table('filament_collaboration_edits')->count())->toBe(0);
});
