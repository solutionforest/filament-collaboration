<?php

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;

/** An empty app of its own, so the command never writes into the demo, which other tests boot from. */
beforeEach(function (): void {
    $this->base = sys_get_temp_dir().'/collaborative-field-'.uniqid();

    File::ensureDirectoryExists($this->base.'/bootstrap');
    File::put($this->base.'/composer.json', json_encode(['autoload' => ['psr-4' => ['App\\' => 'app/']]]));
    File::put($this->base.'/bootstrap/providers.php', "<?php\n\nreturn [\n    App\\Providers\\AppServiceProvider::class,\n];\n");

    app()->setBasePath($this->base);
    app()->useAppPath($this->base.'/app');
    app()->useBootstrapPath($this->base.'/bootstrap');
});

afterEach(fn () => File::deleteDirectory($this->base));

/** The file's PHP parses. */
function parses(string $file): bool
{
    exec('php -l '.escapeshellarg($file).' 2>&1', $output, $status);

    return $status === 0;
}

it('asks for the name and the kind, step by step, and makes the four files of the guide', function (): void {
    $this->artisan('make:collaborative-field', ['--no-assets' => true])
        ->expectsQuestion('What is the field called?', 'TeamNotes')
        ->expectsChoice('What does it hold?', 'text', [
            'text' => 'Text: merged character by character, with carets (a composer, a notes box)',
            'choice' => 'A choice: the latest change wins (a rating, a status, a colour)',
        ])
        ->expectsConfirmation('Create these files?', 'yes')
        ->assertSuccessful();

    $field = $this->base.'/app/Forms/Components/TeamNotes.php';
    $view = $this->base.'/resources/views/forms/components/team-notes.blade.php';
    $script = $this->base.'/resources/js/collaboration/team-notes.js';
    $provider = $this->base.'/app/Providers/CollaborativeFieldsServiceProvider.php';

    expect(File::get($field))->toContain('namespace App\Forms\Components;', 'class TeamNotes extends Field', "protected string \$view = 'forms.components.team-notes';")
        ->and(parses($field))->toBeTrue()
        ->and(File::get($view))->toContain("getAlpineComponentSrc('team-notes')", 'x-data="teamNotes(', 'data-collaboration-input', 'wire:ignore')
        ->and(fn () => Blade::compileString(File::get($view)))->not->toThrow(Throwable::class)
        ->and(File::get($script))->toContain("FilamentCollaboration.adapter('team-notes', {", "format: 'text'", 'export default function teamNotes(')
        ->and(File::get($script))->not->toContain('{{')
        ->and(File::get($provider))->toContain("\\App\\Forms\\Components\\TeamNotes::class => ['team-notes', FieldKind::Text],")
        ->and(parses($provider))->toBeTrue()
        ->and(File::get($this->base.'/bootstrap/providers.php'))->toContain('App\Providers\CollaborativeFieldsServiceProvider::class');
});

it('makes a choice field, and adds it to the same service provider', function (): void {
    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--kind' => 'text', '--no-assets' => true, '--no-interaction' => true])->assertSuccessful();
    $this->artisan('make:collaborative-field', ['name' => 'review-status', '--kind' => 'choice', '--no-assets' => true, '--no-interaction' => true])->assertSuccessful();

    $provider = File::get($this->base.'/app/Providers/CollaborativeFieldsServiceProvider.php');

    expect(File::get($this->base.'/app/Forms/Components/ReviewStatus.php'))->toContain('class ReviewStatus extends Field', 'public function options(')
        ->and(File::get($this->base.'/resources/js/collaboration/review-status.js'))->toContain("format: 'value'", "'review-status-change'")
        ->and($provider)->toContain("ReviewStatus::class => ['review-status', FieldKind::Value],", "TeamNotes::class => ['team-notes', FieldKind::Text],")
        ->and(substr_count(File::get($this->base.'/bootstrap/providers.php'), 'CollaborativeFieldsServiceProvider'))->toBe(1);
});

it('never overwrites a file unless told to', function (): void {
    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--no-assets' => true, '--no-interaction' => true])->assertSuccessful();
    File::put($this->base.'/app/Forms/Components/TeamNotes.php', 'mine');

    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--no-assets' => true, '--no-interaction' => true])->assertFailed();
    expect(File::get($this->base.'/app/Forms/Components/TeamNotes.php'))->toBe('mine');

    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--force' => true, '--no-assets' => true, '--no-interaction' => true])->assertSuccessful();
    expect(File::get($this->base.'/app/Forms/Components/TeamNotes.php'))->toContain('class TeamNotes');
});

it('refuses a name that is not a class name, and a kind it does not know', function (): void {
    $this->artisan('make:collaborative-field', ['name' => '1st field', '--no-assets' => true, '--no-interaction' => true])->assertFailed();
    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--kind' => 'html', '--no-assets' => true, '--no-interaction' => true])->assertFailed();

    expect(File::exists($this->base.'/app'))->toBeFalse();
});

it('writes nothing when asked to stop, or when given no name without questions', function (): void {
    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--kind' => 'text', '--no-assets' => true])
        ->expectsConfirmation('Create these files?', 'no')
        ->assertFailed();

    $this->artisan('make:collaborative-field', ['--no-assets' => true, '--no-interaction' => true])->assertFailed();

    expect(File::exists($this->base.'/app'))->toBeFalse();
});

it('says what to add when the service provider was changed by hand', function (): void {
    File::ensureDirectoryExists($this->base.'/app/Providers');
    File::put($this->base.'/app/Providers/CollaborativeFieldsServiceProvider.php', "<?php\n// edited by hand\n");

    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--no-assets' => true, '--no-interaction' => true])
        ->expectsOutputToContain("TeamNotes::class => ['team-notes', FieldKind::Text],")
        ->assertSuccessful();

    expect(File::get($this->base.'/app/Providers/CollaborativeFieldsServiceProvider.php'))->toBe("<?php\n// edited by hand\n");
});

it('publishes the new script with the Filament assets', function (): void {
    File::ensureDirectoryExists($this->base.'/public');
    app()->usePublicPath($this->base.'/public');

    $this->artisan('make:collaborative-field', ['name' => 'TeamNotes', '--no-interaction' => true])->assertSuccessful();

    expect(File::exists($this->base.'/public/js/app/components/team-notes.js'))->toBeTrue();
});
