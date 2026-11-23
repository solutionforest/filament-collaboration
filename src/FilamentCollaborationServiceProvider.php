<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use Filament\Actions\EditAction;
use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Facades\FilamentAsset;
use Filament\Support\Facades\FilamentView;
use Filament\View\PanelsRenderHook;
use Illuminate\Contracts\View\View;
use Livewire\Livewire;
use ReflectionMethod;
use SolutionForest\FilamentCollaboration\Actions\CollaborateAction;
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;
use SolutionForest\FilamentCollaboration\Livewire\Presence;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;
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
        $store = config('filament-collaboration.cache_store');

        $this->app->singleton(PresenceStore::class, fn (): PresenceStore => new PresenceStore(
            is_string($store) ? $store : null,
        ));
    }

    public function packageBooted(): void
    {
        Livewire::component('filament-collaboration-presence', Presence::class);

        FilamentAsset::register([
            AlpineComponent::make(
                'collaborative-rich-editor',
                __DIR__.'/../resources/dist/collaborative-rich-editor.js',
            ),
        ], 'solutionforest/filament-collaboration');

        EditAction::macro('collaborate', function (array $ignore = [], bool $presence = true): EditAction {
            return CollaborateAction::fromMacro($this, $ignore, $presence);
        });

        FilamentView::registerRenderHook(
            PanelsRenderHook::PAGE_HEADER_ACTIONS_BEFORE,
            function (): string {
                $page = Livewire::current();

                if (! is_object($page) || ! in_array(HasPresence::class, class_uses_recursive($page), true)) {
                    return '';
                }

                if (! method_exists($page, 'renderCollaborationPresence')) {
                    return '';
                }

                $method = new ReflectionMethod($page, 'renderCollaborationPresence');
                $view = $method->invoke($page);

                return $view instanceof View ? $view->render() : '';
            },
        );
    }
}
