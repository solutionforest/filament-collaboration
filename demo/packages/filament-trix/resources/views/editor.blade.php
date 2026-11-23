<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        x-load
        x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('demo-trix', 'demo/filament-trix') }}"
        x-data="demoTrix({ state: $wire.$entangle(@js($getStatePath())) })"
        id="{{ $getId() }}"
        class="demo-editor demo-trix"
    >
        <div x-ref="editor"></div>
    </div>
</x-dynamic-component>
