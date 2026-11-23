<?php

use App\Filament\Resources\Pages\PageResource;
use App\Filament\Resources\Pages\Pages\EditPage;
use App\Models\Page;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Livewire\Livewire;
use Tests\Support\Editor;
use Tests\TestCase;

function arrangePage(TestCase $test): void
{
    $test->alice = User::factory()->create(['name' => 'Alice Chen']);
    $test->bob = User::factory()->create(['name' => 'Bob Martinez']);
    $test->page = Page::create(['slug' => 'about', 'title' => ['en' => 'About us', 'zh_HK' => '關於我們']]);
}

/** Opens the page in one language, as the locale switcher remembers it. */
function openIn(TestCase $test, User $user, string $locale): Editor
{
    session()->put('spatie_translatable_active_locale', $locale);

    return Editor::openUrl($test, $user, PageResource::getUrl('edit', ['record' => $test->page]));
}

it('makes a translated page live, with a draft per language in one room', function (): void {
    arrangePage($this);
    $english = openIn($this, $this->alice, 'en');
    $chinese = openIn($this, $this->bob, 'zh_HK');

    expect($english->config['fields'])->toHaveKey('title')
        ->and($english->config['draft'])->not->toBe($chinese->config['draft'])
        ->and($english->config['id'])->toBe(substr($english->config['id'], 0, 16).'-'.$english->config['client']);

    $english->sync();
    $chinese->sync();

    expect($english->value('title'))->toBe('About us')
        ->and($chinese->value('title'))->toBe('關於我們');

    // In one room: each sees the other.
    $english->sync()->assertJsonPath('people.0.name', 'Bob Martinez');
});

it('keeps each language\'s typing in its own draft', function (): void {
    arrangePage($this);
    $english = openIn($this, $this->alice, 'en');
    $chinese = openIn($this, $this->bob, 'zh_HK');
    $english->sync();
    $chinese->sync();

    $english->type('title', 'About us!')->sync();
    $chinese->type('title', '關於我們！')->sync();
    $english->sync();
    $chinese->sync();

    expect($english->value('title'))->toBe('About us!')
        ->and($chinese->value('title'))->toBe('關於我們！')
        ->and(DB::table('filament_collaboration_documents')->whereNotNull('parent_room')->count())->toBe(2);
});

it('saves one language without undoing what a colleague saved in another', function (): void {
    arrangePage($this);
    $english = openIn($this, $this->alice, 'en');
    $this->actingAs($this->alice);
    session()->put('spatie_translatable_active_locale', 'en');
    $page = Livewire::test(EditPage::class, ['record' => $this->page->id]);
    $english->config['client'] = $page->get('collaborationClient');
    $english->sync();

    // Bob saves the Chinese title meanwhile.
    $this->page->setTranslation('title', 'zh_HK', '關於我們（新）')->save();

    $english->type('title', 'About us, edited');
    $page->set('collaborationSync', $english->syncState())->call('save', shouldRedirect: false)->assertHasNoFormErrors();

    expect($this->page->fresh()->getTranslation('title', 'en'))->toBe('About us, edited')
        ->and($this->page->fresh()->getTranslation('title', 'zh_HK'))->toBe('關於我們（新）');
});

it('moves the page to the other language\'s draft when the language is switched', function (): void {
    arrangePage($this);
    $this->actingAs($this->alice);
    session()->put('spatie_translatable_active_locale', 'en');
    $page = Livewire::test(EditPage::class, ['record' => $this->page->id]);

    expect(DB::table('filament_collaboration_documents')->whereNotNull('parent_room')->count())->toBe(1);

    $page->set('activeLocale', 'zh_HK');

    expect($page->get('collaborationLocale'))->toBe('zh_HK')
        ->and(DB::table('filament_collaboration_documents')->whereNotNull('parent_room')->count())->toBe(2)
        ->and($page->get('collaborationBase')['title'])->toBe('關於我們');
});
