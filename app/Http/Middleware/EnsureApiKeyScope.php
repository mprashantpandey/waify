<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiKeyScope
{
    public function handle(Request $request, Closure $next, string $scope): Response
    {
        $apiKey = $request->attributes->get('api_key');

        if (!$apiKey) {
            return response()->json(['error' => 'API key context missing.'], 401);
        }

        if (!method_exists($apiKey, 'hasScope') || !$apiKey->hasScope($scope)) {
            return response()->json([
                'error' => 'Insufficient API key scope.',
                'required_scope' => $scope,
            ], 403);
        }

        return $next($request);
    }
}

