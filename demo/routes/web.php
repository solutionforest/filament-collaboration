<?php

use App\Http\Controllers\BlogController;
use App\Models\Document;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

// The public blog. Everything on it is edited in the CMS at /admin.
Route::controller(BlogController::class)->group(function (): void {
    Route::get('/', 'home')->name('home');
    Route::get('/blog', 'index')->name('blog.index');
    Route::get('/blog/{slug}', 'show')->name('blog.show');
    Route::get('/category/{slug}', 'category')->name('blog.category');
    Route::get('/tag/{slug}', 'tag')->name('blog.tag');
    Route::get('/author/{slug}', 'author')->name('blog.author');
    Route::get('/feed.xml', 'feed')->name('feed');
    Route::get('/sitemap.xml', 'sitemap')->name('sitemap');
});

Route::middleware('auth')->get('/preview/articles/{document}', function (Document $document) {
    Gate::authorize('view', $document);

    return view('articles.preview', ['document' => $document]);
})->name('articles.preview');

// Static pages edited in the CMS: /about, /contact, /privacy, /terms. Last, so they never hide another route.
Route::get('/{slug}', [BlogController::class, 'page'])
    ->where('slug', '(?!admin|livewire|storage|filament|up$)[a-z0-9-]+')
    ->name('page');
