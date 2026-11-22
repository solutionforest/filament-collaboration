<?php

use App\Filament\Resources\Documents\DocumentResource;
use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Illuminate\Support\Arr;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Contracts\FieldType;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\RichEditorType;
use SolutionForest\FilamentCollaboration\Fields\Types\TextInputType;
use SolutionForest\FilamentCollaboration\Fields\Types\ValueType;

it('never shares passwords', function (): void {
    expect((new TextInputType)->getKind(TextInput::make('secret')->password()))->toBeNull();
});

it('only merges text by character where a caret exists', function (Closure $field, FieldKind $kind): void {
    expect((new TextInputType)->getKind($field()))->toBe($kind);
})->with([
    'text' => [fn () => TextInput::make('a'), FieldKind::Text],
    'url' => [fn () => TextInput::make('a')->url(), FieldKind::Text],
    'email' => [fn () => TextInput::make('a')->email(), FieldKind::Value],
    'number' => [fn () => TextInput::make('a')->numeric(), FieldKind::Value],
    'masked' => [fn () => TextInput::make('a')->mask('9999'), FieldKind::Value],
]);

it('leaves what can differ by viewer to merge on save', function (Closure $field): void {
    expect(ValueType::defaults()->getKind($field()))->toBeNull();
})->with([
    'a personal timezone' => [fn () => DateTimePicker::make('at')->timezone('Asia/Tokyo')],
    'a scoped many-to-many' => [fn () => CheckboxList::make('posts')->relationship('relatedPosts', 'title')],
]);

it('recognises fields it has no type for', function (): void {
    expect(ValueType::defaults()->supports(FileUpload::make('file')))->toBeFalse()
        ->and((new RichEditorType)->supports(RichEditor::make('body')))->toBeTrue();
});

it('takes custom field types before its own', function (): void {
    CollaborationPlugin::get()->fieldTypes([new class implements FieldType
    {
        public function supports(Field $field): bool
        {
            return $field->getName() === 'title';
        }

        public function getKind(Field $field): FieldKind
        {
            return FieldKind::Value;
        }
    }]);

    $this->actingAs(User::factory()->create())
        ->get(DocumentResource::getUrl('edit', ['record' => Document::create(['title' => 'Custom'])]))
        ->assertSee('&quot;title&quot;:&quot;value&quot;', false);
});

it('shows the inspector only when debugging is on', function (): void {
    $this->actingAs(User::factory()->create());
    $url = DocumentResource::getUrl('edit', ['record' => Document::create(['title' => 'Debug'])]);

    CollaborationPlugin::get()->debug(false);
    $this->get($url)->assertDontSee('Collaboration inspector');

    CollaborationPlugin::get()->debug();
    $this->get($url)->assertSee('Collaboration inspector');
});

it('is configured fluently', function (): void {
    $plugin = CollaborationPlugin::make()
        ->pollingInterval(fn (): int => 900)
        ->avatarLimit(3)
        ->colors(['#123456'])
        ->liveEditing(fn (): bool => false);

    expect($plugin->getPollingInterval())->toBe(900)
        ->and($plugin->getAvatarLimit())->toBe(3)
        ->and($plugin->getPalette()->colorFor('anyone'))->toBe('#123456')
        ->and($plugin->hasLiveEditing())->toBeFalse();
});

it('speaks Hong Kong Chinese and English with the same keys', function (): void {
    $keys = fn (string $locale): array => array_keys(Arr::dot(require __DIR__."/../../../resources/lang/{$locale}/collaboration.php"));

    expect($keys('zh_HK'))->toBe($keys('en'));
});
