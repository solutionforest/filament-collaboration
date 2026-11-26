<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Commands;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Console\Command;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use SolutionForest\Collaboration\Enums\FieldKind;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\intro;
use function Laravel\Prompts\note;
use function Laravel\Prompts\outro;
use function Laravel\Prompts\select;
use function Laravel\Prompts\table;
use function Laravel\Prompts\text;

/**
 * The custom component guide, step by step, as a command: a Filament field,
 * its view, its Alpine component and adapter, and the service provider that
 * loads the script and tells the package which adapter the field uses.
 */
class MakeCollaborativeFieldCommand extends Command
{
    protected $signature = 'make:collaborative-field
        {name? : The field class, such as PostComposer}
        {--kind= : text (merged by character, with carets) or choice (the latest change wins)}
        {--force : Overwrite files that exist}
        {--no-assets : Do not run filament:assets afterwards}';

    protected $description = 'Make a Filament field that several people can edit at once';

    /** @var array<string, string> */
    private const KINDS = [
        'text' => 'Text: merged character by character, with carets (a composer, a notes box)',
        'choice' => 'A choice: the latest change wins (a rating, a status, a colour)',
    ];

    public function handle(Filesystem $files): int
    {
        intro('Make a field that several people can edit at once');

        $class = $this->className();
        $kind = $this->kind();

        if ($class === null || $kind === null) {
            return self::FAILURE;
        }

        $asset = Str::kebab($class);
        $namespace = $this->laravel->getNamespace();
        $replacements = [
            '{{ namespace }}' => $namespace.'Forms\\Components',
            '{{ class }}' => $class,
            '{{ view }}' => "forms.components.{$asset}",
            '{{ asset }}' => $asset,
            '{{ adapter }}' => $asset,
            '{{ alpine }}' => Str::camel($class),
        ];

        $targets = [
            "field-{$kind}.php" => $this->laravel->path("Forms/Components/{$class}.php"),
            "view-{$kind}.blade.php" => $this->laravel->resourcePath("views/forms/components/{$asset}.blade.php"),
            "script-{$kind}.js" => $this->laravel->resourcePath("js/collaboration/{$asset}.js"),
        ];

        $existing = array_filter($targets, fn (string $path): bool => $files->exists($path));

        if ($existing !== [] && ! $this->option('force')) {
            $this->components->error('These files exist already; run again with --force to overwrite them:');
            $this->components->bulletList(array_map($this->relative(...), array_values($existing)));

            return self::FAILURE;
        }

        $provider = $this->laravel->path('Providers/CollaborativeFieldsServiceProvider.php');

        table(['Step', 'File'], [
            ['1. The field', $this->relative($targets["field-{$kind}.php"])],
            ['2. Its view', $this->relative($targets["view-{$kind}.blade.php"])],
            ['3 and 5. Its Alpine component and adapter', $this->relative($targets["script-{$kind}.js"])],
            ['4 and 6. Loads it and names its adapter', $this->relative($provider)],
        ]);

        if ($this->input->isInteractive() && ! confirm('Create these files?')) {
            return self::FAILURE;
        }

        foreach ($targets as $stub => $path) {
            $files->ensureDirectoryExists(dirname($path));
            $files->put($path, strtr($this->stub($files, $stub), $replacements));
        }

        $this->register($files, $provider, $namespace, $class, $asset, $kind === 'text' ? FieldKind::Text : FieldKind::Value);

        if (! $this->option('no-assets')) {
            // The service provider booted before this field existed: register its script for this run too.
            FilamentAsset::register([AlpineComponent::make($asset, $targets["script-{$kind}.js"])]);
            $this->callSilently('filament:assets');
        }

        $field = Str::snake($class);
        $example = $kind === 'text'
            ? "{$class}::make('{$field}')->rows(4)"
            : "{$class}::make('{$field}')->options(['low' => 'Low', 'high' => 'High'])";

        note(implode(PHP_EOL, [
            'Add it to a form, on a page with InteractsWithCollaboration:',
            '',
            "    use {$namespace}Forms\\Components\\{$class};",
            "    {$example},",
            '',
            'Then open the record in two browsers. If the field is not live, the Collaboration',
            'inspector (CollaborationPlugin::make()->debug()) says why.',
            $this->option('no-assets') ? 'Run php artisan filament:assets to publish the script.' : 'After changing the script, run php artisan filament:assets.',
        ]));

        outro("{$class} is ready. The guide explains each file: docs/custom-components.md");

        return self::SUCCESS;
    }

    private function className(): ?string
    {
        $name = $this->argument('name');

        if (! is_string($name) || $name === '') {
            if (! $this->input->isInteractive()) {
                $this->components->error('Give the field a name, such as PostComposer.');

                return null;
            }

            $name = text(
                label: 'What is the field called?',
                placeholder: 'PostComposer',
                required: true,
                validate: fn (string $value): ?string => self::invalidName($value),
                hint: 'A class name. It becomes app/Forms/Components/{Name}.php.',
            );
        }

        $class = Str::studly($name);

        if (($problem = self::invalidName($class)) !== null) {
            $this->components->error($problem);

            return null;
        }

        return $class;
    }

    private function kind(): ?string
    {
        $kind = $this->option('kind');

        if (is_string($kind) && $kind !== '') {
            if (! array_key_exists($kind, self::KINDS)) {
                $this->components->error('The kind is text or choice.');

                return null;
            }

            return $kind;
        }

        if (! $this->input->isInteractive()) {
            return 'text';
        }

        return (string) select(
            label: 'What does it hold?',
            options: self::KINDS,
            default: 'text',
            hint: 'For HTML or ProseMirror editors, see docs/custom-components.md.',
        );
    }

    private static function invalidName(string $value): ?string
    {
        return preg_match('/^[A-Za-z][A-Za-z0-9]*$/', $value) === 1 ? null : 'Use letters and digits, starting with a letter, such as PostComposer.';
    }

    /** Adds the field to the service provider, making the provider the first time. */
    private function register(Filesystem $files, string $provider, string $namespace, string $class, string $adapter, FieldKind $kind): void
    {
        $marker = '// make:collaborative-field adds each field below this line.';

        if (! $files->exists($provider)) {
            $files->ensureDirectoryExists(dirname($provider));
            $files->put($provider, strtr($this->stub($files, 'provider.php'), ['{{ namespace }}' => $namespace.'Providers']));
            ServiceProvider::addProviderToBootstrapFile($namespace.'Providers\\CollaborativeFieldsServiceProvider', $this->laravel->getBootstrapProvidersPath());
        }

        $entry = "\\{$namespace}Forms\\Components\\{$class}::class => ['{$adapter}', FieldKind::{$kind->name}],";
        $contents = $files->get($provider);

        if (str_contains($contents, $entry)) {
            return;
        }

        if (! str_contains($contents, $marker)) {
            $this->components->warn("Add this line to the \$fields of {$this->relative($provider)}: {$entry}");

            return;
        }

        $files->put($provider, str_replace($marker, $marker.PHP_EOL.'            '.$entry, $contents));
    }

    private function stub(Filesystem $files, string $name): string
    {
        return $files->get(__DIR__."/../../stubs/collaborative-field/{$name}.stub");
    }

    private function relative(string $path): string
    {
        return ltrim(Str::after($path, $this->laravel->basePath()), DIRECTORY_SEPARATOR);
    }
}
