<?php

use App\Modules\WhatsAppCalling\Http\Controllers\WhatsAppCallingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['module.entitled:whatsapp.calling'])
    ->prefix('/whatsapp-calls')
    ->name('whatsapp-calls.')
    ->group(function () {
        Route::get('/', [WhatsAppCallingController::class, 'index'])->name('index');
        Route::post('/settings', [WhatsAppCallingController::class, 'updateSettings'])->name('settings');
        Route::post('/connections/{connection}/check', [WhatsAppCallingController::class, 'checkConnection'])->name('connections.check');
        Route::post('/connections/{connection}/enable', [WhatsAppCallingController::class, 'enableConnection'])->name('connections.enable');
        Route::post('/connections/{connection}/subscribe-calls', [WhatsAppCallingController::class, 'subscribeCallsWebhook'])->name('connections.subscribe-calls');
        Route::post('/connections/{connection}/call-permission/check', [WhatsAppCallingController::class, 'checkCallPermission'])->name('connections.call-permission.check');
        Route::post('/connections/{connection}/call-permission/request', [WhatsAppCallingController::class, 'requestCallPermission'])->name('connections.call-permission.request');
        Route::post('/connections/{connection}/calls/start', [WhatsAppCallingController::class, 'startOutboundCall'])->name('connections.calls.start');
        Route::get('/calls/{call}', [WhatsAppCallingController::class, 'showCall'])->name('calls.show');
        Route::post('/calls/{call}/accept', [WhatsAppCallingController::class, 'acceptInboundCall'])->name('calls.accept');
        Route::post('/calls/{call}/reject', [WhatsAppCallingController::class, 'rejectCall'])->name('calls.reject');
        Route::post('/calls/{call}/terminate', [WhatsAppCallingController::class, 'terminateCall'])->name('calls.terminate');
        Route::post('/consents', [WhatsAppCallingController::class, 'storeConsent'])->name('consents.store');
    });
