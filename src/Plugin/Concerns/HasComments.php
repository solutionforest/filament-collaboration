<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Plugin\Concerns;

use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Livewire\Component;

trait HasComments
{
    protected bool|Closure $hasCommentsAndHistory = true;

    protected ?Closure $mentionableUsing = null;

    protected bool|Closure $isNotifyingMentions = true;

    /**
     * Whether `CollaborationPanelAction`, the comments and history slide-over,
     * is offered. A closure receives `$record` and `$livewire` (the page), to
     * decide per resource or per record:
     *
     *     ->commentsAndHistory(fn (Model $record) => ! $record instanceof Invoice)
     *
     * Off, the button is not rendered, and the page refuses to post, resolve
     * or restore. Versions are still kept, so turning it on shows the history.
     */
    public function commentsAndHistory(bool|Closure $condition = true): static
    {
        $this->hasCommentsAndHistory = $condition;

        return $this;
    }

    public function hasCommentsAndHistory(?Model $record = null, ?Component $livewire = null): bool
    {
        return (bool) $this->evaluate(
            $this->hasCommentsAndHistory,
            ['record' => $record, 'livewire' => $livewire, 'page' => $livewire],
            array_filter([Model::class => $record, Component::class => $livewire]),
        );
    }

    /**
     * Who may be `@mentioned` in a comment on a record, as users: a query,
     * a collection or an array. Receives `$record`.
     *
     *     ->mentionable(fn (Model $record) => User::query()->where('team_id', $record->team_id))
     *
     * Mentioned people get a Filament database notification, unless
     * `notify: false`; `CommentPosted` is dispatched either way.
     */
    public function mentionable(?Closure $users, bool|Closure $notify = true): static
    {
        $this->mentionableUsing = $users;
        $this->isNotifyingMentions = $notify;

        return $this;
    }

    /** @return iterable<mixed> */
    public function getMentionableUsers(Model $record): iterable
    {
        if ($this->mentionableUsing === null) {
            return [];
        }

        $users = $this->evaluate($this->mentionableUsing, ['record' => $record]);

        if ($users instanceof Builder || $users instanceof Relation) {
            $users = $users->limit(500)->get();
        }

        return is_iterable($users) ? $users : [];
    }

    public function hasMentions(): bool
    {
        return $this->mentionableUsing !== null;
    }

    public function isNotifyingMentions(): bool
    {
        return (bool) $this->evaluate($this->isNotifyingMentions);
    }
}
