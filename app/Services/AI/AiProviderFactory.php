<?php

namespace App\Services\AI;

use App\Models\PlatformSetting;
use App\Services\AI\Contracts\AiProviderInterface;
use App\Services\AI\Providers\AnthropicProvider;
use App\Services\AI\Providers\GeminiProvider;
use App\Services\AI\Providers\OpenAiProvider;
use RuntimeException;

class AiProviderFactory
{
    protected static int $timeout = 30;

    public static function fromPlatformSettings(): AiProviderInterface
    {
        $provider = PlatformSetting::get('ai.provider', config('ai.provider', 'openai'));
        $temperature = (float) PlatformSetting::get('ai.temperature', config('ai.temperature', 0.2));
        $maxTokens = (int) PlatformSetting::get('ai.max_tokens', config('ai.max_tokens', 300));

        return match ($provider) {
            'openai' => new OpenAiProvider(
                apiKey: PlatformSetting::get('ai.openai_api_key') ?: config('ai.openai.api_key') ?: throw new RuntimeException('OpenAI API key not configured.'),
                model: PlatformSetting::get('ai.openai_model', config('ai.openai.model', 'gpt-4o-mini')),
                timeout: self::$timeout
            ),
            'anthropic' => new AnthropicProvider(
                apiKey: PlatformSetting::get('ai.anthropic_api_key') ?: config('ai.anthropic.api_key') ?: throw new RuntimeException('Anthropic API key not configured.'),
                model: PlatformSetting::get('ai.anthropic_model', config('ai.anthropic.model', 'claude-3-5-haiku-20241022')),
                version: config('ai.anthropic.version', '2023-06-01'),
                timeout: self::$timeout
            ),
            'gemini' => new GeminiProvider(
                apiKey: PlatformSetting::get('ai.gemini_api_key') ?: config('ai.gemini.api_key') ?: throw new RuntimeException('Gemini API key not configured.'),
                model: self::normalizeGeminiModel(PlatformSetting::get('ai.gemini_model', config('ai.gemini.model', 'gemini-2.0-flash'))),
                timeout: self::$timeout
            ),
            default => throw new RuntimeException("Unknown AI provider: {$provider}"),
        };
    }

    protected static function normalizeGeminiModel(mixed $configuredModel): string
    {
        $model = trim((string) $configuredModel);
        if ($model === '') {
            return 'gemini-2.0-flash';
        }

        // Keep tenants on a widely available free-tier-friendly model.
        if (in_array(strtolower($model), ['gemini-pro', 'gemini-1.5-flash'], true)) {
            return 'gemini-2.0-flash';
        }

        return $model;
    }
}
