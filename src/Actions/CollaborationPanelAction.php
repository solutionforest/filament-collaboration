<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Actions;

use Filament\Actions\Action;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\View\View;
use Livewire\Component;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;

/**
 * One slide-over for a record's comments and its history: field comments
 * with @mentions, and earlier versions of the shared draft to restore.
 * Add it to an edit page's header actions.
 */
class CollaborationPanelAction extends Action
{
    public static function getDefaultName(): ?string
    {
        return 'collaborationPanel';
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this
            ->label(__('filament-collaboration::collaboration.panel.label'))
            ->icon(Heroicon::OutlinedChatBubbleLeftRight)
            ->color('gray')
            ->visible(fn (Component $livewire): bool => in_array(InteractsWithCollaboration::class, class_uses_recursive($livewire), true))
            ->slideOver()
            ->modalWidth(Width::Large)
            ->modalHeading(__('filament-collaboration::collaboration.panel.heading'))
            ->modalContent(fn (Component $livewire): View => view('filament-collaboration::panel', ['page' => $livewire]))
            ->modalSubmitAction(false)
            ->modalCancelActionLabel(__('filament-collaboration::collaboration.panel.close'));
    }
}
