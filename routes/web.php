<?php

use App\Http\Controllers\CollaborationController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin');
Route::middleware('auth')->prefix('collaboration')->group(function (): void {
    Route::post('/presence', [CollaborationController::class, 'heartbeat']);
    Route::get('/documents/{document}/updates', [CollaborationController::class, 'updates']);
    Route::post('/documents/{document}/updates', [CollaborationController::class, 'append']);
});
