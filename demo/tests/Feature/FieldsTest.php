<?php

use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Schema;
use Livewire\Livewire;
use SolutionForest\FilamentCollaboration\Documents\Fingerprint;
use SolutionForest\FilamentCollaboration\Documents\SharedField;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\ItemsType;
use SolutionForest\FilamentCollaboration\Permissions;
use SolutionForest\FilamentCollaboration\Support\FormState;
use Tests\Support\SchemaPage;

/** A field in a container, as Filament renders it. */
function mounted(Repeater|Builder $field): Repeater|Builder
{
    Schema::make(Livewire::test(SchemaPage::class)->instance())->components([$field])->statePath('data')->getFlatFields();

    return $field;
}

it('finds sub-fields inside layout components, with their own state paths', function (): void {
    $repeater = mounted(Repeater::make('rows')->schema([
        Grid::make(2)->schema([TextInput::make('name'), Select::make('size')->options(['s' => 'S'])]),
        Group::make([Textarea::make('note')])->statePath('details'),
    ]));

    expect(ItemsType::paths($repeater))->toBe(['name', 'size', 'details.note'])
        ->and(ItemsType::textPaths($repeater))->toBe(['name', 'details.note']);
});

it('leaves a list to merge on save when any item could hold what cannot be shared', function (Repeater|Builder $field): void {
    expect(ItemsType::paths(mounted($field)))->toBeNull()
        ->and(ItemsType::textPaths($field))->toBe([]);
})->with([
    'an upload in a layout' => fn (): Repeater => Repeater::make('rows')->schema([Grid::make()->schema([FileUpload::make('file')])]),
    'a block with rich text' => fn (): Builder => Builder::make('blocks')->blocks([Block::make('text')->schema([RichEditor::make('body')])]),
    'a simple repeater of uploads' => fn (): Repeater => Repeater::make('files')->simple(FileUpload::make('file')),
    'a repeater with no fields' => fn (): Repeater => Repeater::make('empty')->schema([]),
]);

it('merges a sub-field by character only if it is text in every block', function (): void {
    $builder = mounted(Builder::make('blocks')->blocks([
        Block::make('quote')->schema([Textarea::make('text')]),
        Block::make('count')->schema([TextInput::make('text')->numeric()]),
    ]));

    expect(ItemsType::paths($builder))->toBe(['type', 'data.text'])
        ->and(ItemsType::textPaths($builder))->toBe([]);
});

it('decides which values can be shared live', function (FieldKind $kind, mixed $value, bool $canBeShared): void {
    expect((new SharedField('field', $kind, $value))->canBeShared())->toBe($canBeShared);
})->with([
    'text' => [FieldKind::Text, 'Hello', true],
    'text as an array' => [FieldKind::Text, ['a'], false],
    'a list of values' => [FieldKind::Value, ['a', 'b'], true],
    'a nested value' => [FieldKind::Value, [['a']], false],
    'no items' => [FieldKind::Items, null, true],
    'items with simple values' => [FieldKind::Items, ['row-1' => ['name' => 'a', 'tags' => ['x']]], true],
    'items with a nested value' => [FieldKind::Items, ['row-1' => ['tags' => [['x']]]], false],
    'items under a key that is not safe' => [FieldKind::Items, ['row 1' => ['name' => 'a']], false],
    'too many items' => [FieldKind::Items, array_fill_keys(array_map(fn (int $i): string => "row-{$i}", range(1, 501)), ['name' => 'a']), false],
    'too large' => [FieldKind::Text, str_repeat('a', 1_000_001), false],
    'rich text without custom blocks' => [FieldKind::RichText, ['type' => 'doc', 'content' => [['type' => 'paragraph']]], true],
    'rich text with a custom block' => [FieldKind::RichText, ['type' => 'doc', 'content' => [['type' => 'customBlock']]], false],
]);

it('fingerprints values by what they mean', function (): void {
    $rich = fn (array $attributes): array => ['type' => 'doc', 'content' => [['type' => 'paragraph', ...$attributes, 'content' => [['type' => 'text', 'text' => 'Hi']]]]];

    expect(Fingerprint::value(FieldKind::Text, "a\r\nb"))->toBe(Fingerprint::value(FieldKind::Text, "a\nb"))
        ->and(Fingerprint::value(FieldKind::Value, ''))->toBe(Fingerprint::value(FieldKind::Value, null))
        ->and(Fingerprint::value(FieldKind::RichText, $rich([])))->toBe(Fingerprint::value(FieldKind::RichText, $rich(['attrs' => ['textAlign' => 'start']])))
        ->and(Fingerprint::value(FieldKind::RichText, ['type' => 'doc', 'content' => [['type' => 'customBlock']]]))->not->toBe(Fingerprint::value(FieldKind::RichText, $rich([])))
        ->and(Fingerprint::value(FieldKind::Items, ['a' => ['name' => 'x']]))->toBe(Fingerprint::value(FieldKind::Items, ['b' => ['name' => 'x']]));
});

it('shows a value as plain text for somebody choosing between two', function (mixed $value, string $shown): void {
    expect(FormState::display($value))->toBe($shown);
})->with([
    'nothing' => [null, '(empty)'],
    'yes' => [true, 'Yes'],
    'no' => [false, 'No'],
    'HTML' => ['<p>Hello <b>you</b></p>', 'Hello you'],
    'a list' => [['red', 'green'], 'red, green'],
    'rich content' => [['type' => 'doc', 'content' => [['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'One ']]], ['type' => 'paragraph', 'content' => [['type' => 'text', 'text' => 'two']]]]], 'One two'],
    'items' => [['a' => ['name' => 'First'], 'b' => ['name' => 'Second']], 'First, Second'],
]);

it('makes every open tab renew its token from the command line', function (): void {
    $before = Permissions::version(str_repeat('a', 64));

    $this->artisan('filament-collaboration:refresh-permissions')
        ->expectsOutputToContain('renew their tokens')
        ->assertSuccessful();

    expect(Permissions::version(str_repeat('a', 64)))->not->toBe($before);
});
