<?php

declare(strict_types=1);

namespace SolutionForest\FilamentCollaboration\Concerns;

use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Filament\Support\Components\Attributes\Exposed;
use Filament\Support\Components\Attributes\Unexposed;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use SolutionForest\Collaboration\Comments\Comment;
use SolutionForest\Collaboration\Comments\RecordComments;
use SolutionForest\Collaboration\Events\CommentPosted;
use SolutionForest\Collaboration\Presence\Identity;
use SolutionForest\Collaboration\Rooms\RoomResolver;
use SolutionForest\Collaboration\Support\Data;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use Throwable;

/**
 * Comments on the record, or on one of its fields, with `@mentions`. Shown
 * in `CollaborationPanelAction`. Every language of a record shares them.
 */
trait HasComments
{
    /** @return list<Comment> */
    #[Unexposed]
    public function getCollaborationComments(): array
    {
        $labels = $this->getCollaborationFieldLabels();

        // A comment on a field this user may not see is not theirs to read.
        return array_values(array_filter(
            app(RecordComments::class)->list($this->getCollaborationCommentsRoom()),
            static fn (Comment $comment): bool => $comment->field === null || isset($labels[$comment->field]),
        ));
    }

    #[Unexposed]
    public function getCollaborationOpenCommentCount(): int
    {
        $labels = $this->getCollaborationFieldLabels();
        $count = 0;

        foreach (app(RecordComments::class)->openCounts($this->getCollaborationCommentsRoom()) as $field => $open) {
            if ($field === '' || isset($labels[$field])) {
                $count += $open;
            }
        }

        return $count;
    }

    /** @return list<string> names the comment box suggests after `@` */
    #[Unexposed]
    public function getCollaborationMentionableNames(): array
    {
        $plugin = CollaborationPlugin::find();
        $names = [];

        foreach ($plugin?->getMentionableUsers($this->getRecord()) ?? [] as $user) {
            if ($user instanceof Authenticatable) {
                $names[] = Identity::for($user)->name;
            }
        }

        return array_values(array_unique(array_filter($names)));
    }

    #[Exposed]
    public function postCollaborationComment(string $body, ?string $field = null): void
    {
        $this->authorizeAccess();

        if (! $this->hasCollaborationPanel()) {
            return;
        }

        $body = trim($body);
        $field = $field === '' ? null : $field;
        $user = Filament::auth()->user();

        if ($user === null || $body === '' || mb_strlen($body) > RecordComments::MAX_LENGTH || ($field !== null && ! isset($this->getCollaborationFieldLabels()[$field]))) {
            return;
        }

        $record = $this->getRecord();
        $plugin = CollaborationPlugin::find();
        $mentions = RecordComments::mentionsIn($body, $plugin?->getMentionableUsers($record) ?? []);
        $comment = app(RecordComments::class)->post($this->getCollaborationCommentsRoom(), $field, $body, $user, $mentions);
        $url = $this->getCollaborationCommentUrl($record);

        event(new CommentPosted($record, $user, $comment, $url));

        if ($plugin?->isNotifyingMentions() ?? false) {
            $this->notifyCollaborationMentions($user, $comment, $url);
        }

        $this->dispatch('filament-collaboration-comment-posted');
    }

    /** Resolving, and reopening, is for the author and for anybody who may edit the record. */
    #[Exposed]
    public function resolveCollaborationComment(int $id, bool $resolved = true): void
    {
        $this->authorizeAccess();

        if (! $this->hasCollaborationPanel()) {
            return;
        }

        $comments = app(RecordComments::class);
        $room = $this->getCollaborationCommentsRoom();
        $comment = $comments->find($room, $id);

        if ($comment === null || ! $this->canResolveCollaborationComment($comment)) {
            return;
        }

        $resolved
            ? $comments->resolve($room, $id, Identity::current()->name ?? __('filament-collaboration::collaboration.someone'))
            : $comments->reopen($room, $id);
    }

    #[Unexposed]
    public function canResolveCollaborationComment(Comment $comment): bool
    {
        $user = Filament::auth()->user();

        if ($user === null) {
            return false;
        }

        // Not a comment on a field this person cannot see, whose id they might guess.
        if ($comment->field !== null && ! isset($this->getCollaborationFieldLabels()[$comment->field])) {
            return false;
        }

        $isAuthor = $comment->authorType === $user::class && $comment->authorId === Data::string($user->getAuthIdentifier());

        return $isAuthor || $this->mayEditCollaborationRecord();
    }

    /** Whether this page offers comments and history: `CollaborationPlugin::make()->commentsAndHistory()`. */
    #[Unexposed]
    public function hasCollaborationPanel(): bool
    {
        return CollaborationPlugin::find()?->hasCommentsAndHistory($this->getRecord(), $this) ?? false;
    }

    /** Whoever may edit the record, live or not, may resolve its comments. */
    protected function mayEditCollaborationRecord(): bool
    {
        try {
            return static::getResource()::canEdit($this->getRecord()) === true;
        } catch (Throwable) {
            return $this->isCollaborationLive();
        }
    }

    protected function getCollaborationCommentsRoom(): string
    {
        return app(RoomResolver::class)->forRecord($this->getRecord());
    }

    protected function getCollaborationCommentUrl(Model $record): ?string
    {
        try {
            $resource = static::getResource();

            $url = $resource::hasPage('edit') ? $resource::getUrl('edit', ['record' => $record]) : null;

            return is_string($url) ? $url : null;
        } catch (Throwable) {
            return null;
        }
    }

    protected function notifyCollaborationMentions(Authenticatable $author, Comment $comment, ?string $url): void
    {
        $record = $this->getRecordTitle();
        // Filament renders a notification's title and body as HTML: what people typed is text.
        $title = e(__('filament-collaboration::collaboration.comments.mentioned', [
            'name' => $comment->authorName,
            'record' => $record instanceof Htmlable ? strip_tags($record->toHtml()) : $record,
        ]));
        // A comment on a field may be about something a mentioned person cannot see: they read it on the page.
        $body = $comment->field === null ? e(Str::limit($comment->body, 200)) : null;

        foreach ($comment->mentions as $mention) {
            $user = $mention->user();

            if ($user === null || ($mention->type === $author::class && $mention->id === Data::string($author->getAuthIdentifier())) || ! method_exists($user, 'notify')) {
                continue;
            }

            $notification = Notification::make()->title($title)->body($body)->icon('heroicon-o-at-symbol');

            if ($url !== null) {
                $notification->actions([Action::make('view')->label(__('filament-collaboration::collaboration.comments.view'))->url($url)->markAsRead()]);
            }

            $notification->sendToDatabase($user);
        }
    }
}
