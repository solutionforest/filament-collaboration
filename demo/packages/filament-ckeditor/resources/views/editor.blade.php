<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        x-load
        x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('demo-ckeditor', 'demo/filament-ckeditor') }}"
        x-data="demoCkEditor({ state: $wire.$entangle(@js($getStatePath())) })"
        id="{{ $getId() }}"
        class="demo-editor demo-ckeditor"
    >
        <div x-ref="editor"></div>
    </div>
</x-dynamic-component>
