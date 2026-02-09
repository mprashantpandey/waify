<?php

use App\Modules\Chatbots\Http\Controllers\BotController;
use App\Modules\Chatbots\Http\Controllers\BotExecutionController;
use App\Modules\Chatbots\Http\Controllers\BotFlowController;
use App\Modules\Chatbots\Http\Controllers\BotEdgeController;
use App\Modules\Chatbots\Http\Controllers\BotNodeController;
use Illuminate\Support\Facades\Route;

// Note: These routes are loaded inside the app routes group, so they don't need their own prefix/middleware
// Routes are already under '/app' and have the 'app.' name prefix applied by the parent group.
Route::middleware(['module.entitled:automation.chatbots'])->group(function () {
    // Bots
    Route::get('/chatbots', [BotController::class, 'index'])->name('chatbots.index');
    Route::get('/chatbots/create', [BotController::class, 'create'])->name('chatbots.create');
    Route::post('/chatbots', [BotController::class, 'store'])->name('chatbots.store');
    Route::get('/chatbots/{bot}', [BotController::class, 'show'])->name('chatbots.show');
    Route::patch('/chatbots/{bot}', [BotController::class, 'update'])->name('chatbots.update');
    Route::delete('/chatbots/{bot}', [BotController::class, 'destroy'])->name('chatbots.destroy');

    // Flows
    Route::post('/chatbots/{bot}/flows', [BotFlowController::class, 'store'])->name('chatbots.flows.store');
    Route::patch('/chatbots/flows/{flow}', [BotFlowController::class, 'update'])->name('chatbots.flows.update');
    Route::delete('/chatbots/flows/{flow}', [BotFlowController::class, 'destroy'])->name('chatbots.flows.destroy');

    // Nodes
    Route::post('/chatbots/flows/{flow}/nodes', [BotNodeController::class, 'store'])->name('chatbots.nodes.store');
    Route::patch('/chatbots/nodes/{node}', [BotNodeController::class, 'update'])->name('chatbots.nodes.update');
    Route::delete('/chatbots/nodes/{node}', [BotNodeController::class, 'destroy'])->name('chatbots.nodes.destroy');

    // Edges
    Route::post('/chatbots/flows/{flow}/edges', [BotEdgeController::class, 'store'])->name('chatbots.edges.store');
    Route::patch('/chatbots/edges/{edge}', [BotEdgeController::class, 'update'])->name('chatbots.edges.update');
    Route::delete('/chatbots/edges/{edge}', [BotEdgeController::class, 'destroy'])->name('chatbots.edges.destroy');

    // Executions
    Route::get('/chatbots/executions', [BotExecutionController::class, 'index'])->name('chatbots.executions.index');
    Route::get('/chatbots/executions/{execution}', [BotExecutionController::class, 'show'])->name('chatbots.executions.show');
});
