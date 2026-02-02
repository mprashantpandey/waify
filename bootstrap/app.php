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
    ->withBroadcasting(__DIR__.'/../routes/channels.php', [
        'middleware' => ['web', 'auth'],
        'prefix' => '__broadcasting',
    ])
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

            $middleware->alias([
                'workspace.resolve' => \App\Http\Middleware\ResolveWorkspace::class,
                'workspace.selected' => \App\Http\Middleware\EnsureWorkspaceSelected::class,
                'module.enabled' => \App\Http\Middleware\EnsureModuleEnabled::class,
                'super.admin' => \App\Http\Middleware\EnsureSuperAdmin::class,
                'workspace.active' => \App\Http\Middleware\EnsureWorkspaceActive::class,
                'workspace.subscribed' => \App\Http\Middleware\EnsureWorkspaceSubscribed::class,
                'module.entitled' => \App\Http\Middleware\EnsureModuleEntitled::class,
                'rate.limit' => \App\Http\Middleware\EnforceRateLimits::class,
            ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Don't leak stack traces in production
        if (app()->environment('production')) {
            $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
                // For webhook routes, always return generic errors
                if ($request->is('webhooks/*')) {
                    return response()->json([
                        'success' => false,
                        'error' => 'An error occurred processing the webhook',
                    ], 500);
                }

                // For API routes, return JSON errors without stack traces
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => $e->getMessage(),
                        'error' => app()->environment('local') ? $e->getTraceAsString() : 'Server error',
                    ], 500);
                }
            });
        }
    })->create();
