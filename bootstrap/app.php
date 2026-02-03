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
        
        // Exclude broadcasting/auth from CSRF verification
        // Broadcasting uses its own authentication mechanism
        $middleware->validateCsrfTokens(except: [
            'broadcasting/auth',
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
