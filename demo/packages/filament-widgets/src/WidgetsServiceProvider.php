<?php

declare(strict_types=1);

namespace Demo\Widgets;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Assets\Css;
use Filament\Support\Facades\FilamentAsset;
use Illuminate\Support\ServiceProvider;
use SolutionForest\FilamentCollaboration\CollaborationPlugin;
use SolutionForest\FilamentCollaboration\Enums\FieldKind;
use SolutionForest\FilamentCollaboration\Fields\Types\AdapterType;

class WidgetsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'demo-widgets');

        FilamentAsset::register([
            AlpineComponent::make('demo-widgets', __DIR__.'/../resources/dist/editor.js'),
            Css::make('demo-widgets', __DIR__.'/../resources/dist/editor.css'),
        ], 'demo/filament-widgets');

        // Each field, the JavaScript adapter that reads and writes it, and what its state is.
        // Only when the collaboration package is installed: without it the fields work as usual.
        if (class_exists(CollaborationPlugin::class)) {
            CollaborationPlugin::registerFieldTypes(
                AdapterType::make([PostComposer::class], adapter: 'demo-post-composer', kind: FieldKind::Text),
                AdapterType::make([StarRating::class], adapter: 'demo-star-rating', kind: FieldKind::Value),
            );
        }
    }
}
