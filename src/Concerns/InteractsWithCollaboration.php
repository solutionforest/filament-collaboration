<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Filament\Actions\Action;
use Filament\Forms\Components\Radio;
use Filament\Notifications\Notification;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;
use Livewire\Attributes\On;
use SolutionForest\FilamentCollaboration\Collaboration;
use SolutionForest\FilamentCollaboration\Events\ChangesMerged;
use SolutionForest\FilamentCollaboration\Events\ConflictDetected;
use SolutionForest\FilamentCollaboration\Events\ConflictResolved;
use SolutionForest\FilamentCollaboration\Merge\ThreeWayMerge;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;
use SolutionForest\FilamentCollaboration\Support\FormState;

trait InteractsWithCollaboration
{
    use HasPresence;

    /** @var array<string, mixed> */
    #[Locked]
    public array $collaborationBase = [];

    /** @var array<string, mixed> */
    #[Locked]
    public array $collaborationTheirs = [];

    /** @var list<string> */
    #[Locked]
    public array $collaborationConflicts = [];

    #[Locked]
    public int $collaborationVersion = 0;

    /** @var array{0: bool, 1: bool} */
    #[Locked]
    public array $collaborationSaveArguments = [true, true];

    /** @var array<string, 'mine'|'theirs'> */
    #[Locked]
    public array $collaborationSettled = [];

    /** @var array<string, string> */
    #[Locked]
    public array $collaborationTaken = [];

    #[Locked]
    public bool $collaborationMounted = false;

    protected bool $collaborationResolving = false;

    protected bool $collaborationMerged = false;

    public function mountInteractsWithCollaboration(): void
    {
        if ($this->collaborationMounted) {
            return;
        }

        $this->collaborationMounted = true;
        $this->collaborationBase = $this->collaborationFields();
        $this->collaborationVersion = (int) (Collaboration::store()->lastSave($this->getCollaborationRoom())['version'] ?? 0);
    }

    protected function getCollaborationMode(): string
    {
        return 'editing';
    }

    /**
     * @return list<string>
     */
    protected function getCollaborationIgnoredFields(): array
    {
        return [];
    }

    public function save(bool $shouldRedirect = true, bool $shouldSendSavedNotification = true): void
    {
        $this->collaborationSaveArguments = [$shouldRedirect, $shouldSendSavedNotification];

        try {
            Collaboration::store()->whileSaving($this->getCollaborationRoom(), function () use ($shouldRedirect, $shouldSendSavedNotification): void {
                if (! $this->collaborationMergeBeforeSave()) {
                    return;
                }

                parent::save($shouldRedirect, $shouldSendSavedNotification);
            });
        } catch (LockTimeoutException) {
            Notification::make()
                ->title(__('filament-collaboration::collaboration.busy'))
                ->warning()
                ->send();
        } finally {
            $this->collaborationMerged = false;
        }
    }

    protected function afterSave(): void
    {
        if (method_exists(parent::class, 'afterSave')) {
            parent::afterSave();
        }

        $this->collaborationAfterSave();
    }

    public function collaborationAfterSave(): void
    {
        if (! $this->collaborationMerged && ! $this->collaborationResolving) {
            return;
        }

        $room = $this->getCollaborationRoom();
        $fields = ThreeWayMerge::changed($this->collaborationBase, $this->collaborationFields());
        $name = $this->collaborationUserName();

        Collaboration::store()->rememberSave($room, [
            'name' => $name,
            'fields' => $fields,
            'origin' => $this->collaborationOrigin,
        ]);

        if ($this->collaborationTaken !== []) {
            event(new ChangesMerged(
                $this->getRecord(),
                auth()->user(),
                array_keys($this->collaborationTaken),
                (string) reset($this->collaborationTaken),
            ));
        }

        if ($this->collaborationSettled !== []) {
            event(new ConflictResolved($this->getRecord(), auth()->user(), $this->collaborationSettled));
        }

        $this->collaborationBase = $this->collaborationFields();
        $this->collaborationVersion = (int) (Collaboration::store()->lastSave($room)['version'] ?? $this->collaborationVersion + 1);
        $this->collaborationTaken = [];
        $this->collaborationSettled = [];
        $this->collaborationTheirs = [];
        $this->collaborationConflicts = [];
    }

    #[On('collaboration-pull')]
    public function collaborationPullRequested(mixed $room = null): void
    {
        if ($room === PresenceStore::opaque($this->getCollaborationRoom())) {
            $this->collaborationPull();
        }
    }

    public function collaborationPull(): void
    {
        $this->authorizeAccess();

        $theirs = $this->collaborationTheirsFromRecord();
        if ($theirs === null) {
            $this->collaborationAcknowledge();

            return;
        }

        $result = ThreeWayMerge::merge($this->collaborationBase, $this->collaborationFields(), $theirs);
        $this->collaborationWrite(FormState::onlyKeys($result->data, $result->taken));
        $this->collaborationBase = [
            ...$theirs,
            ...FormState::onlyKeys($this->collaborationBase, $result->conflicts),
        ];
        $this->collaborationAcknowledge(! $result->hasConflicts());

        $body = null;
        if ($result->hasConflicts()) {
            $message = __('filament-collaboration::collaboration.pull.conflicts', ['fields' => $this->collaborationLabels($result->conflicts)]);
            $body = is_string($message) ? $message : null;
        } elseif ($result->taken !== []) {
            $message = __('filament-collaboration::collaboration.pull.taken', ['fields' => $this->collaborationLabels($result->taken)]);
            $body = is_string($message) ? $message : null;
        }

        Notification::make()
            ->title(__('filament-collaboration::collaboration.pull.title'))
            ->body($body)
            ->success()
            ->send();
    }

    public function resolveCollaborationConflictAction(): Action
    {
        return Action::make('resolveCollaborationConflict')
            ->modalIcon('heroicon-o-arrows-right-left')
            ->modalIconColor('warning')
            ->modalWidth('2xl')
            ->modalHeading(fn (): string => __('filament-collaboration::collaboration.conflict.heading', ['name' => $this->collaborationTheirName()]))
            ->modalDescription(fn (): string => trans_choice(
                'filament-collaboration::collaboration.conflict.description',
                count($this->collaborationConflicts),
                ['name' => $this->collaborationTheirName()],
            ))
            ->schema(function (): array {
                $mine = $this->collaborationFields();

                return array_map(fn (string $field): Radio => Radio::make('choices.'.FormState::key($field))
                    ->label($this->collaborationLabel($field))
                    ->options([
                        'mine' => __('filament-collaboration::collaboration.conflict.mine'),
                        'theirs' => __('filament-collaboration::collaboration.conflict.theirs', ['name' => $this->collaborationTheirName()]),
                    ])
                    ->descriptions([
                        'mine' => FormState::display($mine[$field] ?? null),
                        'theirs' => FormState::display($this->collaborationTheirs[$field] ?? null),
                    ])
                    ->required(), $this->collaborationConflicts);
            })
            ->action(function (array $data): void {
                $choicesData = $data['choices'] ?? null;
                if (! is_array($choicesData)) {
                    return;
                }

                $choices = [];
                foreach ($this->collaborationConflicts as $field) {
                    $choice = $choicesData[FormState::key($field)] ?? null;
                    if ($choice !== 'mine' && $choice !== 'theirs') {
                        return;
                    }
                    $choices[$field] = $choice;
                }

                $current = $this->collaborationTheirsFromRecord() ?? [];
                foreach ($this->collaborationConflicts as $field) {
                    if (! ThreeWayMerge::same($current[$field] ?? null, $this->collaborationTheirs[$field] ?? null, exact: true)) {
                        throw ValidationException::withMessages([
                            'choices.'.FormState::key($field) => __('filament-collaboration::collaboration.conflict.stale'),
                        ]);
                    }
                }

                foreach ($choices as $field => $choice) {
                    $this->collaborationBase[$field] = $this->collaborationTheirs[$field] ?? null;
                    if ($choice === 'theirs') {
                        $this->collaborationWrite([$field => $this->collaborationTheirs[$field] ?? null]);
                    }
                }

                $this->collaborationSettled = $choices;
                $this->collaborationConflicts = [];
                $this->collaborationTheirs = [];
                $this->collaborationResolving = true;

                try {
                    $this->save(...$this->collaborationSaveArguments);
                } finally {
                    $this->collaborationResolving = false;
                }
            });
    }

    protected function collaborationMergeBeforeSave(): bool
    {
        if ($this->collaborationResolving) {
            $this->collaborationMerged = true;

            return true;
        }

        $theirs = $this->collaborationTheirsFromRecord();
        if ($theirs === null) {
            return true;
        }

        $mine = $this->collaborationFields();
        $result = ThreeWayMerge::merge($this->collaborationBase, $mine, $theirs);

        if ($result->taken !== []) {
            $this->collaborationWrite(FormState::onlyKeys($result->data, $result->taken));
            foreach ($result->taken as $field) {
                $this->collaborationTaken[$field] = $this->collaborationTheirName();
            }
        }

        if ($result->hasConflicts()) {
            $this->collaborationConflicts = $result->conflicts;
            $this->collaborationTheirs = FormState::onlyKeys($theirs, $result->conflicts);
            event(new ConflictDetected($this->getRecord(), auth()->user(), $result->conflicts, $this->collaborationTheirName()));
            $this->mountAction('resolveCollaborationConflict');

            return false;
        }

        $this->collaborationMerged = true;

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    protected function collaborationFields(): array
    {
        return FormState::only(
            $this->form,
            FormState::array($this->form->getRawState()),
            $this->getCollaborationIgnoredFields(),
        );
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function collaborationTheirsFromRecord(): ?array
    {
        $current = $this->getRecord();
        $fresh = $current::query()->whereKey($current->getKey())->first();
        if (! $fresh instanceof Model) {
            return null;
        }

        $oldData = is_array($this->data) ? $this->data : [];
        $oldRaw = FormState::array($this->form->getRawState());
        $this->form->fill($fresh->attributesToArray());
        $theirs = FormState::only(
            $this->form,
            FormState::array($this->form->getRawState()),
            $this->getCollaborationIgnoredFields(),
        );
        $this->form->rawState($oldRaw);
        $this->data = $oldData;

        return $theirs;
    }

    /**
     * @param  array<string, mixed>  $values
     */
    protected function collaborationWrite(array $values): void
    {
        $state = FormState::write(FormState::array($this->form->getRawState()), $values);
        $this->form->rawState($state);
        $this->data = FormState::write(is_array($this->data) ? $this->data : [], $values);
    }

    protected function collaborationAcknowledge(bool $advanceVersion = true): void
    {
        if ($advanceVersion) {
            $this->collaborationVersion = (int) (Collaboration::store()->lastSave($this->getCollaborationRoom())['version'] ?? $this->collaborationVersion);
        }
    }

    protected function collaborationUserName(): string
    {
        $user = auth()->user();

        if ($user !== null && method_exists($user, 'getFilamentName')) {
            $name = $user->getFilamentName();
            if (is_string($name) && $name !== '') {
                return $name;
            }
        }

        $fallback = is_object($user) ? ($user->name ?? null) : null;

        return is_string($fallback) && $fallback !== ''
            ? $fallback
            : __('filament-collaboration::collaboration.someone');
    }

    protected function collaborationTheirName(): string
    {
        $save = Collaboration::store()->lastSave($this->getCollaborationRoom());

        return is_string($save['name'] ?? null) && $save['name'] !== ''
            ? $save['name']
            : __('filament-collaboration::collaboration.someone');
    }

    protected function collaborationLabel(string $field): string
    {
        return FormState::label($this->form, $field);
    }

    /**
     * @param  list<string>  $fields
     */
    protected function collaborationLabels(array $fields): string
    {
        return implode(', ', array_map(fn (string $field): string => $this->collaborationLabel($field), $fields));
    }
}
