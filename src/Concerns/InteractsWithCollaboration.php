<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Carbon\CarbonImmutable;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Notifications\Notification;
use Filament\Support\Components\Attributes\Exposed;
use Filament\Support\Components\Attributes\Unexposed;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;
use Livewire\Attributes\Renderless;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Crdt\Html;
use SolutionForest\FilamentCollaboration\Documents\DocumentRepository;
use SolutionForest\FilamentCollaboration\Documents\DraftVersions;
use SolutionForest\FilamentCollaboration\Documents\EditTrail;
use SolutionForest\FilamentCollaboration\Documents\Fingerprint;
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
use SolutionForest\FilamentCollaboration\Rooms\RoomContext;
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

    /** The language whose draft this page is on, on a page with a locale switcher. */
    #[Locked]
    public ?string $collaborationLocale = null;

    protected bool $collaborationHasSaved = false;

    public function mountInteractsWithCollaboration(): void
    {
        if ($this->collaborationMounted) {
            return;
        }

        $this->collaborationMounted = true;
        $this->openCollaborationDraft();
    }

    /** Switching language moves the page to that language's draft. */
    public function renderingInteractsWithCollaboration(): void
    {
        if ($this->collaborationMounted && $this->getCollaborationLocale() !== $this->collaborationLocale) {
            $this->openCollaborationDraft();
        }
    }

    protected function openCollaborationDraft(): void
    {
        $this->collaborationLocale = $this->getCollaborationLocale();
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

    /**
     * Stores the files just uploaded to a live upload field, so everybody sees
     * them and any save keeps them. Validated by the field's own rules first.
     *
     * @return array<string, string> the field's files, by key
     */
    #[Exposed]
    #[Renderless]
    public function storeCollaborationUpload(string $field): array
    {
        $this->authorizeAccess();

        $component = FormState::fields($this->form, withHidden: false)[$field] ?? null;

        if (! $component instanceof FileUpload || ! isset($this->getCollaborationLiveFields()[$field])) {
            return [];
        }

        $before = Arr::wrap($component->getRawState());
        $validator = Validator::make(['files' => $before], ['files' => $component->getValidationRules()], [], ['files' => $component->getValidationAttribute()]);

        if ($validator->fails()) {
            throw ValidationException::withMessages([$component->getStatePath() => $validator->errors()->first()]);
        }

        $component->saveUploadedFiles();

        $disk = $component->getDiskName();
        $files = array_filter(Arr::wrap($component->getRawState()), is_string(...));

        foreach (array_diff($files, array_filter($before, is_string(...))) as $stored) {
            if (Storage::disk($disk)->exists($stored)) {
                app(SharedUploads::class)->track($this->getCollaborationRoom(), $field, $disk, $stored);
            }
        }

        $stored = [];

        foreach ($files as $key => $path) {
            $stored[(string) $key] = $path;
        }

        return $stored;
    }

    /**
     * The shared draft's earlier versions, for the comments and history panel.
     *
     * @return list<array{id: int, reason: string, name: string|null, at: CarbonImmutable, changed: list<string>}>
     */
    #[Unexposed]
    public function getCollaborationVersions(): array
    {
        return app(DraftVersions::class)->list($this->getCollaborationRoom(), $this->getCollaborationLabels());
    }

    /** @return array<string, string> the visible fields' labels */
    #[Unexposed]
    public function getCollaborationFieldLabels(): array
    {
        return $this->getCollaborationLabels();
    }

    #[Unexposed]
    public function canRestoreCollaborationVersions(): bool
    {
        return $this->isCollaborationLive() && $this->getCollaborationLiveFields() !== [];
    }

    /** Puts the shared draft back as it was in a version, for everybody, in the fields this user may edit. */
    #[Exposed]
    public function restoreCollaborationVersion(int $id): void
    {
        $this->authorizeAccess();

        $room = $this->getCollaborationRoom();
        $values = app(DraftVersions::class)->values($room, $id);

        if ($values === null || ! $this->canRestoreCollaborationVersions()) {
            return;
        }

        $fields = array_map(strval(...), array_keys($this->getCollaborationLiveFields()));
        $name = Identity::current()->name ?? __('filament-collaboration::collaboration.someone');

        app(SaveLock::class)->block($room, fn () => app(DocumentRepository::class)->restore($room, $values, $fields, $name));

        Notification::make()->title(__('filament-collaboration::collaboration.panel.restored'))->success()->send();
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
        $publishing = $this->fromSharedValues($live->valuesToPublish($this->toSharedValues($mine), $this->toSharedValues($theirs)), $theirs);
        $typed = FormState::only($mine, array_map(strval(...), array_keys($publishing)));
        $this->writeCollaborationValues($publishing);
        $this->forgetOtherLanguagesLiveFields($writable);

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

    /** The shared draft's room: with a locale switcher, one draft per language. */
    protected function getCollaborationRoom(): string
    {
        return RoomContext::draftFor(app(RoomResolver::class)->forRecord($this->getRecord()), $this->getCollaborationLocale());
    }

    /**
     * A locale switcher keeps what this page last had in each other language,
     * and saves it too. A live field's other languages are in their own shared
     * drafts, so saving this page's old copy would undo colleagues' work there.
     *
     * @param  array<string, FieldKind>  $live
     */
    protected function forgetOtherLanguagesLiveFields(array $live): void
    {
        $record = $this->getRecord();

        if (! property_exists($this, 'otherLocaleData') || ! is_array($this->otherLocaleData) || ! method_exists($record, 'getTranslation')) {
            return;
        }

        // What is stored stays stored: those languages' drafts are saved from their own pages.
        foreach ($this->otherLocaleData as $locale => $data) {
            if (! is_array($data)) {
                continue;
            }

            foreach (array_keys(array_intersect_key($data, $live)) as $field) {
                $data[$field] = $record->getTranslation((string) $field, (string) $locale, false);
            }

            $this->otherLocaleData[$locale] = $data;
        }
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

    /** @return list<string> */
    protected function getCollaborationUploads(): array
    {
        return CollaborationPlugin::get()->getFieldResolver()->uploads($this->form, $this->getCollaborationLiveFields());
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
        $attributes = $record->attributesToArray();
        $locale = $this->getCollaborationLocale();

        // Translated attributes in the language being edited, as the locale switcher fills them.
        if ($locale !== null && method_exists($record, 'getTranslatableAttributes') && method_exists($record, 'getTranslation')) {
            foreach (Data::strings($record->getTranslatableAttributes()) as $attribute) {
                $attributes[$attribute] = $record->getTranslation($attribute, $locale, false);
            }
        }

        try {
            $this->form->fill($this->mutateFormDataBeforeFill($attributes));

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
            app(DocumentRepository::class)->link($this->getCollaborationRoom(), app(RoomResolver::class)->forRecord($this->getRecord()));
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

        $values = $this->toSharedValues($values);

        foreach ($kinds as $path => $kind) {
            $fields[] = new SharedField((string) $path, $kind, $values[$path] ?? null, $texts[$path] ?? []);
        }

        return $fields;
    }

    /** @return list<string> rich text fields whose form state is HTML, edited through an adapter */
    protected function getCollaborationHtmlFields(): array
    {
        $resolver = CollaborationPlugin::get()->getFieldResolver();

        return $resolver->htmlFields($this->form, $resolver->shareable($this->form, $this->getCollaborationIgnoredFields()));
    }

    /**
     * Form state as the draft holds it: HTML as a document.
     *
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    protected function toSharedValues(array $values): array
    {
        foreach ($this->getCollaborationHtmlFields() as $path) {
            if (array_key_exists($path, $values)) {
                $values[$path] = Html::toDocument(is_string($values[$path]) ? $values[$path] : '');
            }
        }

        return $values;
    }

    /**
     * The draft's values as form state: a document as HTML. A value that
     * means what is stored is kept exactly as stored.
     *
     * @param  array<string, mixed>  $values
     * @param  array<string, mixed>  $stored
     * @return array<string, mixed>
     */
    protected function fromSharedValues(array $values, array $stored): array
    {
        foreach ($this->getCollaborationHtmlFields() as $path) {
            if (! is_array($values[$path] ?? null)) {
                continue;
            }

            $isStored = is_string($stored[$path] ?? null)
                && Fingerprint::value(FieldKind::RichText, Html::toDocument($stored[$path])) === Fingerprint::value(FieldKind::RichText, $values[$path]);

            $values[$path] = $isStored ? $stored[$path] : Html::fromDocument(Data::map($values[$path]));
        }

        return $values;
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
