<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\Platform\ImpersonationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SupportAttachmentController;
use Illuminate\Support\Facades\Route;

// Landing page
Route::get('/', [\App\Http\Controllers\LandingPageController::class, 'index'])->name('landing');
Route::get('/sitemap.xml', [\App\Http\Controllers\SeoController::class, 'sitemap'])->name('seo.sitemap');
Route::get('/robots.txt', [\App\Http\Controllers\SeoController::class, 'robots'])->name('seo.robots');
Route::get('/api/stats', [\App\Http\Controllers\LandingPageController::class, 'stats'])
    ->middleware(['public-api.enabled', 'log.api'])
    ->name('api.stats');

Route::prefix('/api/v1/whatsapp')
    ->middleware(['public-api.enabled', 'public-api.auth', 'log.api', 'throttle:60,1'])
    ->name('api.whatsapp.')
    ->group(function () {
        Route::get('/connections', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'connections'])->name('connections');
        Route::get('/templates', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'templates'])->name('templates');
        Route::post('/templates/sync', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'syncTemplates'])->name('templates.sync');
        Route::get('/conversations', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'conversations'])->name('conversations');
        Route::post('/messages/text', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'sendText'])->name('messages.text');
        Route::post('/messages/template', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'sendTemplate'])->name('messages.template');
        Route::post('/messages/media', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'sendMedia'])->name('messages.media');
        Route::post('/messages/location', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'sendLocation'])->name('messages.location');
        Route::post('/messages/list', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'sendList'])->name('messages.list');
        Route::post('/messages/buttons', [\App\Http\Controllers\PublicApi\WhatsAppController::class, 'sendButtons'])->name('messages.buttons');
    });

Route::prefix('/api/mobile')
    ->middleware(['throttle:60,1'])
    ->name('api.mobile.')
    ->group(function () {
        Route::post('/auth/login', [\App\Http\Controllers\Mobile\MobileAuthController::class, 'login'])->name('auth.login');

        Route::middleware('mobile.auth')->group(function () {
            Route::post('/auth/logout', [\App\Http\Controllers\Mobile\MobileAuthController::class, 'logout'])->name('auth.logout');
            Route::post('/auth/device', [\App\Http\Controllers\Mobile\MobileAuthController::class, 'registerDevice'])->name('auth.device');
            Route::get('/me', [\App\Http\Controllers\Mobile\MobileAuthController::class, 'me'])->name('me');
            Route::get('/profile', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'profile'])->name('profile');
            Route::patch('/profile', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'updateProfile'])->name('profile.update');
            Route::patch('/profile/password', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'updatePassword'])->name('profile.password');
            Route::patch('/profile/notifications', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'updateNotifications'])->name('profile.notifications');
            Route::get('/workspaces', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'workspaces'])->name('workspaces');
            Route::get('/workspace', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'workspace'])->name('workspace');
            Route::patch('/workspace', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'updateWorkspace'])->name('workspace.update');
            Route::get('/billing', [\App\Http\Controllers\Mobile\MobileAccountController::class, 'billing'])->name('billing');
            Route::get('/dashboard', [\App\Http\Controllers\Mobile\MobileDataController::class, 'dashboard'])->name('dashboard');
            Route::get('/tools', [\App\Http\Controllers\Mobile\MobileDataController::class, 'tools'])->name('tools');
            Route::get('/inbox', [\App\Http\Controllers\Mobile\MobileDataController::class, 'inbox'])->name('inbox');
            Route::get('/inbox/{mobileConversation}', [\App\Http\Controllers\Mobile\MobileDataController::class, 'conversation'])->name('inbox.conversation');
            Route::patch('/inbox/{mobileConversation}', [\App\Http\Controllers\Mobile\MobileDataController::class, 'updateConversation'])->name('inbox.conversation.update');
            Route::post('/inbox/{mobileConversation}/read', [\App\Http\Controllers\Mobile\MobileDataController::class, 'markConversationRead'])->name('inbox.conversation.read');
            Route::post('/inbox/{mobileConversation}/bot', [\App\Http\Controllers\Mobile\MobileDataController::class, 'toggleConversationBot'])->name('inbox.conversation.bot');
            Route::post('/inbox/{mobileConversation}/quick-reply', [\App\Http\Controllers\Mobile\MobileDataController::class, 'sendQuickReply'])->name('inbox.quick-reply');
            Route::post('/inbox/{mobileConversation}/media', [\App\Http\Controllers\Mobile\MobileDataController::class, 'sendMedia'])->name('inbox.media');
            Route::post('/inbox/{mobileConversation}/contact-card', [\App\Http\Controllers\Mobile\MobileDataController::class, 'sendContactCard'])->name('inbox.contact-card');
            Route::post('/inbox/{mobileConversation}/location', [\App\Http\Controllers\Mobile\MobileDataController::class, 'sendLocation'])->name('inbox.location');
            Route::post('/inbox/{mobileConversation}/call', [\App\Http\Controllers\Mobile\MobileDataController::class, 'startCall'])->name('inbox.call');
            Route::get('/quick-replies', [\App\Http\Controllers\Mobile\MobileDataController::class, 'quickReplies'])->name('quick-replies');
            Route::get('/campaigns', [\App\Http\Controllers\Mobile\MobileDataController::class, 'campaigns'])->name('campaigns');
            Route::get('/templates', [\App\Http\Controllers\Mobile\MobileDataController::class, 'templates'])->name('templates');
            Route::get('/automations', [\App\Http\Controllers\Mobile\MobileDataController::class, 'automations'])->name('automations');
            Route::get('/agents', [\App\Http\Controllers\Mobile\MobileDataController::class, 'agents'])->name('agents');
            Route::get('/calls', [\App\Http\Controllers\Mobile\MobileDataController::class, 'calls'])->name('calls');
            Route::get('/contacts', [\App\Http\Controllers\Mobile\MobileDataController::class, 'contacts'])->name('contacts');
            Route::patch('/contacts/{mobileContact}', [\App\Http\Controllers\Mobile\MobileDataController::class, 'updateContact'])->name('contacts.update');
            Route::get('/leads', [\App\Http\Controllers\Mobile\MobileDataController::class, 'leads'])->name('leads');
            Route::get('/notifications', [\App\Http\Controllers\Mobile\MobileDataController::class, 'notifications'])->name('notifications');
            Route::post('/notifications/read-all', [\App\Http\Controllers\Mobile\MobileDataController::class, 'markAllNotificationsRead'])->name('notifications.read-all');
            Route::post('/notifications/{notification}/read', [\App\Http\Controllers\Mobile\MobileDataController::class, 'markNotificationRead'])->name('notifications.read');
        });
    });

Route::prefix('/api/voice-bridge')
    ->middleware(['throttle:120,1'])
    ->name('api.voice-bridge.')
    ->group(function () {
        Route::post('/sessions/claim', [\App\Http\Controllers\VoiceBridgeController::class, 'claim'])->name('sessions.claim');
        Route::post('/sessions/{session}/connect', [\App\Http\Controllers\VoiceBridgeController::class, 'connect'])->name('sessions.connect');
        Route::post('/sessions/{session}/accept', [\App\Http\Controllers\VoiceBridgeController::class, 'accept'])->name('sessions.accept');
        Route::get('/sessions/{session}', [\App\Http\Controllers\VoiceBridgeController::class, 'poll'])->name('sessions.poll');
        Route::post('/sessions/{session}/transcript', [\App\Http\Controllers\VoiceBridgeController::class, 'transcript'])->name('sessions.transcript');
        Route::post('/sessions/{session}/transcribe', [\App\Http\Controllers\VoiceBridgeController::class, 'transcribe'])->name('sessions.transcribe');
        Route::post('/sessions/{session}/agent-reply', [\App\Http\Controllers\VoiceBridgeController::class, 'agentReply'])->name('sessions.agent-reply');
        Route::post('/sessions/{session}/synthesize', [\App\Http\Controllers\VoiceBridgeController::class, 'synthesize'])->name('sessions.synthesize');
        Route::post('/sessions/{session}/finish', [\App\Http\Controllers\VoiceBridgeController::class, 'finish'])->name('sessions.finish');
    });

Route::prefix('/api/baileys-bridge')
    ->middleware(['throttle:240,1'])
    ->name('api.baileys-bridge.')
    ->group(function () {
        Route::post('/connections/{connection}/status', [\App\Http\Controllers\BaileysBridgeWebhookController::class, 'status'])->name('connections.status');
        Route::post('/connections/{connection}/message', [\App\Http\Controllers\BaileysBridgeWebhookController::class, 'message'])->name('connections.message');
    });

// Public pages
Route::get('/pricing', [\App\Http\Controllers\PublicPagesController::class, 'pricing'])->name('pricing');
Route::get('/checkout/{legacy?}', fn () => redirect()->route('pricing'))->where('legacy', '.*')->name('checkout.legacy');
Route::get('/privacy', [\App\Http\Controllers\PublicPagesController::class, 'privacy'])->name('privacy');
Route::get('/terms', [\App\Http\Controllers\PublicPagesController::class, 'terms'])->name('terms');
Route::get('/refund-policy', [\App\Http\Controllers\PublicPagesController::class, 'refundPolicy'])->name('refund.policy');
Route::get('/acceptable-use', [\App\Http\Controllers\PublicPagesController::class, 'acceptableUse'])->name('acceptable.use');
Route::get('/qr-disclaimer', [\App\Http\Controllers\PublicPagesController::class, 'qrDisclaimer'])->name('qr.disclaimer');
Route::get('/gdpr', [\App\Http\Controllers\PublicPagesController::class, 'gdpr'])->name('gdpr');
Route::get('/cookies', [\App\Http\Controllers\PublicPagesController::class, 'cookies'])->name('cookies');
Route::get('/security', [\App\Http\Controllers\PublicPagesController::class, 'security'])->name('security');
Route::get('/help', [\App\Http\Controllers\PublicPagesController::class, 'help'])->name('help');
Route::get('/faqs', [\App\Http\Controllers\PublicPagesController::class, 'faqs'])->name('faqs');
Route::redirect('/knowledgebase', '/knowledge-base', 301);
Route::get('/knowledge-base', [\App\Http\Controllers\PublicPagesController::class, 'knowledgebase'])->name('knowledgebase');
Route::get('/roadmap', [\App\Http\Controllers\PublicPagesController::class, 'roadmap'])->name('roadmap');
Route::get('/docs', [\App\Http\Controllers\PublicPagesController::class, 'docs'])->name('docs');
Route::get('/about', [\App\Http\Controllers\PublicPagesController::class, 'about'])->name('about');
Route::get('/contact', [\App\Http\Controllers\PublicPagesController::class, 'contact'])->name('contact');
Route::post('/contact', [\App\Http\Controllers\PublicPagesController::class, 'contactSubmit'])
    ->middleware('throttle:5,1')
    ->name('contact.submit');
Route::get('/forms/{survey}', [\App\Http\Controllers\PublicSurveyController::class, 'show'])->name('public.surveys.show');
Route::post('/forms/{survey}', [\App\Http\Controllers\PublicSurveyController::class, 'submit'])
    ->middleware('throttle:20,1')
    ->name('public.surveys.submit');

// Public widget embeds
Route::get('/widgets/{widget}.js', [\App\Modules\Floaters\Http\Controllers\PublicWidgetController::class, 'script'])->name('widgets.script');
Route::post('/widgets/{widget}/event', [\App\Modules\Floaters\Http\Controllers\PublicWidgetController::class, 'event'])
    ->middleware('throttle:60,1')
    ->name('widgets.event');

Route::get('/webhooks/integrations/meta-leads', [\App\Http\Controllers\IntegrationWebhookController::class, 'verifyMetaLeadsProvider'])
    ->name('webhooks.integrations.meta-leads.verify');
Route::post('/webhooks/integrations/meta-leads', [\App\Http\Controllers\IntegrationWebhookController::class, 'receiveMetaLeadsProvider'])
    ->middleware('throttle:120,1')
    ->name('webhooks.integrations.meta-leads.receive');
Route::get('/webhooks/integrations/{provider}/{integration}', [\App\Http\Controllers\IntegrationWebhookController::class, 'verify'])
    ->whereIn('provider', ['meta-leads'])
    ->name('webhooks.integrations.verify');
Route::post('/webhooks/integrations/{provider}/{integration}', [\App\Http\Controllers\IntegrationWebhookController::class, 'receive'])
    ->middleware('throttle:120,1')
    ->whereIn('provider', ['shopify', 'woocommerce', 'meta-leads', 'razorpay-payments'])
    ->name('webhooks.integrations.receive');

Route::post('/webhooks/whatsapp/flows/{flow?}/data', [\App\Modules\WhatsApp\Http\Controllers\FlowDataController::class, 'receive'])
    ->middleware(['throttle:120,1', \App\Http\Middleware\LogApiRequests::class])
    ->name('webhooks.whatsapp.flows.data');

// Auth routes
require __DIR__.'/auth.php';

// Dashboard shortcut retained for auth and verification redirects.
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
Route::get('/cron/run', \App\Http\Controllers\CronRunController::class)
    ->name('cron.run');

// Onboarding (requires auth, no account)
Route::middleware(['auth'])->group(function () {
    Route::get('/support/attachments/{attachment}', [SupportAttachmentController::class, 'show'])->name('support.attachments.show');
    Route::post('/impersonate/leave', [ImpersonationController::class, 'leave'])->name('impersonate.leave');
    Route::get('/onboarding', [OnboardingController::class, 'create'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');
});

// Platform routes (requires auth + super admin, NO account)
Route::middleware(['auth', 'super.admin'])->prefix('/platform')->name('platform.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Platform\DashboardController::class, 'index'])->name('dashboard');
    Route::get('/accounts', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'index'])->name('accounts.index');
    Route::get('/accounts/{account}', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'show'])->name('accounts.show');
    Route::post('/accounts/{account}/impersonate', [ImpersonationController::class, 'start'])->name('accounts.impersonate');
    Route::post('/accounts/{account}/disable', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'disable'])->name('accounts.disable');
    Route::post('/accounts/{account}/enable', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'enable'])->name('accounts.enable');
    Route::get('/users', [\App\Http\Controllers\Platform\PlatformUserController::class, 'index'])->name('users.index');
    Route::post('/users', [\App\Http\Controllers\Platform\PlatformUserController::class, 'store'])->name('users.store');
    Route::post('/users/{user}/impersonate', [ImpersonationController::class, 'startUser'])->name('users.impersonate');
    Route::post('/users/{user}/make-super-admin', [\App\Http\Controllers\Platform\PlatformUserController::class, 'makeSuperAdmin'])->name('users.make-super-admin');
    Route::post('/users/{user}/remove-super-admin', [\App\Http\Controllers\Platform\PlatformUserController::class, 'removeSuperAdmin'])->name('users.remove-super-admin');
    Route::post('/users/{user}/force-password-reset', [\App\Http\Controllers\Platform\PlatformUserController::class, 'forcePasswordReset'])->name('users.force-password-reset');
    Route::post('/users/{user}/clear-password-reset', [\App\Http\Controllers\Platform\PlatformUserController::class, 'clearPasswordReset'])->name('users.clear-password-reset');
    Route::post('/users/{user}/revoke-sessions', [\App\Http\Controllers\Platform\PlatformUserController::class, 'revokeSessions'])->name('users.revoke-sessions');
    Route::get('/settings', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'index'])->name('settings');
    Route::post('/settings', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/mail/test', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'testMail'])->name('settings.mail.test');
    Route::post('/settings/voice/test', [\App\Http\Controllers\Platform\PlatformSettingsController::class, 'testVoice'])->name('settings.voice.test');
    Route::get('/search', \App\Http\Controllers\Platform\PlatformSearchController::class)->name('search');
    Route::get('/modules', [\App\Http\Controllers\Platform\ModuleController::class, 'index'])->name('modules.index');
    Route::post('/modules/{module}/toggle', [\App\Http\Controllers\Platform\ModuleController::class, 'toggle'])->name('modules.toggle');
    Route::patch('/modules/{module}', [\App\Http\Controllers\Platform\ModuleController::class, 'update'])->name('modules.update');
    Route::get('/plans', [\App\Http\Controllers\Platform\PlanController::class, 'index'])->name('plans.index');
    Route::post('/plans', [\App\Http\Controllers\Platform\PlanController::class, 'store'])->name('plans.store');
    Route::patch('/plans/{plan}', [\App\Http\Controllers\Platform\PlanController::class, 'update'])->name('plans.update');
    Route::post('/plans/{plan}/toggle', [\App\Http\Controllers\Platform\PlanController::class, 'toggle'])->name('plans.toggle');
    Route::get('/discounts', [\App\Http\Controllers\Platform\BillingDiscountController::class, 'index'])->name('discounts.index');
    Route::post('/discounts', [\App\Http\Controllers\Platform\BillingDiscountController::class, 'store'])->name('discounts.store');
    Route::patch('/discounts/{discount}', [\App\Http\Controllers\Platform\BillingDiscountController::class, 'update'])->name('discounts.update');
    Route::post('/discounts/{discount}/toggle', [\App\Http\Controllers\Platform\BillingDiscountController::class, 'toggle'])->name('discounts.toggle');
    Route::get('/email-campaigns', [\App\Http\Controllers\Platform\EmailCampaignController::class, 'index'])->name('email-campaigns.index');
    Route::post('/email-campaigns', [\App\Http\Controllers\Platform\EmailCampaignController::class, 'store'])->name('email-campaigns.store');
    Route::get('/subscriptions', [\App\Http\Controllers\Platform\PlanController::class, 'subscriptions'])->name('subscriptions.index');
    Route::post('/subscriptions/{subscription}/cancel', [\App\Http\Controllers\Platform\PlanController::class, 'cancelSubscription'])->name('subscriptions.cancel');
    Route::get('/transactions', [\App\Http\Controllers\Platform\TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions/payments/{paymentOrder}/approve', [\App\Http\Controllers\Platform\TransactionController::class, 'approvePayment'])->name('transactions.payments.approve');
    Route::post('/transactions/payments/{paymentOrder}/reject', [\App\Http\Controllers\Platform\TransactionController::class, 'rejectPayment'])->name('transactions.payments.reject');
    Route::post('/transactions/payments/{paymentOrder}/remind', [\App\Http\Controllers\Platform\TransactionController::class, 'remindPayment'])->name('transactions.payments.remind');
    Route::post('/transactions/payments/{paymentOrder}/void', [\App\Http\Controllers\Platform\TransactionController::class, 'voidPayment'])->name('transactions.payments.void');
    Route::get('/transactions/payments/{paymentOrder}/proof', [\App\Http\Controllers\Platform\TransactionController::class, 'proof'])->name('transactions.payments.proof');
    Route::get('/transactions/payments/{paymentOrder}/invoice', [\App\Http\Controllers\Platform\TransactionController::class, 'invoice'])->name('transactions.payments.invoice');
    Route::post('/accounts/{account}/wallet/credit', [\App\Http\Controllers\Platform\TransactionController::class, 'credit'])->name('accounts.wallet.credit');
    Route::post('/accounts/{account}/wallet/debit', [\App\Http\Controllers\Platform\TransactionController::class, 'debit'])->name('accounts.wallet.debit');
    Route::post('/accounts/{account}/plan', [\App\Http\Controllers\Platform\PlatformAccountController::class, 'assignPlan'])->name('accounts.plan.assign');
    Route::get('/system-health', [\App\Http\Controllers\Platform\SystemHealthController::class, 'index'])->name('system-health');
    Route::post('/system-health/campaigns/recover', [\App\Http\Controllers\Platform\SystemHealthController::class, 'recoverCampaigns'])
        ->middleware('throttle:6,1')
        ->name('system-health.campaigns.recover');
    Route::post('/system-health/webhooks/{event}/replay', [\App\Http\Controllers\Platform\SystemHealthController::class, 'replayWebhookEvent'])
        ->middleware('throttle:10,1')
        ->name('system-health.webhooks.replay');
    Route::post('/system-health/queue/run', [\App\Http\Controllers\Platform\SystemHealthController::class, 'runQueueOnce'])
        ->middleware('throttle:6,1')
        ->name('system-health.queue.run');
    Route::post('/system-health/queue/retry-all', [\App\Http\Controllers\Platform\SystemHealthController::class, 'retryAllFailedJobs'])
        ->middleware('throttle:6,1')
        ->name('system-health.queue.retry-all');
    Route::post('/system-health/queue/flush', [\App\Http\Controllers\Platform\SystemHealthController::class, 'flushFailedJobs'])
        ->middleware('throttle:3,1')
        ->name('system-health.queue.flush');
    Route::post('/system-health/queue/{failedJob}/retry', [\App\Http\Controllers\Platform\SystemHealthController::class, 'retryFailedJob'])
        ->middleware('throttle:10,1')
        ->name('system-health.queue.retry');
    Route::delete('/system-health/queue/{failedJob}', [\App\Http\Controllers\Platform\SystemHealthController::class, 'forgetFailedJob'])
        ->middleware('throttle:10,1')
        ->name('system-health.queue.forget');
    Route::get('/analytics', [\App\Http\Controllers\Platform\AnalyticsController::class, 'index'])
        ->middleware('feature.enabled:analytics')
        ->name('analytics');
    Route::get('/notifications', [\App\Http\Controllers\Platform\NotificationCenterController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [\App\Http\Controllers\Platform\NotificationCenterController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/clear-resolved-operational', [\App\Http\Controllers\Platform\NotificationCenterController::class, 'clearResolvedOperational'])->name('notifications.clear-resolved-operational');
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\Platform\NotificationCenterController::class, 'markRead'])->name('notifications.read');
    Route::get('/activity-logs', [\App\Http\Controllers\Platform\ActivityLogController::class, 'index'])->name('activity-logs');
    Route::get('/templates', [\App\Http\Controllers\Platform\TemplateController::class, 'index'])->name('templates.index');
    Route::get('/templates/{template}', [\App\Http\Controllers\Platform\TemplateController::class, 'show'])->name('templates.show');
    Route::get('/support', [\App\Http\Controllers\Platform\SupportController::class, 'index'])->name('support.index');
    Route::post('/support/{thread}/assistant', [\App\Http\Controllers\Platform\SupportController::class, 'assistant'])->name('support.assistant');
    Route::get('/support/{thread}', [\App\Http\Controllers\Platform\SupportController::class, 'show'])->name('support.show');
    Route::post('/support/{thread}/messages', [\App\Http\Controllers\Platform\SupportController::class, 'message'])->middleware('throttle:60,1')->name('support.message');
    Route::post('/support/{thread}/close', [\App\Http\Controllers\Platform\SupportController::class, 'close'])->middleware('throttle:20,1')->name('support.close');
    Route::post('/support/{thread}/update', [\App\Http\Controllers\Platform\SupportController::class, 'update'])->middleware('throttle:20,1')->name('support.update');
    Route::get('/contact-requests', [\App\Http\Controllers\Platform\ContactRequestController::class, 'index'])->name('contact-requests.index');
    Route::post('/contact-requests/{contactRequest}/convert', [\App\Http\Controllers\Platform\ContactRequestController::class, 'convert'])->name('contact-requests.convert');
    Route::patch('/contact-requests/{contactRequest}', [\App\Http\Controllers\Platform\ContactRequestController::class, 'update'])->name('contact-requests.update');
    Route::delete('/contact-requests/{contactRequest}', [\App\Http\Controllers\Platform\ContactRequestController::class, 'destroy'])->name('contact-requests.destroy');
});

// App routes (requires auth + account + account active + account subscribed)
// restrict.chat.agent: chat agents (role member) only see Inbox; others have full access
Route::middleware(['auth', 'account.resolve', 'account.active', 'account.subscribed', 'restrict.chat.agent'])->prefix('/app')->name('app.')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Human-friendly aliases that match sidebar labels and support docs.
    Route::redirect('/campaigns', '/app/broadcasts');
    Route::redirect('/automation', '/app/chatbots');
    Route::redirect('/automations', '/app/chatbots');
    Route::redirect('/waba-account', '/app/connections');
    Route::redirect('/ai-assistant', '/app/ai');

    // Tools
    Route::redirect('/modules', '/app/tools');
    Route::get('/tools', [AccountController::class, 'modules'])->name('modules');
    Route::post('/modules/{moduleKey}/toggle', [AccountController::class, 'toggleModule'])->name('modules.toggle');
    Route::get('/integrations', [\App\Http\Controllers\IntegrationController::class, 'index'])->name('integrations.index');
    Route::post('/integrations/{provider}/connect', [\App\Http\Controllers\IntegrationController::class, 'connect'])->name('integrations.connect');
    Route::get('/integrations/{provider}/oauth', [\App\Http\Controllers\IntegrationController::class, 'redirectOAuth'])->name('integrations.oauth');
    Route::get('/integrations/{provider}/oauth/callback', [\App\Http\Controllers\IntegrationController::class, 'oauthCallback'])->name('integrations.oauth.callback');
    Route::get('/integrations/{provider}/resources', [\App\Http\Controllers\IntegrationController::class, 'resources'])->name('integrations.resources');
    Route::patch('/integrations/{provider}', [\App\Http\Controllers\IntegrationController::class, 'update'])->name('integrations.update');
    Route::post('/integrations/{provider}/sync', [\App\Http\Controllers\IntegrationController::class, 'sync'])->name('integrations.sync');
    Route::delete('/integrations/{provider}', [\App\Http\Controllers\IntegrationController::class, 'disconnect'])->name('integrations.disconnect');
    Route::get('/developer', [\App\Http\Controllers\DeveloperController::class, 'index'])->name('developer.index');
    Route::post('/developer/api-keys', [\App\Http\Controllers\DeveloperController::class, 'storeKey'])->name('developer.keys.store');
    Route::delete('/developer/api-keys/{key}', [\App\Http\Controllers\DeveloperController::class, 'destroyKey'])->name('developer.keys.destroy');
    Route::post('/developer/webhooks', [\App\Http\Controllers\DeveloperController::class, 'storeWebhook'])->name('developer.webhooks.store');
    Route::patch('/developer/webhooks/{endpoint}', [\App\Http\Controllers\DeveloperController::class, 'updateWebhook'])->name('developer.webhooks.update');
    Route::post('/developer/webhooks/{endpoint}/test', [\App\Http\Controllers\DeveloperController::class, 'testWebhook'])->name('developer.webhooks.test');
    Route::delete('/developer/webhooks/{endpoint}', [\App\Http\Controllers\DeveloperController::class, 'destroyWebhook'])->name('developer.webhooks.destroy');
    Route::get('/search', \App\Http\Controllers\GlobalSearchController::class)->name('search');
    Route::get('/notifications', [\App\Http\Controllers\NotificationCenterController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationCenterController::class, 'markAllRead'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [\App\Http\Controllers\NotificationCenterController::class, 'markRead'])->name('notifications.read');

    Route::get('/channels', [\App\Http\Controllers\WorkspaceAddonController::class, 'channels'])->name('channels.index');
    Route::get('/media-library', [\App\Http\Controllers\WorkspaceAddonController::class, 'media'])->name('media-library.index');
    Route::post('/media-library', [\App\Http\Controllers\WorkspaceAddonController::class, 'storeMedia'])->name('media-library.store');
    Route::delete('/media-library/{asset}', [\App\Http\Controllers\WorkspaceAddonController::class, 'destroyMedia'])->name('media-library.destroy');
    Route::get('/catalog', [\App\Http\Controllers\WorkspaceAddonController::class, 'catalog'])->name('catalog.index');
    Route::post('/catalog/products', [\App\Http\Controllers\WorkspaceAddonController::class, 'storeProduct'])->name('catalog.products.store');
    Route::patch('/catalog/products/{product}', [\App\Http\Controllers\WorkspaceAddonController::class, 'updateProduct'])->name('catalog.products.update');
    Route::delete('/catalog/products/{product}', [\App\Http\Controllers\WorkspaceAddonController::class, 'destroyProduct'])->name('catalog.products.destroy');
    Route::get('/surveys', [\App\Http\Controllers\WorkspaceAddonController::class, 'surveys'])->name('surveys.index');
    Route::post('/surveys', [\App\Http\Controllers\WorkspaceAddonController::class, 'storeSurvey'])->name('surveys.store');
    Route::patch('/surveys/{survey}', [\App\Http\Controllers\WorkspaceAddonController::class, 'updateSurvey'])->name('surveys.update');
    Route::delete('/surveys/{survey}', [\App\Http\Controllers\WorkspaceAddonController::class, 'destroySurvey'])->name('surveys.destroy');
    Route::get('/appointments', [\App\Http\Controllers\WorkspaceAddonController::class, 'appointments'])->name('appointments.index');
    Route::post('/appointments', [\App\Http\Controllers\WorkspaceAddonController::class, 'storeAppointment'])->name('appointments.store');
    Route::patch('/appointments/{appointment}', [\App\Http\Controllers\WorkspaceAddonController::class, 'updateAppointment'])->name('appointments.update');
    Route::post('/appointments/{appointment}/reminder', [\App\Http\Controllers\WorkspaceAddonController::class, 'sendAppointmentReminder'])->name('appointments.reminder');
    Route::delete('/appointments/{appointment}', [\App\Http\Controllers\WorkspaceAddonController::class, 'destroyAppointment'])->name('appointments.destroy');
    Route::get('/meta-leads', [\App\Http\Controllers\WorkspaceAddonController::class, 'metaLeads'])->name('meta-leads.index');
    Route::post('/meta-leads', [\App\Http\Controllers\WorkspaceAddonController::class, 'storeMetaLead'])->name('meta-leads.store');
    Route::patch('/meta-leads/{lead}', [\App\Http\Controllers\WorkspaceAddonController::class, 'updateMetaLead'])->name('meta-leads.update');
    Route::post('/meta-leads/{lead}/contact', [\App\Http\Controllers\WorkspaceAddonController::class, 'convertMetaLeadToContact'])->name('meta-leads.contact');
    Route::delete('/meta-leads/{lead}', [\App\Http\Controllers\WorkspaceAddonController::class, 'destroyMetaLead'])->name('meta-leads.destroy');
    Route::get('/ecommerce', [\App\Http\Controllers\WorkspaceAddonController::class, 'ecommerce'])->name('ecommerce.index');
    Route::post('/ecommerce/orders', [\App\Http\Controllers\WorkspaceAddonController::class, 'storeOrder'])->name('ecommerce.orders.store');
    Route::patch('/ecommerce/orders/{order}', [\App\Http\Controllers\WorkspaceAddonController::class, 'updateOrder'])->name('ecommerce.orders.update');
    Route::post('/ecommerce/orders/{order}/payment-link', [\App\Http\Controllers\WorkspaceAddonController::class, 'createOrderPaymentLink'])->name('ecommerce.orders.payment-link');
    Route::post('/ecommerce/orders/{order}/contact', [\App\Http\Controllers\WorkspaceAddonController::class, 'convertOrderToContact'])->name('ecommerce.orders.contact');
    Route::delete('/ecommerce/orders/{order}', [\App\Http\Controllers\WorkspaceAddonController::class, 'destroyOrder'])->name('ecommerce.orders.destroy');

    Route::get('/quick-replies', [\App\Http\Controllers\QuickReplyController::class, 'index'])->name('quick-replies.index');
    Route::post('/quick-replies', [\App\Http\Controllers\QuickReplyController::class, 'store'])->name('quick-replies.store');
    Route::patch('/quick-replies/{quickReply}', [\App\Http\Controllers\QuickReplyController::class, 'update'])->name('quick-replies.update');
    Route::post('/quick-replies/{quickReply}/toggle', [\App\Http\Controllers\QuickReplyController::class, 'toggle'])->name('quick-replies.toggle');
    Route::delete('/quick-replies/{quickReply}', [\App\Http\Controllers\QuickReplyController::class, 'destroy'])->name('quick-replies.destroy');

    Route::get('/workspaces', [AccountController::class, 'workspaces'])->name('workspaces.index');
    Route::post('/workspaces', [AccountController::class, 'storeWorkspace'])->name('workspaces.store');
    Route::patch('/workspaces/settings', [\App\Http\Controllers\SettingsController::class, 'updateWorkspace'])->name('workspaces.update');

    // Billing (always accessible)
    Route::prefix('/settings/billing')->name('billing.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Billing\BillingController::class, 'index'])->name('index');
        Route::post('/plans/{plan}/preview', [\App\Http\Controllers\Billing\BillingController::class, 'previewPlan'])
            ->middleware('throttle:20,1')
            ->name('preview');
        Route::post('/plans/{plan}/orders', [\App\Http\Controllers\Billing\BillingController::class, 'createOrder'])
            ->middleware('throttle:10,1')
            ->name('orders.store');
        Route::post('/plans/{plan}/credits', [\App\Http\Controllers\Billing\BillingController::class, 'purchaseWithCredits'])
            ->middleware('throttle:10,1')
            ->name('credits.purchase');
        Route::post('/orders/{paymentOrder}/proof', [\App\Http\Controllers\Billing\BillingController::class, 'uploadProof'])
            ->middleware('throttle:10,1')
            ->name('orders.proof');
        Route::get('/orders/{paymentOrder}/proof', [\App\Http\Controllers\Billing\BillingController::class, 'proof'])->name('orders.proof.show');
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
        Route::post('/wallet/topup', [\App\Http\Controllers\Billing\BillingController::class, 'walletTopup'])->name('wallet.topup');
        Route::post('/wallet/topup/confirm', [\App\Http\Controllers\Billing\BillingController::class, 'confirmWalletTopup'])->name('wallet.topup.confirm');
        Route::post('/cancel', [\App\Http\Controllers\Billing\BillingController::class, 'cancel'])->name('cancel');
        Route::get('/invoices/{paymentOrder}/download', [\App\Http\Controllers\Billing\BillingController::class, 'downloadInvoice'])->name('invoices.download');
    });

    // AI module (requires AI entitlement)
    Route::middleware(['module.entitled:ai'])->prefix('ai')->name('ai.')->group(function () {
        Route::get('/', [\App\Modules\AI\Http\Controllers\AiController::class, 'index'])->name('index');
        Route::post('/settings', [\App\Modules\AI\Http\Controllers\AiController::class, 'updateSettings'])->name('settings');
        Route::post('/agents', [\App\Modules\AI\Http\Controllers\AiAgentController::class, 'store'])->name('agents.store');
        Route::patch('/agents/{agent}', [\App\Modules\AI\Http\Controllers\AiAgentController::class, 'update'])->name('agents.update');
        Route::post('/agents/{agent}/simulate', [\App\Modules\AI\Http\Controllers\AiAgentController::class, 'simulate'])->name('agents.simulate');
        Route::delete('/agents/{agent}', [\App\Modules\AI\Http\Controllers\AiAgentController::class, 'destroy'])->name('agents.destroy');
    });

    // Load module routes (WhatsApp, Chatbots, etc.)
    if (file_exists(__DIR__.'/../app/Modules/WhatsApp/routes/web.php')) {
        require __DIR__.'/../app/Modules/WhatsApp/routes/web.php';
    }
    if (file_exists(__DIR__.'/../app/Modules/Chatbots/routes/web.php')) {
        require __DIR__.'/../app/Modules/Chatbots/routes/web.php';
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
    if (file_exists(__DIR__.'/../app/Modules/WhatsAppCalling/routes/web.php')) {
        require __DIR__.'/../app/Modules/WhatsAppCalling/routes/web.php';
    }

    // Team management
    Route::prefix('/team')->name('team.')->group(function () {
        Route::get('/', [\App\Http\Controllers\TeamController::class, 'index'])->name('index');
        Route::post('/invite', [\App\Http\Controllers\TeamController::class, 'invite'])->middleware('throttle:10,1')->name('invite');
        Route::post('/roles', [\App\Http\Controllers\TeamController::class, 'storeRole'])->name('roles.store');
        Route::patch('/roles/{role}', [\App\Http\Controllers\TeamController::class, 'updateRoleDefinition'])->name('roles.update');
        Route::delete('/roles/{role}', [\App\Http\Controllers\TeamController::class, 'deleteRole'])->name('roles.delete');
        Route::post('/invites/{invitation}/resend', [\App\Http\Controllers\TeamController::class, 'resendInvite'])->middleware('throttle:10,1')->name('invites.resend');
        Route::delete('/invites/{invitation}', [\App\Http\Controllers\TeamController::class, 'revokeInvite'])->name('invites.revoke');
        Route::post('/{user}/update-role', [\App\Http\Controllers\TeamController::class, 'updateRole'])->name('update-role');
        Route::delete('/{user}/remove', [\App\Http\Controllers\TeamController::class, 'remove'])->name('remove');
    });

    // Activity Logs
    Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs');
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

    if (! $user) {
        return response()->json(['error' => 'Unauthenticated'], 403);
    }

    // Ensure channels are loaded - Broadcast::channel() registers them on the default broadcaster
    // The channels file should be loaded via withBroadcasting() or we need to load it here
    // Since we disabled withBroadcasting(), we need to load channels manually
    static $channelsLoaded = false;
    if (! $channelsLoaded) {
        require __DIR__.'/../routes/channels.php';
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

    $hasAccountAccess = static function (int|string $accountId) use ($user): bool {
        $account = \App\Models\Account::find($accountId);

        if (! $account) {
            return false;
        }

        return $user->canAccessAccount($account);
    };

    $fallbackAuth = static function () use ($request, $user, $broadcaster, $normalizedChannel, $hasAccountAccess) {
        if (preg_match('/^App\.Models\.User\.(\d+)$/', $normalizedChannel, $matches)) {
            return (int) $matches[1] === (int) $user->id
                ? $broadcaster->validAuthenticationResponse($request, true)
                : null;
        }

        if (preg_match('/^account\.(\d+)\.whatsapp\.inbox$/', $normalizedChannel, $matches)) {
            return $hasAccountAccess($matches[1])
                ? $broadcaster->validAuthenticationResponse($request, true)
                : null;
        }

        if (preg_match('/^account\.(\d+)\.whatsapp\.conversation\.(\d+)$/', $normalizedChannel, $matches)) {
            $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::find($matches[2]);
            $allowed = $conversation
                && account_ids_match($conversation->account_id, $matches[1])
                && $hasAccountAccess($matches[1]);

            return $allowed
                ? $broadcaster->validAuthenticationResponse($request, true)
                : null;
        }

        if (preg_match('/^account\.(\d+)\.support\.thread\.(\d+)$/', $normalizedChannel, $matches)) {
            $thread = \App\Modules\Support\Models\SupportThread::find($matches[2]);
            $allowed = $thread
                && account_ids_match($thread->account_id, $matches[1])
                && ($user->isPlatformAdmin() || $hasAccountAccess($matches[1]));

            return $allowed
                ? $broadcaster->validAuthenticationResponse($request, true)
                : null;
        }

        if ($normalizedChannel === 'platform.support' && $user->isSuperAdmin()) {
            return $broadcaster->validAuthenticationResponse($request, true);
        }

        return null;
    };

    // Prefer Laravel's normal channel authorization. The fallback covers the
    // same registered private channels when route caching or broadcaster state
    // prevents the framework matcher from finding a loaded pattern.
    try {
        return $broadcaster->auth($request);
    } catch (\Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException $e) {
        $fallbackResponse = $fallbackAuth();

        if ($fallbackResponse !== null) {
            \Log::info('Broadcast auth granted by account-scoped fallback', [
                'user_id' => $user->id,
                'channel' => $channelName,
                'normalized_channel' => $normalizedChannel,
            ]);

            return $fallbackResponse;
        }

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
    Route::patch('/settings/workspace', [\App\Http\Controllers\SettingsController::class, 'updateWorkspace'])->name('settings.workspace');
    Route::post('/settings/workspace', [\App\Http\Controllers\SettingsController::class, 'updateWorkspace'])->name('settings.workspace.upload');
    Route::post('/settings/inbox', [\App\Http\Controllers\SettingsController::class, 'updateInbox'])->name('settings.inbox');
    Route::post('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications'])->name('settings.notifications');
    Route::delete('/workspaces/{account}', [AccountController::class, 'destroyWorkspace'])->name('workspaces.destroy');
});

Route::any('/webhooks/whatsapp/debug/{any?}', fn () => response()->json(['success' => false, 'error' => 'Not found'], 404))
    ->where('any', '.*');

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
        Route::get('/', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'verifyCentral'])->name('central.verify');
        Route::post('/', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'receiveCentral'])->name('central.receive');

        // Test endpoint to verify webhook route is accessible (no route binding)
        Route::get('/test', function () {
            abort_if(app()->isProduction(), 404);

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

        Route::get('/{connection}', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'verify'])->name('verify');
        Route::post('/{connection}', [\App\Modules\WhatsApp\Http\Controllers\WebhookController::class, 'receive'])->name('receive');
    });

// Razorpay webhook (public)
Route::post('/webhooks/razorpay', [\App\Http\Controllers\Billing\RazorpayWebhookController::class, 'handle'])
    ->middleware([\App\Http\Middleware\EnsureWebhooksEnabled::class, \App\Http\Middleware\LogApiRequests::class])
    ->name('webhooks.razorpay');
