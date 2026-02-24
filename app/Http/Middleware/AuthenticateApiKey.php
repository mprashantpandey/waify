<?php

namespace App\Http\Middleware;

use App\Models\AccountApiKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Resolve account from API key (Bearer or X-API-Key header).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->extractKey($request);
        if ($key === null || $key === '') {
            return response()->json(['error' => 'Missing or invalid API key.'], 401);
        }

        $apiKey = AccountApiKey::findByPlaintext($key);
        if (!$apiKey) {
            return response()->json(['error' => 'Invalid API key.'], 401);
        }

        $account = $apiKey->account;
        if (!$account) {
            return response()->json(['error' => 'Account not found.'], 401);
        }

        if ($account->status === 'disabled') {
            return response()->json(['error' => 'Account is disabled.'], 403);
        }

        $apiKey->touchUsage($request->ip());

        $request->attributes->set('account', $account);
        $request->attributes->set('api_key', $apiKey);
        $request->setUserResolver(fn () => null);

        return $next($request);
    }

    protected function extractKey(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if (is_string($header) && preg_match('/^\s*Bearer\s+(.+)\s*$/i', $header, $m)) {
            return trim($m[1]);
        }
        $key = $request->header('X-API-Key');
        if (is_string($key)) {
            return trim($key);
        }
        return null;
    }
}
