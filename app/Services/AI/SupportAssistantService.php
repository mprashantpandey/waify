<?php

namespace App\Services\AI;

use App\Modules\Support\Models\SupportMessage;
use App\Modules\Support\Models\SupportThread;
use Illuminate\Support\Collection;

class SupportAssistantService
{
    public function generateReply(SupportThread $thread, Collection $messages, string $action = 'reply'): string
    {
        $provider = AiProviderFactory::fromPlatformSettings();
        $systemPrompt = \App\Models\PlatformSetting::get('ai.system_prompt', $this->defaultSystemPrompt());
        $temperature = (float) \App\Models\PlatformSetting::get('ai.temperature', 0.2);
        $maxTokens = (int) \App\Models\PlatformSetting::get('ai.max_tokens', 300);

        if ($messages->isEmpty()) {
            $userPrompt = $this->fallbackPrompt($thread, $action);
        } else {
            $conversation = $messages
                ->map(function (SupportMessage $message) {
                    $label = match ($message->sender_type) {
                        'admin' => 'Support',
                        'bot' => 'Assistant',
                        'system' => 'System',
                        default => 'Customer',
                    };
                    return "{$label}: {$message->body}";
                })
                ->implode("\n");

            $userPrompt = "Thread subject: {$thread->subject}\n\nConversation:\n{$conversation}\n\n";
            $userPrompt .= match ($action) {
                'summary' => 'Summarize the issue in 3-5 bullet points. Keep it concise.',
                'next_steps' => 'List the next steps in 3-5 bullets for the support agent.',
                default => 'Write a concise, helpful support reply.',
            };
        }

        return $provider->generate($systemPrompt, $userPrompt, $temperature, $maxTokens);
    }

    protected function defaultSystemPrompt(): string
    {
        return 'You are a helpful, concise support assistant. Ask clarifying questions if needed, avoid promises, and keep replies friendly and actionable.';
    }

    protected function fallbackPrompt(SupportThread $thread, string $action): string
    {
        return match ($action) {
            'summary' => 'There are no messages yet. Summarize the thread as: "No customer messages yet."',
            'next_steps' => 'There are no messages yet. Provide next steps: ask the customer to share details, steps to reproduce, and relevant screenshots/logs.',
            default => "No messages yet for subject \"{$thread->subject}\". Draft a friendly opener asking the customer to describe the issue and desired outcome.",
        };
    }
}
