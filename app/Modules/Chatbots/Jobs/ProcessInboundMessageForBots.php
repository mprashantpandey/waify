<?php

namespace App\Modules\Chatbots\Jobs;

use App\Modules\Chatbots\Services\BotRuntime;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInboundMessageForBots implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public WhatsAppMessage $inboundMessage,
        public WhatsAppConversation $conversation
    ) {
        // Use dedicated queue for chatbot processing
        $this->onQueue('chatbots');
    }

    /**
     * Execute the job.
     */
    public function handle(BotRuntime $botRuntime): void
    {
        $botRuntime->processInboundMessage($this->inboundMessage, $this->conversation);
    }
}
