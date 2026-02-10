<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AiProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GeminiProvider implements AiProviderInterface
{
    public function __construct(
        protected string $apiKey,
        protected string $model = 'gemini-1.5-flash',
        protected int $timeout = 30
    ) {
    }

    public function generate(string $systemPrompt, string $userPrompt, float $temperature, int $maxTokens): string
    {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent";

        $response = Http::timeout($this->timeout)
            ->withQueryParameters(['key' => $this->apiKey])
            ->post($url, [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $systemPrompt . "\n\n" . $userPrompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => $temperature,
                    'maxOutputTokens' => $maxTokens,
                ],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Gemini request failed: ' . ($response->json('error.message') ?? $response->body()));
        }

        $content = $response->json('candidates.0.content.parts.0.text', '');
        return Str::of($content)->trim()->toString();
    }
}
