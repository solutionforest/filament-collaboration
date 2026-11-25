<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use SolutionForest\Collaboration\Contracts\PresenceRepository;
use SolutionForest\Collaboration\Documents\DocumentRepository;
use SolutionForest\Collaboration\Documents\SharedField;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\Collaboration\Enums\PresenceMode;
use SolutionForest\Collaboration\Presence\Participant;
use SolutionForest\Collaboration\Rooms\RoomContext;
use Tests\Support\Editor;

// Bugs found by a review of the whole package, each kept from coming back.

it("never compacts a language's draft while people are editing the record", function (): void {
    $documents = app(DocumentRepository::class);
    $draft = RoomContext::draftFor('record-room', 'fr');
    $fields = [new SharedField('title', FieldKind::Text, 'Bonjour', [])];

    // Somebody is editing: present in the record's room, where everybody on a translated page is.
    app(PresenceRepository::class)->touch(new Participant(room: 'record-room', scope: 'pages', client: 1, userKey: 'u1', name: 'Alice', mode: PresenceMode::Editing));
    $documents->reconcile($draft, $fields);
    $documents->link($draft, 'record-room');
    DB::table('filament_collaboration_documents')->where('room', $draft)->update(['sequence' => 500, 'compacted_at_sequence' => 0, 'dirty' => '[]']);
    $epoch = DB::table('filament_collaboration_documents')->where('room', $draft)->value('epoch');

    $documents->reconcile($draft, $fields);

    // A compaction starts a new epoch, and refuses the editors' unsent edits.
    expect(DB::table('filament_collaboration_documents')->where('room', $draft)->value('epoch'))->toBe($epoch);
});

it('restores only the options a person may pick, as when they pick', function (): void {
    $alice = User::factory()->create();
    $article = Document::create(['title' => 'First', 'status' => 'draft']);
    $editor = Editor::open($this, $alice, $article);
    $editor->sync();
    $editor->type('title', 'Second')->sync();

    // A version whose status is not one of the field's options, as an older form might have offered.
    DB::table('filament_collaboration_versions')->update(['values' => json_encode(['title' => 'First', 'status' => 'retired'])]);
    $id = DB::table('filament_collaboration_versions')->value('id');

    $this->actingAs($alice);
    Livewire::test(EditDocument::class, ['record' => $article->id])->call('restoreCollaborationVersion', $id);

    $editor->sync();

    expect($editor->value('title'))->toBe('First')
        ->and($editor->value('status'))->not->toBe('retired');
});
