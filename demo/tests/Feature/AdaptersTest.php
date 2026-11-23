<?php

use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\Field;
use Filament\Schemas\Schema;
use Livewire\Livewire;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\AdapterType;
use Tests\Support\Editor;
use Tests\Support\SchemaPage;

/** A field from a third-party package, made live by an adapter. */
class AdaptedEditor extends Field {}

function adapterSchema(array $components): Schema
{
    return Schema::make(Livewire::test(SchemaPage::class)->instance())->components($components)->statePath('data');
}

it("makes Filament's Markdown and code editors live through the adapters it ships", function (): void {
    $editor = Editor::open($this, User::factory()->create(), Document::create(['title' => 'Adapters']));

    expect($editor->config['fields'])->toMatchArray(['newsletter_markdown' => 'text', 'embed_code' => 'text'])
        ->and($editor->config['adapters'])->toBe(['newsletter_markdown' => 'filament-markdown-editor', 'embed_code' => 'filament-code-editor']);

    $editor->sync();
    $editor->type('newsletter_markdown', '**Hello**')->sync()->assertOk();
});

it('takes field types other packages register, for every panel', function (): void {
    CollaborationPlugin::registerFieldTypes(AdapterType::make([AdaptedEditor::class], adapter: 'acme-editor', kind: FieldKind::RichText));
    $resolver = CollaborationPlugin::get()->getFieldResolver();
    $schema = adapterSchema([AdaptedEditor::make('body')]);

    expect($resolver->shareable($schema))->toBe(['body' => FieldKind::RichText])
        ->and($resolver->adapters($schema, ['body' => FieldKind::RichText]))->toBe(['body' => 'acme-editor']);
});

it('lets an app name the adapter for a field itself', function (): void {
    $resolver = CollaborationPlugin::get()->getFieldResolver();
    $schema = adapterSchema([
        Field::make('notes')->collaborative(adapter: 'my-editor'),
        Field::make('body')->collaborative(adapter: 'my-html-editor', as: FieldKind::RichText),
    ]);

    expect($resolver->shareable($schema))->toBe(['notes' => FieldKind::Text, 'body' => FieldKind::RichText])
        ->and($resolver->adapters($schema, $resolver->shareable($schema)))->toBe(['notes' => 'my-editor', 'body' => 'my-html-editor']);
});
