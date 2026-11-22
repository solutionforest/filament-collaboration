<?php

use App\Models\Document;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/blog');

Route::get('/blog', function () {
    $posts = Document::query()
        ->published()
        ->with('author')
        ->orderByDesc('published_at')
        ->get();

    return view('blog.index', ['posts' => $posts]);
})->name('blog.index');

Route::get('/blog/{slug}', function (string $slug) {
    $post = Document::query()
        ->published()
        ->where('slug', $slug)
        ->with(['author', 'relatedPosts' => fn ($query) => $query->published()])
        ->firstOrFail();

    return view('blog.show', ['post' => $post]);
})->name('blog.show');

Route::middleware('auth')->get('/preview/articles/{document}', function (Document $document) {
    Gate::authorize('view', $document);

    return view('articles.preview', ['document' => $document]);
})->name('articles.preview');
