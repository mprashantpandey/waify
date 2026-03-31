<?php

use App\Modules\Developer\Http\Controllers\DeveloperController;
use App\Modules\Developer\Http\Controllers\InboundAutomationWebhookController;
use App\Modules\Developer\Http\Controllers\GoogleSheetsIntegrationController;

Route::middleware(['module.entitled:developer'])->prefix('developer')->name('developer.')->group(function () {
    Route::get('/', [DeveloperController::class, 'index'])->name('index');
    Route::get('/docs', [DeveloperController::class, 'docs'])->name('docs');
    Route::post('/api-keys', [DeveloperController::class, 'store'])->name('api-keys.store');
    Route::patch('/api-keys/{id}', [DeveloperController::class, 'update'])->name('api-keys.update');
    Route::delete('/api-keys/{id}', [DeveloperController::class, 'destroy'])->name('api-keys.destroy');
    Route::post('/webhooks', [DeveloperController::class, 'storeWebhookEndpoint'])->name('webhooks.store');
    Route::patch('/webhooks/{id}', [DeveloperController::class, 'updateWebhookEndpoint'])->name('webhooks.update');
    Route::delete('/webhooks/{id}', [DeveloperController::class, 'destroyWebhookEndpoint'])->name('webhooks.destroy');
    Route::post('/webhooks/{id}/test', [DeveloperController::class, 'testWebhookEndpoint'])->name('webhooks.test');
    Route::post('/webhook-deliveries/{id}/replay', [DeveloperController::class, 'replayWebhookDelivery'])->name('webhook-deliveries.replay');
    Route::post('/inbound-webhooks', [InboundAutomationWebhookController::class, 'store'])->name('inbound-webhooks.store');
    Route::patch('/inbound-webhooks/{id}', [InboundAutomationWebhookController::class, 'update'])->name('inbound-webhooks.update');
    Route::delete('/inbound-webhooks/{id}', [InboundAutomationWebhookController::class, 'destroy'])->name('inbound-webhooks.destroy');
    Route::post('/google-sheets', [GoogleSheetsIntegrationController::class, 'store'])->name('google-sheets.store');
    Route::patch('/google-sheets/{id}', [GoogleSheetsIntegrationController::class, 'update'])->name('google-sheets.update');
    Route::delete('/google-sheets/{id}', [GoogleSheetsIntegrationController::class, 'destroy'])->name('google-sheets.destroy');
    Route::post('/google-sheets/{id}/test', [GoogleSheetsIntegrationController::class, 'test'])->name('google-sheets.test');
});
