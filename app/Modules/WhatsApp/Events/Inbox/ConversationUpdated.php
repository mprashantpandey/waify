<?php

namespace App\Modules\WhatsApp\Events\Inbox;

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Services\ConversationAutomationService;
use App\Modules\WhatsApp\Services\InboxMetricsService;
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
     * Include contact and connection so the inbox can show new conversations without a full refetch.
     */
    public function broadcastWith(): array
    {
        $conversation = $this->conversation;
        $conversation->loadMissing(['contact', 'connection', 'assignee:id,name', 'latestAuditEvent']);
        $unreadCount = app(InboxMetricsService::class)->unreadCountForConversation((int) $conversation->id);
        $latestAudit = $conversation->latestAuditEvent;

        $tags = [];
        if ($conversation->contact && $conversation->contact->relationLoaded('tags')) {
            $tags = $conversation->contact->tags?->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'color' => $tag->color,
                ];
            })->values()->toArray() ?? [];
        }

        $priority = null;
        if (Schema::hasColumn('whatsapp_conversations', 'priority')) {
            $priority = $conversation->priority;
        }

        $assigneeId = null;
        if (Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $assigneeId = $conversation->assigned_to;
        }

        return [
            'conversation' => [
                'id' => $conversation->id,
                'account_id' => $conversation->account_id,
                'status' => $conversation->status,
                'priority' => $priority,
                'assignee_id' => $assigneeId,
                'assigned_to' => $assigneeId,
                'tags' => $tags,
                'last_activity_at' => $conversation->last_message_at?->toIso8601String(),
                'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                'last_message_preview' => $conversation->last_message_preview,
                'unread_count' => $unreadCount,
                'has_unread' => $unreadCount > 0,
                'activity' => $latestAudit ? [
                    'event_type' => $latestAudit->event_type,
                    'description' => $latestAudit->description,
                    'created_at' => $latestAudit->created_at?->toIso8601String(),
                ] : null,
                'automation' => app(ConversationAutomationService::class)->present($conversation),
                'contact' => $conversation->contact ? [
                    'id' => $conversation->contact->id,
                    'wa_id' => $conversation->contact->wa_id,
                    'name' => $conversation->contact->name ?? $conversation->contact->wa_id,
                ] : null,
                'connection' => $conversation->connection ? [
                    'id' => $conversation->connection->id,
                    'name' => $conversation->connection->name,
                ] : null,
            ],
        ];
    }
}
