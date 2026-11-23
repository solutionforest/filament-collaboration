@php
    $people = $getState() ?? [];
    $visible = array_slice($people, 0, $getAvatarLimit());
    $overflow = count($people) - count($visible);
    $names = collect($people)
        ->take(20)
        ->map(fn (array $person): string => $person['name'] . ' · ' . $person['mode'])
        ->implode(', ');
@endphp

<div class="fi-collab-column">
    @if ($people === [])
        <span class="fi-collab-column-empty" aria-label="{{ __('filament-collaboration::collaboration.column.empty') }}">—</span>
    @else
        <span class="fi-collab-stack fi-collab-stack-sm" role="img" aria-label="{{ $names }}" title="{{ $names }}">
            @foreach ($visible as $person)
                <span
                    @class(['fi-collab-avatar', 'fi-collab-avatar-editing' => $person['editing']])
                    style="--fi-collab-color: {{ $person['color'] }}"
                    aria-hidden="true"
                >
                    @if ($person['avatar'])
                        <img src="{{ $person['avatar'] }}" alt="" />
                    @else
                        {{ $person['initials'] }}
                    @endif
                </span>
            @endforeach

            @if ($overflow > 0)
                <span class="fi-collab-avatar fi-collab-avatar-more" aria-hidden="true">+{{ $overflow }}</span>
            @endif
        </span>
    @endif
</div>
