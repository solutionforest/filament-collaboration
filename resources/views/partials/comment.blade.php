<article class="fi-collab-comment @if ($comment->isResolved()) fi-collab-comment-resolved @endif" wire:key="collaboration-comment-{{ $comment->id }}" data-collaboration-comment>
    <div class="fi-collab-version-head">
        <strong>{{ $comment->authorName }}</strong>
        <time datetime="{{ $comment->at->toIso8601String() }}" title="{{ $comment->at->toDayDateTimeString() }}">{{ $comment->at->diffForHumans() }}</time>
    </div>

    @if ($comment->field !== null)
        <p class="fi-collab-version-fields">{{ $labels[$comment->field] ?? $comment->field }}</p>
    @endif

    <p class="fi-collab-comment-body">{!! $comment->html() !!}</p>

    @if ($comment->isResolved())
        <p class="fi-collab-version-fields">{{ __('filament-collaboration::collaboration.comments.resolved', ['name' => $comment->resolvedBy]) }}</p>
    @endif

    @if ($page->canResolveCollaborationComment($comment))
        <button type="button" class="fi-collab-link" wire:click="resolveCollaborationComment({{ $comment->id }}, {{ $comment->isResolved() ? 'false' : 'true' }})">
            {{ __('filament-collaboration::collaboration.comments.'.($comment->isResolved() ? 'reopen' : 'resolve')) }}
        </button>
    @endif
</article>
