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
        
        // Apply maintenance mode check (before auth)
        $middleware->web(prepend: [
            \App\Http\Middleware\EnsureMaintenanceMode::class,
        ]);
        
        // Exclude broadcasting/auth and webhooks from CSRF verification
        // Broadcasting uses its own authentication mechanism
        // Webhooks are verified via signature/token
        $middleware->validateCsrfTokens(except: [
            'broadcasting/auth',
            'webhooks/*',
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
            if ($request->header('X-Inertia') && ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException || ($e instanceof \Illuminate\Http\Exceptions\HttpException && $e->getStatusCode() === 404))) {
                return \Inertia\Inertia::render('Error/NotFound')->toResponse($request)->setStatusCode(404);
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
