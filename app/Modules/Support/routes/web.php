<?php

use App\Modules\Support\Http\Controllers\SupportController;
use Illuminate\Support\Facades\Route;

// Support (tenant)
Route::get('/support', [SupportController::class, 'index'])->name('support.index');
Route::post('/support', [SupportController::class, 'store'])->middleware('throttle:60,1')->name('support.store');
Route::post('/support/{thread}/assistant', [SupportController::class, 'assistant'])->middleware('throttle:30,1')->name('support.assistant');
Route::get('/support/{thread}', [SupportController::class, 'show'])->name('support.show');
Route::post('/support/{thread}/messages', [SupportController::class, 'message'])->middleware('throttle:60,1')->name('support.message');
Route::post('/support/{thread}/close', [SupportController::class, 'close'])->middleware('throttle:20,1')->name('support.close');
Route::post('/support/{thread}/reopen', [SupportController::class, 'reopen'])->middleware('throttle:20,1')->name('support.reopen');
