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
        $account = $conversation->account;
        $connection = $conversation->connection;

        // Get eligible bots
        $bots = Bot::where('account_id', $account->id)
            ->where('status', 'active')
            ->get()
            ->filter(fn (Bot $bot) => $bot->appliesToConnection($connection->id));

        if ($bots->isEmpty()) {
            return;
        }

        // Create context
        $context = new BotContext(
            account: $account,
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

        $existingExecution = BotExecution::where('account_id', $context->account->id)
            ->where('trigger_event_id', $triggerEventId)
            ->where('bot_flow_id', $flow->id)
            ->first();

        if ($existingExecution) {
            Log::channel('chatbots')->debug('Skipping duplicate execution', [
                'execution_id' => $existingExecution->id,
                'trigger_event_id' => $triggerEventId]);
            return;
        }

        // Check trigger
        if (!$this->triggerEvaluator->matches($flow, $context)) {
            return;
        }

        // Create execution record
        $execution = BotExecution::create([
            'account_id' => $context->account->id,
            'bot_id' => $flow->bot_id,
            'bot_flow_id' => $flow->id,
            'whatsapp_conversation_id' => $context->conversation->id,
            'trigger_event_id' => $triggerEventId,
            'status' => 'running',
            'started_at' => now(),
            'logs' => []]);

        // Update context with execution ID
        $context->metadata['execution_id'] = $execution->id;

        try {
            $logs = [];
            $actionCount = 0;
            $maxActions = 10;
            // Graph execution (start -> traverse edges)
            $nodes = $flow->nodes()->get()->keyBy('id');
            $edgesByFrom = $flow->edges()
                ->orderBy('sort_order')
                ->get()
                ->groupBy('from_node_id');

            if ($edgesByFrom->isEmpty()) {
                // Fallback to linear for existing flows without edges
                $ordered = $nodes->sortBy('sort_order')->values();
                foreach ($ordered as $node) {
                    if ($actionCount >= $maxActions) {
                        $logs[] = [
                            'node_id' => $node->id,
                            'type' => $node->type,
                            'result' => 'skipped',
                            'reason' => 'Max actions limit reached',
                        ];
                        break;
                    }

                    if ($node->type === 'condition') {
                        $passed = $this->conditionEvaluator->evaluate($node, $context);
                        $logs[] = [
                            'node_id' => $node->id,
                            'type' => 'condition',
                            'result' => $passed ? 'passed' : 'failed',
                        ];
                        if (!$passed) {
                            continue;
                        }
                    }

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
                            Log::channel('chatbots')->warning('Action failed', [
                                'node_id' => $node->id,
                                'error' => $result['error'] ?? 'Unknown error',
                            ]);
                        }
                    }
                }
            } else {
            $startNode = $nodes->first(fn (BotNode $node) => ($node->config['is_start'] ?? false) === true)
                ?? $nodes->sortBy('sort_order')->first();

            if (!$startNode) {
                $execution->update([
                    'status' => 'skipped',
                    'finished_at' => now(),
                    'logs' => [['result' => 'skipped', 'reason' => 'No nodes found']],
                ]);
                return;
            }

            $queue = [$startNode->id];
            $visited = [];

            while (!empty($queue)) {
                $nodeId = array_shift($queue);
                if (!$nodeId || isset($visited[$nodeId])) {
                    continue;
                }
                $visited[$nodeId] = true;
                $node = $nodes->get($nodeId);
                if (!$node) {
                    continue;
                }

                if ($actionCount >= $maxActions) {
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $node->type,
                        'result' => 'skipped',
                        'reason' => 'Max actions limit reached'];
                    break;
                }

                if ($node->type === 'condition') {
                    $passed = $this->conditionEvaluator->evaluate($node, $context);
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => 'condition',
                        'result' => $passed ? 'passed' : 'failed'];

                    $edges = $edgesByFrom->get($node->id, collect());
                    $labelToFollow = $passed ? 'true' : 'false';
                    $next = $edges->first(fn ($edge) => $edge->label === $labelToFollow)
                        ?? $edges->first();
                    if ($next) {
                        $queue[] = $next->to_node_id;
                    }
                    continue;
                }

                if ($node->type === 'action' || $node->type === 'delay' || $node->type === 'webhook') {
                    $result = $this->actionExecutor->execute($node, $context);
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $node->type,
                        'result' => $result['success'] ? 'success' : 'failed',
                        'data' => $result];

                    if ($result['success']) {
                        $actionCount++;
                    } else {
                        Log::channel('chatbots')->warning('Action failed', [
                            'node_id' => $node->id,
                            'error' => $result['error'] ?? 'Unknown error']);
                    }
                }

                $edges = $edgesByFrom->get($node->id, collect());
                foreach ($edges as $edge) {
                    if ($edge->to_node_id && !isset($visited[$edge->to_node_id])) {
                        $queue[] = $edge->to_node_id;
                    }
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
                'trace' => $e->getTraceAsString()]);

            $execution->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error_message' => $e->getMessage()]);
        }
    }
}
