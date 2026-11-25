<?php

use App\Filament\Resources\Authors\Pages\ManageAuthors;
use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Filament\Resources\Tags\Pages\ManageTags;
use App\Filament\Widgets\Drafts;
use App\Filament\Widgets\EditingNow;
use App\Filament\Widgets\NewsroomStats;
use App\Models\Category;
use App\Models\Document;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Livewire\Livewire;

beforeEach(function (): void {
    $this->seed(DatabaseSeeder::class);
    $this->actingAs(User::query()->where('email', 'alice@example.test')->firstOrFail());
});

it('shows the newsroom on the dashboard: counts, recent articles and what is not published yet', function (): void {
    $this->get('/admin')->assertOk();

    Livewire::test(NewsroomStats::class)->assertSee('Published')->assertSee('13')->assertSee('In review');
    Livewire::test(EditingNow::class)->assertCanSeeTableRecords(Document::query()->latest('updated_at')->limit(5)->get());
    Livewire::test(Drafts::class)
        ->assertCanSeeTableRecords(Document::query()->where('status', 'review')->get())
        ->assertCanNotSeeTableRecords(Document::query()->where('status', 'published')->get());
});

it('manages categories, with how many articles each has', function (): void {
    Livewire::test(ManageCategories::class)
        ->assertCanSeeTableRecords(Category::all())
        ->callAction('create', ['name' => 'Opinion', 'color' => '#be123c', 'position' => 9])
        ->assertHasNoActionErrors();

    expect(Category::query()->where('name', 'Opinion')->value('slug'))->toBe('opinion');
});

it('manages tags and authors', function (): void {
    Livewire::test(ManageTags::class)->assertSuccessful()->assertSee('harbour');

    Livewire::test(ManageAuthors::class)
        ->assertCanSeeTableRecords(User::query()->whereIn('email', ['alice@example.test', 'editor001@example.test'])->get())
        ->assertCanNotSeeTableRecords(User::query()->where('email', 'editor050@example.test')->get())
        ->callAction('create', ['name' => 'Sam Lee', 'email' => 'sam@example.test', 'job_title' => 'Intern', 'slug' => 'sam-lee'])
        ->assertHasNoActionErrors();

    expect(User::query()->where('email', 'sam@example.test')->value('slug'))->toBe('sam-lee');
});

it('opens the CMS pages for articles, pages and the taxonomy', function (string $path): void {
    $this->get($path)->assertOk();
})->with(['/admin/documents', '/admin/documents/4/edit', '/admin/pages', '/admin/pages/1/edit', '/admin/categories', '/admin/tags', '/admin/authors']);
