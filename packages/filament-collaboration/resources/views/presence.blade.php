@php
    use SolutionForest\FilamentCollaboration\Support\PresenceColor;

    $fieldLabels = [
        'title' => 'Title',
        'slug' => 'Slug',
        'author_id' => 'Author',
        'category' => 'Category',
        'status' => 'Status',
        'published_at' => 'Publish at',
        'tags' => 'Tags',
        'featured_image_url' => 'Featured image',
        'excerpt' => 'Summary',
        'body_html' => 'Article body',
        'seo_title' => 'SEO title',
        'seo_description' => 'SEO description',
        'seo_keywords' => 'SEO keywords',
        'canonical_url' => 'Canonical URL',
        'robots_noindex' => 'Noindex',
        'relatedPosts' => 'Related posts',
        'live_draft' => 'Live draft',
        'body' => 'Live draft',
        'draft' => 'Live draft',
    ];

    $visibleLimit = 8;
    $visiblePeople = array_slice($people, 0, $visibleLimit);
    $overflow = max(0, count($people) - $visibleLimit);
@endphp

{{-- Single root element required so Livewire does not bind to <style>. --}}
<div
    class="fi-collaboration-presence-root"
    wire:poll.{{ (int) config('filament-collaboration.heartbeat', 4) }}s="tick"
    x-data="filamentCollaborationPresence()"
    x-init="boot($wire)"
>
    <style>
        .fi-collaboration-avatars { display: flex; align-items: center; }
        .fi-collaboration-avatar {
            display: inline-flex; align-items: center; justify-content: center;
            width: 2rem; height: 2rem; margin-left: -.45rem; border-radius: 999px;
            color: #fff; font-size: .68rem; font-weight: 700; letter-spacing: .02em;
            box-shadow: 0 0 0 2px #fff; cursor: default; position: relative;
        }
        .dark .fi-collaboration-avatar { box-shadow: 0 0 0 2px rgb(17 24 39); }
        .fi-collaboration-avatars > .fi-collaboration-avatar:first-child { margin-left: 0; }
        .fi-collaboration-avatar-overflow { background: #5f6368 !important; font-size: .65rem; }
        .fi-collaboration-field-chip {
            display: inline-flex; align-items: center; gap: .35rem;
            border-radius: 999px; padding: .15rem .55rem .15rem .2rem;
            font-size: .72rem; font-weight: 600; background: rgb(0 0 0 / 4%);
        }
        .dark .fi-collaboration-field-chip { background: rgb(255 255 255 / 8%); }
        .fi-collaboration-field-chip-dot {
            width: .65rem; height: .65rem; border-radius: 999px; flex-shrink: 0;
        }
        .fi-collaboration-remote-field {
            outline: 2px solid var(--fi-collab-color, #1a73e8) !important;
            outline-offset: 2px;
            border-radius: .5rem;
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--fi-collab-color, #1a73e8) 18%, transparent);
        }
        .fi-collaboration-remote-label {
            position: absolute; top: -0.55rem; left: .5rem; z-index: 20;
            padding: .05rem .4rem; border-radius: .3rem .3rem .3rem 0;
            color: #fff; font-size: .65rem; font-weight: 700; line-height: 1.3;
            pointer-events: none; white-space: nowrap;
            box-shadow: 0 1px 2px rgb(0 0 0 / 18%);
        }
        .fi-collaboration-remote-caret {
            position: absolute; top: .4rem; right: .45rem; width: 2px; height: 1.1rem;
            border-radius: 1px; pointer-events: none; z-index: 21;
            animation: fi-collab-caret 1s steps(1) infinite;
        }
        @keyframes fi-collab-caret { 50% { opacity: 0; } }
    </style>

    <div class="fi-collaboration-presence flex flex-wrap items-center gap-2">
        @if (count($people))
            <div class="fi-collaboration-avatars" title="{{ __('filament-collaboration::collaboration.presence.others') }}">
                @foreach ($visiblePeople as $person)
                    @php
                        $fieldKey = $person['field'] ?? null;
                        $fieldLabel = is_string($fieldKey) ? ($fieldLabels[$fieldKey] ?? str_replace('_', ' ', $fieldKey)) : null;
                        $color = $person['color'] ?? PresenceColor::for($person['id'] ?? ($person['name'] ?? 'x'));
                        $initials = PresenceColor::initials((string) ($person['name'] ?? '?'));
                    @endphp
                    <span
                        class="fi-collaboration-avatar"
                        style="background: {{ $color }}"
                        title="{{ $person['name'] }} ({{ $person['mode'] }}){{ $fieldLabel ? ' · '.$fieldLabel : '' }}"
                    >
                        @if (! empty($person['avatar']))
                            <img src="{{ $person['avatar'] }}" alt="" class="h-full w-full rounded-full object-cover">
                        @else
                            {{ $initials }}
                        @endif
                    </span>
                @endforeach
                @if ($overflow > 0)
                    <span class="fi-collaboration-avatar fi-collaboration-avatar-overflow" title="{{ $overflow }} more editors">
                        +{{ $overflow }}
                    </span>
                @endif
            </div>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                <span>{{ trans_choice('filament-collaboration::collaboration.presence.count', count($people), ['count' => count($people)]) }}</span>
                @foreach (array_slice($people, 0, 6) as $person)
                    @php
                        $fieldKey = $person['field'] ?? null;
                        $fieldLabel = is_string($fieldKey) ? ($fieldLabels[$fieldKey] ?? str_replace('_', ' ', $fieldKey)) : null;
                        $color = $person['color'] ?? PresenceColor::for($person['id'] ?? ($person['name'] ?? 'x'));
                    @endphp
                    @if ($fieldLabel)
                        <span class="fi-collaboration-field-chip" style="color: {{ $color }}">
                            <span class="fi-collaboration-field-chip-dot" style="background: {{ $color }}"></span>
                            {{ \Illuminate\Support\Str::before($person['name'], ' ') }} → {{ $fieldLabel }}
                        </span>
                    @endif
                @endforeach
            </div>
        @endif

        @if ($lastSaveName)
            <div class="flex items-center gap-2 rounded-lg bg-warning-50 px-3 py-1.5 text-sm text-warning-800 dark:bg-warning-400/10 dark:text-warning-400">
                <span>{{ __('filament-collaboration::collaboration.save_notice', ['name' => $lastSaveName]) }}</span>
                <button
                    type="button"
                    class="font-semibold underline"
                    wire:click="$dispatch('collaboration-pull', { room: @js(\SolutionForest\FilamentCollaboration\Presence\PresenceStore::opaque($room)) })"
                >
                    {{ __('filament-collaboration::collaboration.pull.action') }}
                </button>
            </div>
        @endif
    </div>

    <script>
        if (! window.filamentCollaborationPresence) {
            window.filamentCollaborationPresence = function () {
                return {
                    wire: null,
                    boot(wire) {
                        this.wire = wire;
                        this.paintHighlights();
                        const root = document.querySelector('.fi-page') || document;
                        root.addEventListener('focusin', (event) => {
                            const field = event.target?.closest?.('[wire\\:model], [wire\\:model\\.live], [wire\\:model\\.blur], [data-collaborative-rich-editor]');
                            if (! field) return;
                            if (field.hasAttribute('data-collaborative-rich-editor')) {
                                this.wire.setField(field.getAttribute('data-field') || 'live_draft');
                                return;
                            }
                            const name = field.getAttribute('wire:model')
                                || field.getAttribute('wire:model.live')
                                || field.getAttribute('wire:model.blur');
                            if (name && name.startsWith('data.')) {
                                this.wire.setField(name.slice(5));
                            }
                        });
                        window.addEventListener('beforeunload', () => this.wire.leave());
                        this.wire.$watch('people', () => this.paintHighlights());
                    },
                    clearHighlights() {
                        document.querySelectorAll('.fi-collaboration-remote-label, .fi-collaboration-remote-caret').forEach((el) => el.remove());
                        document.querySelectorAll('.fi-collaboration-remote-field').forEach((el) => {
                            el.classList.remove('fi-collaboration-remote-field');
                            el.style.removeProperty('--fi-collab-color');
                        });
                    },
                    findFieldEl(name) {
                        const root = document.querySelector('.fi-page') || document;
                        const selectors = [
                            '[wire\\:model="data.' + name + '"]',
                            '[wire\\:model.live="data.' + name + '"]',
                            '[wire\\:model.blur="data.' + name + '"]',
                            '[data-collaborative-rich-editor][data-field="' + name + '"]',
                        ];
                        for (const selector of selectors) {
                            const el = root.querySelector(selector);
                            if (el) return el;
                        }
                        if (name === 'live_draft' || name === 'body' || name === 'draft') {
                            return root.querySelector('[data-collaborative-rich-editor]');
                        }
                        return null;
                    },
                    paintHighlights() {
                        this.clearHighlights();
                        const people = this.wire?.people || [];
                        const byField = new Map();
                        for (const person of people) {
                            if (! person.field) continue;
                            if (! byField.has(person.field)) byField.set(person.field, []);
                            byField.get(person.field).push(person);
                        }
                        for (const [field, occupants] of byField.entries()) {
                            const target = this.findFieldEl(field);
                            if (! target) continue;
                            const host = target.closest('.fi-fo-field-wrp, .fi-fo-field, .fi-sc-component') || target;
                            const color = occupants[0].color || '#1a73e8';
                            host.classList.add('fi-collaboration-remote-field');
                            host.style.setProperty('--fi-collab-color', color);
                            if (getComputedStyle(host).position === 'static') {
                                host.style.position = 'relative';
                            }
                            const label = document.createElement('span');
                            label.className = 'fi-collaboration-remote-label';
                            label.style.background = color;
                            label.textContent = occupants.map((p) => String(p.name || '').split(/\s+/)[0]).filter(Boolean).join(', ');
                            host.appendChild(label);
                            const caret = document.createElement('span');
                            caret.className = 'fi-collaboration-remote-caret';
                            caret.style.background = color;
                            host.appendChild(caret);
                        }
                    },
                };
            };
        }
    </script>
</div>
