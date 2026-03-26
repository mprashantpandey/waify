<?php

use App\Modules\Ecommerce\Http\Controllers\EcommerceController;
use App\Modules\Ecommerce\Http\Controllers\ProductController;
use App\Modules\Ecommerce\Http\Controllers\OrderController;
use Illuminate\Support\Facades\Route;

Route::middleware(['module.entitled:ecommerce'])->group(function () {
    Route::get('/commerce', [EcommerceController::class, 'index'])->name('ecommerce.index');

    Route::get('/commerce/products', [ProductController::class, 'index'])->name('ecommerce.products.index');
    Route::get('/commerce/products/create', [ProductController::class, 'create'])->name('ecommerce.products.create');
    Route::post('/commerce/products', [ProductController::class, 'store'])->name('ecommerce.products.store');

    Route::get('/commerce/orders', [OrderController::class, 'index'])->name('ecommerce.orders.index');
});

