<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        x-load
        x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('demo-tinymce', 'demo/filament-tinymce') }}"
        x-data="demoTinyMce({ state: $wire.$entangle(@js($getStatePath())) })"
        id="{{ $getId() }}"
        class="demo-editor demo-tinymce"
    >
        <textarea x-ref="editor"></textarea>
    </div>
</x-dynamic-component>
