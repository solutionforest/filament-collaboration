<?php

use App\Http\Controllers\CollaborationController;
use App\Models\Document;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin');
Route::middleware('auth')->prefix('collaboration')->group(function (): void {
    Route::post('/presence', [CollaborationController::class, 'heartbeat']);
    Route::get('/documents/{document}/updates', [CollaborationController::class, 'updates']);
    Route::post('/documents/{document}/updates', [CollaborationController::class, 'append']);
});

Route::middleware('auth')->get('/preview/articles/{document}', function (Document $document) {
    Gate::authorize('view', $document);

    return view('articles.preview', ['document' => $document]);
})->name('articles.preview');
