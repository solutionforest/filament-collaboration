@php
    use Filament\Support\Facades\FilamentAsset;

    $documentId = $getDocumentId();
    $updatesUrl = $getUpdatesUrl();
    $isDisabled = $isDisabled();
    $statePath = $getStatePath();
    $label = $getLabel();
    $placeholder = $getPlaceholder() ?? 'Start writing together…';
    $id = $getId();
@endphp

<x-dynamic-component :component="$getFieldWrapperView()" :field="$field">
    <div
        wire:ignore
        data-collaborative-rich-editor
        data-field="{{ $statePath }}"
        @if (filled($documentId))
            data-document-id="{{ $documentId }}"
        @endif
        @if (filled($documentId))
            x-load
            x-load-src="{{ FilamentAsset::getAlpineComponentSrc('collaborative-rich-editor', 'solutionforest/filament-collaboration') }}"
            x-data="collaborativeRichEditorFormComponent({
                documentId: @js($documentId),
                updatesUrl: @js($updatesUrl),
                csrfToken: @js(csrf_token()),
                isDisabled: @js($isDisabled),
                label: @js(is_string($label) ? $label : null),
                placeholder: @js($placeholder),
                statePath: @js($statePath),
            })"
        @endif
        class="fi-fo-rich-editor fi-collaborative-rich-editor"
    >
        <div class="fi-collaborative-rich-editor-status mb-2 flex items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>
                @if (filled($documentId))
                    Live collaborative rich text (Filament field · Yjs)
                @else
                    Collaborative rich text unlocks after the record is created
                @endif
            </span>
            @if (filled($documentId))
                <span x-text="status" role="status" aria-live="polite"></span>
            @endif
        </div>

        @if (filled($documentId))
            <div class="fi-fo-rich-editor-main rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-950">
                <div
                    x-ref="editor"
                    id="{{ $id }}"
                    class="fi-fo-rich-editor-content fi-prose min-h-48 p-3"
                ></div>
            </div>
        @else
            <div class="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-white/20 dark:text-gray-400">
                Create and save the article first. The Filament collaborative rich editor will open on the edit page and sync as people type.
            </div>
        @endif
    </div>
</x-dynamic-component>
