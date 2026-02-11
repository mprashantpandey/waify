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
        public WhatsAppMessage $inboundMessage,
        public WhatsAppConversation $conversation
    ) {
        // Queue is selected by the dispatch site. Default queue should work
        // on hosts where only the default worker is running.
    }

    /**
     * Execute the job.
     */
    public function handle(BotRuntime $botRuntime): void
    {
        \Illuminate\Support\Facades\Log::channel('chatbots')->debug('ProcessInboundMessageForBots started', [
            'account_id' => $this->conversation->account_id,
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->inboundMessage->id,
            'meta_message_id' => $this->inboundMessage->meta_message_id,
        ]);

        $botRuntime->processInboundMessage($this->inboundMessage, $this->conversation);

        \Illuminate\Support\Facades\Log::channel('chatbots')->debug('ProcessInboundMessageForBots finished', [
            'account_id' => $this->conversation->account_id,
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->inboundMessage->id,
        ]);
    }

    public function uniqueId(): string
    {
        return 'chatbot-inbound-message:' . $this->inboundMessage->id;
    }

    public function failed(\Throwable $e): void
    {
        \Illuminate\Support\Facades\Log::channel('chatbots')->error('ProcessInboundMessageForBots failed', [
            'account_id' => $this->conversation->account_id,
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->inboundMessage->id,
            'meta_message_id' => $this->inboundMessage->meta_message_id,
            'error' => $e->getMessage(),
        ]);
    }
}
