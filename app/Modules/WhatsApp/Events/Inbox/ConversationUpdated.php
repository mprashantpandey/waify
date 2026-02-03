<?php

namespace App\Modules\WhatsApp\Events\Inbox;

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Schema;

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
        $accountId = $this->conversation->account_id;
        $conversationId = $this->conversation->id;

        return [
            // Account inbox channel (for list updates)
            new PrivateChannel("account.{$accountId}.whatsapp.inbox"),
            // Conversation channel (for thread updates)
            new PrivateChannel("account.{$accountId}.whatsapp.conversation.{$conversationId}")];
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
        $tags = [];
        if ($this->conversation->relationLoaded('contact') && $this->conversation->contact) {
            $tags = $this->conversation->contact->tags?->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                ];
            })->values()->toArray() ?? [];
        }

        $priority = null;
        if (Schema::hasColumn('whatsapp_conversations', 'priority')) {
            $priority = $this->conversation->priority;
        }

        $assigneeId = null;
        if (Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $assigneeId = $this->conversation->assigned_to;
        }

        return [
            'conversation' => [
                'id' => $this->conversation->id,
                'status' => $this->conversation->status,
                'priority' => $priority,
                'assignee_id' => $assigneeId,
                'tags' => $tags,
                'last_activity_at' => $this->conversation->last_message_at?->toIso8601String(),
                'last_message_preview' => $this->conversation->last_message_preview]];
    }
}
