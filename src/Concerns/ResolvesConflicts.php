<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Filament\Actions\Action;
use Filament\Forms\Components\Radio;
use Illuminate\Validation\ValidationException;
use Livewire\Attributes\Locked;
use SolutionForest\Collaboration\Merge\ThreeWayMerge;
use SolutionForest\Collaboration\Support\Data;
use SolutionForest\FilamentCollaboration\Support\FormState;

/** @internal used by `InteractsWithCollaboration` */
trait ResolvesConflicts
{
    /** @var array<string, mixed> */
    #[Locked]
    public array $collaborationTheirs = [];

    /** @var list<string> */
    #[Locked]
    public array $collaborationConflicts = [];

    /** @var array<string, 'mine'|'theirs'> */
    #[Locked]
    public array $collaborationSettled = [];

    /** @var array{0: bool, 1: bool} */
    #[Locked]
    public array $collaborationSaveArguments = [true, true];

    public function resolveCollaborationConflictAction(): Action
    {
        return Action::make('resolveCollaborationConflict')
            ->modalIcon('heroicon-o-arrows-right-left')
            ->modalIconColor('warning')
            ->modalWidth('2xl')
            ->modalHeading(fn (): string => __('filament-collaboration::collaboration.conflict.heading', ['name' => $this->getCollaborationTheirName()]))
            ->modalDescription(fn (): string => trans_choice(
                'filament-collaboration::collaboration.conflict.description',
                count($this->collaborationConflicts),
                ['name' => $this->getCollaborationTheirName()],
            ))
            ->modalSubmitActionLabel(__('filament-collaboration::collaboration.conflict.submit'))
            ->schema(function (): array {
                $mine = $this->getCollaborationFormValues();
                $name = $this->getCollaborationTheirName();

                return array_map(fn (string $field): Radio => Radio::make('choices.'.FormState::key($field))
                    ->label(FormState::label($this->form, $field))
                    ->options([
                        'mine' => __('filament-collaboration::collaboration.conflict.mine'),
                        'theirs' => __('filament-collaboration::collaboration.conflict.theirs', ['name' => $name]),
                    ])
                    ->descriptions([
                        'mine' => FormState::display($mine[$field] ?? null),
                        'theirs' => FormState::display($this->collaborationTheirs[$field] ?? null),
                    ])
                    ->required(), $this->collaborationConflicts);
            })
            ->action(function (array $data): void {
                $this->resolveConflicts(Data::map($data['choices'] ?? null));
            });
    }

    /**
     * @param  list<string>  $conflicts
     * @param  array<string, mixed>  $theirs
     */
    protected function askToResolveConflicts(array $conflicts, array $theirs): void
    {
        $this->collaborationConflicts = $conflicts;
        $this->collaborationTheirs = FormState::only($theirs, $conflicts);
        $this->mountAction('resolveCollaborationConflict');
    }

    /** @param array<string, mixed> $given */
    protected function resolveConflicts(array $given): void
    {
        $choices = [];

        foreach ($this->collaborationConflicts as $field) {
            $choice = $given[FormState::key($field)] ?? null;

            if ($choice !== 'mine' && $choice !== 'theirs') {
                return;
            }

            $choices[$field] = $choice;
        }

        $current = $this->getCollaborationSavedValues() ?? [];

        foreach ($this->collaborationConflicts as $field) {
            if (! ThreeWayMerge::same($current[$field] ?? null, $this->collaborationTheirs[$field] ?? null, exact: true)) {
                throw ValidationException::withMessages([
                    'choices.'.FormState::key($field) => __('filament-collaboration::collaboration.conflict.stale'),
                ]);
            }
        }

        foreach ($choices as $field => $choice) {
            // Having seen their value, it is what this editor's change is now based on.
            $this->collaborationBase[$field] = $this->collaborationTheirs[$field] ?? null;

            if ($choice === 'theirs') {
                $this->writeCollaborationValues([$field => $this->collaborationTheirs[$field] ?? null]);
            }
        }

        $this->collaborationSettled = $choices;
        $this->collaborationConflicts = [];
        $this->collaborationTheirs = [];

        // Saving merges again, so anything changed meanwhile is not overwritten.
        $this->save(...$this->collaborationSaveArguments);
    }
}
