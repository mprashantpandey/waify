<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    // Broadcasting channels are loaded manually in routes/web.php
    // ->withBroadcasting(__DIR__.'/../routes/channels.php', [
    //     'middleware' => ['web', 'auth'],
    // ])
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\ApplyPlatformSettings::class,
            \App\Http\Middleware\EnforceRateLimits::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        
        // Request correlation ID first (so all logs can include it)
        $middleware->web(prepend: [
            \App\Http\Middleware\AddRequestCorrelationId::class,
            \App\Http\Middleware\EnsureMaintenanceMode::class,
        ]);
        
        // Exclude broadcasting/auth and webhooks from CSRF verification
        // Broadcasting uses its own authentication mechanism
        // Webhooks are verified via signature/token
        $middleware->validateCsrfTokens(except: [
            'broadcasting/auth',
            'webhooks/*',
            'api/v1/*',
        ]);

        $middleware->alias([
            'account.resolve' => \App\Http\Middleware\ResolveAccount::class,
            'module.enabled' => \App\Http\Middleware\EnsureModuleEnabled::class,
            'super.admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
            'account.active' => \App\Http\Middleware\EnsureAccountActive::class,
            'account.subscribed' => \App\Http\Middleware\EnsureAccountSubscribed::class,
            'module.entitled' => \App\Http\Middleware\EnsureModuleEntitled::class,
            'rate.limit' => \App\Http\Middleware\EnforceRateLimits::class,
            'profile.complete' => \App\Http\Middleware\EnsureProfileComplete::class,
            'feature.enabled' => \App\Http\Middleware\EnsureFeatureEnabled::class,
            'webhooks.enabled' => \App\Http\Middleware\EnsureWebhooksEnabled::class,
            'public-api.enabled' => \App\Http\Middleware\EnsurePublicApiEnabled::class,
            'log.api' => \App\Http\Middleware\LogApiRequests::class,
            'restrict.chat.agent' => \App\Http\Middleware\RestrictChatAgentAccess::class,
            'tenant.phone.verified' => \App\Http\Middleware\EnsurePhoneVerifiedForTenant::class,
            'api.key' => \App\Http\Middleware\AuthenticateApiKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle unauthenticated exceptions for Inertia requests
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            // Check if it's an authentication exception and an Inertia request
            if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                if ($request->header('X-Inertia')) {
                    return \Inertia\Inertia::location('/login');
                }
                // For non-Inertia requests, let Laravel handle it (will return JSON or redirect)
                return null;
            }

            // Return Inertia 404 page for Inertia requests so the client doesn't crash (e.g. "Cannot read properties of null (reading 'component')")
            $is404 = $e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
                || ($e instanceof \Illuminate\Http\Exceptions\HttpException && $e->getStatusCode() === 404)
                || $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException
                || (method_exists($e, 'getStatusCode') && $e->getStatusCode() === 404);
            if ($request->header('X-Inertia') && $is404) {
                return \Inertia\Inertia::render('Error/NotFound')->toResponse($request)->setStatusCode(404);
            }

            // Return Inertia 403 page for Inertia requests
            $is403 = ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException && $e->getStatusCode() === 403)
                || (method_exists($e, 'getStatusCode') && $e->getStatusCode() === 403);
            if ($request->header('X-Inertia') && $is403) {
                return \Inertia\Inertia::render('Error/Forbidden')->toResponse($request)->setStatusCode(403);
            }

            // Let Laravel/Inertia handle validation errors normally (422 + error bags).
            // If we treat these as 500s, login/register/auth validation failures appear as server crashes.
            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return null;
            }

            // Return Inertia 500 page for Inertia requests so users see a friendly message
            $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
            $is500 = $statusCode >= 500 || !method_exists($e, 'getStatusCode');
            if ($request->header('X-Inertia') && $is500) {
                $context = [
                    'path' => $request->path(),
                    'method' => $request->method(),
                ];
                if ($request->user()) {
                    $context['user_id'] = $request->user()->id;
                }
                if ($request->attributes->get('account')) {
                    $context['account_id'] = $request->attributes->get('account')->id;
                }
                if ($request->attributes->has('webhook_correlation_id')) {
                    $context['correlation_id'] = $request->attributes->get('webhook_correlation_id');
                }
                if ($request->attributes->has(\App\Http\Middleware\AddRequestCorrelationId::REQUEST_ID_ATTRIBUTE)) {
                    $context['request_id'] = $request->attributes->get(\App\Http\Middleware\AddRequestCorrelationId::REQUEST_ID_ATTRIBUTE);
                }
                \Illuminate\Support\Facades\Log::error('Server error (Inertia)', array_merge($context, [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]));
                return \Inertia\Inertia::render('Error/ServerError')->toResponse($request)->setStatusCode(500);
            }
            
            // Don't leak stack traces in production
            if (app()->environment('production')) {
                // For webhook routes, always return generic errors
                if ($request->is('webhooks/*')) {
                    return response()->json([
                        'success' => false,
                        'error' => 'An error occurred processing the webhook',
                    ], 500);
                }

                // For API routes, return JSON errors without stack traces
                // Only handle if it's not already handled by Laravel's default handler
                if ($request->expectsJson() && !$request->header('X-Inertia')) {
                    $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                    return response()->json([
                        'message' => $e->getMessage() ?: 'Server error',
                        'error' => 'Server error',
                    ], $statusCode);
                }
            }
            
            return null; // Let Laravel handle other exceptions
        });
    })->create();
