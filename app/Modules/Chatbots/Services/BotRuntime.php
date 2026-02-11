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
     * Some older flows or buggy saves may persist non-standard node types.
     * Normalize the execution category so the runtime can still traverse and execute.
     */
    protected function normalizeNodeType(BotNode $node): string
    {
        $type = (string) ($node->type ?? '');
        if (in_array($type, ['condition', 'action', 'delay', 'webhook'], true)) {
            return $type;
        }

        $config = is_array($node->config) ? $node->config : [];

        // If the config shape clearly matches a known node category, treat it as such.
        if (array_key_exists('action_type', $config)) {
            return 'action';
        }
        if (array_key_exists('seconds', $config)) {
            return 'delay';
        }
        if (array_key_exists('url', $config)) {
            return 'webhook';
        }
        if (array_key_exists('type', $config)) {
            return 'condition';
        }

        // Pure pass-through/unknown nodes still allow graph traversal.
        return 'passthrough';
    }

    /**
     * Process inbound message for bots.
     */
    public function processInboundMessage(
        WhatsAppMessage $inboundMessage,
        WhatsAppConversation $conversation
    ): void {
        $account = $conversation->account;
        $connection = $conversation->connection;
        if (!$account || !$connection) {
            Log::channel('chatbots')->warning('Inbound message skipped: missing account/connection context', [
                'conversation_id' => $conversation->id,
                'message_id' => $inboundMessage->id,
                'account_present' => (bool) $account,
                'connection_present' => (bool) $connection,
            ]);
            return;
        }

        // Get eligible bots
        $bots = Bot::where('account_id', $account->id)
            ->where('status', 'active')
            ->get()
            ->filter(fn (Bot $bot) => $bot->appliesToConnection($connection->id));

        if ($bots->isEmpty()) {
            Log::channel('chatbots')->debug('No eligible bots for inbound message', [
                'account_id' => $account->id,
                'conversation_id' => $conversation->id,
                'connection_id' => $connection->id,
                'message_id' => $inboundMessage->id,
            ]);
            return;
        }

        Log::channel('chatbots')->debug('Eligible bots for inbound message', [
            'account_id' => $account->id,
            'conversation_id' => $conversation->id,
            'connection_id' => $connection->id,
            'message_id' => $inboundMessage->id,
            'bots' => $bots->map(fn (Bot $b) => [
                'id' => $b->id,
                'name' => $b->name,
                'applies_to' => $b->applies_to,
            ])->values()->all(),
        ]);

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

            if ($flows->isEmpty()) {
                Log::channel('chatbots')->warning('Active bot has no enabled flows', [
                    'account_id' => $account->id,
                    'bot_id' => $bot->id,
                    'bot_name' => $bot->name,
                    'conversation_id' => $conversation->id,
                    'message_id' => $inboundMessage->id,
                ]);
                continue;
            }

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
            Log::channel('chatbots')->debug('Flow trigger did not match', [
                'account_id' => $context->account->id,
                'flow_id' => $flow->id,
                'flow_name' => $flow->name,
                'trigger' => $flow->trigger,
                'message_id' => $context->inboundMessage->id,
                'meta_message_id' => $context->inboundMessage->meta_message_id,
                'message_type' => $context->inboundMessage->type,
                'message_text' => $context->getMessageText(),
                'connection_id' => $context->getConnectionId(),
                'conversation_id' => $context->conversation->id,
            ]);
            return;
        }

        Log::channel('chatbots')->info('Flow trigger matched, starting execution', [
            'account_id' => $context->account->id,
            'bot_id' => $flow->bot_id,
            'flow_id' => $flow->id,
            'flow_name' => $flow->name,
            'trigger' => $flow->trigger,
            'conversation_id' => $context->conversation->id,
            'message_id' => $context->inboundMessage->id,
            'meta_message_id' => $context->inboundMessage->meta_message_id,
        ]);

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

            $nodeTypeSummary = $nodes
                ->values()
                ->map(fn (BotNode $n) => [
                    'id' => $n->id,
                    'type' => $n->type,
                    'normalized' => $this->normalizeNodeType($n),
                    'has_config' => is_array($n->config) && !empty($n->config),
                    'config_keys' => is_array($n->config) ? array_slice(array_keys($n->config), 0, 12) : [],
                ])
                ->take(25)
                ->all();

            Log::channel('chatbots')->debug('Flow graph snapshot', [
                'execution_id' => $execution->id,
                'bot_id' => $flow->bot_id,
                'flow_id' => $flow->id,
                'nodes_count' => $nodes->count(),
                'edges_count' => $edgesByFrom->flatten(1)->count(),
                'has_edges' => !$edgesByFrom->isEmpty(),
                'nodes' => $nodeTypeSummary,
            ]);

            if ($nodes->isEmpty()) {
                $execution->update([
                    'status' => 'skipped',
                    'finished_at' => now(),
                    'logs' => [['result' => 'skipped', 'reason' => 'No nodes found']],
                ]);
                Log::channel('chatbots')->warning('Flow has no nodes; skipping', [
                    'execution_id' => $execution->id,
                    'flow_id' => $flow->id,
                ]);
                return;
            }

            if ($edgesByFrom->isEmpty()) {
                // Fallback to linear for existing flows without edges
                Log::channel('chatbots')->debug('Executing flow in linear mode (no edges)', [
                    'execution_id' => $execution->id,
                    'flow_id' => $flow->id,
                ]);
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

                    $normalized = $this->normalizeNodeType($node);

                    if ($normalized === 'condition') {
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

                    if ($normalized === 'action' || $normalized === 'delay' || $normalized === 'webhook') {
                        // For legacy nodes, ensure executor sees the expected node category.
                        if ($node->type !== $normalized && $normalized !== 'passthrough') {
                            $node->type = $normalized;
                        }
                        $result = $this->actionExecutor->execute($node, $context);
                        $logs[] = [
                            'node_id' => $node->id,
                            'type' => $normalized,
                            'result' => $result['success'] ? 'success' : 'failed',
                            'data' => $result,
                        ];

                        if ($result['success']) {
                            $actionCount++;
                            Log::channel('chatbots')->info('Action executed', [
                                'execution_id' => $execution->id,
                                'flow_id' => $flow->id,
                                'node_id' => $node->id,
                                'node_type' => $normalized,
                                'action_type' => $normalized === 'action' ? ($node->config['action_type'] ?? null) : null,
                                'success' => true,
                            ]);
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

            Log::channel('chatbots')->debug('Executing flow in graph mode', [
                'execution_id' => $execution->id,
                'flow_id' => $flow->id,
                'start_node_id' => $startNode->id,
            ]);

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

                $normalized = $this->normalizeNodeType($node);

                if ($actionCount >= $maxActions) {
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $normalized,
                        'result' => 'skipped',
                        'reason' => 'Max actions limit reached'];
                    break;
                }

                if ($normalized === 'condition') {
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

                if ($normalized === 'action' || $normalized === 'delay' || $normalized === 'webhook') {
                    if ($node->type !== $normalized && $normalized !== 'passthrough') {
                        $node->type = $normalized;
                    }
                    $result = $this->actionExecutor->execute($node, $context);
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $normalized,
                        'result' => $result['success'] ? 'success' : 'failed',
                        'data' => $result];

                    if ($result['success']) {
                        $actionCount++;
                        Log::channel('chatbots')->info('Action executed', [
                            'execution_id' => $execution->id,
                            'flow_id' => $flow->id,
                            'node_id' => $node->id,
                            'node_type' => $normalized,
                            'action_type' => $normalized === 'action' ? ($node->config['action_type'] ?? null) : null,
                            'success' => true,
                        ]);
                    } else {
                        Log::channel('chatbots')->warning('Action failed', [
                            'node_id' => $node->id,
                            'error' => $result['error'] ?? 'Unknown error']);
                    }
                } else {
                    // Unknown/pass-through node type. Still traverse the graph.
                    $logs[] = [
                        'node_id' => $node->id,
                        'type' => $normalized,
                        'result' => 'skipped',
                        'reason' => 'Non-executable node type',
                        'raw_type' => $node->type,
                    ];
                }

                $edges = $edgesByFrom->get($node->id, collect());
                foreach ($edges as $edge) {
                    if ($edge->to_node_id && !isset($visited[$edge->to_node_id])) {
                        $queue[] = $edge->to_node_id;
                    }
                }
            }
            }

            if ($actionCount === 0) {
                Log::channel('chatbots')->warning('Execution completed but no actions were executed', [
                    'execution_id' => $execution->id,
                    'flow_id' => $flow->id,
                    'nodes_count' => $nodes->count(),
                    'has_edges' => !$edgesByFrom->isEmpty(),
                ]);

                $execution->update([
                    'status' => 'skipped',
                    'finished_at' => now(),
                    'error_message' => 'No executable actions were run for this flow',
                    'logs' => array_slice($logs, 0, 100),
                ]);

                return;
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
