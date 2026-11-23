<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Filament\Resources\Pages\CreateRecord;
use Filament\Resources\Pages\EditRecord;
use Filament\Resources\Resource;
use Filament\Support\Components\Attributes\Unexposed;
use Illuminate\Database\Eloquent\Model;
use Livewire\Attributes\Locked;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Enums\PresenceMode;
use SolutionForest\FilamentCollaboration\Rooms\RoomRenderer;
use SolutionForest\FilamentCollaboration\Support\PageInspector;

/**
 * Shows who else is here. Works on list, create, view, edit and custom pages.
 */
trait HasPresence
{
    #[Locked]
    public int $collaborationClient = 0;

    public function mountHasPresence(): void
    {
        if ($this->collaborationClient === 0) {
            $this->collaborationClient = random_int(1, 2147483647);
        }
    }

    #[Unexposed]
    public function renderCollaborationRoom(): string
    {
        $view = app(RoomRenderer::class)->render(
            mode: $this->getCollaborationMode(),
            client: $this->collaborationClient,
            record: $this->getCollaborationRecord(),
            resource: $this->getCollaborationResource(),
            page: static::class,
            fields: $this->getCollaborationLiveFields(),
            labels: $this->getCollaborationLabels(),
            reactive: $this->getCollaborationReactiveFields(),
            canPull: $this->canPullCollaborationChanges(),
            allowed: $this->getCollaborationAllowedValues(),
            locks: $this->getCollaborationLocks(),
            adapters: $this->getCollaborationAdapters(),
            uploads: $this->getCollaborationUploads(),
            locale: $this->getCollaborationLocale(),
        );

        return $view?->render() ?? '';
    }

    protected function getCollaborationMode(): PresenceMode
    {
        return match (true) {
            is_subclass_of(static::class, EditRecord::class) => PresenceMode::Editing,
            is_subclass_of(static::class, CreateRecord::class) => PresenceMode::Creating,
            $this->getCollaborationRecord() !== null => PresenceMode::Viewing,
            default => PresenceMode::Browsing,
        };
    }

    protected function getCollaborationRecord(): ?Model
    {
        return PageInspector::record($this);
    }

    /** @return class-string<resource>|null */
    protected function getCollaborationResource(): ?string
    {
        return PageInspector::resource($this);
    }

    /** @return array<string, FieldKind> */
    protected function getCollaborationLiveFields(): array
    {
        return [];
    }

    /** @return array<string, string> */
    protected function getCollaborationLabels(): array
    {
        return [];
    }

    /** @return list<string> */
    protected function getCollaborationReactiveFields(): array
    {
        return [];
    }

    /** @return array<string, list<string>> */
    protected function getCollaborationAllowedValues(): array
    {
        return [];
    }

    /** @return list<string> */
    protected function getCollaborationLocks(): array
    {
        return [];
    }

    /** @return array<string, string> */
    protected function getCollaborationAdapters(): array
    {
        return [];
    }

    /** @return list<string> */
    protected function getCollaborationUploads(): array
    {
        return [];
    }

    /** The language being edited, on a page with a locale switcher. */
    protected function getCollaborationLocale(): ?string
    {
        $locale = property_exists($this, 'activeLocale') ? $this->activeLocale : null;

        return is_string($locale) && $locale !== '' ? $locale : null;
    }

    protected function canPullCollaborationChanges(): bool
    {
        return false;
    }
}
