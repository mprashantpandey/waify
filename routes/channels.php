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
| Private channels for workspace-scoped WhatsApp inbox realtime updates.
|
*/

// Workspace inbox channel - for conversation list updates
Broadcast::channel('workspace.{workspaceId}.whatsapp.inbox', function ($user, $workspaceId) {
    $workspace = \App\Models\Workspace::find($workspaceId);
    
    if (!$workspace) {
        return false;
    }
    
    // Check if user is a member of this workspace
    $membership = $workspace->users()->where('user_id', $user->id)->first();
    
    if (!$membership) {
        return false;
    }
    
    // Return minimal user data for presence if needed
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});

// Conversation thread channel - for message updates within a conversation
Broadcast::channel('workspace.{workspaceId}.whatsapp.conversation.{conversationId}', function ($user, $workspaceId, $conversationId) {
    $workspace = \App\Models\Workspace::find($workspaceId);
    
    if (!$workspace) {
        return false;
    }
    
    // Check if user is a member of this workspace
    $membership = $workspace->users()->where('user_id', $user->id)->first();
    
    if (!$membership) {
        return false;
    }
    
    // Verify conversation belongs to this workspace
    $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::find($conversationId);
    
    if (!$conversation || $conversation->workspace_id !== (int) $workspaceId) {
        return false;
    }
    
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

Broadcast::channel('workspace.{workspaceId}.support.thread.{threadId}', function ($user, $workspaceId, $threadId) {
    if (app()->environment('local')) {
        \Log::debug('Support channel auth attempt', [
            'user_id' => $user?->id,
            'workspace_id' => $workspaceId,
            'thread_id' => $threadId,
            'has_user' => $user !== null,
        ]);
    }

    if (!$user) {
        \Log::warning('Support channel auth denied: unauthenticated', [
            'workspace_id' => $workspaceId,
            'thread_id' => $threadId,
        ]);
        return false;
    }

    $workspace = \App\Models\Workspace::find($workspaceId);
    if (!$workspace) {
        \Log::warning('Support channel auth denied: workspace missing', [
            'user_id' => $user?->id,
            'workspace_id' => $workspaceId,
            'thread_id' => $threadId,
        ]);
        return false;
    }

    $membership = $workspace->users()->where('user_id', $user->id)->first();
    if (!$membership && $workspace->owner_id !== $user->id) {
        \Log::warning('Support channel auth denied: no membership', [
            'user_id' => $user?->id,
            'workspace_id' => $workspaceId,
            'thread_id' => $threadId,
            'owner_id' => $workspace->owner_id,
        ]);
        return false;
    }

    $thread = \App\Modules\Support\Models\SupportThread::find($threadId);
    if (!$thread || $thread->workspace_id !== (int) $workspaceId) {
        \Log::warning('Support channel auth denied: thread mismatch', [
            'user_id' => $user?->id,
            'workspace_id' => $workspaceId,
            'thread_id' => $threadId,
            'thread_workspace_id' => $thread?->workspace_id,
        ]);
        return false;
    }

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
