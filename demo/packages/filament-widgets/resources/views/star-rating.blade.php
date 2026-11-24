<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        x-load
        x-load-src="{{ \Filament\Support\Facades\FilamentAsset::getAlpineComponentSrc('demo-widgets', 'demo/filament-widgets') }}"
        x-data="demoWidget({ type: 'rating', state: $wire.$entangle(@js($getStatePath())), stars: @js($getStars()) })"
        id="{{ $getId() }}"
        class="demo-widget demo-rating"
        role="radiogroup"
    >
        <template x-for="star in stars" x-bind:key="star">
            <button
                type="button"
                role="radio"
                x-bind:aria-checked="String(state === star)"
                x-bind:aria-label="star + ' / ' + stars"
                x-bind:class="{ 'demo-rating-on': star <= (hover ?? state ?? 0) }"
                x-on:click="state = state === star ? null : star"
                x-on:mouseenter="hover = star"
                x-on:mouseleave="hover = null"
            >★</button>
        </template>
    </div>
</x-dynamic-component>
