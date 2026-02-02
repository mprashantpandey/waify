<?php

use App\Modules\WhatsApp\Http\Controllers\ConnectionController;
use App\Modules\WhatsApp\Http\Controllers\ConnectionHealthController;
use App\Modules\WhatsApp\Http\Controllers\ConversationController;
use App\Modules\WhatsApp\Http\Controllers\TemplateController;
use App\Modules\WhatsApp\Http\Controllers\TemplateSendController;
use App\Modules\WhatsApp\Http\Controllers\TemplateSyncController;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Support\Facades\Route;

// Note: These routes are loaded inside the app routes group, so they don't need their own prefix/middleware
// Routes are prefixed with 'app.whatsapp.' and are already under '/app/{workspace}'

// Note: Connection model binding is handled in the controllers via resolveConnection() method
// This avoids issues with route binding running before middleware

// WhatsApp Cloud API routes - Protected by module entitlement
Route::middleware(['module.entitled:whatsapp.cloud'])->group(function () {
    // Connections
    Route::get('/connections', [ConnectionController::class, 'index'])->name('whatsapp.connections.index');
    Route::get('/connections/create', [ConnectionController::class, 'create'])->name('whatsapp.connections.create');
    Route::get('/connections/wizard', [ConnectionController::class, 'wizard'])->name('whatsapp.connections.wizard');
    Route::post('/connections', [ConnectionController::class, 'store'])->name('whatsapp.connections.store');
    Route::post('/connections/test', [ConnectionController::class, 'testConnection'])->name('whatsapp.connections.test');
    Route::post('/connections/{connection}/test', [ConnectionController::class, 'testSavedConnection'])->name('whatsapp.connections.test-saved');
    Route::post('/connections/embedded', [ConnectionController::class, 'storeEmbedded'])->name('whatsapp.connections.store-embedded');
    Route::get('/connections/{connection}/edit', [ConnectionController::class, 'edit'])->name('whatsapp.connections.edit');
    Route::get('/connections/{connection}/health', [ConnectionController::class, 'showHealth'])->name('whatsapp.connections.health');
    Route::get('/connections/{connection}/health/api', [ConnectionHealthController::class, 'check'])->name('whatsapp.connections.health.api');
    Route::get('/connections/{connection}/health/quick', [ConnectionHealthController::class, 'quickCheck'])->name('whatsapp.connections.health.quick');
    Route::put('/connections/{connection}', [ConnectionController::class, 'update'])->name('whatsapp.connections.update');
    Route::post('/connections/{connection}/rotate-verify-token', [ConnectionController::class, 'rotateVerifyToken'])->name('whatsapp.connections.rotate-verify-token');
    Route::post('/connections/{connection}/webhook/test', [ConnectionController::class, 'testWebhook'])->name('whatsapp.connections.webhook.test');

    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index'])->name('whatsapp.conversations.index');
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->name('whatsapp.conversations.show');
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'loadMoreMessages'])->name('whatsapp.conversations.messages');
    Route::post('/conversations/{conversation}/send', [ConversationController::class, 'sendMessage'])->name('whatsapp.conversations.send');
    Route::post('/conversations/{conversation}/send-template', [ConversationController::class, 'sendTemplateMessage'])->name('whatsapp.conversations.send-template');
    Route::post('/conversations/{conversation}/send-media', [ConversationController::class, 'sendMediaMessage'])->name('whatsapp.conversations.send-media');
    Route::post('/conversations/{conversation}/send-location', [ConversationController::class, 'sendLocationMessage'])->name('whatsapp.conversations.send-location');

    // Inbox stream endpoints (fallback polling)
    Route::get('/inbox/stream', [\App\Modules\WhatsApp\Http\Controllers\InboxStreamController::class, 'stream'])->name('whatsapp.inbox.stream');
    Route::get('/inbox/{conversation}/stream', [\App\Modules\WhatsApp\Http\Controllers\InboxStreamController::class, 'conversationStream'])->name('whatsapp.inbox.conversation.stream');
});

// Templates (requires templates module entitlement)
Route::middleware(['module.entitled:templates'])->group(function () {
    Route::get('/templates', [TemplateController::class, 'index'])->name('whatsapp.templates.index');
    Route::get('/templates/create', [TemplateController::class, 'create'])->name('whatsapp.templates.create');
    Route::post('/templates', [TemplateController::class, 'store'])->name('whatsapp.templates.store');
    Route::get('/templates/{template}', [TemplateController::class, 'show'])->name('whatsapp.templates.show');
    Route::get('/templates/{template}/edit', [TemplateController::class, 'edit'])->name('whatsapp.templates.edit');
    Route::put('/templates/{template}', [TemplateController::class, 'update'])->name('whatsapp.templates.update');
    Route::post('/templates/{template}/check-status', [TemplateController::class, 'checkStatus'])->name('whatsapp.templates.check-status');
    Route::post('/templates/sync', [TemplateSyncController::class, 'store'])->name('whatsapp.templates.sync');
    Route::post('/templates/{template}/archive', [TemplateController::class, 'archive'])->name('whatsapp.templates.archive');
    Route::post('/templates/{template}/restore', [TemplateController::class, 'restore'])->name('whatsapp.templates.restore');
    Route::delete('/templates/{template}', [TemplateController::class, 'destroy'])->name('whatsapp.templates.destroy');
    Route::get('/templates/{template}/send', [TemplateSendController::class, 'create'])->name('whatsapp.templates.send');
    Route::post('/templates/{template}/send', [TemplateSendController::class, 'store'])->name('whatsapp.templates.send.store');
    Route::post('/templates/upload-media', [TemplateController::class, 'uploadMedia'])->name('whatsapp.templates.upload-media');
});
