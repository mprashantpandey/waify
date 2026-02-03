<?php

namespace App\Services\AI;

use App\Models\PlatformSetting;
use App\Modules\Support\Models\SupportMessage;
use App\Modules\Support\Models\SupportThread;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupportAssistantService
{
    public function generateReply(SupportThread $thread, Collection $messages, string $action = 'reply'): string
    {
        $provider = PlatformSetting::get('ai.provider', 'openai');
        $systemPrompt = PlatformSetting::get('ai.system_prompt', $this->defaultSystemPrompt());
        $temperature = (float) PlatformSetting::get('ai.temperature', 0.2);
        $maxTokens = (int) PlatformSetting::get('ai.max_tokens', 300);

        if ($messages->isEmpty()) {
            $prompt = $this->fallbackPrompt($thread, $action);
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

            $prompt = "Thread subject: {$thread->subject}\n\nConversation:\n{$conversation}\n\n";
            $prompt .= match ($action) {
                'summary' => 'Summarize the issue in 3-5 bullet points. Keep it concise.',
                'next_steps' => 'List the next steps in 3-5 bullets for the support agent.',
                default => 'Write a concise, helpful support reply.',
            };
        }

        if ($provider === 'gemini') {
            return $this->generateWithGemini($systemPrompt, $prompt, $temperature, $maxTokens);
        }

        return $this->generateWithOpenAI($systemPrompt, $prompt, $temperature, $maxTokens);
    }

    protected function generateWithOpenAI(string $systemPrompt, string $prompt, float $temperature, int $maxTokens): string
    {
        $apiKey = PlatformSetting::get('ai.openai_api_key');
        $model = PlatformSetting::get('ai.openai_model', 'gpt-4o-mini');

        if (!$apiKey) {
            throw new \RuntimeException('OpenAI API key not configured.');
        }

        $response = Http::withToken($apiKey)
            ->timeout(20)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $prompt]],
                'temperature' => $temperature,
                'max_tokens' => $maxTokens]);

        if (!$response->ok()) {
            throw new \RuntimeException('OpenAI request failed.');
        }

        $content = data_get($response->json(), 'choices.0.message.content', '');
        return Str::of($content)->trim()->toString();
    }

    protected function generateWithGemini(string $systemPrompt, string $prompt, float $temperature, int $maxTokens): string
    {
        $apiKey = PlatformSetting::get('ai.gemini_api_key');
        $model = PlatformSetting::get('ai.gemini_model', 'gemini-1.5-flash');

        if (!$apiKey) {
            throw new \RuntimeException('Gemini API key not configured.');
        }

        $response = Http::timeout(20)
            ->withQueryParameters(['key' => $apiKey])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => "{$systemPrompt}\n\n{$prompt}"]]]],
                'generationConfig' => [
                    'temperature' => $temperature,
                    'maxOutputTokens' => $maxTokens]]);

        if (!$response->ok()) {
            throw new \RuntimeException('Gemini request failed.');
        }

        $content = data_get($response->json(), 'candidates.0.content.parts.0.text', '');
        return Str::of($content)->trim()->toString();
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
