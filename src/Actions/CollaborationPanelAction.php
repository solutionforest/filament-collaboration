<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Actions;

use Filament\Actions\Action;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Illuminate\Contracts\View\View;
use Livewire\Component;
use SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration;
use SolutionForest\FilamentCollaboration\Support\Data;

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
            // Only the icon in the header; the label stays as its tooltip and accessible name.
            ->iconButton()
            ->tooltip(__('filament-collaboration::collaboration.panel.label'))
            ->extraAttributes(['aria-label' => __('filament-collaboration::collaboration.panel.label')])
            ->icon(Heroicon::OutlinedChatBubbleLeftRight)
            ->color('gray')
            // On collaborative pages, unless `commentsAndHistory(false)` turned it off.
            ->visible(fn (Component $livewire): bool => in_array(InteractsWithCollaboration::class, class_uses_recursive($livewire), true)
                && method_exists($livewire, 'hasCollaborationPanel') && $livewire->hasCollaborationPanel() === true)
            ->badge(fn (Component $livewire): ?int => method_exists($livewire, 'getCollaborationOpenCommentCount') ? (Data::int($livewire->getCollaborationOpenCommentCount()) ?: null) : null)
            ->slideOver()
            ->modalWidth(Width::Large)
            ->modalHeading(__('filament-collaboration::collaboration.panel.heading'))
            ->modalContent(fn (Component $livewire): View => view('filament-collaboration::panel', ['page' => $livewire]))
            ->modalSubmitAction(false)
            ->modalCancelActionLabel(__('filament-collaboration::collaboration.panel.close'));
    }
}
