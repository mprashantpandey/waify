<?php

use App\Modules\Contacts\Http\Controllers\ContactController;
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
});

