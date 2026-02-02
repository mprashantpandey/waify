<?php

namespace App\Modules\Chatbots\Services;

use App\Core\Billing\EntitlementService;
use App\Core\Billing\UsageService;
use App\Modules\Chatbots\Models\BotNode;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\TemplateComposer;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ActionExecutor
{
    public function __construct(
        protected WhatsAppClient $whatsappClient,
        protected TemplateComposer $templateComposer,
        protected EntitlementService $entitlementService,
        protected UsageService $usageService
    ) {}

    /**
     * Execute an action node.
     */
    public function execute(BotNode $node, BotContext $context): array
    {
        $type = $node->type;
        $config = $node->config;

        return match ($type) {
            'action' => $this->executeAction($config, $context),
            'delay' => $this->scheduleDelay($node, $context),
            'webhook' => $this->callWebhook($config, $context),
            default => ['success' => false, 'error' => "Unknown action type: {$type}"],
        };
    }

    protected function executeAction(array $config, BotContext $context): array
    {
        $actionType = $config['action_type'] ?? null;

        return match ($actionType) {
            'send_text' => $this->sendTextMessage($config, $context),
            'send_template' => $this->sendTemplateMessage($config, $context),
            'assign_agent' => $this->assignAgent($config, $context),
            'add_tag' => $this->addTag($config, $context),
            'set_status' => $this->setStatus($config, $context),
            'set_priority' => $this->setPriority($config, $context),
            default => ['success' => false, 'error' => "Unknown action: {$actionType}"],
        };
    }

    protected function sendTextMessage(array $config, BotContext $context): array
    {
        try {
            // Check message limit
            $this->entitlementService->assertWithinLimit($context->workspace, 'messages_monthly', 1);

            // Rate limit check (max 5 messages per conversation per minute)
            $rateLimitKey = "bot_rate_limit:{$context->conversation->id}";
            $messageCount = Cache::get($rateLimitKey, 0);
            if ($messageCount >= 5) {
                return ['success' => false, 'error' => 'Rate limit exceeded for this conversation'];
            }

            $messageText = $config['message'] ?? '';
            $toWaId = $context->conversation->contact->wa_id;

            // Send via WhatsApp API
            $response = $this->whatsappClient->sendTextMessage(
                $context->connection,
                $toWaId,
                $messageText
            );

            // Create message record
            $message = WhatsAppMessage::create([
                'workspace_id' => $context->workspace->id,
                'whatsapp_conversation_id' => $context->conversation->id,
                'direction' => 'outbound',
                'type' => 'text',
                'text_body' => $messageText,
                'status' => 'sent',
                'sent_at' => now(),
                'meta_message_id' => $response['messages'][0]['id'] ?? null,
                'payload' => $response,
            ]);

            // Track usage
            $this->usageService->incrementMessages($context->workspace, 1);

            // Update conversation
            $context->conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($messageText, 0, 100),
            ]);

            // Broadcast events
            event(new MessageCreated($message));
            event(new ConversationUpdated($context->conversation));

            // Update rate limit
            Cache::put($rateLimitKey, $messageCount + 1, 60);

            return [
                'success' => true,
                'message_id' => $message->id,
                'meta_message_id' => $message->meta_message_id,
            ];
        } catch (\Exception $e) {
            Log::channel('chatbots')->error('Failed to send text message', [
                'error' => $e->getMessage(),
                'context' => $context->workspace->id,
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    protected function sendTemplateMessage(array $config, BotContext $context): array
    {
        try {
            // Check limits
            $this->entitlementService->assertWithinLimit($context->workspace, 'messages_monthly', 1);
            $this->entitlementService->assertWithinLimit($context->workspace, 'template_sends_monthly', 1);

            $templateId = $config['template_id'] ?? null;
            $variables = $config['variables'] ?? [];

            if (!$templateId) {
                return ['success' => false, 'error' => 'Template ID required'];
            }

            $template = \App\Modules\WhatsApp\Models\WhatsAppTemplate::find($templateId);
            if (!$template || $template->workspace_id !== $context->workspace->id) {
                return ['success' => false, 'error' => 'Template not found'];
            }

            $toWaId = $context->conversation->contact->wa_id;

            // Prepare payload
            $payload = $this->templateComposer->preparePayload($template, $toWaId, $variables);

            // Send via WhatsApp API
            $response = $this->whatsappClient->sendTemplateMessage(
                $context->connection,
                $toWaId,
                $template->name,
                $template->language,
                $payload['template']['components'] ?? []
            );

            // Create message record
            $message = WhatsAppMessage::create([
                'workspace_id' => $context->workspace->id,
                'whatsapp_conversation_id' => $context->conversation->id,
                'direction' => 'outbound',
                'type' => 'template',
                'text_body' => $this->templateComposer->renderPreview($template, $variables)['body'],
                'status' => 'sent',
                'sent_at' => now(),
                'meta_message_id' => $response['messages'][0]['id'] ?? null,
                'payload' => $payload,
            ]);

            // Track usage
            $this->usageService->incrementMessages($context->workspace, 1);
            $this->usageService->incrementTemplateSends($context->workspace, 1);

            // Update conversation
            $context->conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($message->text_body, 0, 100),
            ]);

            // Broadcast events
            event(new MessageCreated($message));
            event(new ConversationUpdated($context->conversation));

            return [
                'success' => true,
                'message_id' => $message->id,
                'meta_message_id' => $message->meta_message_id,
            ];
        } catch (\Exception $e) {
            Log::channel('chatbots')->error('Failed to send template message', [
                'error' => $e->getMessage(),
                'context' => $context->workspace->id,
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    protected function assignAgent(array $config, BotContext $context): array
    {
        // TODO: Implement when assignee_id field exists on conversations
        // For now, return success but log that it's not implemented
        Log::channel('chatbots')->info('Assign agent action called but not yet implemented', [
            'conversation_id' => $context->conversation->id,
            'agent_id' => $config['agent_id'] ?? null,
        ]);

        return ['success' => true, 'note' => 'Agent assignment not yet implemented'];
    }

    protected function addTag(array $config, BotContext $context): array
    {
        // TODO: Implement when tags system exists
        return ['success' => true, 'note' => 'Tags system not yet implemented'];
    }

    protected function setStatus(array $config, BotContext $context): array
    {
        $status = $config['status'] ?? 'open';
        $context->conversation->update(['status' => $status]);

        event(new ConversationUpdated($context->conversation));

        return ['success' => true];
    }

    protected function setPriority(array $config, BotContext $context): array
    {
        // TODO: Implement when priority field exists on conversations
        Log::channel('chatbots')->info('Set priority action called but not yet implemented', [
            'conversation_id' => $context->conversation->id,
            'priority' => $config['priority'] ?? null,
        ]);

        return ['success' => true, 'note' => 'Priority system not yet implemented'];
    }

    protected function scheduleDelay(BotNode $node, BotContext $context): array
    {
        $delaySeconds = $node->config['seconds'] ?? 0;
        if ($delaySeconds <= 0) {
            return ['success' => false, 'error' => 'Invalid delay seconds'];
        }

        $runAt = now()->addSeconds($delaySeconds);
        $executionId = $context->metadata['execution_id'] ?? null;

        if (!$executionId) {
            return ['success' => false, 'error' => 'Execution ID required for delay'];
        }

        // Get next node (node after delay)
        $nextNode = \App\Modules\Chatbots\Models\BotNode::where('bot_flow_id', $node->bot_flow_id)
            ->where('sort_order', '>', $node->sort_order)
            ->orderBy('sort_order')
            ->first();

        if (!$nextNode) {
            return ['success' => false, 'error' => 'No action node found after delay'];
        }

        // Create action job record
        $actionJob = \App\Modules\Chatbots\Models\BotActionJob::create([
            'workspace_id' => $context->workspace->id,
            'bot_execution_id' => $executionId,
            'node_id' => $nextNode->id, // Store the next node to execute
            'run_at' => $runAt,
            'status' => 'queued',
        ]);

        // Dispatch queued job
        \App\Modules\Chatbots\Jobs\ProcessDelayedAction::dispatch($actionJob->id)
            ->delay($runAt);

        return ['success' => true, 'scheduled_at' => $runAt->toIso8601String(), 'job_id' => $actionJob->id];
    }

    protected function callWebhook(array $config, BotContext $context): array
    {
        $url = $config['url'] ?? '';
        $timeout = $config['timeout'] ?? 10;
        $method = $config['method'] ?? 'POST';

        if (empty($url)) {
            return ['success' => false, 'error' => 'Webhook URL required'];
        }

        try {
            $payload = [
                'workspace_id' => $context->workspace->id,
                'conversation_id' => $context->conversation->id,
                'message' => [
                    'id' => $context->inboundMessage->id,
                    'text' => $context->inboundMessage->text_body,
                ],
                'connection' => [
                    'id' => $context->connection->id,
                    'name' => $context->connection->name,
                ],
            ];

            $response = \Illuminate\Support\Facades\Http::timeout($timeout)
                ->{strtolower($method)}($url, $payload);

            return [
                'success' => $response->successful(),
                'status_code' => $response->status(),
                'response' => substr($response->body(), 0, 500), // Cap response size
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}

