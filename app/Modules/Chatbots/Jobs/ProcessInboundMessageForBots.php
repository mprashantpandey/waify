<?php

namespace App\Modules\Chatbots\Jobs;

use App\Modules\Chatbots\Services\BotRuntime;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInboundMessageForBots implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public int $timeout = 120;

    public array $backoff = [5, 15, 60, 180];

    public int $uniqueFor = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $inboundMessageId,
        public int $conversationId
    ) {
        // Queue is selected by the dispatch site. Default queue should work
        // on hosts where only the default worker is running.
    }

    /**
     * Execute the job.
     */
    public function handle(BotRuntime $botRuntime): void
    {
        $inboundMessage = WhatsAppMessage::find($this->inboundMessageId);
        $conversation = WhatsAppConversation::find($this->conversationId);

        if (!$inboundMessage || !$conversation) {
            \Illuminate\Support\Facades\Log::channel('chatbots')->warning('ProcessInboundMessageForBots skipped: message/conversation not found', [
                'conversation_id' => $this->conversationId,
                'message_id' => $this->inboundMessageId,
            ]);
            return;
        }

        \Illuminate\Support\Facades\Log::channel('chatbots')->debug('ProcessInboundMessageForBots started', [
            'account_id' => $conversation->account_id,
            'conversation_id' => $conversation->id,
            'message_id' => $inboundMessage->id,
            'meta_message_id' => $inboundMessage->meta_message_id,
        ]);

        $botRuntime->processInboundMessage($inboundMessage, $conversation);

        \Illuminate\Support\Facades\Log::channel('chatbots')->debug('ProcessInboundMessageForBots finished', [
            'account_id' => $conversation->account_id,
            'conversation_id' => $conversation->id,
            'message_id' => $inboundMessage->id,
        ]);
    }

    public function uniqueId(): string
    {
        return 'chatbot-inbound-message:' . $this->inboundMessageId;
    }

    public function failed(\Throwable $e): void
    {
        \Illuminate\Support\Facades\Log::channel('chatbots')->error('ProcessInboundMessageForBots failed', [
            'conversation_id' => $this->conversationId,
            'message_id' => $this->inboundMessageId,
            'error' => $e->getMessage(),
        ]);
    }
}
