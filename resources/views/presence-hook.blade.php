<div wire:ignore>
    @livewire('filament-collaboration-presence', [
        'room' => $room,
        'mode' => $mode,
        'origin' => $origin,
        'version' => $version,
    ], key('filament-collaboration-presence-'.$origin))
</div>
