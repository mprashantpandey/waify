<?php

namespace App\Services\AI;

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Support\Collection;

class ConversationAssistantService
{
    /**
     * Generate a suggested reply for the agent based on recent conversation messages.
     */
    public function suggestReply(
        WhatsAppConversation $conversation,
        int $lastMessagesLimit = 25,
        ?string $customInstruction = null
    ): string
    {
        $provider = AiProviderFactory::fromPlatformSettings();
        $systemPrompt = \App\Models\PlatformSetting::get('ai.system_prompt', $this->defaultSystemPrompt());
        $systemPrompt = $this->applyCustomInstruction($systemPrompt, $customInstruction);
        $temperature = (float) \App\Models\PlatformSetting::get('ai.temperature', 0.3);
        $maxTokens = (int) \App\Models\PlatformSetting::get('ai.max_tokens', 250);

        $conversation->loadMissing(['contact']);
        $contactName = $conversation->contact?->name ?? $conversation->contact?->wa_id ?? 'Customer';

        $messages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->orderBy('created_at', 'desc')
            ->limit($lastMessagesLimit)
            ->get(['direction', 'text_body', 'type', 'created_at'])
            ->reverse()
            ->values();

        $conversationText = $this->formatMessagesForPrompt($messages);
        $userPrompt = $this->buildUserPrompt($contactName, $conversationText);

        return $provider->generate($systemPrompt, $userPrompt, $temperature, $maxTokens);
    }

    protected function applyCustomInstruction(string $systemPrompt, ?string $customInstruction): string
    {
        $customInstruction = trim((string) $customInstruction);
        if ($customInstruction === '') {
            return $systemPrompt;
        }

        return $systemPrompt . "\n\nAdditional agent instruction:\n" . $customInstruction;
    }

    protected function formatMessagesForPrompt(Collection $messages): string
    {
        $lines = [];
        foreach ($messages as $msg) {
            $label = $msg->direction === 'inbound' ? 'Customer' : 'Agent';
            $body = $msg->text_body ?? $this->summarizeNonTextMessage($msg->type);
            $body = trim((string) $body);
            if ($body !== '') {
                $lines[] = "{$label}: {$body}";
            }
        }
        return implode("\n", $lines);
    }

    protected function summarizeNonTextMessage(string $type): string
    {
        return match ($type) {
            'image' => '[Image]',
            'audio', 'video' => '[Media]',
            'document' => '[Document]',
            'location' => '[Location]',
            'interactive', 'button' => '[Interactive message]',
            'template' => '[Template message]',
            default => '[Message]',
        };
    }

    protected function buildUserPrompt(string $contactName, string $conversationText): string
    {
        if ($conversationText === '') {
            return "WhatsApp chat with {$contactName}. No messages yet. Suggest a brief, friendly opening message to start the conversation.";
        }
        return "WhatsApp chat with {$contactName}.\n\nRecent messages:\n{$conversationText}\n\nSuggest a short, helpful reply as the agent (1-3 sentences). Keep it conversational and on-topic. Do not include greetings like 'Hi' at the start if the conversation is already ongoing.";
    }

    protected function defaultSystemPrompt(): string
    {
        return 'You are a helpful assistant suggesting reply text for support agents in WhatsApp conversations. Output only the suggested reply text, nothing else. Be concise, professional, and friendly. Do not add quotes or labels.';
    }
}
