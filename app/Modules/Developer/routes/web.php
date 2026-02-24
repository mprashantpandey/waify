<?php

use App\Modules\Developer\Http\Controllers\DeveloperController;

Route::middleware(['module.entitled:developer'])->prefix('developer')->name('developer.')->group(function () {
    Route::get('/', [DeveloperController::class, 'index'])->name('index');
    Route::get('/docs', [DeveloperController::class, 'docs'])->name('docs');
    Route::post('/api-keys', [DeveloperController::class, 'store'])->name('api-keys.store');
    Route::patch('/api-keys/{id}', [DeveloperController::class, 'update'])->name('api-keys.update');
    Route::delete('/api-keys/{id}', [DeveloperController::class, 'destroy'])->name('api-keys.destroy');
});
