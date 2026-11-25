<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Actions;

use Closure;
use Filament\Actions\Contracts\HasActions;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Filament\Schemas\Contracts\HasSchemas;
use Filament\Schemas\Schema;
use Filament\Support\Exceptions\Halt;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Model;
use Livewire\Component;
use LogicException;
use SolutionForest\Collaboration\Documents\DocumentRepository;
use SolutionForest\Collaboration\Enums\PresenceMode;
use SolutionForest\Collaboration\Events\ChangesMerged;
use SolutionForest\Collaboration\Events\ConflictDetected;
use SolutionForest\Collaboration\Merge\ThreeWayMerge;
use SolutionForest\Collaboration\Presence\Identity;
use SolutionForest\Collaboration\Rooms\RoomResolver;
use SolutionForest\Collaboration\Support\Data;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Rooms\RoomRenderer;
use SolutionForest\FilamentCollaboration\Support\FormState;
use SolutionForest\FilamentCollaboration\Support\PageInspector;

/**
 * Presence and merge on save for modals: `EditAction::make()->collaborate()`.
 *
 * A conflict stops the first submit and shows the saved values. Submitting
 * again keeps yours, unless those values changed again in the meantime.
 *
 * Call it last, as it wraps the action's lifecycle hooks.
 */
final class CollaborateAction
{
    private const STATE_KEY = '__collaboration';

    /** @param array<mixed> $ignore */
    public static function fromMacro(mixed $action, array $ignore = [], bool $presence = true): EditAction
    {
        if (! $action instanceof EditAction) {
            throw new LogicException('collaborate() may only be called on an EditAction.');
        }

        return self::configure($action, Data::strings($ignore), $presence);
    }

    /** @param list<string> $ignore */
    public static function configure(EditAction $action, array $ignore = [], bool $presence = true): EditAction
    {
        $afterFormFilled = self::hook($action, 'afterFormFilled');
        $beforeFormValidated = self::hook($action, 'beforeFormValidated');
        $after = self::hook($action, 'after');

        // Otherwise a list page turns it into a link to the edit page.
        $action->modal();

        // The row stays locked from the merge until the update commits.
        $action->databaseTransaction();

        $action->afterFormFilled(function (EditAction $action) use ($afterFormFilled, $ignore): void {
            if ($afterFormFilled !== null) {
                $action->evaluate($afterFormFilled);
            }

            if (($schema = self::schema($action)) !== null) {
                self::remember($schema, ['base' => FormState::values($schema, $ignore), 'seen' => null]);
            }
        });

        $action->beforeFormValidated(function (EditAction $action, Model $record) use ($beforeFormValidated, $ignore): void {
            if (($schema = self::schema($action)) !== null) {
                self::merge($action, $schema, $record, $ignore);
            }

            if ($beforeFormValidated !== null) {
                $action->evaluate($beforeFormValidated);
            }
        });

        $action->after(function (EditAction $action, Model $record) use ($after): void {
            app(DocumentRepository::class)->announceSave(
                app(RoomResolver::class)->forRecord($record),
                Identity::current()->name ?? __('filament-collaboration::collaboration.someone'),
            );

            if ($after !== null) {
                $action->evaluate($after);
            }
        });

        if ($presence) {
            $action->modalContent(fn (EditAction $action, Model $record): ?View => self::room($action, $record));
        }

        return $action;
    }

    /** @param list<string> $ignore */
    private static function merge(EditAction $action, Schema $schema, Model $record, array $ignore): void
    {
        $fresh = $record->newQueryWithoutScopes()->whereKey($record->getKey())->lockForUpdate()->first();

        if ($fresh === null) {
            return;
        }

        $typed = Data::map($schema->getRawState());
        $memory = Data::map($typed[self::STATE_KEY] ?? null);
        $mine = FormState::values($schema, $ignore);

        // Fill exactly as the action does, read it, and put back what was typed.
        $action->record($fresh);
        $action->mount(['form' => $schema, 'schema' => $schema]);
        $theirs = FormState::values($schema, $ignore);
        $schema->rawState($typed);

        $result = ThreeWayMerge::merge(Data::map($memory['base'] ?? null), $mine, $theirs);
        $name = app(DocumentRepository::class)
            ->changesSince(app(RoomResolver::class)->forRecord($fresh), 0, 0, 0, [])
            ->savedByName ?? __('filament-collaboration::collaboration.someone');

        if ($result->taken !== []) {
            $schema->rawState(FormState::write($typed, FormState::only($result->data, $result->taken)));
        }

        if ($result->hasConflicts()) {
            $seen = sha1(Data::encode(ThreeWayMerge::normalize(FormState::only($theirs, $result->conflicts), exact: true)));

            if (($memory['seen'] ?? null) !== $seen) {
                // `base` is untouched: nothing has been saved, so the next submit merges from the same place.
                self::remember($schema, [...$memory, 'seen' => $seen]);
                event(new ConflictDetected($fresh, Filament::auth()->user(), $result->conflicts, $name));
                self::warn($schema, $result->conflicts, $theirs, $name);

                throw new Halt;
            }
        }

        if ($result->taken !== []) {
            event(new ChangesMerged($fresh, Filament::auth()->user(), $result->taken, $name));
        }
    }

    /**
     * @param  list<string>  $conflicts
     * @param  array<string, mixed>  $theirs
     */
    private static function warn(Schema $schema, array $conflicts, array $theirs, string $name): void
    {
        $lines = [e(__('filament-collaboration::collaboration.conflict.modal', ['name' => $name]))];

        foreach ($conflicts as $field) {
            $lines[] = '<strong>'.e(FormState::label($schema, $field)).'</strong>: '.e(FormState::display($theirs[$field] ?? null));
        }

        Notification::make()
            ->title(__('filament-collaboration::collaboration.conflict.heading', ['name' => $name]))
            ->body(implode('<br>', $lines))
            ->warning()
            ->persistent()
            ->send();
    }

    private static function room(EditAction $action, Model $record): ?View
    {
        $livewire = $action->getLivewire();
        $schema = self::schema($action);
        $plugin = CollaborationPlugin::find();

        if ($schema === null || $plugin === null || ! $livewire instanceof Component) {
            return null;
        }

        $resource = PageInspector::resource($livewire);

        // A relation manager's records are not those of its page's resource.
        if ($resource !== null && ! is_a($record, $resource::getModel())) {
            $resource = null;
        }

        $statePath = Data::string($schema->getStatePath());
        $user = Data::string(Filament::auth()->user()?->getAuthIdentifier());

        return app(RoomRenderer::class)->render(
            mode: PresenceMode::Editing,
            // The same for every render of one open modal.
            client: (int) hexdec(substr(hash('sha256', Data::string($livewire->getId()).$statePath.$user.Data::string($record->getKey())), 0, 7)) + 1,
            record: $record,
            resource: $resource,
            statePath: $statePath,
            labels: $plugin->getFieldResolver()->labels($schema),
        );
    }

    /** @param array<string, mixed> $memory */
    private static function remember(Schema $schema, array $memory): void
    {
        $schema->rawState([...Data::map($schema->getRawState()), self::STATE_KEY => $memory]);
    }

    private static function hook(EditAction $action, string $name): Closure|string|null
    {
        $value = (fn (): mixed => $this->{$name})->call($action);

        return $value instanceof Closure || is_string($value) ? $value : null;
    }

    private static function schema(EditAction $action): ?Schema
    {
        $livewire = $action->getLivewire();

        if (! $livewire instanceof HasSchemas || ! $livewire instanceof HasActions) {
            return null;
        }

        $name = $livewire->getMountedActionSchemaName();

        return $name === null ? null : $livewire->getSchema($name);
    }
}
