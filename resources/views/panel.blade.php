@php
    /** @var \Filament\Resources\Pages\EditRecord&\SolutionForest\FilamentCollaboration\Concerns\InteractsWithCollaboration $page */
    $versions = $page->getCollaborationVersions();
    $labels = $page->getCollaborationFieldLabels();
    $canRestore = $page->canRestoreCollaborationVersions();
    $comments = $page->getCollaborationComments();
    $open = array_values(array_filter($comments, fn ($comment) => ! $comment->isResolved()));
    $resolved = array_values(array_filter($comments, fn ($comment) => $comment->isResolved()));
    $mentionable = $page->getCollaborationMentionableNames();
@endphp

<div class="fi-collab-panel-view" x-data="{ tab: 'comments' }">
    <nav class="fi-collab-tabs" role="tablist">
        <button type="button" role="tab" class="fi-collab-tab" x-bind:aria-selected="tab === 'comments'" x-on:click="tab = 'comments'">
            {{ __('filament-collaboration::collaboration.panel.comments') }}
        </button>
        <button type="button" role="tab" class="fi-collab-tab" x-bind:aria-selected="tab === 'history'" x-on:click="tab = 'history'">
            {{ __('filament-collaboration::collaboration.panel.history') }}
        </button>
    </nav>

    <section x-show="tab === 'comments'" role="tabpanel" data-collaboration-comments>
        {{-- Not a <form>: the slide-over can be inside the page's form, and forms do not nest. --}}
        <div
            class="fi-collab-comment-form"
            x-data="{
                body: '',
                field: '',
                busy: false,
                names: @js($mentionable),
                query: null,
                at: { left: 0, top: 0 },
                get suggestions() {
                    if (this.query === null) return []
                    const query = this.query.toLowerCase()
                    return this.names.filter((name) => name.toLowerCase().includes(query)).slice(0, 6)
                },
                typed(event) {
                    const input = event.target
                    const before = input.value.slice(0, input.selectionStart)
                    const match = before.match(/(?:^|\s)@([^@\n]{0,40})$/)
                    this.query = match && this.names.length ? match[1] : null
                    if (this.query !== null) this.place(input, before.length - match[1].length - 1)
                },
                // The list opens under the @ being typed, kept inside the comment box.
                place(input, offset) {
                    const caret = window.filamentCollaboration?.caretRect?.(input, offset)
                    const box = input.parentElement.getBoundingClientRect()
                    if (!caret) return (this.at = { left: 8, top: input.offsetHeight + 4 })
                    this.at = {
                        left: Math.max(0, Math.min(caret.left - box.left, box.width - 192)),
                        top: caret.bottom - box.top + 4,
                    }
                },
                mention(name) {
                    const input = this.$refs.body
                    const before = this.body.slice(0, input.selectionStart).replace(/@[^@\n]*$/, '@' + name + ' ')
                    this.body = before + this.body.slice(input.selectionStart)
                    this.query = null
                    input.value = this.body
                    input.focus()
                    input.setSelectionRange(before.length, before.length)
                },
                async post() {
                    if (this.body.trim() === '' || this.busy) return
                    this.busy = true
                    try {
                        await $wire.postCollaborationComment(this.body, this.field)
                        this.body = ''
                    } finally {
                        this.busy = false
                    }
                },
            }"
            role="form"
        >
            <label class="fi-collab-comment-on">
                <span>{{ __('filament-collaboration::collaboration.comments.on') }}</span>
                <select x-model="field" class="fi-select-input" data-collaboration-comment-field>
                    <option value="">{{ __('filament-collaboration::collaboration.comments.whole_record') }}</option>
                    @foreach ($labels as $name => $label)
                        <option value="{{ $name }}">{{ $label }}</option>
                    @endforeach
                </select>
            </label>

            <div class="fi-collab-comment-input">
                <textarea
                    x-ref="body"
                    x-model="body"
                    x-on:input="typed($event)"
                    x-on:keydown.enter.meta.prevent="post()"
                    x-on:keydown.enter.ctrl.prevent="post()"
                    x-on:keydown.escape="if (query !== null) { query = null; $event.stopPropagation() }"
                    rows="3"
                    maxlength="{{ \SolutionForest\FilamentCollaboration\Comments\RecordComments::MAX_LENGTH }}"
                    placeholder="{{ __('filament-collaboration::collaboration.comments.placeholder') }}"
                    aria-label="{{ __('filament-collaboration::collaboration.panel.comments') }}"
                ></textarea>

                <ul class="fi-collab-mentions" x-show="suggestions.length" x-cloak role="listbox" x-bind:style="{ left: at.left + 'px', top: at.top + 'px' }">
                    <template x-for="name in suggestions" x-bind:key="name">
                        <li><button type="button" role="option" x-on:click="mention(name)" x-text="name"></button></li>
                    </template>
                </ul>
            </div>

            <x-filament::button type="button" size="sm" x-on:click="post()" x-bind:disabled="busy || body.trim() === ''">
                {{ __('filament-collaboration::collaboration.comments.post') }}
            </x-filament::button>
        </div>

        @forelse ($open as $comment)
            @include('filament-collaboration::partials.comment', ['comment' => $comment, 'labels' => $labels, 'page' => $page])
        @empty
            <p class="fi-collab-panel-empty">{{ __('filament-collaboration::collaboration.comments.none') }}</p>
        @endforelse

        @if ($resolved !== [])
            <details class="fi-collab-resolved">
                <summary>{{ __('filament-collaboration::collaboration.comments.resolved_heading', ['count' => count($resolved)]) }}</summary>
                @foreach ($resolved as $comment)
                    @include('filament-collaboration::partials.comment', ['comment' => $comment, 'labels' => $labels, 'page' => $page])
                @endforeach
            </details>
        @endif
    </section>

    <section x-show="tab === 'history'" x-cloak role="tabpanel" data-collaboration-history>
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
