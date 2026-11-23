@php
    /** @var \Filament\Resources\Pages\EditRecord&\SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration $page */
    $versions = $page->getCollaborationVersions();
    $labels = $page->getCollaborationFieldLabels();
    $canRestore = $page->canRestoreCollaborationVersions();
@endphp

<div class="fi-collab-panel-view" x-data="{ tab: 'history' }">
    @isset($commentsSlot)
    <nav class="fi-collab-tabs" role="tablist">
        <button type="button" role="tab" class="fi-collab-tab" x-bind:aria-selected="tab === 'comments'" x-on:click="tab = 'comments'">
            {{ __('filament-collaboration::collaboration.panel.comments') }}
        </button>
        <button type="button" role="tab" class="fi-collab-tab" x-bind:aria-selected="tab === 'history'" x-on:click="tab = 'history'">
            {{ __('filament-collaboration::collaboration.panel.history') }}
        </button>
    </nav>

    <section x-show="tab === 'comments'" x-cloak role="tabpanel" data-collaboration-comments>
        {{ $commentsSlot }}
    </section>
    @endisset

    <section x-show="tab === 'history'" role="tabpanel" data-collaboration-history>
        @forelse ($versions as $version)
            <article class="fi-collab-version" wire:key="collaboration-version-{{ $version['id'] }}">
                <div class="fi-collab-version-head">
                    <strong>{{ __('filament-collaboration::collaboration.panel.reasons.'.$version['reason'], ['name' => $version['name'] ?? __('filament-collaboration::collaboration.someone')]) }}</strong>
                    <time datetime="{{ $version['at']->toIso8601String() }}" title="{{ $version['at']->toDayDateTimeString() }}">{{ $version['at']->diffForHumans() }}</time>
                </div>

                @if ($version['changed'] !== [])
                    <p class="fi-collab-version-fields">{{ collect($version['changed'])->map(fn (string $field): string => $labels[$field] ?? $field)->join(', ') }}</p>
                @endif

                @if ($canRestore && ! $loop->first)
                    <button
                        type="button"
                        class="fi-collab-link"
                        wire:click="restoreCollaborationVersion({{ $version['id'] }})"
                        wire:confirm="{{ __('filament-collaboration::collaboration.panel.restore_confirm', ['time' => $version['at']->toDayDateTimeString()]) }}"
                    >
                        {{ __('filament-collaboration::collaboration.panel.restore', ['time' => $version['at']->format('H:i')]) }}
                    </button>
                @endif
            </article>
        @empty
            <p class="fi-collab-panel-empty">{{ __('filament-collaboration::collaboration.panel.no_history') }}</p>
        @endforelse
    </section>
</div>
