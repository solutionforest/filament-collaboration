<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration;

use Filament\Contracts\Plugin;
use Filament\Facades\Filament;
use Filament\Panel;
use Filament\Support\Concerns\EvaluatesClosures;
use Filament\Support\Facades\FilamentView;
use Illuminate\Support\Facades\Route;
use Livewire\Livewire;
use LogicException;
use SolutionForest\FilamentCollaboration\Concerns\HasPresence;
use SolutionForest\FilamentCollaboration\Http\Controllers\SyncController;
use SolutionForest\FilamentCollaboration\Http\Middleware\KeepSessionReadOnly;
use SolutionForest\FilamentCollaboration\Plugin\Concerns as PluginConcerns;
use SolutionForest\FilamentCollaboration\Support\Data;

class CollaborationPlugin implements Plugin
{
    use EvaluatesClosures;
    use PluginConcerns\HasDebugging;
    use PluginConcerns\HasLiveEditing;
    use PluginConcerns\HasPresenceAppearance;
    use PluginConcerns\HasRoomScope;

    public const ID = 'filament-collaboration';

    final public function __construct()
    {
        $this->evaluationIdentifier = 'plugin';
    }

    public static function make(): static
    {
        return new static;
    }

    public static function get(): static
    {
        return static::find() ?? throw new LogicException('Register CollaborationPlugin::make() on this panel to use collaboration.');
    }

    public static function find(): ?static
    {
        $panel = Filament::getCurrentOrDefaultPanel();

        if ($panel === null || ! $panel->hasPlugin(self::ID)) {
            return null;
        }

        $plugin = $panel->getPlugin(self::ID);

        return $plugin instanceof static ? $plugin : null;
    }

    public function getId(): string
    {
        return self::ID;
    }

    public function register(Panel $panel): void
    {
        $panel->authenticatedTenantRoutes(function (): void {
            $limit = max(60, Data::int(config('filament-collaboration.rate_limit'), 2400));

            Route::post('/_collaboration/sync', SyncController::class)
                ->middleware([KeepSessionReadOnly::class, "throttle:{$limit},1,filament-collaboration"])
                ->name('collaboration.sync');
        });
    }

    public function boot(Panel $panel): void
    {
        // Registered at boot, so `presenceRenderHook()` may be chained in any order.
        // The panel has registered its own hooks by now, so this one is registered directly.
        FilamentView::registerRenderHook($this->getPresenceRenderHook(), function (): string {
            $page = Livewire::current();

            if (! is_object($page) || ! in_array(HasPresence::class, class_uses_recursive($page), true) || ! method_exists($page, 'renderCollaborationRoom')) {
                return '';
            }

            return Data::string($page->renderCollaborationRoom());
        });
    }
}
