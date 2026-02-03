<?php

namespace App\Modules\Chatbots\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Models\Account;

/**
 * Context object passed to trigger/condition/action evaluators.
 */
class BotContext
{
    public function __construct(
        public Account $account,
        public WhatsAppConversation $conversation,
        public WhatsAppMessage $inboundMessage,
        public WhatsAppConnection $connection,
        public array $metadata = []
    ) {}

    public function getMessageText(): ?string
    {
        return $this->inboundMessage->text_body;
    }

    public function getConversationStatus(): string
    {
        return $this->conversation->status ?? 'open';
    }

    public function getConnectionId(): int
    {
        return $this->connection->id;
    }

    public function isFirstMessage(): bool
    {
        // Check if this is the first message in the conversation
        return $this->conversation->messages()
            ->where('direction', 'inbound')
            ->count() === 1;
    }
}

