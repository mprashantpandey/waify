<?php

namespace App\Services\AI\Providers;

use App\Services\AI\Contracts\AiProviderInterface;
use Illuminate\Support\Str;
use OpenAI\OpenAI;

class OpenAiProvider implements AiProviderInterface
{
    public function __construct(
        protected string $apiKey,
        protected string $model = 'gpt-4o-mini',
        protected int $timeout = 30
    ) {
    }

    public function generate(string $systemPrompt, string $userPrompt, float $temperature, int $maxTokens): string
    {
        $client = OpenAI::client($this->apiKey);

        $response = $client->chat()->create([
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
        ]);

        $content = $response->choices[0]->message->content ?? '';
        return Str::of($content)->trim()->toString();
    }
}
