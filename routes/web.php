<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\Platform\ImpersonationController;
use App\Http\Controllers\SupportAttachmentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', [\App\Http\Controllers\LandingPageController::class, 'index'])->name('landing');
Route::get('/api/stats', [\App\Http\Controllers\LandingPageController::class, 'stats'])->name('api.stats');

// Public pages
Route::get('/pricing', [\App\Http\Controllers\PublicPagesController::class, 'pricing'])->name('pricing');
Route::get('/privacy', [\App\Http\Controllers\PublicPagesController::class, 'privacy'])->name('privacy');
Route::get('/terms', [\App\Http\Controllers\PublicPagesController::class, 'terms'])->name('terms');
Route::get('/help', [\App\Http\Controllers\PublicPagesController::class, 'help'])->name('help');
Route::get('/faqs', [\App\Http\Controllers\PublicPagesController::class, 'faqs'])->name('faqs');
Route::get('/about', [\App\Http\Controllers\PublicPagesController::class, 'about'])->name('about');
Route::get('/contact', [\App\Http\Controllers\PublicPagesController::class, 'contact'])->name('contact');
Route::post('/contact', [\App\Http\Controllers\PublicPagesController::class, 'contactSubmit'])->name('contact.submit');

// Public widget embeds
Route::get('/widgets/{widget}.js', [\App\Modules\Floaters\Http\Controllers\PublicWidgetController::class, 'script'])->name('widgets.script');
Route::post('/widgets/{widget}/event', [\App\Modules\Floaters\Http\Controllers\PublicWidgetController::class, 'event'])->name('widgets.event');

// Auth routes
require __DIR__.'/auth.php';

// Onboarding (requires auth, no workspace)
Route::middleware(['auth'])->group(function () {
    Route::get('/support/attachments/{attachment}', [SupportAttachmentController::class, 'show'])->name('support.attachments.show');
    Route::post('/impersonate/leave', [ImpersonationController::class, 'leave'])->name('impersonate.leave');
    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

// Platform routes (requires auth + super admin, NO workspace)
Route::middleware(['auth', 'super.admin'])->prefix('/platform')->name('platform.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Platform\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/workspaces', [\App\Http\Controllers\Platform\PlatformWorkspaceController::class, 'index'])->name('workspaces.index');
    Route::get('/workspaces/{workspace}', [\App\Http\Controllers\Platform\PlatformWorkspaceController::class, 'show'])->name('workspaces.show');
    Route::post('/workspaces/{workspace}/impersonate', [ImpersonationController::class, 'start'])->name('workspaces.impersonate');
    Route::post('/workspaces/{workspace}/disable', [\App\Http\Controllers\Platform\PlatformWorkspaceController::class, 'disable'])->name('workspaces.disable');
    Route::post('/workspaces/{workspace}/enable', [\App\Http\Controllers\Platform\PlatformWorkspaceController::class, 'enable'])->name('workspaces.enable');
    Route::get('/users', [\App\Http\Controllers\Platform\PlatformUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [\App\Http\Controllers\Platform\PlatformUserController::class, 'show'])->name('users.show');
    Route::post('/users/{user}/make-super-admin', [\App\Http\Controllers\Platform\PlatformUserController::class, 'makeSuperAdmin'])->name('users.make-super-admin');
    Route::post('/users/{user}/remove-super-admin', [\App\Http\Controllers\Platform\PlatformUserController::class, 'removeSuperAdmin'])->name('users.remove-super-admin');
    Route::get('/settings', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'update'])->name('settings.update');
    Route::get('/modules', [\App\Http\Controllers\Platform\ModuleController::class, 'index'])->name('modules.index');
    Route::post('/modules/{module}/toggle', [\App\Http\Controllers\Platform\ModuleController::class, 'toggle'])->name('modules.toggle');
    Route::patch('/modules/{module}', [\App\Http\Controllers\Platform\ModuleController::class, 'update'])->name('modules.update');
    Route::get('/plans', [\App\Http\Controllers\Platform\PlanController::class, 'index'])->name('plans.index');
    Route::get('/plans/create', [\App\Http\Controllers\Platform\PlanController::class, 'create'])->name('plans.create');
    Route::post('/plans', [\App\Http\Controllers\Platform\PlanController::class, 'store'])->name('plans.store');
    Route::get('/plans/{plan}', [\App\Http\Controllers\Platform\PlanController::class, 'show'])->name('plans.show');
    Route::get('/plans/{plan}/edit', [\App\Http\Controllers\Platform\PlanController::class, 'edit'])->name('plans.edit');
    Route::patch('/plans/{plan}', [\App\Http\Controllers\Platform\PlanController::class, 'update'])->name('plans.update');
    Route::post('/plans/{plan}/toggle', [\App\Http\Controllers\Platform\PlanController::class, 'toggle'])->name('plans.toggle');
    Route::get('/subscriptions', [\App\Http\Controllers\Platform\PlanController::class, 'subscriptions'])->name('subscriptions.index');
    Route::get('/subscriptions/{subscription}', [\App\Http\Controllers\Platform\PlanController::class, 'showSubscription'])->name('subscriptions.show');
    Route::get('/system-health', [\App\Http\Controllers\Platform\SystemHealthController::class, 'index'])->name('system-health');
    Route::get('/analytics', [\App\Http\Controllers\Platform\AnalyticsController::class, 'index'])->name('analytics');
    Route::get('/activity-logs', [\App\Http\Controllers\Platform\ActivityLogController::class, 'index'])->name('activity-logs');
    Route::get('/templates', [\App\Http\Controllers\Platform\TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}', [\App\Http\Controllers\Platform\TemplateController::class, 'show'])->name('templates.show');
    Route::get('/support/hub', [\App\Http\Controllers\Platform\SupportController::class, 'hub'])->name('support.hub');
    Route::get('/support', [\App\Http\Controllers\Platform\SupportController::class, 'index'])->name('support.index');
    Route::get('/support/live', [\App\Http\Controllers\Platform\SupportController::class, 'live'])->name('support.live');
    Route::get('/support/live/list', [\App\Http\Controllers\Platform\SupportController::class, 'liveList'])->name('support.live.list');
    Route::get('/support/live/thread/{thread}', [\App\Http\Controllers\Platform\SupportController::class, 'liveThread'])->name('support.live.thread');
    Route::post('/support/live/message', [\App\Http\Controllers\Platform\SupportController::class, 'liveMessage'])->middleware('throttle:60,1')->name('support.live.message');
    Route::post('/support/{thread}/assistant', [\App\Http\Controllers\Platform\SupportController::class, 'assistant'])->name('support.assistant');
    Route::get('/support/{thread}', [\App\Http\Controllers\Platform\SupportController::class, 'show'])->name('support.show');
    Route::post('/support/{thread}/messages', [\App\Http\Controllers\Platform\SupportController::class, 'message'])->middleware('throttle:60,1')->name('support.message');
    Route::post('/support/{thread}/close', [\App\Http\Controllers\Platform\SupportController::class, 'close'])->middleware('throttle:20,1')->name('support.close');
    Route::post('/support/{thread}/update', [\App\Http\Controllers\Platform\SupportController::class, 'update'])->middleware('throttle:20,1')->name('support.update');
});

// App routes (requires auth + workspace + workspace active + workspace subscribed)
Route::middleware(['auth', 'workspace.resolve', 'workspace.active', 'workspace.subscribed'])->prefix('/app/{workspace}')->name('app.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Modules management
    Route::get('/modules', [WorkspaceController::class, 'modules'])->name('modules');
    Route::post('/modules/{moduleKey}/toggle', [WorkspaceController::class, 'toggleModule'])->name('modules.toggle');
    
    // Billing (always accessible)
    Route::prefix('/settings/billing')->name('billing.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Billing\BillingController::class, 'index'])->name('index');
        Route::get('/plans', [\App\Http\Controllers\Billing\BillingController::class, 'plans'])->name('plans');
        // Razorpay routes - more specific routes first
        Route::post('/plans/{plan}/razorpay/order', [\App\Http\Controllers\Billing\BillingController::class, 'createRazorpayOrder'])
            ->name('razorpay.order');
        Route::post('/plans/{plan}/switch', [\App\Http\Controllers\Billing\BillingController::class, 'switchPlan'])
            ->name('switch-plan');
        Route::post('/razorpay/confirm', [\App\Http\Controllers\Billing\BillingController::class, 'confirmRazorpayPayment'])->name('razorpay.confirm');
        Route::get('/history', [\App\Http\Controllers\Billing\BillingController::class, 'history'])->name('history');
        Route::post('/cancel', [\App\Http\Controllers\Billing\BillingController::class, 'cancel'])->name('cancel');
        Route::post('/resume', [\App\Http\Controllers\Billing\BillingController::class, 'resume'])->name('resume');
        Route::get('/usage', [\App\Http\Controllers\Billing\BillingController::class, 'usage'])->name('usage');
    });
    
    // Module placeholder pages
    Route::get('/whatsapp', [ModuleController::class, 'show'])->name('whatsapp')->defaults('module', 'whatsapp');
    // Templates route removed - using app.whatsapp.templates.index instead
    Route::get('/chatbots', [ModuleController::class, 'show'])->name('chatbots')->defaults('module', 'chatbots');
    Route::get('/ai', [ModuleController::class, 'show'])->name('ai')->defaults('module', 'ai');
    
    // Load module routes (WhatsApp, Chatbots, etc.)
    if (file_exists(__DIR__.'/../app/Modules/WhatsApp/routes/web.php')) {
        require __DIR__.'/../app/Modules/WhatsApp/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Support/routes/web.php')) {
        require __DIR__.'/../app/Modules/Support/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Broadcasts/routes/web.php')) {
        require __DIR__.'/../app/Modules/Broadcasts/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Contacts/routes/web.php')) {
        require __DIR__.'/../app/Modules/Contacts/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Floaters/routes/web.php')) {
        require __DIR__.'/../app/Modules/Floaters/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Analytics/routes/web.php')) {
        require __DIR__.'/../app/Modules/Analytics/routes/web.php';
    }
    
    // Team management
    Route::prefix('/team')->name('team.')->group(function () {
        Route::get('/', [\App\Http\Controllers\TeamController::class, 'index'])->name('index');
        Route::post('/invite', [\App\Http\Controllers\TeamController::class, 'invite'])->name('invite');
        Route::post('/invites/{invitation}/resend', [\App\Http\Controllers\TeamController::class, 'resendInvite'])->name('invites.resend');
        Route::delete('/invites/{invitation}', [\App\Http\Controllers\TeamController::class, 'revokeInvite'])->name('invites.revoke');
        Route::post('/{user}/update-role', [\App\Http\Controllers\TeamController::class, 'updateRole'])->name('update-role');
        Route::delete('/{user}/remove', [\App\Http\Controllers\TeamController::class, 'remove'])->name('remove');
    });
    
    // Activity Logs
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs');
});

// Workspace switching
Route::middleware(['auth'])->group(function () {
    Route::post('/workspaces/{workspace}/switch', [WorkspaceController::class, 'switch'])->name('workspaces.switch');
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::patch('/password', [\App\Http\Controllers\Auth\PasswordController::class, 'update'])->name('password.update');
});

// Broadcasting auth (customized logging; overrides default route)
Route::middleware(['web', 'auth'])->post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
    \Log::debug('Broadcast auth request', [
        'user_id' => $request->user()?->id,
        'channel' => $request->input('channel_name'),
        'socket_id' => $request->input('socket_id'),
        'session_id' => $request->session()->getId(),
        'host' => $request->getHost(),
    ]);

    try {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
        \Log::warning('Broadcast auth denied', [
            'user_id' => $request->user()?->id,
            'channel' => $request->input('channel_name'),
            'socket_id' => $request->input('socket_id'),
            'error' => $e->getMessage(),
        ]);
        throw $e;
    }
})->name('broadcasting.auth');

// Settings route (unified settings page)
Route::middleware(['auth', 'workspace.resolve'])->prefix('/app/{workspace}')->name('app.')->group(function () {
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
});

// Webhook routes (public, no auth, but with security middleware)
Route::prefix('/webhooks/whatsapp')
    ->middleware([\App\Modules\WhatsApp\Http\Middleware\WebhookSecurity::class])
    ->name('webhooks.whatsapp.')
    ->group(function () {
        Route::get('/{connection}', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'verify'])->name('verify');
        Route::post('/{connection}', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'receive'])->name('receive');
    });

// Razorpay webhook (public)
Route::post('/webhooks/razorpay', [\App\Http\Controllers\Billing\RazorpayWebhookController::class, 'handle'])
    ->name('webhooks.razorpay');
