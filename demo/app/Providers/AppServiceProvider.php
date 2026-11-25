<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\Page;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // The blog's navigation, on every public page: its sections and its static pages.
        View::composer(['site.layout', 'errors::404'], function (\Illuminate\View\View $view): void {
            $view->with([
                'siteCategories' => rescue(fn () => Category::query()->orderBy('position')->get(), collect(), report: false),
                'sitePages' => rescue(fn () => Page::query()->orderBy('id')->get(), collect(), report: false),
            ]);
        });
    }
}
