<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Actions;

use Filament\Actions\Action;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\View\View;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;

/**
 * A live inspector. Add it to any page's header actions; it stays hidden
 * unless the panel has `CollaborationPlugin::make()->debug()`.
 */
class CollaborationDebugAction extends Action
{
    public static function getDefaultName(): ?string
    {
        return 'collaborationDebug';
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->label(__('filament-collaboration::collaboration.debug.label'))
            ->icon(Heroicon::OutlinedBugAnt)
            ->color('gray')
            ->iconButton()
            ->tooltip(__('filament-collaboration::collaboration.debug.label'))
            ->visible(fn (): bool => CollaborationPlugin::find()?->isDebugging() ?? false)
            ->slideOver()
            ->modalWidth(Width::Large)
            ->modalHeading(__('filament-collaboration::collaboration.debug.heading'))
            ->modalDescription(__('filament-collaboration::collaboration.debug.description'))
            ->modalContent(fn (): View => view('filament-collaboration::debug'))
            ->modalSubmitAction(false)
            ->modalCancelActionLabel(__('filament-collaboration::collaboration.debug.close'));
    }
}
