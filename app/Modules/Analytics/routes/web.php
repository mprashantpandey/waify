<?php

use App\Modules\Analytics\Http\Controllers\AnalyticsController;
use Illuminate\Support\Facades\Route;

// Analytics routes - Protected by module entitlement
Route::middleware(['module.entitled:analytics', 'feature.enabled:analytics'])->group(function () {
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
});
