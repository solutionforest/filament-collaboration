<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms\Components\RichEditor;
use Filament\Notifications\Notification;
use Filament\Support\Components\Attributes\Exposed;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Facades\Storage;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Renderless;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Documents\DocumentRepository;
use SolutionForest\FilamentCollaboration\Documents\EditTrail;
use SolutionForest\FilamentCollaboration\Documents\SharedField;
use SolutionForest\FilamentCollaboration\Documents\SharedUploads;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Events\ChangesMerged;
use SolutionForest\FilamentCollaboration\Events\ConflictDetected;
use SolutionForest\FilamentCollaboration\Events\ConflictResolved;
use SolutionForest\FilamentCollaboration\Events\SharedDraftSaved;
use SolutionForest\FilamentCollaboration\Merge\ThreeWayMerge;
use SolutionForest\FilamentCollaboration\Permissions;
use SolutionForest\FilamentCollaboration\Presence\Identity;
use SolutionForest\FilamentCollaboration\Rooms\RoomResolver;
use SolutionForest\FilamentCollaboration\Saving\LiveSave;
use SolutionForest\FilamentCollaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Support\FormState;
use SolutionForest\FilamentCollaboration\Support\SaveLock;

/**
 * Turns an `EditRecord` page into a shared document.
 *
 * Live fields are saved from the shared draft. The others, and every field of
 * a browser that is not connected, are merged field by field when saving.
 */
trait InteractsWithCollaboration
{
    use HasPresence;
    use ResolvesConflicts;

    /**
     * What the browser has not been able to send yet, plus the fields it has
     * bound. Written by the browser, so it is never trusted.
     */
    public string $collaborationSync = '';

    /** @var array<string, mixed> */
    #[Locked]
    public array $collaborationBase = [];

    #[Locked]
    public bool $collaborationMounted = false;

    protected bool $collaborationHasSaved = false;

    public function mountInteractsWithCollaboration(): void
    {
        if ($this->collaborationMounted) {
            return;
        }

        $this->collaborationMounted = true;
        $this->collaborationBase = $this->getCollaborationFormValues();

        if (! $this->isCollaborationLive()) {
            return;
        }

        $room = $this->getCollaborationRoom();
        $reconcile = fn () => $this->reconcileCollaborationDraft();

        // A draft that does not exist yet is worth waiting for a save to finish.
        if (! app(SaveLock::class)->attempt($room, $reconcile) && ! app(DocumentRepository::class)->exists($room)) {
            rescue(fn () => app(SaveLock::class)->block($room, $reconcile));
        }
    }

    /**
     * Fields to keep out of both live editing and merging.
     *
     * @return list<string>
     */
    protected function getCollaborationIgnoredFields(): array
    {
        return [];
    }

    protected function isCollaborationLive(): bool
    {
        // A locale switcher fills one form with different languages; those must not share a draft.
        if (property_exists(static::class, 'activeLocale')) {
            return false;
        }

        return (CollaborationPlugin::find()?->hasLiveEditing($this->getRecord()) ?? false)
            && Permissions::mayCollaborate($this->getRecord());
    }

    #[Exposed]
    public function save(bool $shouldRedirect = true, bool $shouldSendSavedNotification = true): void
    {
        $this->authorizeAccess();
        $this->collaborationSaveArguments = [$shouldRedirect, $shouldSendSavedNotification];

        try {
            app(SaveLock::class)->block(
                $this->getCollaborationRoom(),
                fn () => $this->saveCollaboratively(fn () => parent::save($shouldRedirect, $shouldSendSavedNotification)),
            );
        } catch (LockTimeoutException) {
            Notification::make()
                ->title(__('filament-collaboration::collaboration.busy'))
                ->warning()
                ->send();
        }
    }

    /**
     * Brings in what others saved. Live fields are already up to date, so this
     * concerns the fields that merge on save.
     */
    #[Exposed]
    public function collaborationPull(bool $notify = false): void
    {
        $this->authorizeAccess();

        if ($this->isCollaborationLive()) {
            app(SaveLock::class)->attempt($this->getCollaborationRoom(), fn () => $this->reconcileCollaborationDraft());
        }

        $theirs = $this->getCollaborationSavedValues();

        if ($theirs === null) {
            return;
        }

        $live = $this->getReportedLiveFields();
        $mine = $this->getCollaborationFormValues();
        $result = ThreeWayMerge::merge(
            array_diff_key($this->collaborationBase, $live),
            array_diff_key($mine, $live),
            array_diff_key($theirs, $live),
        );

        $this->writeCollaborationValues(FormState::only($result->data, $result->taken));
        $this->collaborationBase = [...$theirs, ...FormState::only($this->collaborationBase, $result->conflicts)];

        if (! $notify) {
            return;
        }

        $body = match (true) {
            $result->hasConflicts() => __('filament-collaboration::collaboration.pull.conflicts', ['fields' => $this->getCollaborationFieldList($result->conflicts)]),
            $result->taken !== [] => __('filament-collaboration::collaboration.pull.taken', ['fields' => $this->getCollaborationFieldList($result->taken)]),
            default => null,
        };

        Notification::make()
            ->title(__('filament-collaboration::collaboration.pull.title'))
            ->body(is_string($body) ? $body : null)
            ->success()
            ->send();
    }

    /**
     * Stores an image as soon as it is uploaded into a live rich editor. A
     * temporary upload exists only in its uploader's component, so until now
     * nobody else's save could keep it.
     *
     * @return array{id: string, src: ?string}|null
     */
    #[Exposed]
    #[Renderless]
    public function storeCollaborationAttachment(string $field, string $id): ?array
    {
        $this->authorizeAccess();

        $component = FormState::fields($this->form, withHidden: false)[$field] ?? null;

        if (! $component instanceof RichEditor || ! isset($this->getCollaborationLiveFields()[$field])) {
            return null;
        }

        // Validated against the field's size and type rules by Filament.
        $file = $component->getUploadedFileAttachment($id);
        $stored = $file === null ? null : $component->saveUploadedFileAttachment($file);

        if (! is_string($stored) && ! is_int($stored)) {
            return null;
        }

        $disk = $component->getFileAttachmentsDiskName();

        // Only a stored file, not an id from a custom `saveUploadedFileAttachmentsUsing()`, can be cleaned up.
        if (is_string($stored) && Storage::disk($disk)->exists($stored)) {
            app(SharedUploads::class)->track($this->getCollaborationRoom(), $field, $disk, $stored);
        }

        return ['id' => (string) $stored, 'src' => $component->getFileAttachmentUrl($stored)];
    }

    public function discardSharedDraftAction(): Action
    {
        return Action::make('discardSharedDraft')
            ->requiresConfirmation()
            ->color('danger')
            ->modalIcon('heroicon-o-arrow-uturn-left')
            ->modalHeading(__('filament-collaboration::collaboration.discard.heading'))
            ->modalDescription(__('filament-collaboration::collaboration.discard.description'))
            ->modalSubmitActionLabel(__('filament-collaboration::collaboration.discard.action'))
            ->action(function (): void {
                $this->authorizeAccess();

                $room = $this->getCollaborationRoom();
                $fields = array_map(strval(...), array_keys($this->getCollaborationLiveFields()));

                app(SaveLock::class)->block($room, fn () => app(DocumentRepository::class)->discard($room, $fields));
                app(SharedUploads::class)->discard($room);
            });
    }

    // Filament calls this only once a save has succeeded and been committed.
    protected function rememberData(): void
    {
        parent::rememberData();

        $this->collaborationHasSaved = true;
    }

    protected function saveCollaboratively(callable $save): void
    {
        $this->collaborationHasSaved = false;
        $writable = $this->getCollaborationLiveFields();
        $theirs = $this->getCollaborationSavedValues();

        if ($theirs === null) {
            $save();

            return;
        }

        $room = $this->getCollaborationRoom();
        $documents = app(DocumentRepository::class);
        $live = new LiveSave;

        if ($this->isCollaborationLive()) {
            $documents->reconcile($room, $this->getSharedFields($theirs));
            $live = LiveSave::prepare($documents, $room, $this->collaborationClient, $this->collaborationSync, $writable, $this->getCollaborationAllowedValues());
        }

        $mine = $this->getCollaborationFormValues();
        $merging = array_flip($live->fields);
        $result = ThreeWayMerge::merge(
            array_diff_key($this->collaborationBase, $merging),
            array_diff_key($mine, $merging),
            array_diff_key($theirs, $merging),
        );
        $theirName = $this->getCollaborationTheirName();

        if ($result->taken !== []) {
            $this->writeCollaborationValues(FormState::only($result->data, $result->taken));
        }

        if ($result->hasConflicts()) {
            $this->askToResolveConflicts($result->conflicts, $theirs);
            event(new ConflictDetected($this->getRecord(), Filament::auth()->user(), $result->conflicts, $theirName));

            return;
        }

        if ($live->hasSomeoneElsesUpload($theirs, Data::map(data_get($this, 'componentFileAttachments.data')))) {
            Notification::make()
                ->title(__('filament-collaboration::collaboration.foreign_upload'))
                ->warning()
                ->send();

            return;
        }

        // Save the draft, then give the browser its own state back: replacing it
        // would erase whatever was typed while this request was running.
        $publishing = $live->valuesToPublish($mine, $theirs);
        $typed = FormState::only($mine, array_map(strval(...), array_keys($publishing)));
        $this->writeCollaborationValues($publishing);

        try {
            $save();
        } finally {
            $this->writeCollaborationValues($typed);
        }

        if (! $this->collaborationHasSaved) {
            return;
        }

        $overwritten = [];

        foreach (array_keys($writable) as $path) {
            $path = (string) $path;

            if (! isset($merging[$path]) && ! ThreeWayMerge::untouched($this->collaborationBase[$path] ?? null, $mine[$path] ?? null)) {
                $overwritten[] = $path;
            }
        }

        $saved = $this->getCollaborationSavedValues() ?? $theirs;

        $contributors = $documents->markSaved(
            $room,
            $this->isCollaborationLive() ? $this->getSharedFields($saved) : [],
            $live->snapshot,
            $live->fields,
            $overwritten,
            Identity::current()->name ?? __('filament-collaboration::collaboration.someone'),
            $this->collaborationClient,
            Filament::auth()->user(),
        );

        app(SharedUploads::class)->release($room);

        // Edits that only reached the server with this save belong in the trail too.
        if (CollaborationPlugin::get()->isAuditing()) {
            foreach ($contributors as $field => $people) {
                foreach ($people as $contributor) {
                    app(EditTrail::class)->record($room, $this->getRecord(), $contributor, [$field]);
                }
            }
        }

        $this->collaborationBase = [...$this->getCollaborationFormValues(), ...FormState::only($saved, $live->fields)];

        if ($result->taken !== []) {
            event(new ChangesMerged($this->getRecord(), Filament::auth()->user(), $result->taken, $theirName));
        }

        if ($this->collaborationSettled !== []) {
            event(new ConflictResolved($this->getRecord(), Filament::auth()->user(), $this->collaborationSettled));
            $this->collaborationSettled = [];
        }

        if ($live->fields !== [] || $contributors !== []) {
            event(new SharedDraftSaved($this->getRecord(), Filament::auth()->user(), $live->fields, $contributors));
        }
    }

    protected function getCollaborationRoom(): string
    {
        return app(RoomResolver::class)->forRecord($this->getRecord());
    }

    /** @return array<string, FieldKind> */
    protected function getCollaborationLiveFields(): array
    {
        return $this->isCollaborationLive()
            ? CollaborationPlugin::get()->getFieldResolver()->writable($this->form, $this->getCollaborationIgnoredFields())
            : [];
    }

    /** @return array<string, list<string>> */
    protected function getCollaborationAllowedValues(): array
    {
        $writable = $this->getCollaborationLiveFields();

        return $writable === [] ? [] : CollaborationPlugin::get()->getFieldResolver()->allowedValues($this->form, $writable);
    }

    /** @return list<string> */
    protected function getCollaborationLocks(): array
    {
        $plugin = CollaborationPlugin::get();

        return $plugin->getFieldResolver()->lockable($this->form, $this->getCollaborationLiveFields(), $plugin->locksWhileEditing());
    }

    /** @return array<string, string> */
    protected function getCollaborationAdapters(): array
    {
        return CollaborationPlugin::get()->getFieldResolver()->adapters($this->form, $this->getCollaborationLiveFields());
    }

    /** @return array<string, string> */
    protected function getCollaborationLabels(): array
    {
        return CollaborationPlugin::get()->getFieldResolver()->labels($this->form);
    }

    /** @return list<string> */
    protected function getCollaborationReactiveFields(): array
    {
        $reactive = [];

        foreach (FormState::fields($this->form, withHidden: false) as $path => $field) {
            if ($field->isLive()) {
                $reactive[] = (string) $path;
            }
        }

        return $reactive;
    }

    protected function canPullCollaborationChanges(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    protected function getCollaborationFormValues(): array
    {
        return FormState::values($this->form, $this->getCollaborationIgnoredFields());
    }

    /**
     * What the form would contain if it were opened now. Override this if
     * your page fills its form some other way.
     *
     * @return array<string, mixed>|null
     */
    protected function getCollaborationSavedValues(): ?array
    {
        $record = $this->getRecord();
        $fresh = $record->newQueryWithoutScopes()->whereKey($record->getKey())->first();

        if ($fresh === null) {
            return null;
        }

        $record->setRawAttributes($fresh->getAttributes(), true);
        $record->unsetRelations();

        $typed = $this->data;

        try {
            $this->form->fill($this->mutateFormDataBeforeFill($record->attributesToArray()));

            return $this->getCollaborationFormValues();
        } finally {
            $this->data = $typed;
        }
    }

    protected function reconcileCollaborationDraft(): void
    {
        $theirs = $this->getCollaborationSavedValues();

        if ($theirs !== null) {
            app(DocumentRepository::class)->reconcile($this->getCollaborationRoom(), $this->getSharedFields($theirs));
        }
    }

    /**
     * @param  array<string, mixed>  $values
     * @return list<SharedField>
     */
    protected function getSharedFields(array $values): array
    {
        $fields = [];
        $resolver = CollaborationPlugin::get()->getFieldResolver();
        $kinds = $resolver->shareable($this->form, $this->getCollaborationIgnoredFields());
        $texts = $resolver->texts($this->form, $kinds, $this->getCollaborationIgnoredFields());

        foreach ($kinds as $path => $kind) {
            $fields[] = new SharedField((string) $path, $kind, $values[$path] ?? null, $texts[$path] ?? []);
        }

        return $fields;
    }

    /** @return array<string, FieldKind> */
    protected function getReportedLiveFields(): array
    {
        $bound = Data::strings(Data::decode($this->collaborationSync)['fields'] ?? null);

        return array_intersect_key($this->getCollaborationLiveFields(), array_flip($bound));
    }

    /** @param array<string, mixed> $values */
    protected function writeCollaborationValues(array $values): void
    {
        if ($values !== []) {
            $this->data = FormState::write(Data::map($this->data), $values);
        }
    }

    protected function getCollaborationTheirName(): string
    {
        $update = app(DocumentRepository::class)->changesSince($this->getCollaborationRoom(), 0, 0, 0, []);

        return $update->savedByName ?? __('filament-collaboration::collaboration.someone');
    }

    /** @param list<string> $paths */
    protected function getCollaborationFieldList(array $paths): string
    {
        return implode(', ', array_map(fn (string $path): string => FormState::label($this->form, $path), $paths));
    }
}
