<?php

use App\Modules\Support\Http\Controllers\SupportController;
use Illuminate\Support\Facades\Route;

// Support (tenant)
Route::get('/support/hub', [SupportController::class, 'hub'])->name('support.hub');
Route::get('/support', [SupportController::class, 'index'])->name('support.index');
Route::post('/support', [SupportController::class, 'store'])->middleware('throttle:60,1')->name('support.store');
Route::get('/support/live', [SupportController::class, 'live'])->name('support.live');
Route::post('/support/live/message', [SupportController::class, 'liveMessage'])->middleware('throttle:60,1')->name('support.live.message');
Route::post('/support/live/request-human', [SupportController::class, 'liveRequestHuman'])->middleware('throttle:20,1')->name('support.live.request-human');
Route::post('/support/live/close', [SupportController::class, 'liveClose'])->middleware('throttle:20,1')->name('support.live.close');
Route::get('/support/{thread}', [SupportController::class, 'show'])->name('support.show');
Route::post('/support/{thread}/messages', [SupportController::class, 'message'])->middleware('throttle:60,1')->name('support.message');
Route::post('/support/{thread}/close', [SupportController::class, 'close'])->middleware('throttle:20,1')->name('support.close');
Route::post('/support/{thread}/reopen', [SupportController::class, 'reopen'])->middleware('throttle:20,1')->name('support.reopen');
