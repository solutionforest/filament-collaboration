<?php

declare(strict_types=1);

namespace Demo\Trix;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\ServiceProvider;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\AdapterType;

class TrixServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'demo-trix');

        FilamentAsset::register([
            AlpineComponent::make('demo-trix', __DIR__.'/../resources/dist/editor.js'),
            Css::make('demo-trix', __DIR__.'/../resources/dist/editor.css'),
        ], 'demo/filament-trix');

        // All a package needs to be live: which field, which JavaScript adapter, and that it holds HTML.
        if (class_exists(CollaborationPlugin::class)) {
            CollaborationPlugin::registerFieldTypes(AdapterType::make([TrixEditor::class], adapter: 'demo-trix', kind: FieldKind::RichText));
        }
    }
}
