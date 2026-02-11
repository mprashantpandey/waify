<?php

namespace App\Modules\WhatsApp\Events\Inbox;

use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public WhatsAppMessage $message
    ) {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $accountId = $this->message->account_id;
        $conversationId = $this->message->whatsapp_conversation_id;

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
        return 'whatsapp.message.created';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'account_id' => $this->message->account_id,
            'conversation_id' => $this->message->whatsapp_conversation_id,
            'message' => [
                'id' => $this->message->id,
                'direction' => $this->message->direction,
                'type' => $this->message->type,
                'text_body' => $this->message->text_body,
                'payload' => $this->message->payload,
                'status' => $this->message->status,
                'created_at' => $this->message->created_at->toIso8601String(),
                'updated_at' => $this->message->updated_at?->toIso8601String(),
                'meta_message_id' => $this->message->meta_message_id],
            'contact' => $this->message->conversation?->contact ? [
                'wa_id' => $this->message->conversation->contact->wa_id,
                'name' => $this->message->conversation->contact->name] : null];
    }
}
