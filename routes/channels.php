<?php

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Support\WebhookLogSanitizer;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

$broadcastAuthDebug = static function (string $message, array $context = []): void {
    if (!config('broadcasting.auth_debug', false)) {
        return;
    }

    Log::debug($message, $context);
};

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/*
|--------------------------------------------------------------------------
| WhatsApp Inbox Channels
|--------------------------------------------------------------------------
|
| Private channels for account-scoped WhatsApp inbox realtime updates.
|
*/

Broadcast::channel('account.{accountId}.whatsapp.inbox', function ($user, $accountId) use ($broadcastAuthDebug) {
    $account = \App\Models\Account::find($accountId);

    if (!$account) {
        $broadcastAuthDebug('Broadcast channel auth denied', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.inbox", [
            'scope' => 'whatsapp_inbox',
            'reason' => 'account_missing',
            'account_id' => (int) $accountId,
        ]));

        return false;
    }

    $isOwner = $account->owner_id && (int) $account->owner_id === (int) $user->id;
    $isMember = $account->users()->where('user_id', $user->id)->exists();

    if (!$isOwner && !$isMember) {
        $broadcastAuthDebug('Broadcast channel auth denied', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.inbox", [
            'scope' => 'whatsapp_inbox',
            'reason' => 'membership_missing',
            'account_id' => (int) $accountId,
        ]));

        return false;
    }

    $broadcastAuthDebug('Broadcast channel auth granted', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.inbox", [
        'scope' => 'whatsapp_inbox',
        'account_id' => (int) $accountId,
        'access' => $isOwner ? 'owner' : 'member',
    ]));

    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

Broadcast::channel('account.{accountId}.whatsapp.conversation.{conversationId}', function ($user, $accountId, $conversationId) use ($broadcastAuthDebug) {
    $account = \App\Models\Account::find($accountId);

    if (!$account) {
        $broadcastAuthDebug('Broadcast channel auth denied', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.conversation.{$conversationId}", [
            'scope' => 'whatsapp_conversation',
            'reason' => 'account_missing',
            'account_id' => (int) $accountId,
            'conversation_id' => (int) $conversationId,
        ]));

        return false;
    }

    $isOwner = $account->owner_id && (int) $account->owner_id === (int) $user->id;
    $isMember = $account->users()->where('user_id', $user->id)->exists();

    if (!$isOwner && !$isMember) {
        $broadcastAuthDebug('Broadcast channel auth denied', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.conversation.{$conversationId}", [
            'scope' => 'whatsapp_conversation',
            'reason' => 'membership_missing',
            'account_id' => (int) $accountId,
            'conversation_id' => (int) $conversationId,
        ]));

        return false;
    }

    $conversation = WhatsAppConversation::find($conversationId);

    if (!$conversation || !account_ids_match($conversation->account_id, $accountId)) {
        $broadcastAuthDebug('Broadcast channel auth denied', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.conversation.{$conversationId}", [
            'scope' => 'whatsapp_conversation',
            'reason' => 'conversation_mismatch',
            'account_id' => (int) $accountId,
            'conversation_id' => (int) $conversationId,
        ]));

        return false;
    }

    $broadcastAuthDebug('Broadcast channel auth granted', WebhookLogSanitizer::authChannelContext($user->id, "account.{$accountId}.whatsapp.conversation.{$conversationId}", [
        'scope' => 'whatsapp_conversation',
        'account_id' => (int) $accountId,
        'conversation_id' => (int) $conversationId,
        'access' => $isOwner ? 'owner' : 'member',
    ]));

    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

Broadcast::channel('account.{accountId}.whatsapp.templates', function ($user, $accountId) {
    $account = \App\Models\Account::find($accountId);

    if (!$account) {
        return false;
    }

    $isOwner = $account->owner_id && (int) $account->owner_id === (int) $user->id;
    $membership = $account->users()->where('user_id', $user->id)->exists();

    if (!$isOwner && !$membership) {
        return false;
    }

    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});
