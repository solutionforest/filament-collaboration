<?php

namespace Tests\MultiPanel;

use App\Filament\Resources\Documents\DocumentResource;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Panel;
use Filament\PanelProvider;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;

/** A second panel on the same articles, signing people in with a guard of its own. */
class EditorsPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->id('editors')
            ->path('editors')
            ->authGuard('editors')
            ->plugin(
                CollaborationPlugin::make()
                    // The same room scope as the admin panel, so both panels share each article's room.
                    ->scopeRoomsUsing(fn (): mixed => auth()->user()?->workspace_id)
                    ->broadcasting(fn (): bool => config('broadcasting.default') === 'reverb'),
            )
            ->resources([DocumentResource::class])
            ->middleware([EncryptCookies::class, StartSession::class, SubstituteBindings::class, DisableBladeIconComponents::class, DispatchServingFilamentEvent::class])
            ->authMiddleware([Authenticate::class]);
    }
}
