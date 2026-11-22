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
            const field = event.target?.closest?.('[wire\\:model], [wire\\:model\\.live], [wire\\:model\\.blur]');
            if (! field) {
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
                <span
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-xs font-semibold text-white ring-2 ring-white dark:ring-gray-900"
                    title="{{ $person['name'] }} ({{ $person['mode'] }}){{ $person['field'] ? ' · '.$person['field'] : '' }}"
                >
                    {{ \Illuminate\Support\Str::upper(\Illuminate\Support\Str::substr($person['name'], 0, 1)) }}
                </span>
            @endforeach
        </div>
        <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ trans_choice('filament-collaboration::collaboration.presence.count', count($people), ['count' => count($people)]) }}
            @php
                $focused = collect($people)->first(fn ($person) => filled($person['field'] ?? null));
            @endphp
            @if ($focused)
                · {{ __('filament-collaboration::collaboration.presence.focus', ['name' => $focused['name'], 'field' => $focused['field']]) }}
            @endif
        </span>
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
