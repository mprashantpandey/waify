<?php

use App\Modules\Broadcasts\Http\Controllers\CampaignController;
use Illuminate\Support\Facades\Route;

// Broadcasts/Campaigns routes - Protected by module entitlement
Route::middleware(['module.entitled:broadcasts'])->group(function () {
    Route::get('/broadcasts', [CampaignController::class, 'index'])->name('broadcasts.index');
    Route::get('/broadcasts/create', [CampaignController::class, 'create'])->name('broadcasts.create');
    Route::post('/broadcasts', [CampaignController::class, 'store'])->name('broadcasts.store');
    Route::get('/broadcasts/{campaign}', [CampaignController::class, 'show'])->name('broadcasts.show');
    Route::post('/broadcasts/{campaign}/start', [CampaignController::class, 'start'])->name('broadcasts.start');
    Route::post('/broadcasts/{campaign}/pause', [CampaignController::class, 'pause'])->name('broadcasts.pause');
    Route::post('/broadcasts/{campaign}/cancel', [CampaignController::class, 'cancel'])->name('broadcasts.cancel');
});

