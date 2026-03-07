<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\DashboardController;
use App\Http\Controllers\Api\Mobile\InboxController;

// Mobile App Authentication Routes
Route::prefix('mobile')->group(function () {
    Route::post('/login', [AuthController::class , 'login']);

    // Protected Mobile Routes
    Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class , 'logout']);
            Route::get('/user', [AuthController::class , 'user']);

            // Dashboard
            Route::get('/dashboard', [DashboardController::class , 'index']);

            // Inbox & Messages
            Route::get('/conversations', [InboxController::class , 'index']);
            Route::get('/conversations/{id}', [InboxController::class , 'show']);
            Route::post('/conversations/{id}/messages', [InboxController::class , 'sendMessage']);
            Route::post('/conversations/{id}/read', [InboxController::class , 'markAsRead']);
        }
        );
    });