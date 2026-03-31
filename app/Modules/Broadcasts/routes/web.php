<?php

use App\Modules\Broadcasts\Http\Controllers\CampaignController;
use App\Modules\Broadcasts\Http\Controllers\SequenceController;
use Illuminate\Support\Facades\Route;

// Broadcasts/Campaigns routes - Protected by module entitlement
Route::middleware(['module.entitled:broadcasts'])->group(function () {
    Route::get('/broadcasts', [CampaignController::class, 'index'])->name('broadcasts.index');
    Route::get('/broadcasts/create', [CampaignController::class, 'create'])->name('broadcasts.create');
    Route::post('/broadcasts', [CampaignController::class, 'store'])->name('broadcasts.store');
    Route::get('/broadcasts/{campaign}', [CampaignController::class, 'show'])->name('broadcasts.show');
    Route::post('/broadcasts/{campaign}/duplicate', [CampaignController::class, 'duplicate'])->name('broadcasts.duplicate');
    Route::post('/broadcasts/{campaign}/retry-failed', [CampaignController::class, 'retryFailed'])->name('broadcasts.retry-failed');
    Route::post('/broadcasts/{campaign}/send-test', [CampaignController::class, 'sendTest'])->name('broadcasts.send-test');
    Route::post('/broadcasts/{campaign}/start', [CampaignController::class, 'start'])->name('broadcasts.start');
    Route::post('/broadcasts/{campaign}/pause', [CampaignController::class, 'pause'])->name('broadcasts.pause');
    Route::post('/broadcasts/{campaign}/cancel', [CampaignController::class, 'cancel'])->name('broadcasts.cancel');
    Route::delete('/broadcasts/{campaign}', [CampaignController::class, 'destroy'])->name('broadcasts.destroy');

    Route::get('/sequences', [SequenceController::class, 'index'])->name('broadcasts.sequences.index');
    Route::get('/sequences/create', [SequenceController::class, 'create'])->name('broadcasts.sequences.create');
    Route::post('/sequences', [SequenceController::class, 'store'])->name('broadcasts.sequences.store');
    Route::get('/sequences/{sequence}', [SequenceController::class, 'show'])->name('broadcasts.sequences.show');
    Route::post('/sequences/{sequence}/activate', [SequenceController::class, 'activate'])->name('broadcasts.sequences.activate');
    Route::post('/sequences/{sequence}/pause', [SequenceController::class, 'pause'])->name('broadcasts.sequences.pause');
});
