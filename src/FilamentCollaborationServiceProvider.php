<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use Closure;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Field;
use Filament\Support\Assets\Css;
use Filament\Support\Assets\Js;
use Filament\Support\Facades\FilamentAsset;
use SolutionForest\FilamentCollaboration\Actions\CollaborateAction;
use SolutionForest\FilamentCollaboration\Contracts\PresenceRepository;
use SolutionForest\FilamentCollaboration\Fields\FieldResolver;
use SolutionForest\FilamentCollaboration\Presence\DatabasePresenceRepository;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentCollaborationServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-collaboration';

    public function configurePackage(Package $package): void
    {
        $package
            ->name(static::$name)
            ->hasConfigFile()
            ->hasViews(static::$name)
            ->hasTranslations();
    }

    public function packageRegistered(): void
    {
        $this->app->bindIf(PresenceRepository::class, DatabasePresenceRepository::class);
    }

    public function packageBooted(): void
    {
        // Loaded, not published: a published copy would create the tables twice.
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

        FilamentAsset::register([
            Css::make('collaboration', __DIR__.'/../resources/dist/collaboration.css'),
            Js::make('collaboration', __DIR__.'/../resources/dist/collaboration.js'),
        ], 'solutionforest/filament-collaboration');

        EditAction::macro('collaborate', function (array $ignore = [], bool $presence = true): EditAction {
            return CollaborateAction::fromMacro($this, $ignore, $presence);
        });

        Field::macro('collaborative', function (bool|Closure $condition = true): Field {
            return FieldResolver::markField($this, $condition);
        });
    }
}
