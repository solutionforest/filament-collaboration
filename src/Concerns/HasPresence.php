<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;
use Livewire\Attributes\Locked;
use SolutionForest\FilamentCollaboration\Collaboration;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;

trait HasPresence
{
    #[Locked]
    public string $collaborationOrigin = '';

    public function mountHasPresence(): void
    {
        if ($this->collaborationOrigin === '') {
            $this->collaborationOrigin = Str::random(16);
        }
    }

    protected function getCollaborationRoom(): string
    {
        return PresenceStore::room($this->getRecord());
    }

    protected function getCollaborationMode(): string
    {
        return 'viewing';
    }

    protected function renderCollaborationPresence(): View
    {
        return view('filament-collaboration::presence-hook', [
            'room' => $this->getCollaborationRoom(),
            'mode' => $this->getCollaborationMode(),
            'version' => (int) (Collaboration::store()->lastSave($this->getCollaborationRoom())['version'] ?? 0),
            'origin' => $this->collaborationOrigin,
            'opaqueRoom' => PresenceStore::opaque($this->getCollaborationRoom()),
        ]);
    }
}
