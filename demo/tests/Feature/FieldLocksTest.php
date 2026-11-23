<?php

use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Livewire\Livewire;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use Tests\Support\Editor;
use Tests\Support\SchemaPage;

/** A field from a third-party package this plugin knows nothing about. */
class ThirdPartyEditor extends Field {}

function lockSchema(array $components): Schema
{
    return Schema::make(Livewire::test(SchemaPage::class)->instance())->components($components)->statePath('data');
}

it('tells the page which fields lock while somebody is in them', function (): void {
    $editor = Editor::open($this, User::factory()->create(), Document::create(['title' => 'Locks']));

    expect($editor->config['locks'])->toBe(['editor_notes'])
        ->and($editor->config['fields'])->not->toHaveKey('editor_notes');
});

it('locks every field that cannot be live when the panel asks, unless a field says otherwise', function (): void {
    $resolver = CollaborationPlugin::get()->getFieldResolver();
    $schema = lockSchema([
        TextInput::make('title'),
        ThirdPartyEditor::make('body'),
        ThirdPartyEditor::make('notes')->lockWhileEditing(false),
        TextInput::make('code')->disabled(),
    ]);

    expect($resolver->lockable($schema, ['title' => FieldKind::Text], byDefault: true))->toBe(['body'])
        ->and($resolver->lockable($schema, ['title' => FieldKind::Text], byDefault: false))->toBe([]);
});

it('shares the whole value of a field it does not know, once marked collaborative', function (): void {
    $resolver = CollaborationPlugin::get()->getFieldResolver();
    $schema = lockSchema([
        ThirdPartyEditor::make('unknown'),
        ThirdPartyEditor::make('shared')->collaborative(),
    ]);

    expect($resolver->shareable($schema))->toBe(['shared' => FieldKind::Value]);
});
