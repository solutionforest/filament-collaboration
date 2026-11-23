<?php

namespace Tests\Tenancy;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;

class TeamPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('teams')
            ->path('teams')
            ->tenant(Team::class)
            ->plugin(CollaborationPlugin::make())
            ->pages([TeamBoard::class])
            ->middleware([EncryptCookies::class, StartSession::class, SubstituteBindings::class, DisableBladeIconComponents::class, DispatchServingFilamentEvent::class])
            ->authMiddleware([Authenticate::class]);
    }
}
