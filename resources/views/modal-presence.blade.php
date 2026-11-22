@if (count($people))
    <div class="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <span class="font-medium">{{ __('filament-collaboration::collaboration.presence.others') }}:</span>
        @foreach ($people as $person)
            <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                {{ $person['name'] }}
                <span class="text-gray-400">({{ $person['mode'] }})</span>
            </span>
        @endforeach
    </div>
@endif
