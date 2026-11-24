<?php

use App\Filament\Resources\Documents\Pages\EditDocument;
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
        ->and($editor->config['adapters'])->toMatchArray(['newsletter_markdown' => 'filament-markdown-editor', 'embed_code' => 'filament-code-editor']);

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

it('shares an HTML editor from a package as a rich document, and saves it back as HTML', function (): void {
    $user = User::factory()->create();
    $article = Document::create(['title' => 'HTML', 'tinymce_html' => '<p>Hello <strong>team</strong></p>']);
    $editor = Editor::open($this, $user, $article);

    expect($editor->config['fields'])->toMatchArray(['tinymce_html' => 'rich', 'ckeditor_html' => 'rich', 'quill_html' => 'rich', 'trix_html' => 'rich'])
        ->and($editor->config['adapters'])->toMatchArray(['tinymce_html' => 'demo-tinymce', 'trix_html' => 'demo-trix']);

    $editor->sync();

    expect($editor->value('tinymce_html'))->toEqual(['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [
        ['type' => 'text', 'text' => 'Hello '],
        ['type' => 'text', 'text' => 'team', 'marks' => [['type' => 'bold']]],
    ]]]]);

    $this->actingAs($user);
    $page = Livewire::test(EditDocument::class, ['record' => $article->id]);
    $editor->config['client'] = $page->get('collaborationClient');
    $editor->type('tinymce_html', ['type' => 'doc', 'content' => [
        ['type' => 'heading', 'attrs' => ['level' => 2], 'content' => [['type' => 'text', 'text' => 'Hello']]],
        ['type' => 'bulletList', 'content' => [['type' => 'listItem', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'team']]]]]]],
    ]]);

    $page->set('collaborationSync', $editor->syncState())->call('save', shouldRedirect: false)->assertHasNoFormErrors();

    expect($article->fresh()->tinymce_html)->toBe('<h2>Hello</h2><ul><li>team</li></ul>');
});

it('keeps stored HTML exactly as it was when the draft did not change it', function (): void {
    $user = User::factory()->create();
    $stored = "<p>Hello&nbsp;<strong>team</strong></p>\n";
    $article = Document::create(['title' => 'HTML', 'quill_html' => $stored]);
    $editor = Editor::open($this, $user, $article);
    $this->actingAs($user);
    $page = Livewire::test(EditDocument::class, ['record' => $article->id]);
    $editor->config['client'] = $page->get('collaborationClient');
    $editor->sync();
    $editor->type('title', 'HTML!');

    $page->set('collaborationSync', $editor->syncState())->call('save', shouldRedirect: false)->assertHasNoFormErrors();

    expect($article->fresh()->quill_html)->toBe($stored)
        ->and($article->fresh()->title)->toBe('HTML!');
});

it('makes custom components live through their adapters: a composer by character, a rating by value', function (): void {
    $article = Document::create(['title' => 'Custom components']);
    $alice = Editor::open($this, User::factory()->create(), $article);
    $bob = Editor::open($this, User::factory()->create(), $article);

    expect($alice->config['fields'])->toMatchArray(['social_post' => 'text', 'rating' => 'value'])
        ->and($alice->config['adapters'])->toMatchArray(['social_post' => 'demo-post-composer', 'rating' => 'demo-star-rating']);

    $alice->sync();
    $bob->sync();
    $alice->type('social_post', 'Shipping today')->type('rating', 4)->sync();
    $bob->sync();
    $bob->type('social_post', 'Shipping today!')->sync();
    $alice->sync();

    expect([$alice->value('social_post'), $alice->value('rating')])->toBe(['Shipping today!', 4])
        ->and([$bob->value('social_post'), $bob->value('rating')])->toBe(['Shipping today!', 4]);
});

it('validates custom components like any field: the character limit and the number of stars', function (): void {
    $this->actingAs(User::factory()->create());

    Livewire::test(EditDocument::class, ['record' => Document::create(['title' => 'Limits'])->id])
        ->fillForm(['social_post' => str_repeat('a', 281), 'rating' => 6])
        ->call('save')
        ->assertHasFormErrors(['social_post' => 'max', 'rating' => 'max']);
});
