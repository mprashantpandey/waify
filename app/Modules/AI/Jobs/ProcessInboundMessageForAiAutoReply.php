<?php

namespace App\Modules\AI\Jobs;

use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Services\AI\AiAutoReplyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessInboundMessageForAiAutoReply implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $messageId)
    {
    }

    public function handle(AiAutoReplyService $service): void
    {
        $message = WhatsAppMessage::query()->find($this->messageId);
        if (!$message) {
            return;
        }

        $service->processInboundMessage($message);
    }
}
