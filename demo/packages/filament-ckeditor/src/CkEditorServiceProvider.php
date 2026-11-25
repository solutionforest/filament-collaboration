<?php

declare(strict_types=1);

namespace Demo\CkEditor;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\ServiceProvider;
use SolutionForest\Collaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Fields\Types\AdapterType;

class CkEditorServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'demo-ckeditor');

        FilamentAsset::register([
            AlpineComponent::make('demo-ckeditor', __DIR__.'/../resources/dist/editor.js'),
            Css::make('demo-ckeditor', __DIR__.'/../resources/dist/editor.css'),
        ], 'demo/filament-ckeditor');

        // All a package needs to be live: which field, which JavaScript adapter, and that it holds HTML.
        if (class_exists(CollaborationPlugin::class)) {
            CollaborationPlugin::registerFieldTypes(AdapterType::make([CkEditor::class], adapter: 'demo-ckeditor', kind: FieldKind::RichText));
        }
    }
}
