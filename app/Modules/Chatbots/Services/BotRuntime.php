<?php

namespace App\Modules\Chatbots\Services;

use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotExecution;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotNode;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Support\Facades\Log;

class BotRuntime
{
    public function __construct(
        protected TriggerEvaluator $triggerEvaluator,
        protected ConditionEvaluator $conditionEvaluator,
        protected ActionExecutor $actionExecutor
    ) {}

    /**
     * Process inbound message for bots.
     */
    public function processInboundMessage(
        WhatsAppMessage $inboundMessage,
        WhatsAppConversation $conversation
    ): void {
        $workspace = $conversation->workspace;
        $connection = $conversation->connection;

        // Get eligible bots
        $bots = Bot::where('workspace_id', $workspace->id)
            ->where('status', 'active')
            ->get()
            ->filter(fn (Bot $bot) => $bot->appliesToConnection($connection->id));

        if ($bots->isEmpty()) {
            return;
        }

        // Create context
        $context = new BotContext(
            workspace: $workspace,
            conversation: $conversation,
            inboundMessage: $inboundMessage,
            connection: $connection
        );

        // Process each bot's flows
        foreach ($bots as $bot) {
            $flows = $bot->flows()
                ->where('enabled', true)
                ->orderBy('priority')
                ->get();

            foreach ($flows as $flow) {
                $this->processFlow($flow, $context);
            }
        }
    }

    protected function processFlow(BotFlow $flow, BotContext $context): void
    {
        // Check idempotency
        $triggerEventId = $context->inboundMessage->meta_message_id ?? 
            "msg_{$context->inboundMessage->id}";

        $existingExecution = BotExecution::where('workspace_id', $context->workspace->id)
            ->where('trigger_event_id', $triggerEventId)
            ->where('bot_flow_id', $flow->id)
            ->first();

        if ($existingExecution) {
            Log::channel('chatbots')->debug('Skipping duplicate execution', [
                'execution_id' => $existingExecution->id,
                'trigger_event_id' => $triggerEventId,
            ]);
            return;
        }

        // Check trigger
        if (!$this->triggerEvaluator->matches($flow, $context)) {
            return;
        }

        // Create execution record
        $execution = BotExecution::create([
            'workspace_id' => $context->workspace->id,
            'bot_id' => $flow->bot_id,
            'bot_flow_id' => $flow->id,
            'whatsapp_conversation_id' => $context->conversation->id,
            'trigger_event_id' => $triggerEventId,
            'status' => 'running',
            'started_at' => now(),
            'logs' => [],
        ]);

        // Update context with execution ID
        $context->metadata['execution_id'] = $execution->id;

        try {
            // Get nodes in order
            $nodes = $flow->nodes()->orderBy('sort_order')->get();
            $logs = [];
            $actionCount = 0;
            $maxActions = 10;
            $conditionPassed = true; // Track if we're in a passing condition block

            foreach ($nodes as $node) {
                // Check action limit
                if ($actionCount >= $maxActions) {
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $node->type,
                        'result' => 'skipped',
                        'reason' => 'Max actions limit reached',
                    ];
                    break;
                }

                // Evaluate conditions
                if ($node->type === 'condition') {
                    $passed = $this->conditionEvaluator->evaluate($node, $context);
                    $conditionPassed = $passed;
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => 'condition',
                        'result' => $passed ? 'passed' : 'failed',
                    ];

                    // Continue to next node (don't execute actions if condition failed)
                    continue;
                }

                // Skip actions if condition failed
                if (!$conditionPassed) {
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $node->type,
                        'result' => 'skipped',
                        'reason' => 'Condition not met',
                    ];
                    continue;
                }

                // Execute actions
                if ($node->type === 'action' || $node->type === 'delay' || $node->type === 'webhook') {
                    $result = $this->actionExecutor->execute($node, $context);
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $node->type,
                        'result' => $result['success'] ? 'success' : 'failed',
                        'data' => $result,
                    ];

                    if ($result['success']) {
                        $actionCount++;
                    } else {
                        // Log error but continue
                        Log::channel('chatbots')->warning('Action failed', [
                            'node_id' => $node->id,
                            'error' => $result['error'] ?? 'Unknown error',
                        ]);
                    }
                }
            }

            // Update execution
            $execution->update([
                'status' => 'success',
                'finished_at' => now(),
                'logs' => array_slice($logs, 0, 100), // Cap logs size
            ]);
        } catch (\Exception $e) {
            Log::channel('chatbots')->error('Bot execution failed', [
                'execution_id' => $execution->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $execution->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}

