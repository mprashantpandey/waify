<?php

namespace App\Modules\AI\Jobs;

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Services\AI\AiAgentAutopilotService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessInboundMessageForAiAgent implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public array $backoff = [10, 60, 180];

    public int $uniqueFor = 300;

    public function __construct(
        public WhatsAppMessage $inboundMessage,
        public WhatsAppConversation $conversation
    ) {}

    public function handle(AiAgentAutopilotService $autopilot): void
    {
        $autopilot->process($this->inboundMessage, $this->conversation);
    }

    public function uniqueId(): string
    {
        return 'ai-agent-inbound-message:'.$this->inboundMessage->id;
    }

    public function failed(\Throwable $e): void
    {
        Log::channel('whatsapp')->error('AI agent inbound processing failed', [
            'account_id' => $this->conversation->account_id,
            'conversation_id' => $this->conversation->id,
            'message_id' => $this->inboundMessage->id,
            'meta_message_id' => $this->inboundMessage->meta_message_id,
            'error' => $e->getMessage(),
        ]);
    }
}
