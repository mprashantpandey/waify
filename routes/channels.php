<?php

use Illuminate\Support\Facades\Broadcast;

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

// Account inbox channel - for conversation list updates
Broadcast::channel('account.{accountId}.whatsapp.inbox', function ($user, $accountId) {
    $account = \App\Models\Account::find($accountId);
    
    if (!$account) {
        \Log::debug('WhatsApp inbox channel auth denied: account not found', ['user_id' => $user->id, 'account_id' => $accountId]);
        return false;
    }
    
    // Owner always has access; otherwise check account_users pivot
    $isOwner = $account->owner_id && (int) $account->owner_id === (int) $user->id;
    $membership = $account->users()->where('user_id', $user->id)->first();
    
    if (!$isOwner && !$membership) {
        \Log::debug('WhatsApp inbox channel auth denied: not owner or member', ['user_id' => $user->id, 'account_id' => $accountId]);
        return false;
    }
    
    \Log::debug('WhatsApp inbox channel auth granted', ['user_id' => $user->id, 'account_id' => $accountId, 'via' => $isOwner ? 'owner' : 'member']);
    // Return minimal user data for presence if needed
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

// Conversation thread channel - for message updates within a conversation
Broadcast::channel('account.{accountId}.whatsapp.conversation.{conversationId}', function ($user, $accountId, $conversationId) {
    $account = \App\Models\Account::find($accountId);
    
    if (!$account) {
        \Log::debug('WhatsApp conversation channel auth denied: account not found', ['user_id' => $user->id, 'account_id' => $accountId]);
        return false;
    }
    
    // Owner always has access; otherwise check account_users pivot
    $isOwner = $account->owner_id && (int) $account->owner_id === (int) $user->id;
    $membership = $account->users()->where('user_id', $user->id)->first();
    
    if (!$isOwner && !$membership) {
        \Log::debug('WhatsApp conversation channel auth denied: not owner or member', ['user_id' => $user->id, 'account_id' => $accountId]);
        return false;
    }
    
    // Verify conversation belongs to this account
    $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::find($conversationId);
    
    if (!$conversation || !account_ids_match($conversation->account_id, $accountId)) {
        \Log::debug('WhatsApp conversation channel auth denied: conversation not found or wrong account', ['user_id' => $user->id, 'account_id' => $accountId, 'conversation_id' => $conversationId]);
        return false;
    }
    
    \Log::debug('WhatsApp conversation channel auth granted', ['user_id' => $user->id, 'account_id' => $accountId, 'conversation_id' => $conversationId, 'via' => $isOwner ? 'owner' : 'member']);
    // Return minimal user data
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

/*
|--------------------------------------------------------------------------
| Support Channels
|--------------------------------------------------------------------------
*/

Broadcast::channel('account.{accountId}.support.thread.{threadId}', function ($user, $accountId, $threadId) {
    \Log::debug('Support channel auth attempt', [
        'user_id' => $user?->id,
        'user_email' => $user?->email,
        'account_id' => $accountId,
        'thread_id' => $threadId,
        'has_user' => $user !== null,
        'is_platform_admin' => $user?->isPlatformAdmin() ?? false,
    ]);

    if (!$user) {
        \Log::warning('Support channel auth denied: unauthenticated', [
            'account_id' => $accountId,
            'thread_id' => $threadId,
        ]);
        return false;
    }

    // Platform admins can access any support thread
    if ($user->isPlatformAdmin()) {
        \Log::debug('Support channel auth granted: platform admin', [
            'user_id' => $user->id,
            'account_id' => $accountId,
            'thread_id' => $threadId,
        ]);
        return [
            'id' => $user->id,
            'name' => $user->name,
        ];
    }

    // Validate account exists
    $account = \App\Models\Account::find($accountId);
    if (!$account) {
        \Log::warning('Support channel auth denied: account missing', [
            'user_id' => $user->id,
            'account_id' => $accountId,
            'thread_id' => $threadId,
        ]);
        return false;
    }

    // Check user membership (owner or member)
    $isOwner = (int) $account->owner_id === (int) $user->id;
    $membership = $account->users()->where('user_id', $user->id)->first();
    
    if (!$membership && !$isOwner) {
        \Log::warning('Support channel auth denied: no membership', [
            'user_id' => $user->id,
            'account_id' => $accountId,
            'thread_id' => $threadId,
            'owner_id' => $account->owner_id,
            'is_owner' => $isOwner,
        ]);
        return false;
    }

    // Validate thread exists and belongs to account
    // Convert threadId to integer if it's numeric
    $threadIdInt = is_numeric($threadId) ? (int) $threadId : null;
    if (!$threadIdInt) {
        \Log::warning('Support channel auth denied: invalid thread ID', [
            'user_id' => $user->id,
            'account_id' => $accountId,
            'thread_id' => $threadId,
            'thread_id_type' => gettype($threadId),
        ]);
        return false;
    }

    $thread = \App\Modules\Support\Models\SupportThread::find($threadIdInt);
    if (!$thread) {
        \Log::warning('Support channel auth denied: thread not found', [
            'user_id' => $user->id,
            'account_id' => $accountId,
            'thread_id' => $threadIdInt,
        ]);
        return false;
    }

    if (!account_ids_match($thread->account_id, $accountId)) {
        \Log::warning('Support channel auth denied: thread account mismatch', [
            'user_id' => $user->id,
            'account_id' => $accountId,
            'thread_id' => $threadIdInt,
            'thread_account_id' => $thread->account_id,
        ]);
        return false;
    }

    \Log::debug('Support channel auth granted', [
        'user_id' => $user->id,
        'account_id' => $accountId,
        'thread_id' => $threadIdInt,
    ]);

    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

Broadcast::channel('platform.support', function ($user) {
    return $user?->isSuperAdmin() ? [
        'id' => $user->id,
        'name' => $user->name,
    ] : false;
});
