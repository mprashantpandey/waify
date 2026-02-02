<?php

namespace App\Modules\WhatsApp\Events\Inbox;

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public WhatsAppConversation $conversation
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $workspaceId = $this->conversation->workspace_id;
        $conversationId = $this->conversation->id;

        return [
            // Workspace inbox channel (for list updates)
            new PrivateChannel("workspace.{$workspaceId}.whatsapp.inbox"),
            // Conversation channel (for thread updates)
            new PrivateChannel("workspace.{$workspaceId}.whatsapp.conversation.{$conversationId}"),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'whatsapp.conversation.updated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'conversation' => [
                'id' => $this->conversation->id,
                'status' => $this->conversation->status,
                'priority' => $this->conversation->priority ?? null,
                'assignee_id' => $this->conversation->assignee_id ?? null,
                'tags' => $this->conversation->tags ?? [],
                'last_activity_at' => $this->conversation->last_message_at?->toIso8601String(),
                'last_message_preview' => $this->conversation->last_message_preview,
            ],
        ];
    }
}

