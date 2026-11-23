@php
    use SolutionForest\FilamentCollaboration\Support\PresenceColor;

    /** @var list<array{id?: string|int, name?: string, avatar?: ?string, field?: ?string, mode?: string}> $people */
    $people = is_array($getState()) ? $getState() : [];
    $visible = array_slice($people, 0, 4);
    $overflow = max(0, count($people) - count($visible));
@endphp

@if (count($people) === 0)
    <span class="text-sm text-gray-400 dark:text-gray-500">—</span>
@else
    <div
        class="fi-collaboration-table-presence inline-flex items-center"
        style="min-width: {{ (count($visible) + ($overflow > 0 ? 1 : 0)) * 1.15 }}rem"
        title="{{ collect($people)->pluck('name')->filter()->implode(', ') }}"
    >
        @foreach ($visible as $person)
            @php
                $color = PresenceColor::for($person['id'] ?? ($person['name'] ?? 'x'));
                $initials = PresenceColor::initials((string) ($person['name'] ?? '?'));
                $tip = ($person['name'] ?? 'Someone').' ('.($person['mode'] ?? 'viewing').')';
                if (! empty($person['field'])) {
                    $tip .= ' · '.$person['field'];
                }
            @endphp
            <span
                class="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold text-white ring-2 ring-white dark:ring-gray-900"
                style="background: {{ $color }}; {{ $loop->first ? '' : 'margin-left: -0.35rem;' }} z-index: {{ 10 - $loop->index }}"
                title="{{ $tip }}"
            >
                @if (! empty($person['avatar']))
                    <img src="{{ $person['avatar'] }}" alt="" class="h-full w-full rounded-full object-cover">
                @else
                    {{ $initials }}
                @endif
            </span>
        @endforeach
        @if ($overflow > 0)
            <span
                class="relative inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-500 text-[0.55rem] font-bold text-white ring-2 ring-white dark:ring-gray-900"
                style="margin-left: -0.35rem; z-index: 0"
                title="{{ $overflow }} more"
            >+{{ $overflow }}</span>
        @endif
    </div>
@endif
