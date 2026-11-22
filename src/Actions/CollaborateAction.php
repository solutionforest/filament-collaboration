<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Actions;

use Closure;
use Filament\Actions\Contracts\HasActions;
use Filament\Actions\EditAction;
use Filament\Notifications\Notification;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Schemas\Schema;
use Filament\Support\Exceptions\Halt;
use Illuminate\Contracts\Cache\LockTimeoutException;
use Illuminate\Database\Eloquent\Model;
use SolutionForest\FilamentCollaboration\Collaboration;
use SolutionForest\FilamentCollaboration\Events\ChangesMerged;
use SolutionForest\FilamentCollaboration\Events\ConflictDetected;
use SolutionForest\FilamentCollaboration\Merge\ThreeWayMerge;
use SolutionForest\FilamentCollaboration\Presence\PresenceStore;
use SolutionForest\FilamentCollaboration\Support\FormState;

/**
 * Modal edit support: `EditAction::make()->collaborate()`.
 *
 * Conflicts use a two-step submit: the first save stops with a notice showing
 * their values; submitting again keeps yours for those fields.
 */
final class CollaborateAction
{
    public const STATE_KEY = '__collaboration';

    /**
     * @param  array<mixed>  $ignore
     */
    public static function fromMacro(mixed $action, array $ignore = [], bool $presence = true): EditAction
    {
        if (! $action instanceof EditAction) {
            throw new \LogicException('collaborate() may only be called on EditAction.');
        }

        $ignoredFields = [];
        foreach ($ignore as $field) {
            if (is_string($field)) {
                $ignoredFields[] = $field;
            }
        }

        return self::configure($action, $ignoredFields, $presence);
    }

    /**
     * @param  list<string>  $ignore
     */
    public static function configure(EditAction $action, array $ignore = [], bool $presence = true): EditAction
    {
        $afterFormFilled = self::hook($action, 'afterFormFilled');
        $beforeFormValidated = self::hook($action, 'beforeFormValidated');

        $action->afterFormFilled(function (EditAction $action, Model $record) use ($afterFormFilled, $ignore): void {
            if ($schema = self::modalSchema($action)) {
                $raw = FormState::array($schema->getRawState());
                $filled = FormState::only($schema, $raw, $ignore);
                $schema->rawState([
                    ...$raw,
                    self::STATE_KEY => [
                        'base' => $filled,
                        'force_mine' => false,
                    ],
                ]);
            }

            if ($afterFormFilled) {
                $action->evaluate($afterFormFilled);
            }
        });

        $action->beforeFormValidated(function (EditAction $action, Model $record) use ($beforeFormValidated, $ignore): void {
            if ($schema = self::modalSchema($action)) {
                $raw = FormState::array($schema->getRawState());
                $meta = FormState::array($raw[self::STATE_KEY] ?? []);
                $base = FormState::array($meta['base'] ?? null);
                $forceMine = ($meta['force_mine'] ?? false) === true;
                $mine = FormState::only($schema, $raw, $ignore);

                $room = PresenceStore::room($record);
                try {
                    Collaboration::store()->whileSaving($room, function () use ($record, $schema, $base, $mine, $ignore, $forceMine, $room): void {
                        $fresh = $record::query()->whereKey($record->getKey())->first();
                        if ($fresh === null) {
                            return;
                        }

                        $clone = clone $schema;
                        $clone->model($fresh)->fill($fresh->attributesToArray());
                        $theirs = FormState::only($clone, FormState::array($clone->getRawState()), $ignore);
                        $result = ThreeWayMerge::merge($base, $mine, $theirs);

                        if ($result->hasConflicts() && ! $forceMine) {
                            event(new ConflictDetected($record, auth()->user(), $result->conflicts, (string) (Collaboration::store()->lastSave($room)['name'] ?? __('filament-collaboration::collaboration.someone'))));
                            Notification::make()
                                ->title(__('filament-collaboration::collaboration.conflict.heading', [
                                    'name' => Collaboration::store()->lastSave($room)['name'] ?? __('filament-collaboration::collaboration.someone'),
                                ]))
                                ->body(__('filament-collaboration::collaboration.conflict.description', [
                                    'name' => Collaboration::store()->lastSave($room)['name'] ?? __('filament-collaboration::collaboration.someone'),
                                ])."\n".collect($result->conflicts)
                                    ->map(fn (string $field): string => FormState::label($schema, $field).': '.FormState::display($theirs[$field] ?? null))
                                    ->implode("\n"))
                                ->warning()
                                ->persistent()
                                ->send();

                            $schema->rawState([
                                ...FormState::write(FormState::array($schema->getRawState()), FormState::onlyKeys($result->data, $result->taken)),
                                self::STATE_KEY => [
                                    'base' => $base,
                                    'force_mine' => true,
                                    'conflicts' => $result->conflicts,
                                ],
                            ]);

                            throw new Halt;
                        }

                        $merged = $forceMine
                            ? $mine
                            : $result->data;

                        if ($result->taken !== [] && ! $forceMine) {
                            event(new ChangesMerged(
                                $record,
                                auth()->user(),
                                $result->taken,
                                (string) (Collaboration::store()->lastSave($room)['name'] ?? __('filament-collaboration::collaboration.someone')),
                            ));
                        }

                        $schema->rawState([
                            ...FormState::write(FormState::array($schema->getRawState()), FormState::onlyKeys($merged, array_keys($mine))),
                            self::STATE_KEY => [
                                'base' => $merged,
                                'force_mine' => false,
                            ],
                        ]);
                    });
                } catch (LockTimeoutException) {
                    Notification::make()
                        ->title(__('filament-collaboration::collaboration.busy'))
                        ->warning()
                        ->send();
                    throw new Halt;
                }
            }

            if ($beforeFormValidated) {
                $action->evaluate($beforeFormValidated);
            }
        });

        if ($presence) {
            $action->modalContent(fn (Model $record): string => view('filament-collaboration::modal-presence', [
                'people' => Collaboration::store()->people(PresenceStore::room($record)),
            ])->render());
        }

        $action->after(function (Model $record): void {
            $room = PresenceStore::room($record);
            Collaboration::store()->rememberSave($room, [
                'name' => self::userName(),
                'fields' => [],
                'origin' => 'modal',
            ]);
        });

        return $action;
    }

    private static function hook(EditAction $action, string $name): Closure|string|null
    {
        $value = (fn (): mixed => $this->{$name})->call($action);

        if ($value instanceof Closure || is_string($value) || $value === null) {
            return $value;
        }

        return null;
    }

    private static function modalSchema(EditAction $action): ?Schema
    {
        $livewire = $action->getLivewire();

        if (! $livewire instanceof HasSchemas || ! $livewire instanceof HasActions) {
            return null;
        }

        $name = $livewire->getMountedActionSchemaName();
        if ($name === null) {
            return null;
        }

        return $livewire->getSchema($name);
    }

    private static function userName(): string
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
}
