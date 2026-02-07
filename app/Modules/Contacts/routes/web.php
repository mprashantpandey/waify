<?php

use App\Modules\Contacts\Http\Controllers\ContactController;
use App\Modules\Contacts\Http\Controllers\TagController;
use App\Modules\Contacts\Http\Controllers\SegmentController;
use Illuminate\Support\Facades\Route;

// Contacts routes - Protected by module entitlement
Route::middleware(['module.entitled:contacts'])->group(function () {
    Route::get('/contacts', [ContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/create', [ContactController::class, 'create'])->name('contacts.create');
    Route::post('/contacts', [ContactController::class, 'store'])->name('contacts.store');
    Route::get('/contacts/{contact}', [ContactController::class, 'show'])->name('contacts.show');
    Route::put('/contacts/{contact}', [ContactController::class, 'update'])->name('contacts.update');
    Route::post('/contacts/{contact}/note', [ContactController::class, 'addNote'])->name('contacts.add-note');
    Route::post('/contacts/import', [ContactController::class, 'import'])->name('contacts.import');
    Route::get('/contacts/export', [ContactController::class, 'export'])->name('contacts.export');
    Route::post('/contacts/{contact}/merge', [ContactController::class, 'merge'])->name('contacts.merge');

    // Tags (CRM)
    Route::get('/contacts/tags', [TagController::class, 'index'])->name('contacts.tags.index');
    Route::post('/contacts/tags', [TagController::class, 'store'])->name('contacts.tags.store');
    Route::put('/contacts/tags/{tag}', [TagController::class, 'update'])->name('contacts.tags.update');
    Route::delete('/contacts/tags/{tag}', [TagController::class, 'destroy'])->name('contacts.tags.destroy');

    // Segments (CRM)
    Route::get('/contacts/segments', [SegmentController::class, 'index'])->name('contacts.segments.index');
    Route::get('/contacts/segments/create', [SegmentController::class, 'create'])->name('contacts.segments.create');
    Route::post('/contacts/segments', [SegmentController::class, 'store'])->name('contacts.segments.store');
    Route::get('/contacts/segments/{segment}', [SegmentController::class, 'show'])->name('contacts.segments.show');
    Route::get('/contacts/segments/{segment}/edit', [SegmentController::class, 'edit'])->name('contacts.segments.edit');
    Route::put('/contacts/segments/{segment}', [SegmentController::class, 'update'])->name('contacts.segments.update');
    Route::delete('/contacts/segments/{segment}', [SegmentController::class, 'destroy'])->name('contacts.segments.destroy');
    Route::post('/contacts/segments/{segment}/recalculate', [SegmentController::class, 'recalculate'])->name('contacts.segments.recalculate');
});

