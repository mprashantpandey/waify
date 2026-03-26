<?php

namespace App\Modules\WhatsApp\Support;

use Illuminate\Http\Request;
use Throwable;

class WebhookLogSanitizer
{
    public static function requestContext(Request $request, array $extra = []): array
    {
        return array_filter(array_merge([
            'method' => $request->method(),
            'path' => $request->path(),
            'ip' => $request->ip(),
            'user_agent' => self::truncate($request->userAgent(), 80),
            'signature_present' => $request->header('X-Hub-Signature-256') !== null,
        ], $extra), static fn ($value) => $value !== null);
    }

    public static function verifyAttemptContext(Request $request, ?string $mode, ?string $challenge, bool $tokenConfigured): array
    {
        return self::requestContext($request, [
            'mode' => $mode,
            'has_challenge' => !empty($challenge),
            'verify_token_configured' => $tokenConfigured,
        ]);
    }

    public static function exceptionContext(Throwable $exception, array $extra = []): array
    {
        return array_merge([
            'exception' => $exception::class,
            'file' => basename($exception->getFile()),
            'line' => $exception->getLine(),
        ], $extra);
    }

    public static function authChannelContext(?int $userId, string $channel, array $extra = []): array
    {
        return array_merge([
            'user_id' => $userId,
            'channel' => self::truncate($channel, 120),
        ], $extra);
    }

    private static function truncate(?string $value, int $limit): ?string
    {
        if ($value === null) {
            return null;
        }

        return mb_substr($value, 0, $limit);
    }
}
