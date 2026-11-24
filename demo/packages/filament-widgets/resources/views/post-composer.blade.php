<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        x-load
        x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('demo-widgets', 'demo/filament-widgets') }}"
        x-data="demoWidget({ type: 'composer', state: $wire.$entangle(@js($getStatePath())), limit: @js($getCharacterLimit()) })"
        id="{{ $getId() }}"
        class="demo-widget demo-composer"
    >
        <textarea x-model="state" rows="3" class="demo-composer-input" placeholder="What's happening?"></textarea>
        <div class="demo-composer-footer">
            <span x-text="remaining" x-bind:class="{ 'demo-composer-over': remaining < 0 }"></span>
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" /><circle cx="10" cy="10" r="8" x-bind:style="ring" /></svg>
        </div>
    </div>
</x-dynamic-component>
