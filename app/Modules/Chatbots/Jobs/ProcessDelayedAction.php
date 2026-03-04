<?php

namespace App\Modules\Chatbots\Jobs;

use App\Modules\Chatbots\Models\BotActionJob;
use App\Modules\Chatbots\Services\ActionExecutor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessDelayedAction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;

    public int $timeout = 120;

    public array $backoff = [10, 30, 90];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $actionJobId
    ) {
        $this->onQueue('chatbots');
    }

    /**
     * Execute the job.
     */
    public function handle(ActionExecutor $actionExecutor): void
    {
        $actionJob = BotActionJob::find($this->actionJobId);
        if (!$actionJob || $actionJob->status !== 'queued') {
            return;
        }

        $actionJob->update(['status' => 'running']);

        try {
            // Get execution and conversation
            $execution = $actionJob->execution;
            $node = $actionJob->node;
            if (!$execution || !$node) {
                throw new \RuntimeException('Execution or node not found for delayed action');
            }

            $conversation = $execution->conversation;
            if (!$conversation || !$conversation->connection) {
                throw new \RuntimeException('Conversation or connection missing for delayed action');
            }
            $connection = $conversation->connection;
            $inboundMessage = $conversation->messages()
                ->where('direction', 'inbound')
                ->latest()
                ->first();

            if (!$inboundMessage) {
                throw new \Exception('Inbound message not found');
            }

            // Create context
            $context = new \App\Modules\Chatbots\Services\BotContext(
                account: $execution->account,
                conversation: $conversation,
                inboundMessage: $inboundMessage,
                connection: $connection,
                metadata: ['execution_id' => $execution->id]
            );

            // Execute the delayed action node
            $result = $actionExecutor->execute($node, $context);

            $actionJob->update([
                'status' => $result['success'] ? 'done' : 'failed',
                'last_error' => $result['error'] ?? null]);
        } catch (\Exception $e) {
            $actionJob->update([
                'status' => 'failed',
                'last_error' => $e->getMessage()]);
            Log::channel('chatbots')->error('ProcessDelayedAction failed', [
                'action_job_id' => $this->actionJobId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
