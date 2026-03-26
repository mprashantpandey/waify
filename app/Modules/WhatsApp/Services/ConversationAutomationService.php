<?php

namespace App\Modules\WhatsApp\Services;

use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConversation;

class ConversationAutomationService
{
    public function markAiActive(WhatsAppConversation $conversation): void
    {
        $this->mergeAutomationState($conversation, [
            'current_actor' => 'ai',
            'state' => 'active',
            'assignment_source' => null,
            'last_event_type' => 'ai_auto_reply_sent',
            'last_event_at' => now()->toIso8601String(),
        ]);
    }

    public function markChatbotActive(WhatsAppConversation $conversation, string $eventType = 'chatbot_reply_sent'): void
    {
        $this->mergeAutomationState($conversation, [
            'current_actor' => 'chatbot',
            'state' => 'active',
            'assignment_source' => null,
            'last_event_type' => $eventType,
            'last_event_at' => now()->toIso8601String(),
        ]);
    }

    public function markHumanAssigned(WhatsAppConversation $conversation, string $source = 'human', string $state = 'active'): void
    {
        $this->mergeAutomationState($conversation, [
            'current_actor' => 'human',
            'state' => $state,
            'assignment_source' => $source,
            'last_event_type' => 'conversation_assigned',
            'last_event_at' => now()->toIso8601String(),
        ]);
    }

    public function markHumanReply(WhatsAppConversation $conversation): void
    {
        $this->mergeAutomationState($conversation, [
            'current_actor' => 'human',
            'state' => 'active',
            'assignment_source' => data_get($conversation->metadata, 'automation.assignment_source', 'human'),
            'last_event_type' => 'human_reply_sent',
            'last_event_at' => now()->toIso8601String(),
        ]);
    }

    public function clearHumanAssignment(WhatsAppConversation $conversation): void
    {
        $this->mergeAutomationState($conversation, [
            'current_actor' => null,
            'state' => 'stopped',
            'assignment_source' => null,
            'last_event_type' => 'conversation_unassigned',
            'last_event_at' => now()->toIso8601String(),
        ]);
    }

    public function present(WhatsAppConversation $conversation): ?array
    {
        $automation = data_get($conversation->metadata, 'automation');
        if (!is_array($automation)) {
            $automation = [];
        }

        $actor = $this->normalizeActor($automation['current_actor'] ?? null);
        $state = $this->normalizeState($automation['state'] ?? null);
        $assignmentSource = $this->normalizeAssignmentSource($automation['assignment_source'] ?? null);

        if (!$actor && $conversation->assigned_to) {
            $actor = 'human';
            $state = 'active';
            $assignmentSource = 'human';
        }

        if (!$actor) {
            return null;
        }

        $assigneeName = $this->resolveAssigneeName($conversation);

        return match ($actor) {
            'ai' => [
                'actor' => 'ai',
                'state' => $state ?? 'active',
                'label' => 'AI is replying',
                'description' => 'Automatic replies are active for this chat.',
                'tone' => 'ai',
                'assignment_source' => null,
                'last_event_type' => $automation['last_event_type'] ?? null,
                'last_event_at' => $automation['last_event_at'] ?? null,
            ],
            'chatbot' => [
                'actor' => 'chatbot',
                'state' => $state ?? 'active',
                'label' => 'Chatbot is replying',
                'description' => 'Bot automation is handling this chat.',
                'tone' => 'chatbot',
                'assignment_source' => null,
                'last_event_type' => $automation['last_event_type'] ?? null,
                'last_event_at' => $automation['last_event_at'] ?? null,
            ],
            'human' => $this->presentHumanState($state, $assignmentSource, $assigneeName, $automation),
            default => null,
        };
    }

    protected function presentHumanState(?string $state, ?string $assignmentSource, ?string $assigneeName, array $automation): array
    {
        [$label, $description] = match ($assignmentSource) {
            'chatbot' => [
                'Handed to human by chatbot',
                $assigneeName ? "Assigned to {$assigneeName}." : 'A teammate is now handling this chat.',
            ],
            'auto_assign' => [
                'Assigned automatically',
                $assigneeName ? "Assigned to {$assigneeName}." : 'A teammate was assigned automatically.',
            ],
            'ai' => [
                'Handed to human by AI',
                $assigneeName ? "Assigned to {$assigneeName}." : 'A teammate is now handling this chat.',
            ],
            default => [
                $assigneeName ? "Assigned to {$assigneeName}" : 'Assigned to human',
                $assigneeName ? 'A teammate is handling this chat.' : 'A teammate is handling this chat.',
            ],
        };

        if (($state ?? 'active') === 'stopped' && !$assigneeName) {
            $description = 'This chat is not currently assigned.';
        }

        return [
            'actor' => 'human',
            'state' => $state ?? 'active',
            'label' => $label,
            'description' => $description,
            'tone' => 'human',
            'assignment_source' => $assignmentSource,
            'last_event_type' => $automation['last_event_type'] ?? null,
            'last_event_at' => $automation['last_event_at'] ?? null,
        ];
    }

    protected function mergeAutomationState(WhatsAppConversation $conversation, array $state): void
    {
        $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
        $existing = is_array($metadata['automation'] ?? null) ? $metadata['automation'] : [];
        $next = array_merge($existing, $state);

        if (($next['current_actor'] ?? null) === null) {
            unset($next['current_actor']);
        }

        $metadata['automation'] = $next;
        $conversation->forceFill(['metadata' => $metadata])->save();
        $conversation->refresh();
    }

    protected function resolveAssigneeName(WhatsAppConversation $conversation): ?string
    {
        if (!$conversation->assigned_to) {
            return null;
        }

        if ($conversation->relationLoaded('assignee')) {
            return $conversation->assignee?->name;
        }

        return User::query()->whereKey($conversation->assigned_to)->value('name');
    }

    protected function normalizeActor(mixed $value): ?string
    {
        $actor = strtolower(trim((string) $value));
        return in_array($actor, ['ai', 'chatbot', 'human'], true) ? $actor : null;
    }

    protected function normalizeState(mixed $value): ?string
    {
        $state = strtolower(trim((string) $value));
        return in_array($state, ['active', 'handed_off', 'stopped'], true) ? $state : null;
    }

    protected function normalizeAssignmentSource(mixed $value): ?string
    {
        $source = strtolower(trim((string) $value));
        return in_array($source, ['human', 'chatbot', 'auto_assign', 'ai'], true) ? $source : null;
    }
}
