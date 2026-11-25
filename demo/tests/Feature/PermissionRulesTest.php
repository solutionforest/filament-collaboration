<?php

use App\Models\Document;
use App\Models\User;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Gate;
use Livewire\Livewire;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\Collaboration\Permissions;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use Tests\Support\Editor;
use Tests\Support\SchemaPage;
use Tests\TestCase;

function arrangeRules(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->article = Document::create(['title' => 'Shared', 'excerpt' => 'Summary']);
}

it('lets the policy decide who edits live, while everybody may still edit', function (): void {
    arrangeRules($this);
    Gate::define('collaborate', fn (User $user, Document $document): bool => $user->name === 'Alice Chen');

    $alice = Editor::open($this, $this->alice, $this->article);
    $bob = Editor::open($this, $this->bob, $this->article);

    expect($alice->config['fields'])->toHaveKey('title')
        ->and($bob->config['fields'])->toBe([])
        ->and(Permissions::mayCollaborate($this->article, $this->bob))->toBeFalse();

    // Bob is still here, and sees Alice.
    $alice->sync();
    $bob->sync()->assertOk()->assertJsonPath('people.0.name', 'Alice Chen');
});

it('lets everybody who may edit collaborate when the policy has no collaborate ability', function (): void {
    arrangeRules($this);

    expect(Permissions::mayCollaborate($this->article, $this->bob))->toBeTrue();
});

it('asks open tabs to render again when the collaborate ability is withdrawn', function (): void {
    arrangeRules($this);
    $allowed = true;
    Gate::define('collaborate', function (User $user, Document $document) use (&$allowed): bool {
        return $allowed;
    });

    $alice = Editor::open($this, $this->alice, $this->article);
    $alice->sync();

    $allowed = false;

    $alice->send()->assertStatus(410)->assertJsonPath('error', 'expired');
});

it('shares a field marked with a Gate ability, but lets only those it allows edit it live', function (): void {
    arrangeRules($this);
    Gate::define('edit-seo', fn (User $user): bool => $user->name === 'Alice Chen');
    $resolver = CollaborationPlugin::get()->getFieldResolver();
    $schema = fn (): Schema => Schema::make(Livewire::test(SchemaPage::class)->instance())->components([
        TextInput::make('title'),
        TextInput::make('seo_title')->collaborative('edit-seo'),
    ])->statePath('data');

    $this->actingAs($this->alice);
    expect($resolver->writable($schema()))->toBe(['title' => FieldKind::Text, 'seo_title' => FieldKind::Text]);

    $this->actingAs($this->bob);
    expect($resolver->writable($schema()))->toBe(['title' => FieldKind::Text])
        ->and($resolver->shareable($schema()))->toBe(['title' => FieldKind::Text, 'seo_title' => FieldKind::Text]);
});
