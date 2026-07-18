<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Services\CronDiagnosticsService;
use App\Services\NotificationOutboxService;
use App\Services\PlatformSettingsService;
use App\Services\PlatformSettingsValidationService;
use App\Services\Voice\VoiceProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PlatformSettingsController extends Controller
{
    public function __construct(
        protected CronDiagnosticsService $cronDiagnosticsService
    ) {}

    /**
     * Display platform settings.
     */
    public function index(Request $request): Response
    {
        // Helper to get setting with fallback
        $get = fn ($key, $default = null) => PlatformSetting::get($key, $default);

        // General Settings
        $generalSettings = [
            'platform_url' => $get('general.platform_url', config('app.url')),
            'timezone' => $get('general.timezone', config('app.timezone', 'UTC')),
            'locale' => $get('general.locale', config('app.locale', 'en')),
            'date_format' => $get('general.date_format', 'Y-m-d'),
            'time_format' => $get('general.time_format', '24'),
            'maintenance_mode' => $get('general.maintenance_mode', false),
            'maintenance_message' => $get('general.maintenance_message')];

        // Security Settings
        $securitySettings = [
            'password_min_length' => $get('security.password_min_length', 8),
            'password_max_length' => $get('security.password_max_length', 128),
            'password_require_uppercase' => $get('security.password_require_uppercase', false),
            'password_require_lowercase' => $get('security.password_require_lowercase', false),
            'password_require_numbers' => $get('security.password_require_numbers', false),
            'password_require_symbols' => $get('security.password_require_symbols', false),
            'password_expiry_days' => $get('security.password_expiry_days', 0),
            'password_history_count' => $get('security.password_history_count', 0),
            'require_2fa' => $get('security.require_2fa', false),
            'session_timeout' => $get('security.session_timeout', 120),
            'max_login_attempts' => $get('security.max_login_attempts', 5),
            'lockout_duration' => $get('security.lockout_duration', 15),
            'api_rate_limit' => $get('security.api_rate_limit', 60),
            'web_rate_limit' => $get('security.web_rate_limit', 120),
            'ip_whitelist' => $get('security.ip_whitelist')];

        // Payment Settings
        $paymentSettings = [
            'razorpay_key_id' => $get('payment.razorpay_key_id'),
            'razorpay_key_secret' => $get('payment.razorpay_key_secret'),
            'razorpay_webhook_secret' => $get('payment.razorpay_webhook_secret'),
            'razorpay_enabled' => $get('payment.razorpay_enabled', false),
            'wallet_self_topup_enabled' => $get('payment.wallet_self_topup_enabled', false),
            'self_hosted_payments_enabled' => $get('payment.self_hosted_payments_enabled', true),
            'method_upi_enabled' => $get('payment.method_upi_enabled', true),
            'method_bank_enabled' => $get('payment.method_bank_enabled', true),
            'method_manual_enabled' => $get('payment.method_manual_enabled', true),
            'method_razorpay_enabled' => $get('payment.method_razorpay_enabled', true),
            'default_currency' => $get('payment.default_currency', 'USD'),
            'currency_symbol_position' => $get('payment.currency_symbol_position', 'before'),
            'tax_rate' => $get('payment.tax_rate', 0),
            'gstin' => $get('payment.gstin'),
            'legal_name' => $get('payment.legal_name', config('app.name', 'Zyptos')),
            'address_line1' => $get('payment.address_line1'),
            'address_line2' => $get('payment.address_line2'),
            'city' => $get('payment.city'),
            'state' => $get('payment.state'),
            'state_code' => $get('payment.state_code'),
            'postal_code' => $get('payment.postal_code'),
            'country' => $get('payment.country', 'IN'),
            'sac_code' => $get('payment.sac_code', '998313'),
            'upi_id' => $get('payment.upi_id'),
            'upi_payee_name' => $get('payment.upi_payee_name'),
            'bank_account_name' => $get('payment.bank_account_name'),
            'bank_account_number' => $get('payment.bank_account_number'),
            'bank_ifsc' => $get('payment.bank_ifsc'),
            'bank_name' => $get('payment.bank_name'),
            'manual_payment_note' => $get('payment.manual_payment_note'),
            'invoice_prefix' => $get('payment.invoice_prefix', 'INV-'),
            'invoice_number_start' => $get('payment.invoice_number_start', 1),
            'subscription_grace_days' => $get('payment.subscription_grace_days', 3),
            'auto_disable_overdue_enabled' => $get('payment.auto_disable_overdue_enabled', false),
            'auto_disable_overdue_days' => $get('payment.auto_disable_overdue_days', 7),
            'renewal_reminder_days' => $get('payment.renewal_reminder_days', 7),
            'renewal_reminder_time' => $get('payment.renewal_reminder_time', '09:00')];

        // Integrations Settings
	        $integrationsSettings = [
	            'api_key' => $get('integrations.api_key'),
	            'api_rate_limit' => $get('integrations.api_rate_limit', 60),
	            'api_enabled' => $get('integrations.api_enabled', false),
	            'webhooks_enabled' => $get('integrations.webhooks_enabled', true),
	            'google_oauth_enabled' => $get('integrations.google_oauth_enabled', false),
	            'google_client_id' => $get('integrations.google_client_id', config('services.google.client_id')),
	            'google_client_secret' => $get('integrations.google_client_secret', config('services.google.client_secret')),
	            'google_redirect_url' => route('auth.google.callback'),
	            'google_integration_redirect_urls' => [
	                'Google Sheets' => route('app.integrations.oauth.callback', 'google-sheets'),
	                'Google Calendar' => route('app.integrations.oauth.callback', 'google-calendar'),
	            ],
	            'facebook_redirect_url' => route('app.integrations.oauth.callback', 'meta-leads'),
	            'meta_leads_webhook_url' => route('webhooks.integrations.meta-leads.receive'),
	        ];

        // Analytics Settings
        $analyticsSettings = [
            'google_analytics_id' => $get('analytics.google_analytics_id'),
            'google_analytics_enabled' => $get('analytics.google_analytics_enabled', false),
            'mixpanel_token' => $get('analytics.mixpanel_token'),
            'mixpanel_enabled' => $get('analytics.mixpanel_enabled', false),
            'log_level' => $get('analytics.log_level', 'info'),
            'log_api_requests' => $get('analytics.log_api_requests', false)];

        // Compliance Settings
        $complianceSettings = [
            'terms_url' => $get('compliance.terms_url'),
            'privacy_url' => $get('compliance.privacy_url'),
            'cookie_policy_url' => $get('compliance.cookie_policy_url'),
            'gdpr_enabled' => $get('compliance.gdpr_enabled', false),
            'data_retention_days' => $get('compliance.data_retention_days', 365),
            'data_officer_email' => $get('compliance.data_officer_email'),
            'cookie_consent_required' => $get('compliance.cookie_consent_required', false),
            'allow_data_export' => $get('compliance.allow_data_export', false),
            'allow_data_deletion' => $get('compliance.allow_data_deletion', false)];

        // Performance Settings
        $performanceSettings = [
            'cache_driver' => $get('performance.cache_driver', config('cache.default', 'file')),
            'cache_ttl' => $get('performance.cache_ttl', 3600),
            'cache_enabled' => $get('performance.cache_enabled', false),
            'queue_connection' => $get('performance.queue_connection', config('queue.default', 'database')),
            'queue_max_attempts' => $get('performance.queue_max_attempts', 3),
            'queue_timeout' => $get('performance.queue_timeout', 90),
            'db_connection_pool' => $get('performance.db_connection_pool', 10),
            'query_timeout' => $get('performance.query_timeout', 30),
            'query_logging_enabled' => $get('performance.query_logging_enabled', false),
            'max_upload_size' => $get('performance.max_upload_size', 10),
            'allowed_file_types' => $get('performance.allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx')];

        // Features Settings
        $featuresSettings = [
            'user_registration' => $get('features.user_registration', true),
            'email_verification' => $get('features.email_verification', false),
            'account_creation' => $get('features.account_creation', true),
            'public_api' => $get('features.public_api', false),
            'webhooks' => $get('features.webhooks', true),
            'analytics' => $get('features.analytics', true)];

        // Pusher Settings
        $pusherSettings = [
            'app_id' => $get('pusher.app_id', config('broadcasting.connections.pusher.app_id')),
            'key' => $get('pusher.key', config('broadcasting.connections.pusher.key')),
            'secret' => $get('pusher.secret', config('broadcasting.connections.pusher.secret')),
            'cluster' => $get('pusher.cluster', config('broadcasting.connections.pusher.options.cluster'))];

        // Mail Settings
        $mailSettings = [
            'driver' => $get('mail.driver', config('mail.default')),
            'host' => $get('mail.host', config('mail.mailers.smtp.host')),
            'port' => $get('mail.port', config('mail.mailers.smtp.port', 587)),
            'username' => $get('mail.username', config('mail.mailers.smtp.username')),
            'password' => $get('mail.password', config('mail.mailers.smtp.password')),
            'encryption' => $get('mail.encryption', config('mail.mailers.smtp.encryption', 'tls')),
            'from_address' => $get('mail.from_address', config('mail.from.address')),
            'from_name' => $get('mail.from_name', config('mail.from.name'))];

        // Storage Settings
        $storageSettings = [
            'default' => $get('storage.default', config('filesystems.default')),
            's3_key' => $get('storage.s3_key', config('filesystems.disks.s3.key')),
            's3_secret' => $get('storage.s3_secret', config('filesystems.disks.s3.secret')),
            's3_region' => $get('storage.s3_region', config('filesystems.disks.s3.region')),
            's3_bucket' => $get('storage.s3_bucket', config('filesystems.disks.s3.bucket'))];

        // Branding Settings
        $brandingService = app(\App\Services\BrandingService::class);
        $brandingSettings = [
            'platform_name' => $get('branding.platform_name', config('app.name', 'Zyptos')),
            'logo_path' => $get('branding.logo_path'),
            'logo_url' => $brandingService->getLogoUrl(),
            'logo_dark_path' => $get('branding.logo_dark_path'),
            'logo_dark_url' => $brandingService->getDarkLogoUrl(),
            'sidebar_icon_path' => $get('branding.sidebar_icon_path'),
            'sidebar_icon_url' => $brandingService->getSidebarIconUrl(),
            'sidebar_icon_dark_path' => $get('branding.sidebar_icon_dark_path'),
            'sidebar_icon_dark_url' => $brandingService->getDarkSidebarIconUrl(),
            'favicon_path' => $get('branding.favicon_path'),
            'favicon_url' => $brandingService->getFaviconUrl(),
            'favicon_dark_path' => $get('branding.favicon_dark_path'),
            'favicon_dark_url' => $brandingService->getDarkFaviconUrl(),
            'primary_color' => $get('branding.primary_color', '#3B82F6'),
            'secondary_color' => $get('branding.secondary_color', '#8B5CF6'),
            'support_email' => $get('branding.support_email'),
            'support_phone' => $get('branding.support_phone'),
            'footer_text' => $get('branding.footer_text'),
            'show_powered_by' => $get('branding.show_powered_by', false)];

        // AI Settings
        $aiSettings = [
            'enabled' => $get('ai.enabled', false),
            'provider' => $get('ai.provider', 'openai'),
            'openai_api_key' => $get('ai.openai_api_key'),
            'openai_model' => $get('ai.openai_model', 'gpt-4o-mini'),
            'anthropic_api_key' => $get('ai.anthropic_api_key'),
            'anthropic_model' => $get('ai.anthropic_model', 'claude-3-5-haiku-20241022'),
            'gemini_api_key' => $get('ai.gemini_api_key'),
            'gemini_model' => $get('ai.gemini_model', 'gemini-2.0-flash'),
            'system_prompt' => $get('ai.system_prompt'),
            'temperature' => $get('ai.temperature', 0.2),
            'max_tokens' => $get('ai.max_tokens', 300),
            'voice_enabled' => $get('ai.voice_enabled', false),
            'voice_stt_provider' => $get('ai.voice_stt_provider', 'elevenlabs'),
            'voice_tts_provider' => $get('ai.voice_tts_provider', 'elevenlabs'),
            'voice_fallback_provider' => $get('ai.voice_fallback_provider', 'openai'),
            'elevenlabs_api_key' => $get('ai.elevenlabs_api_key'),
            'elevenlabs_stt_model' => $get('ai.elevenlabs_stt_model', 'scribe_v1'),
            'elevenlabs_tts_model' => $get('ai.elevenlabs_tts_model', 'eleven_multilingual_v2'),
            'elevenlabs_voice_id' => $get('ai.elevenlabs_voice_id', '21m00Tcm4TlvDq8ikWAM'),
            'voice_openai_api_key' => $get('ai.voice_openai_api_key'),
            'openai_stt_model' => $get('ai.openai_stt_model', 'whisper-1'),
            'openai_tts_model' => $get('ai.openai_tts_model', 'tts-1'),
            'openai_voice' => $get('ai.openai_voice', 'alloy')];

        // WhatsApp Meta Settings
        $whatsappSettings = [
            'embedded_enabled' => $get('whatsapp.embedded_enabled', null),
            'meta_app_id' => $get('whatsapp.meta_app_id', config('whatsapp.meta.app_id')),
            'meta_app_secret' => $get('whatsapp.meta_app_secret', config('whatsapp.meta.app_secret')),
            'embedded_signup_config_id' => $get('whatsapp.embedded_signup_config_id', config('whatsapp.meta.embedded_signup_config_id')),
            'coexistence_signup_config_id' => $get('whatsapp.coexistence_signup_config_id', config('whatsapp.meta.coexistence_signup_config_id')),
            'api_version' => $get('whatsapp.api_version', config('whatsapp.meta.api_version', 'v25.0')),
            'app_domain' => parse_url($get('general.platform_url', config('app.url')), PHP_URL_HOST),
            'central_webhook_url' => route('webhooks.whatsapp.central.receive'),
            'central_webhook_verify_token' => \App\Modules\WhatsApp\Http\Controllers\WebhookController::centralVerifyToken()];

        // Check for misconfigured settings
        $validationService = app(PlatformSettingsValidationService::class);
        $misconfiguredSettings = $validationService->getMisconfiguredSettings();

        return Inertia::render('Platform/Settings', [
            'general' => $generalSettings,
            'security' => $securitySettings,
            'payment' => $paymentSettings,
            'integrations' => $integrationsSettings,
            'analytics' => $analyticsSettings,
            'compliance' => $complianceSettings,
            'performance' => $performanceSettings,
            'features' => $featuresSettings,
            'pusher' => $pusherSettings,
            'mail' => $mailSettings,
            'storage' => $storageSettings,
            'branding' => $brandingSettings,
            'ai' => $aiSettings,
            'whatsapp' => $whatsappSettings,
            'cron' => $this->cronDiagnosticsService->platformSummary(),
            'delivery' => $this->cronDiagnosticsService->deliverySummary(),
            'misconfigured_settings' => array_values($misconfiguredSettings)]);
    }

    /**
     * Update platform settings.
     */
    public function update(Request $request)
    {
        $request->merge([
            'performance' => $this->normalizePerformanceSettings((array) $request->input('performance', [])),
        ]);

        $validated = $request->validate([
            // General
            'general.platform_url' => 'nullable|url|max:255',
            'general.timezone' => 'nullable|string|max:50',
            'general.locale' => 'nullable|string|max:10',
            'general.date_format' => 'nullable|string|max:20',
            'general.time_format' => 'nullable|string|in:12,24',
            'general.maintenance_mode' => 'nullable|boolean',
            'general.maintenance_message' => 'nullable|string|max:500',
            // Security
            'security.password_min_length' => 'nullable|integer|min:6|max:128',
            'security.password_max_length' => 'nullable|integer|min:8|max:128',
            'security.password_require_uppercase' => 'nullable|boolean',
            'security.password_require_lowercase' => 'nullable|boolean',
            'security.password_require_numbers' => 'nullable|boolean',
            'security.password_require_symbols' => 'nullable|boolean',
            'security.password_expiry_days' => 'nullable|integer|min:0|max:365',
            'security.password_history_count' => 'nullable|integer|min:0|max:10',
            'security.require_2fa' => 'nullable|boolean',
            'security.session_timeout' => 'nullable|integer|min:5|max:1440',
            'security.max_login_attempts' => 'nullable|integer|min:3|max:10',
            'security.lockout_duration' => 'nullable|integer|min:1|max:1440',
            'security.api_rate_limit' => 'nullable|integer|min:10',
            'security.web_rate_limit' => 'nullable|integer|min:10',
            'security.ip_whitelist' => 'nullable|string|max:1000',
            // Payment
            'payment.razorpay_key_id' => 'nullable|string',
            'payment.razorpay_key_secret' => 'nullable|string',
            'payment.razorpay_webhook_secret' => 'nullable|string',
            'payment.razorpay_enabled' => 'nullable|boolean',
            'payment.wallet_self_topup_enabled' => 'nullable|boolean',
            'payment.self_hosted_payments_enabled' => 'nullable|boolean',
            'payment.method_upi_enabled' => 'nullable|boolean',
            'payment.method_bank_enabled' => 'nullable|boolean',
            'payment.method_manual_enabled' => 'nullable|boolean',
            'payment.method_razorpay_enabled' => 'nullable|boolean',
            'payment.default_currency' => 'nullable|string|max:3',
            'payment.currency_symbol_position' => 'nullable|string|in:before,after',
            'payment.tax_rate' => 'nullable|numeric|min:0|max:100',
            'payment.gstin' => 'nullable|string|max:20',
            'payment.legal_name' => 'nullable|string|max:255',
            'payment.address_line1' => 'nullable|string|max:255',
            'payment.address_line2' => 'nullable|string|max:255',
            'payment.city' => 'nullable|string|max:120',
            'payment.state' => 'nullable|string|max:120',
            'payment.state_code' => 'nullable|string|max:8',
            'payment.postal_code' => 'nullable|string|max:20',
            'payment.country' => 'nullable|string|max:2',
            'payment.sac_code' => 'nullable|string|max:16',
            'payment.upi_id' => 'nullable|string|max:120',
            'payment.upi_payee_name' => 'nullable|string|max:255',
            'payment.bank_account_name' => 'nullable|string|max:255',
            'payment.bank_account_number' => 'nullable|string|max:80',
            'payment.bank_ifsc' => 'nullable|string|max:40',
            'payment.bank_name' => 'nullable|string|max:160',
            'payment.manual_payment_note' => 'nullable|string|max:1000',
            'payment.invoice_prefix' => 'nullable|string|max:20',
            'payment.invoice_number_start' => 'nullable|integer|min:1',
            'payment.subscription_grace_days' => 'nullable|integer|min:0|max:90',
            'payment.auto_disable_overdue_enabled' => 'nullable|boolean',
            'payment.auto_disable_overdue_days' => 'nullable|integer|min:1|max:180',
            'payment.renewal_reminder_days' => 'nullable|integer|min:0|max:90',
            'payment.renewal_reminder_time' => 'nullable|date_format:H:i',
            // Integrations
            'integrations.api_key' => 'nullable|string',
            'integrations.api_rate_limit' => 'nullable|integer|min:10',
            'integrations.api_enabled' => 'nullable|boolean',
            'integrations.webhooks_enabled' => 'nullable|boolean',
            'integrations.google_oauth_enabled' => 'nullable|boolean',
            'integrations.google_client_id' => 'nullable|string|max:255',
            'integrations.google_client_secret' => 'nullable|string|max:255',
            // Analytics
            'analytics.google_analytics_id' => 'nullable|string|max:50',
            'analytics.google_analytics_enabled' => 'nullable|boolean',
            'analytics.mixpanel_token' => 'nullable|string',
            'analytics.mixpanel_enabled' => 'nullable|boolean',
            'analytics.log_level' => 'nullable|string|in:debug,info,warning,error',
            'analytics.log_api_requests' => 'nullable|boolean',
            // Compliance
            'compliance.terms_url' => 'nullable|url',
            'compliance.privacy_url' => 'nullable|url',
            'compliance.cookie_policy_url' => 'nullable|url',
            'compliance.gdpr_enabled' => 'nullable|boolean',
            'compliance.data_retention_days' => 'nullable|integer|min:30|max:2555',
            'compliance.data_officer_email' => 'nullable|email',
            'compliance.cookie_consent_required' => 'nullable|boolean',
            'compliance.allow_data_export' => 'nullable|boolean',
            'compliance.allow_data_deletion' => 'nullable|boolean',
            // Performance
            'performance.cache_driver' => 'nullable|string|in:file,redis,memcached,database,array,null',
            'performance.cache_ttl' => 'nullable|integer|min:60',
            'performance.cache_enabled' => 'nullable|boolean',
            'performance.queue_connection' => 'nullable|string|in:database,redis,sqs,beanstalkd',
            'performance.queue_max_attempts' => 'nullable|integer|min:1|max:10',
            'performance.queue_timeout' => 'nullable|integer|min:30',
            'performance.db_connection_pool' => 'nullable|integer|min:5|max:100',
            'performance.query_timeout' => 'nullable|integer|min:5',
            'performance.query_logging_enabled' => 'nullable|boolean',
            'performance.max_upload_size' => 'nullable|integer|min:1|max:100',
            'performance.allowed_file_types' => 'nullable|string|max:255',
            // Features
            'features.user_registration' => 'nullable|boolean',
            'features.email_verification' => 'nullable|boolean',
            'features.account_creation' => 'nullable|boolean',
            'features.public_api' => 'nullable|boolean',
            'features.webhooks' => 'nullable|boolean',
            'features.analytics' => 'nullable|boolean',
            // Pusher
            'pusher.app_id' => 'nullable|string',
            'pusher.key' => 'nullable|string',
            'pusher.secret' => 'nullable|string',
            'pusher.cluster' => 'nullable|string',
            // Mail
            'mail.driver' => 'nullable|string|in:smtp,sendmail,mailgun,ses,postmark,log,array',
            'mail.host' => 'nullable|string',
            'mail.port' => 'nullable|integer|min:1|max:65535',
            'mail.username' => 'nullable|string',
            'mail.password' => 'nullable|string',
            'mail.encryption' => 'nullable|string|in:tls,ssl,none',
            'mail.from_address' => 'nullable|email',
            'mail.from_name' => 'nullable|string|max:255',
            // Storage
            'storage.default' => 'nullable|string|in:local,public,s3',
            'storage.s3_key' => 'nullable|string',
            'storage.s3_secret' => 'nullable|string',
            'storage.s3_region' => 'nullable|string',
            'storage.s3_bucket' => 'nullable|string',
            // Branding
            'branding.platform_name' => 'nullable|string|max:255',
            'branding.primary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'branding.secondary_color' => 'nullable|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'branding.support_email' => 'nullable|email|max:255',
            'branding.support_phone' => 'nullable|string|max:50',
            'branding.remove_logo' => 'nullable|boolean',
            'branding.remove_logo_dark' => 'nullable|boolean',
            'branding.remove_sidebar_icon' => 'nullable|boolean',
            'branding.remove_sidebar_icon_dark' => 'nullable|boolean',
            'branding.remove_favicon' => 'nullable|boolean',
            'branding.remove_favicon_dark' => 'nullable|boolean',
            // AI
            'ai.enabled' => 'nullable|boolean',
            'ai.provider' => 'nullable|string|in:openai,anthropic,gemini',
            'ai.openai_api_key' => 'nullable|string',
            'ai.openai_model' => 'nullable|string|max:100',
            'ai.anthropic_api_key' => 'nullable|string',
            'ai.anthropic_model' => 'nullable|string|max:100',
            'ai.gemini_api_key' => 'nullable|string',
            'ai.gemini_model' => 'nullable|string|max:100',
            'ai.system_prompt' => 'nullable|string|max:2000',
            'ai.temperature' => 'nullable|numeric|min:0|max:1',
            'ai.max_tokens' => 'nullable|integer|min:50|max:2000',
            'ai.voice_enabled' => 'nullable|boolean',
            'ai.voice_stt_provider' => 'nullable|string|in:elevenlabs,openai',
            'ai.voice_tts_provider' => 'nullable|string|in:elevenlabs,openai',
            'ai.voice_fallback_provider' => 'nullable|string|in:openai,elevenlabs,none',
            'ai.elevenlabs_api_key' => 'nullable|string|max:255',
            'ai.elevenlabs_stt_model' => 'nullable|string|max:100',
            'ai.elevenlabs_tts_model' => 'nullable|string|max:100',
            'ai.elevenlabs_voice_id' => 'nullable|string|max:120',
            'ai.voice_openai_api_key' => 'nullable|string|max:255',
            'ai.openai_stt_model' => 'nullable|string|max:100',
            'ai.openai_tts_model' => 'nullable|string|max:100',
            'ai.openai_voice' => 'nullable|string|max:80',
            // WhatsApp Meta
            'whatsapp.embedded_enabled' => 'nullable|boolean',
            'whatsapp.meta_app_id' => 'nullable|string|max:255',
            'whatsapp.meta_app_secret' => 'nullable|string|max:255',
            'whatsapp.embedded_signup_config_id' => 'nullable|string|max:255',
            'whatsapp.coexistence_signup_config_id' => 'nullable|string|max:255',
            'whatsapp.api_version' => 'nullable|string|max:10',
            'whatsapp.central_webhook_verify_token' => 'nullable|string|min:12|max:255',
            'logo' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/svg+xml|max:5120',
            'logo_dark' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/svg+xml|max:5120',
            'sidebar_icon' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/svg+xml|max:2048',
            'sidebar_icon_dark' => 'nullable|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/svg+xml|max:2048',
            'favicon' => 'nullable|file|mimes:ico,png|max:512',
            'favicon_dark' => 'nullable|file|mimes:ico,png|max:512']);

        $brandingService = app(\App\Services\BrandingService::class);
        $brandingInput = (array) $request->input('branding', []);

        if (filter_var($brandingInput['remove_logo'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $brandingService->deleteLogo();
        }

        if (filter_var($brandingInput['remove_logo_dark'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $brandingService->deleteDarkLogo();
        }

        if (filter_var($brandingInput['remove_sidebar_icon'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $brandingService->deleteSidebarIcon();
        }

        if (filter_var($brandingInput['remove_sidebar_icon_dark'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $brandingService->deleteDarkSidebarIcon();
        }

        if (filter_var($brandingInput['remove_favicon'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $brandingService->deleteFavicon();
        }

        if (filter_var($brandingInput['remove_favicon_dark'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            $brandingService->deleteDarkFavicon();
        }

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $brandingService->uploadLogo($request->file('logo'));
        }

        if ($request->hasFile('logo_dark')) {
            $brandingService->uploadDarkLogo($request->file('logo_dark'));
        }

        if ($request->hasFile('sidebar_icon')) {
            $brandingService->uploadSidebarIcon($request->file('sidebar_icon'));
        }

        if ($request->hasFile('sidebar_icon_dark')) {
            $brandingService->uploadDarkSidebarIcon($request->file('sidebar_icon_dark'));
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            $brandingService->uploadFavicon($request->file('favicon'));
        }

        if ($request->hasFile('favicon_dark')) {
            $brandingService->uploadDarkFavicon($request->file('favicon_dark'));
        }

        // Update all settings groups
        $groups = ['general', 'security', 'payment', 'integrations', 'analytics', 'compliance', 'performance', 'features', 'pusher', 'mail', 'storage', 'branding', 'ai', 'whatsapp'];

        // Define boolean fields that need explicit handling (for unchecked checkboxes)
        $booleanFields = [
            'payment' => ['razorpay_enabled', 'wallet_self_topup_enabled', 'self_hosted_payments_enabled', 'method_upi_enabled', 'method_bank_enabled', 'method_manual_enabled', 'method_razorpay_enabled', 'auto_disable_overdue_enabled'],
            'security' => ['password_require_uppercase', 'password_require_lowercase', 'password_require_numbers', 'password_require_symbols', 'require_2fa'],
            'integrations' => ['api_enabled', 'webhooks_enabled', 'google_oauth_enabled'],
            'analytics' => ['google_analytics_enabled', 'mixpanel_enabled', 'log_api_requests'],
            'compliance' => ['gdpr_enabled', 'cookie_consent_required', 'allow_data_export', 'allow_data_deletion'],
            'performance' => ['cache_enabled', 'query_logging_enabled'],
            'features' => ['user_registration', 'email_verification', 'account_creation', 'public_api', 'webhooks', 'analytics'],
            'general' => ['maintenance_mode'],
            'ai' => ['enabled', 'voice_enabled'],
            'whatsapp' => ['embedded_enabled']];

        foreach ($groups as $group) {
            // Handle both nested array format and dot-notation format
            $groupData = $validated[$group] ?? $request->input($group, []);

            // For boolean fields, explicitly set to false if not present (unchecked checkbox)
            if (isset($booleanFields[$group])) {
                foreach ($booleanFields[$group] as $boolKey) {
                    if (! isset($groupData[$boolKey])) {
                        $groupData[$boolKey] = false;
                    }
                }
            }

            if (is_array($groupData) && ! empty($groupData)) {
                foreach ($groupData as $key => $value) {
                    if ($group === 'branding' && in_array($key, [
                        'logo_url',
                        'logo_dark_url',
                        'sidebar_icon_url',
                        'sidebar_icon_dark_url',
                        'favicon_url',
                        'favicon_dark_url',
                        'logo_path',
                        'logo_dark_path',
                        'sidebar_icon_path',
                        'sidebar_icon_dark_path',
                        'favicon_path',
                        'favicon_dark_path',
                        'remove_logo',
                        'remove_logo_dark',
                        'remove_sidebar_icon',
                        'remove_sidebar_icon_dark',
                        'remove_favicon',
                        'remove_favicon_dark',
                        'footer_text',
                        'show_powered_by',
                    ], true)) {
                        continue;
                    }

                    // Skip null values but allow false/0/empty string
                    if ($value !== null) {
                        // Determine type - check if it's a known boolean field first
                        $isBooleanField = isset($booleanFields[$group]) && in_array($key, $booleanFields[$group]);

                        if ($isBooleanField) {
                            // Convert to boolean if it's a known boolean field
                            $value = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                            if ($value === null) {
                                $value = false; // Default to false if conversion fails
                            }
                            $type = 'boolean';
                        } else {
                            $type = is_bool($value) ? 'boolean' : (is_int($value) ? 'integer' : (is_float($value) ? 'float' : 'string'));
                        }

                        PlatformSetting::set("{$group}.{$key}", $value, $type, $group);
                    }
                }
            }
        }

        if ($request->has('mail')) {
            app(PlatformSettingsService::class)->applyMailConfig((array) $request->input('mail', []));
        }

        return redirect()->route('platform.settings')
            ->with('success', 'Settings updated successfully.');
    }

    private function normalizePerformanceSettings(array $performance): array
    {
        if (array_key_exists('cache_driver', $performance)) {
            $cacheDriver = strtolower(trim((string) $performance['cache_driver']));
            $cacheDriver = $cacheDriver === '' || $cacheDriver === 'default'
                ? (string) config('cache.default', 'file')
                : $cacheDriver;

            $performance['cache_driver'] = match ($cacheDriver) {
                'apc', 'apcu' => 'array',
                'none' => 'null',
                default => $cacheDriver,
            };
        }

        if (array_key_exists('queue_connection', $performance)) {
            $queueConnection = strtolower(trim((string) $performance['queue_connection']));
            $performance['queue_connection'] = $queueConnection === '' || $queueConnection === 'default'
                ? (string) config('queue.default', 'database')
                : $queueConnection;
        }

        return $performance;
    }

    public function testMail(Request $request)
    {
        $validated = $request->validate([
            'test_email' => 'required|email',
            'mail.driver' => 'required|string|in:smtp,sendmail,mailgun,ses,postmark,log,array',
            'mail.host' => 'nullable|string',
            'mail.port' => 'nullable|integer|min:1|max:65535',
            'mail.username' => 'nullable|string',
            'mail.password' => 'nullable|string',
            'mail.encryption' => 'nullable|string|in:tls,ssl,none',
            'mail.from_address' => 'nullable|email',
            'mail.from_name' => 'nullable|string|max:255',
        ]);

        $mailInput = (array) ($validated['mail'] ?? []);
        $testEmail = (string) $validated['test_email'];
        app(PlatformSettingsService::class)->applyMailConfig($mailInput);

        $subject = '[Zyptos] SMTP Test - '.now()->format('Y-m-d H:i:s');
        $body = implode("\n", [
            'This is a test email from Zyptos Platform Settings.',
            '',
            'Diagnostics:',
            '- Driver: '.(string) config('mail.default'),
            '- SMTP Host: '.(string) config('mail.mailers.smtp.host'),
            '- SMTP Port: '.(string) config('mail.mailers.smtp.port'),
            '- Encryption: '.(string) (config('mail.mailers.smtp.encryption') ?? 'none'),
            '- Timestamp: '.now()->toIso8601String(),
        ]);

        $outboxService = app(NotificationOutboxService::class);
        $outbox = $outboxService->queueForMail(
            recipient: $testEmail,
            templateKey: 'platform_mail_test',
            subject: $subject,
            account: null,
            meta: ['feature' => 'platform_mail_test']
        );

        try {
            Mail::raw($body, function ($message) use ($testEmail, $subject, $outbox) {
                $message->to($testEmail)->subject($subject);
                $message->getHeaders()->addTextHeader('X-Zyptos-Outbox-Id', (string) $outbox->id);
            });

            PlatformSetting::set('mail.test.last_success_at', now()->toIso8601String(), 'string', 'mail');

            return redirect()->route('platform.settings', ['tab' => 'mail'])
                ->with('success', "Test email sent to {$testEmail} using driver '".config('mail.default')."'.");
        } catch (Throwable $smtpError) {
            $error = mb_substr($smtpError->getMessage(), 0, 500);
            $outboxService->markFailed($outbox, $error);

            try {
                // If SMTP fails, force a log transport fallback so operators can still inspect mail payloads.
                Mail::mailer('log')->raw($body, function ($message) use ($testEmail, $subject) {
                    $message->to($testEmail)->subject($subject.' [FALLBACK LOG]');
                });

                PlatformSetting::set('mail.fallback.last_triggered_at', now()->toIso8601String(), 'string', 'mail');
                PlatformSetting::set('mail.fallback.last_error', $error, 'string', 'mail');

                Log::warning('SMTP test failed, mail fallback to log transport was used', [
                    'test_email' => $testEmail,
                    'driver' => config('mail.default'),
                    'error' => $error,
                ]);

                return redirect()->route('platform.settings', ['tab' => 'mail'])
                    ->with('warning', 'SMTP test failed. Fallback to log mailer was used. Check logs and delivery diagnostics.');
            } catch (Throwable $fallbackError) {
                $fallbackErrorMessage = mb_substr($fallbackError->getMessage(), 0, 500);

                PlatformSetting::set('mail.fallback.last_triggered_at', now()->toIso8601String(), 'string', 'mail');
                PlatformSetting::set('mail.fallback.last_error', $error.' | Fallback failed: '.$fallbackErrorMessage, 'string', 'mail');

                Log::error('Mail test failed for both SMTP and fallback log transport', [
                    'test_email' => $testEmail,
                    'driver' => config('mail.default'),
                    'smtp_error' => $error,
                    'fallback_error' => $fallbackErrorMessage,
                ]);

                return redirect()->route('platform.settings', ['tab' => 'mail'])
                    ->with('error', 'SMTP test failed and fallback could not be written. Check server logs.');
            }
        }
    }

    public function testVoice(Request $request, VoiceProviderService $voiceProvider)
    {
        $validated = $request->validate([
            'text' => 'nullable|string|max:500',
        ]);

        try {
            $result = $voiceProvider->synthesize($validated['text'] ?? 'This is a Zyptos voice test.');
            PlatformSetting::set('ai.voice_test.last_success_at', now()->toIso8601String(), 'string', 'ai');

            return redirect()->route('platform.settings', ['tab' => 'ai'])
                ->with('success', 'Voice test generated using '.$result['provider'].($result['fallback_used'] ? ' fallback' : '').'.');
        } catch (Throwable $e) {
            PlatformSetting::set('ai.voice_test.last_error', mb_substr($e->getMessage(), 0, 500), 'string', 'ai');

            return redirect()->route('platform.settings', ['tab' => 'ai'])
                ->with('error', 'Voice test failed: '.$e->getMessage());
        }
    }
}
