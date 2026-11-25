<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\ItemsType;
use Tests\Support\Editor;
use Tests\Support\SchemaPage;

function arrangeItems(): Document
{
    return Document::create([
        'title' => 'Lists',
        'key_points' => [['point' => 'First', 'highlight' => true], ['point' => 'Second', 'highlight' => false]],
        'sidebar' => [['type' => 'quote', 'data' => ['text' => 'Hello', 'author' => 'Ann']]],
    ]);
}

it('makes repeaters and builders live, with the sub-fields their items may have', function (): void {
    $editor = Editor::open($this, User::factory()->create(), arrangeItems());

    expect($editor->config['fields'])->toMatchArray(['key_points' => 'items', 'sidebar' => 'items']);

    $editor->sync();

    expect(array_values($editor->value('key_points')))->toEqual([
        ['highlight' => true, 'point' => 'First'],
        ['highlight' => false, 'point' => 'Second'],
    ]);
});

it('leaves lists of uploads, rich text or nested lists to merge on save', function (): void {
    $kind = function (Repeater $repeater): ?FieldKind {
        Schema::make(Livewire::test(SchemaPage::class)->instance())->components([$repeater])->statePath('data')->getFlatFields();

        return (new ItemsType)->getKind($repeater);
    };

    expect($kind(Repeater::make('files')->schema([FileUpload::make('file')])))->toBeNull()
        ->and($kind(Repeater::make('nested')->schema([Repeater::make('inner')->schema([TextInput::make('a')])])))->toBeNull()
        ->and($kind(Repeater::make('plain')->schema([TextInput::make('a')])))->toBe(FieldKind::Items)
        ->and($kind(Repeater::make('secret')->schema([TextInput::make('a')->password()])))->toBeNull();
});

it('merges two people adding, editing and removing items, and saves it', function (): void {
    $article = arrangeItems();
    $alice = Editor::open($this, $alice_ = User::factory()->create(), $article);
    $bob = Editor::open($this, User::factory()->create(), $article);
    $alice->sync();
    $bob->sync();

    [$first, $second] = array_keys($alice->value('key_points'));
    $alice->type('key_points', [$first => ['point' => 'First, edited', 'highlight' => true], $second => ['point' => 'Second', 'highlight' => false], '0bd2a5a4-9f52-4c4b-8a5e-6f0a1b2c3d4e' => ['point' => 'Third', 'highlight' => false]])->sync();
    $bob->type('key_points', [$first => ['point' => 'First', 'highlight' => false]])->sync();
    $alice->sync();

    expect(array_values($alice->value('key_points')))->toBe(array_values($bob->value('key_points')))
        ->and(array_column(array_values($alice->value('key_points')), 'point'))->toBe(['First, edited', 'Third'])
        ->and(array_values($alice->value('key_points'))[0]['highlight'])->toBeFalse();

    $this->actingAs($alice_);
    $page = Livewire::test(EditDocument::class, ['record' => $article->id]);
    $alice->config['client'] = $page->get('collaborationClient');
    $page->set('collaborationSync', $alice->syncState())->call('save', shouldRedirect: false)->assertHasNoFormErrors();

    expect($article->fresh()->key_points)->toEqual([
        ['point' => 'First, edited', 'highlight' => false],
        ['point' => 'Third', 'highlight' => false],
    ]);
});

it('does not treat freshly loaded items as changes', function (): void {
    $article = arrangeItems();
    Editor::open($this, User::factory()->create(), $article)->sync();
    $updates = DB::table('filament_collaboration_updates')->count();

    // Every page load gives the items new random keys.
    foreach (range(1, 3) as $load) {
        Editor::open($this, User::factory()->create(), $article)->sync()->assertJsonPath('dirty', []);
    }

    expect(DB::table('filament_collaboration_updates')->count())->toBe($updates);
});

it('refuses a sub-field that the items do not have', function (): void {
    $editor = Editor::open($this, User::factory()->create(), arrangeItems());
    $editor->sync();
    $key = array_key_first($editor->value('key_points'));

    $editor->pending[] = ['n' => 1, 'ops' => [['o' => 'put', 'f' => 'key_points', 'i' => $key, 'p' => 'workspace_id', 'id' => [$editor->document->clock() + 1, $editor->config['client']], 'v' => 2]]];
    $editor->send()->assertConflict();
});

it('merges two people typing in the same sub-field of the same item', function (): void {
    $article = arrangeItems();
    $alice = Editor::open($this, User::factory()->create(), $article);
    $bob = Editor::open($this, User::factory()->create(), $article);
    $alice->sync();
    $bob->sync();

    $edit = function (Editor $editor, string $point): void {
        $items = $editor->value('key_points');
        $items[array_key_first($items)]['point'] = $point;
        $editor->type('key_points', $items);
    };

    $edit($alice, 'First point');
    $edit($bob, 'The First');
    $alice->sync();
    $bob->sync();
    $alice->sync();

    expect(array_values($alice->value('key_points'))[0]['point'])->toBe('The First point')
        ->and($bob->value('key_points'))->toBe($alice->value('key_points'));
});

it('merges text inputs and textareas inside items by character, and nothing else', function (): void {
    $this->actingAs(User::factory()->create());
    $form = Livewire::test(EditDocument::class, ['record' => arrangeItems()->id])->instance()->form;
    $fields = $form->getFlatFields(withHidden: true);

    expect(ItemsType::textPaths($fields['key_points']))->toBe(['point'])
        ->and(ItemsType::textPaths($fields['sidebar']))->toBe(['data.text', 'data.author', 'data.label', 'data.url'])
        ->and(ItemsType::textPaths(Repeater::make('tags')->simple(TextInput::make('tag'))))->toBe([''])
        ->and(ItemsType::textPaths(Repeater::make('codes')->simple(TextInput::make('code')->mask('999'))))->toBe([]);
});

it('rebuilds a list whose text sub-fields changed, keeping what was not saved yet', function (): void {
    $article = arrangeItems();
    $alice = Editor::open($this, User::factory()->create(), $article);
    $alice->sync();
    $items = $alice->value('key_points');
    $items[array_key_first($items)]['point'] = 'First, edited';
    $alice->type('key_points', $items)->sync();

    // As a draft from before `point` merged by character.
    $row = DB::table('filament_collaboration_documents')->first();
    $forget = function (string $json): string {
        $state = json_decode($json, true);
        unset($state['fields']['key_points']['t']);

        return json_encode($state);
    };
    DB::table('filament_collaboration_documents')->update(['state' => $forget($row->state), 'saved_state' => $forget($row->saved_state)]);

    $bob = Editor::open($this, User::factory()->create(), $article);
    $response = $bob->sync();

    expect(array_column(array_values($bob->value('key_points')), 'point'))->toBe(['First, edited', 'Second'])
        ->and($response->json('dirty'))->toContain('key_points')
        ->and($response->json('state.fields.key_points.t'))->toBe(['point']);
});
