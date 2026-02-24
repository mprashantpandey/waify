<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\Platform\ImpersonationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', [\App\Http\Controllers\LandingPageController::class, 'index'])->name('landing');
Route::get('/api/stats', [\App\Http\Controllers\LandingPageController::class, 'stats'])
    ->middleware(['throttle:60,1', 'log.api'])
    ->name('api.stats');

// Tenant external API (v1) – authenticated by API key
Route::prefix('api/v1')->middleware(['api.key', 'throttle:60,1'])->group(function () {
    Route::get('/account', [\App\Http\Controllers\Api\V1\AccountApiController::class, 'show'])->middleware('api.scope:account.read');
    Route::get('/connections', [\App\Http\Controllers\Api\V1\ConnectionsApiController::class, 'index'])->middleware('api.scope:connections.read');
    Route::get('/contacts', [\App\Http\Controllers\Api\V1\ContactsApiController::class, 'index'])->middleware('api.scope:contacts.read');
    Route::get('/conversations', [\App\Http\Controllers\Api\V1\ConversationsApiController::class, 'index'])->middleware('api.scope:conversations.read');
});

// Public pages
Route::get('/pricing', [\App\Http\Controllers\PublicPagesController::class, 'pricing'])->name('pricing');
Route::get('/privacy', [\App\Http\Controllers\PublicPagesController::class, 'privacy'])->name('privacy');
Route::get('/terms', [\App\Http\Controllers\PublicPagesController::class, 'terms'])->name('terms');
Route::get('/cookie-policy', [\App\Http\Controllers\PublicPagesController::class, 'cookiePolicy'])->name('cookie-policy');
Route::get('/refund-policy', [\App\Http\Controllers\PublicPagesController::class, 'refundPolicy'])->name('refund-policy');
Route::get('/help', [\App\Http\Controllers\PublicPagesController::class, 'help'])->name('help');
Route::get('/faqs', [\App\Http\Controllers\PublicPagesController::class, 'faqs'])->name('faqs');
Route::get('/about', [\App\Http\Controllers\PublicPagesController::class, 'about'])->name('about');
Route::get('/contact', [\App\Http\Controllers\PublicPagesController::class, 'contact'])->name('contact');
Route::post('/contact', [\App\Http\Controllers\PublicPagesController::class, 'contactSubmit'])
        ->middleware('throttle:5,1')
        ->name('contact.submit');

// Public widget embeds
Route::get('/widgets/{widget}.js', [\App\Modules\Floaters\Http\Controllers\PublicWidgetController::class, 'script'])->name('widgets.script');
Route::post('/widgets/{widget}/event', [\App\Modules\Floaters\Http\Controllers\PublicWidgetController::class, 'event'])
    ->middleware('throttle:60,1')
    ->name('widgets.event');

// Auth routes
require __DIR__.'/auth.php';

// Legacy dashboard route retained for auth/verification redirects and old links.
Route::middleware(['auth'])->get('/dashboard', function (\Illuminate\Http\Request $request) {
    $user = $request->user();

    if ($user?->isSuperAdmin()) {
        return redirect()->route('platform.dashboard');
    }

    $hasAccounts = $user
        ? ($user->ownedAccounts()->exists() || $user->accounts()->exists())
        : false;

    return $hasAccounts
        ? redirect()->route('app.dashboard')
        : redirect()->route('onboarding');
})->name('dashboard');

// CSRF token refresh endpoint (no auth required, but session must be valid)
// This allows refreshing CSRF tokens even when user is not authenticated
Route::get('/csrf-token/refresh', [\App\Http\Controllers\CsrfTokenController::class, 'refresh'])->name('csrf-token.refresh');

// Onboarding (requires auth, no account)
Route::middleware(['auth'])->group(function () {
    Route::get('/support/attachments/{attachment}', [\App\Http\Controllers\SupportAttachmentController::class, 'show'])->name('support.attachments.show');
    Route::post('/impersonate/leave', [ImpersonationController::class, 'leave'])->name('impersonate.leave');
    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

// Platform routes (requires auth + super admin, NO account)
Route::middleware(['auth', 'super.admin'])->prefix('/platform')->name('platform.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Platform\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/accounts', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'index'])->name('accounts.index');
    Route::get('/accounts/{account}', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'show'])->name('accounts.show');
    Route::post('/accounts/{account}/billing-profile', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'updateBillingProfile'])->name('accounts.billing-profile.update');
    Route::post('/accounts/{account}/impersonate', [ImpersonationController::class, 'start'])->name('accounts.impersonate');
    Route::post('/accounts/{account}/disable', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'disable'])->name('accounts.disable');
    Route::post('/accounts/{account}/enable', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'enable'])->name('accounts.enable');
    Route::get('/users', [\App\Http\Controllers\Platform\PlatformUserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [\App\Http\Controllers\Platform\PlatformUserController::class, 'show'])->name('users.show');
    Route::post('/users/{user}/make-super-admin', [\App\Http\Controllers\Platform\PlatformUserController::class, 'makeSuperAdmin'])->name('users.make-super-admin');
    Route::post('/users/{user}/remove-super-admin', [\App\Http\Controllers\Platform\PlatformUserController::class, 'removeSuperAdmin'])->name('users.remove-super-admin');
    Route::get('/settings', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'index'])->name('settings');
    Route::get('/settings/{section}', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'index'])
        ->where('section', 'core|security|payments|integrations|operations|delivery')
        ->name('settings.section');
    Route::post('/settings', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/mail/test', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'testMail'])->name('settings.mail.test');
    Route::get('/cms', [\App\Http\Controllers\Platform\CmsPageController::class, 'index'])->name('cms.index');
    Route::post('/cms', [\App\Http\Controllers\Platform\CmsPageController::class, 'update'])->name('cms.update');
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
    Route::get('/transactions', [\App\Http\Controllers\Platform\TransactionController::class, 'index'])->name('transactions.index');
    Route::get('/support/hub', [\App\Http\Controllers\Platform\SupportDeskController::class, 'hub'])->name('support.hub');
    Route::get('/support', [\App\Http\Controllers\Platform\SupportDeskController::class, 'index'])->name('support.index');
    Route::get('/support/{thread}', [\App\Http\Controllers\Platform\SupportDeskController::class, 'show'])->name('support.show');
    Route::post('/support/{thread}/messages', [\App\Http\Controllers\Platform\SupportDeskController::class, 'message'])->name('support.message');
    Route::post('/support/{thread}/update', [\App\Http\Controllers\Platform\SupportDeskController::class, 'update'])->name('support.update');
    Route::get('/meta-pricing', [\App\Http\Controllers\Platform\MetaPricingController::class, 'index'])->name('meta-pricing.index');
    Route::post('/meta-pricing', [\App\Http\Controllers\Platform\MetaPricingController::class, 'store'])->name('meta-pricing.store');
    Route::post('/meta-pricing/import-legacy', [\App\Http\Controllers\Platform\MetaPricingController::class, 'importLegacy'])->name('meta-pricing.import-legacy');
    Route::put('/meta-pricing/{version}', [\App\Http\Controllers\Platform\MetaPricingController::class, 'update'])->name('meta-pricing.update');
    Route::post('/meta-pricing/{version}/toggle', [\App\Http\Controllers\Platform\MetaPricingController::class, 'toggle'])->name('meta-pricing.toggle');
    Route::post('/meta-pricing/billing/{billing}/recalculate', [\App\Http\Controllers\Platform\MetaPricingController::class, 'recalculateBillingSnapshot'])->name('meta-pricing.billing.recalculate');
    Route::post('/meta-pricing/billing/recalculate-bulk', [\App\Http\Controllers\Platform\MetaPricingController::class, 'bulkRecalculateBillingSnapshots'])->name('meta-pricing.billing.recalculate-bulk');
    Route::post('/accounts/{account}/wallet/credit', [\App\Http\Controllers\Platform\TransactionController::class, 'credit'])->name('accounts.wallet.credit');
    Route::post('/accounts/{account}/wallet/debit', [\App\Http\Controllers\Platform\TransactionController::class, 'debit'])->name('accounts.wallet.debit');
    Route::get('/system-health', [\App\Http\Controllers\Platform\SystemHealthController::class, 'index'])->name('system-health');
    Route::get('/analytics', [\App\Http\Controllers\Platform\AnalyticsController::class, 'index'])
        ->middleware('feature.enabled:analytics')
        ->name('analytics');
    Route::get('/activity-logs', [\App\Http\Controllers\Platform\ActivityLogController::class, 'index'])->name('activity-logs');
    Route::get('/templates', [\App\Http\Controllers\Platform\TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}', [\App\Http\Controllers\Platform\TemplateController::class, 'show'])->name('templates.show');
});

// App routes (requires auth + account + account active + account subscribed)
// restrict.chat.agent: chat agents (role member) only see Inbox; others have full access
Route::middleware(['auth', 'account.resolve', 'account.active', 'account.subscribed', 'tenant.phone.verified', 'restrict.chat.agent'])->prefix('/app')->name('app.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Modules management
    Route::get('/modules', [AccountController::class, 'modules'])->name('modules');
    Route::post('/modules/{moduleKey}/toggle', [AccountController::class, 'toggleModule'])->name('modules.toggle');
    
    // Billing (always accessible)
    Route::prefix('/settings/billing')->name('billing.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Billing\BillingController::class, 'index'])->name('index');
        Route::get('/plans', [\App\Http\Controllers\Billing\BillingController::class, 'plans'])->name('plans');
        // Razorpay routes - more specific routes first (throttled to limit abuse)
        Route::post('/plans/{plan}/razorpay/order', [\App\Http\Controllers\Billing\BillingController::class, 'createRazorpayOrder'])
            ->middleware('throttle:10,1')
            ->name('razorpay.order');
        Route::post('/plans/{plan}/switch', [\App\Http\Controllers\Billing\BillingController::class, 'switchPlan'])
            ->middleware('throttle:10,1')
            ->name('switch-plan');
        Route::post('/razorpay/confirm', [\App\Http\Controllers\Billing\BillingController::class, 'confirmRazorpayPayment'])
            ->middleware('throttle:10,1')
            ->name('razorpay.confirm');
        Route::get('/history', [\App\Http\Controllers\Billing\BillingController::class, 'history'])->name('history');
        Route::get('/transactions', [\App\Http\Controllers\Billing\BillingController::class, 'transactions'])->name('transactions');
        Route::post('/wallet/topup', [\App\Http\Controllers\Billing\BillingController::class, 'walletTopup'])->name('wallet.topup');
        Route::post('/wallet/topup/confirm', [\App\Http\Controllers\Billing\BillingController::class, 'confirmWalletTopup'])->name('wallet.topup.confirm');
        Route::post('/cancel', [\App\Http\Controllers\Billing\BillingController::class, 'cancel'])->name('cancel');
        Route::post('/resume', [\App\Http\Controllers\Billing\BillingController::class, 'resume'])->name('resume');
        Route::get('/usage', [\App\Http\Controllers\Billing\BillingController::class, 'usage'])->name('usage');
    });
    
    // Module placeholder pages
    Route::get('/whatsapp', [ModuleController::class, 'show'])->name('whatsapp')->defaults('module', 'whatsapp');

    // AI module (requires AI entitlement)
    Route::middleware(['module.entitled:ai'])->prefix('ai')->name('ai.')->group(function () {
        Route::get('/', [\App\Modules\AI\Http\Controllers\AiController::class, 'index'])->name('index');
        Route::post('/settings', [\App\Modules\AI\Http\Controllers\AiController::class, 'updateSettings'])->name('settings');
    });
    
    // Load module routes (WhatsApp, Chatbots, etc.)
    if (file_exists(__DIR__.'/../app/Modules/WhatsApp/routes/web.php')) {
        require __DIR__.'/../app/Modules/WhatsApp/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Chatbots/routes/web.php')) {
        require __DIR__.'/../app/Modules/Chatbots/routes/web.php';
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
    if (file_exists(__DIR__.'/../app/Modules/Developer/routes/web.php')) {
        require __DIR__.'/../app/Modules/Developer/routes/web.php';
    }

    // Team management
    Route::prefix('/team')->name('team.')->group(function () {
        Route::get('/', [\App\Http\Controllers\TeamController::class, 'index'])->name('index');
        Route::post('/invite', [\App\Http\Controllers\TeamController::class, 'invite'])->middleware('throttle:10,1')->name('invite');
        Route::post('/invites/{invitation}/resend', [\App\Http\Controllers\TeamController::class, 'resendInvite'])->middleware('throttle:10,1')->name('invites.resend');
        Route::delete('/invites/{invitation}', [\App\Http\Controllers\TeamController::class, 'revokeInvite'])->name('invites.revoke');
        Route::post('/{user}/update-role', [\App\Http\Controllers\TeamController::class, 'updateRole'])->name('update-role');
        Route::delete('/{user}/remove', [\App\Http\Controllers\TeamController::class, 'remove'])->name('remove');
    });
    
    // Activity Logs
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs');

    // Core Support Tickets (tenant-facing)
    Route::prefix('/support')->name('support.')->group(function () {
        Route::get('/hub', [\App\Http\Controllers\SupportTicketController::class, 'hub'])->name('hub');
        Route::get('/', [\App\Http\Controllers\SupportTicketController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\SupportTicketController::class, 'store'])->name('store');
        Route::get('/{thread}', [\App\Http\Controllers\SupportTicketController::class, 'show'])->name('show');
        Route::post('/{thread}/messages', [\App\Http\Controllers\SupportTicketController::class, 'message'])->name('message');
        Route::post('/{thread}/close', [\App\Http\Controllers\SupportTicketController::class, 'close'])->name('close');
        Route::post('/{thread}/reopen', [\App\Http\Controllers\SupportTicketController::class, 'reopen'])->name('reopen');
    });
});

// Account switching
Route::middleware('auth')->prefix('/app')->name('app.')->group(function () {
    Route::post('/accounts/{account}/switch', [AccountController::class, 'switch'])->name('accounts.switch');
});

// Profile routes (password.update is defined in auth.php)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Broadcasting auth - custom route to ensure channels are loaded
Route::middleware(['web', 'auth'])->post('/broadcasting/auth', function (\Illuminate\Http\Request $request) {
    $user = $request->user();
    $channelName = $request->input('channel_name');
    
    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 403);
    }
    
    // Ensure channels are loaded - Broadcast::channel() registers them on the default broadcaster
    // The channels file should be loaded via withBroadcasting() or we need to load it here
    // Since we disabled withBroadcasting(), we need to load channels manually
    static $channelsLoaded = false;
    if (!$channelsLoaded) {
        require __DIR__ . '/../routes/channels.php';
        $channelsLoaded = true;
    }
    
    // Get the broadcaster instance - channels are registered on the default connection
    // Broadcast::channel() registers channels on the broadcaster instance returned by connection()
    $broadcastManager = app('Illuminate\Broadcasting\BroadcastManager');
    $broadcaster = $broadcastManager->connection();
    
    // Get channels from the broadcaster instance (channels are stored in the broadcaster, not the manager)
    $channels = $broadcaster->getChannels();
    $normalizedChannel = method_exists($broadcaster, 'normalizeChannelName') 
        ? $broadcaster->normalizeChannelName($channelName) 
        : str_replace('private-', '', $channelName);
    
    \Log::debug('Broadcast auth attempt', [
        'user_id' => $user->id,
        'channel' => $channelName,
        'normalized_channel' => $normalizedChannel,
        'channels_count' => $channels->count(),
        'channel_patterns' => $channels->keys()->toArray(),
    ]);
    
    // Use Laravel's Broadcast::auth() which handles channel matching
    // This uses the BroadcastManager which has the channels
    try {
        return \Illuminate\Support\Facades\Broadcast::auth($request);
    } catch (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e) {
        \Log::warning('Broadcast auth denied - no matching channel', [
            'user_id' => $user->id,
            'channel' => $channelName,
            'normalized_channel' => $normalizedChannel,
            'registered_patterns' => $channels->keys()->toArray(),
        ]);
        throw $e;
    }
})->name('broadcasting.auth');

// Settings route (unified settings page)
Route::middleware(['auth', 'account.resolve'])->prefix('/app')->name('app.')->group(function () {
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings');
    Route::post('/settings/inbox', [\App\Http\Controllers\SettingsController::class, 'updateInbox'])->name('settings.inbox');
    Route::post('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
    Route::post('/settings/security/revoke-other-sessions', [\App\Http\Controllers\SettingsController::class, 'revokeOtherSessions'])->name('settings.security.revoke-other-sessions');
    Route::delete('/settings/security/sessions/{sessionId}', [\App\Http\Controllers\SettingsController::class, 'revokeSession'])->name('settings.security.sessions.revoke');
    Route::post('/settings/security/resend-verification', [\App\Http\Controllers\SettingsController::class, 'resendVerification'])->name('settings.security.resend-verification');
    Route::post('/settings/security/phone/send-code', [\App\Http\Controllers\SettingsController::class, 'sendPhoneVerificationCode'])->name('settings.security.phone.send-code');
    Route::post('/settings/security/phone/verify-code', [\App\Http\Controllers\SettingsController::class, 'verifyPhoneVerificationCode'])->name('settings.security.phone.verify-code');
    Route::post('/settings/security/2fa/setup', [\App\Http\Controllers\SettingsController::class, 'startTwoFactorSetup'])->name('settings.security.2fa.setup');
    Route::post('/settings/security/2fa/cancel', [\App\Http\Controllers\SettingsController::class, 'cancelTwoFactorSetup'])->name('settings.security.2fa.cancel');
    Route::post('/settings/security/2fa/confirm', [\App\Http\Controllers\SettingsController::class, 'confirmTwoFactorSetup'])->name('settings.security.2fa.confirm');
    Route::post('/settings/security/2fa/disable', [\App\Http\Controllers\SettingsController::class, 'disableTwoFactor'])->name('settings.security.2fa.disable');
    Route::post('/settings/security/2fa/recovery-codes/regenerate', [\App\Http\Controllers\SettingsController::class, 'regenerateTwoFactorRecoveryCodes'])->name('settings.security.2fa.recovery-codes.regenerate');
});

// Webhook routes (public, no auth, but with security middleware)
// Note: These routes are excluded from CSRF, rate limiting, and maintenance mode
Route::prefix('/webhooks/whatsapp')
    ->middleware([
        \App\Http\Middleware\LogMetaWhatsAppWebhook::class,
        \App\Http\Middleware\EnsureWebhooksEnabled::class,
        \App\Modules\WhatsApp\Http\Middleware\WebhookSecurity::class,
        \App\Http\Middleware\LogApiRequests::class,
    ])
    ->name('webhooks.whatsapp.')
    ->group(function () {
        // Test endpoint to verify webhook route is accessible (no route binding)
        Route::get('/test', function () {
            \Log::channel('whatsapp')->info('Webhook test endpoint hit', [
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'timestamp' => now()->toIso8601String(),
            ]);
            return response()->json([
                'status' => 'ok', 
                'message' => 'Webhook endpoint is accessible',
                'timestamp' => now()->toIso8601String(),
            ]);
        })->name('test');
        
        // Diagnostic endpoint to test route binding
        Route::get('/debug/{connection}', function ($connection) {
            \Log::channel('whatsapp')->info('Webhook debug endpoint hit', [
                'connection_param' => $connection,
                'ip' => request()->ip(),
                'query_params' => request()->query(),
            ]);
            
            // Try to resolve connection
            $resolved = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('slug', $connection)
                ->orWhere('id', $connection)
                ->first();
            
            return response()->json([
                'status' => 'ok',
                'connection_param' => $connection,
                'connection_found' => $resolved !== null,
                'connection_id' => $resolved?->id,
                'connection_slug' => $resolved?->slug,
                'has_verify_token' => !empty($resolved?->webhook_verify_token),
                'query_params' => request()->query(),
            ]);
        })->name('debug');
        
        Route::get('/{connection}', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'verify'])->name('verify');
        Route::post('/{connection}', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'receive'])->name('receive');
    });

// Razorpay webhook (public)
Route::post('/webhooks/razorpay', [\App\Http\Controllers\Billing\RazorpayWebhookController::class, 'handle'])
    ->middleware([\App\Http\Middleware\EnsureWebhooksEnabled::class, \App\Http\Middleware\LogApiRequests::class])
    ->name('webhooks.razorpay');
