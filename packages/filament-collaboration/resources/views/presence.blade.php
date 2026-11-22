@php
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
@endphp

<div
    class="fi-collaboration-presence flex flex-wrap items-center gap-2"
    wire:poll.{{ (int) config('filament-collaboration.heartbeat', 4) }}s="tick"
    x-data="{
        report(field) {
            $wire.setField(field || null)
        }
    }"
    x-init="
        const root = document.querySelector('.fi-page') || document;
        root.addEventListener('focusin', (event) => {
            const field = event.target?.closest?.('[wire\\:model], [wire\\:model\\.live], [wire\\:model\\.blur], [data-collaborative-rich-editor]');
            if (! field) {
                return;
            }
            if (field.hasAttribute('data-collaborative-rich-editor')) {
                report(field.getAttribute('data-field') || 'live_draft');
                return;
            }
            const name = field.getAttribute('wire:model')
                || field.getAttribute('wire:model.live')
                || field.getAttribute('wire:model.blur');
            if (name && name.startsWith('data.')) {
                report(name.slice(5));
            }
        });
        window.addEventListener('beforeunload', () => $wire.leave());
    "
>
    @if (count($people))
        <div class="flex -space-x-1" title="{{ __('filament-collaboration::collaboration.presence.others') }}">
            @foreach ($people as $person)
                @php
                    $fieldKey = $person['field'] ?? null;
                    $fieldLabel = is_string($fieldKey) ? ($fieldLabels[$fieldKey] ?? str_replace('_', ' ', $fieldKey)) : null;
                @endphp
                <span
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-900"
                    title="{{ $person['name'] }} ({{ $person['mode'] }}){{ $fieldLabel ? ' · '.$fieldLabel : '' }}"
                >
                    {{ \Illuminate\Support\Str::upper(\Illuminate\Support\Str::substr($person['name'], 0, 1)) }}
                </span>
            @endforeach
        </div>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ trans_choice('filament-collaboration::collaboration.presence.count', count($people), ['count' => count($people)]) }}</span>
            @foreach ($people as $person)
                @php
                    $fieldKey = $person['field'] ?? null;
                    $fieldLabel = is_string($fieldKey) ? ($fieldLabels[$fieldKey] ?? str_replace('_', ' ', $fieldKey)) : null;
                @endphp
                @if ($fieldLabel)
                    <span class="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-white/10 dark:text-gray-200">
                        {{ $person['name'] }} → {{ $fieldLabel }}
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
