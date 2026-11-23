<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        x-load
        x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('demo-quill', 'demo/filament-quill') }}"
        x-data="demoQuill({ state: $wire.$entangle(@js($getStatePath())) })"
        id="{{ $getId() }}"
        class="demo-editor demo-quill"
    >
        <div x-ref="editor"></div>
    </div>
</x-dynamic-component>
