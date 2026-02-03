<?php

use App\Modules\Chatbots\Http\Controllers\BotController;
use App\Modules\Chatbots\Http\Controllers\BotExecutionController;
use App\Modules\Chatbots\Http\Controllers\BotFlowController;
use Illuminate\Support\Facades\Route;

// App routes (requires auth + account + module entitlement)
Route::middleware(['auth', 'account.resolve', 'module.entitled:automation.chatbots'])
    ->prefix('/app')
    ->name('app.chatbots.')
    ->group(function () {
        // Bots
        Route::get('/chatbots', [BotController::class, 'index'])->name('index');
        Route::get('/chatbots/create', [BotController::class, 'create'])->name('create');
        Route::post('/chatbots', [BotController::class, 'store'])->name('store');
        Route::get('/chatbots/{bot}', [BotController::class, 'show'])->name('show');
        Route::patch('/chatbots/{bot}', [BotController::class, 'update'])->name('update');
        Route::delete('/chatbots/{bot}', [BotController::class, 'destroy'])->name('destroy');

        // Flows
        Route::post('/chatbots/{bot}/flows', [BotFlowController::class, 'store'])->name('flows.store');
        Route::patch('/chatbots/flows/{flow}', [BotFlowController::class, 'update'])->name('flows.update');
        Route::delete('/chatbots/flows/{flow}', [BotFlowController::class, 'destroy'])->name('flows.destroy');

        // Executions
        Route::get('/chatbots/executions', [BotExecutionController::class, 'index'])->name('executions.index');
        Route::get('/chatbots/executions/{execution}', [BotExecutionController::class, 'show'])->name('executions.show');
    });
