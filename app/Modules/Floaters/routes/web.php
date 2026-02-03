<?php

use App\Modules\Floaters\Http\Controllers\WidgetController;
use Illuminate\Support\Facades\Route;

// Note: Loaded inside app routes group (/app)
Route::middleware(['module.entitled:floaters'])->group(function () {
    Route::get('/floaters', [WidgetController::class, 'index'])->name('floaters');
    Route::get('/floaters/create', [WidgetController::class, 'create'])->name('floaters.create');
    Route::post('/floaters', [WidgetController::class, 'store'])->name('floaters.store');
    Route::get('/floaters/{widget}/edit', [WidgetController::class, 'edit'])->name('floaters.edit');
    Route::put('/floaters/{widget}', [WidgetController::class, 'update'])->name('floaters.update');
    Route::post('/floaters/{widget}/toggle', [WidgetController::class, 'toggle'])->name('floaters.toggle');
    Route::delete('/floaters/{widget}', [WidgetController::class, 'destroy'])->name('floaters.destroy');
});
