<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Services\PlatformSettingsValidationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingsController extends Controller
{
    /**
     * Display platform settings.
     */
    public function index(Request $request): Response
    {
        // Helper to get setting with fallback
        $get = fn($key, $default = null) => PlatformSetting::get($key, $default);

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
            'default_currency' => $get('payment.default_currency', 'USD'),
            'currency_symbol_position' => $get('payment.currency_symbol_position', 'before'),
            'tax_rate' => $get('payment.tax_rate', 0),
            'invoice_prefix' => $get('payment.invoice_prefix', 'INV-'),
            'invoice_number_start' => $get('payment.invoice_number_start', 1)];

        // Integrations Settings
        $integrationsSettings = [
            'api_key' => $get('integrations.api_key'),
            'api_rate_limit' => $get('integrations.api_rate_limit', 60),
            'api_enabled' => $get('integrations.api_enabled', false),
            'webhook_url' => $get('integrations.webhook_url'),
            'webhook_secret' => $get('integrations.webhook_secret'),
            'webhooks_enabled' => $get('integrations.webhooks_enabled', true)]; // Default to enabled

        // Analytics Settings
        $analyticsSettings = [
            'google_analytics_id' => $get('analytics.google_analytics_id'),
            'google_analytics_enabled' => $get('analytics.google_analytics_enabled', false),
            'mixpanel_token' => $get('analytics.mixpanel_token'),
            'mixpanel_enabled' => $get('analytics.mixpanel_enabled', false),
            'sentry_dsn' => $get('analytics.sentry_dsn'),
            'sentry_environment' => $get('analytics.sentry_environment', 'production'),
            'sentry_enabled' => $get('analytics.sentry_enabled', false),
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
            'analytics' => $get('features.analytics', true),
            'beta_features' => $get('features.beta_features', false),
            'maintenance_mode' => $get('features.maintenance_mode', false)];

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
            'platform_name' => $get('branding.platform_name', config('app.name', 'Waify')),
            'logo_path' => $get('branding.logo_path'),
            'logo_url' => $brandingService->getLogoUrl(),
            'favicon_path' => $get('branding.favicon_path'),
            'favicon_url' => $brandingService->getFaviconUrl(),
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
            'gemini_model' => $get('ai.gemini_model', 'gemini-1.5-flash'),
            'system_prompt' => $get('ai.system_prompt'),
            'temperature' => $get('ai.temperature', 0.2),
            'max_tokens' => $get('ai.max_tokens', 300)];

        // WhatsApp Meta Settings
        $whatsappSettings = [
            'embedded_enabled' => $get('whatsapp.embedded_enabled', null),
            'meta_app_id' => $get('whatsapp.meta_app_id', config('whatsapp.meta.app_id')),
            'meta_app_secret' => $get('whatsapp.meta_app_secret', config('whatsapp.meta.app_secret')),
            'system_user_token' => $get('whatsapp.system_user_token', config('whatsapp.meta.system_user_token')),
            'embedded_signup_config_id' => $get('whatsapp.embedded_signup_config_id', config('whatsapp.meta.embedded_signup_config_id')),
            'api_version' => $get('whatsapp.api_version', config('whatsapp.meta.api_version', 'v21.0'))];

        // Support Settings
        $supportFaqsRaw = $get('support.faqs');
        $supportFaqs = [];
        if (is_string($supportFaqsRaw) && $supportFaqsRaw !== '') {
            $supportFaqs = json_decode($supportFaqsRaw, true) ?: [];
        }

        $supportSettings = [
            'live_chat_enabled' => (bool) $get('support.live_chat_enabled', true),
            'ticket_support_enabled' => (bool) $get('support.ticket_support_enabled', true),
            'faqs' => is_array($supportFaqs) ? $supportFaqs : [],
            'sla_hours' => (int) $get('support.sla_hours', 48),
            'first_response_hours' => (int) $get('support.first_response_hours', 4),
            'email_notifications_enabled' => (bool) $get('support.email_notifications_enabled', true),
            'notify_admins' => (bool) $get('support.notify_admins', true),
            'notify_customers' => (bool) $get('support.notify_customers', true)];

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
            'support' => $supportSettings,
            'misconfigured_settings' => array_values($misconfiguredSettings)]);
    }

    /**
     * Update platform settings.
     */
    public function update(Request $request)
    {
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
            'payment.default_currency' => 'nullable|string|max:3',
            'payment.currency_symbol_position' => 'nullable|string|in:before,after',
            'payment.tax_rate' => 'nullable|numeric|min:0|max:100',
            'payment.invoice_prefix' => 'nullable|string|max:20',
            'payment.invoice_number_start' => 'nullable|integer|min:1',
            // Integrations
            'integrations.api_key' => 'nullable|string',
            'integrations.api_rate_limit' => 'nullable|integer|min:10',
            'integrations.api_enabled' => 'nullable|boolean',
            'integrations.webhook_url' => 'nullable|url',
            'integrations.webhook_secret' => 'nullable|string',
            'integrations.webhooks_enabled' => 'nullable|boolean',
            // Analytics
            'analytics.google_analytics_id' => 'nullable|string|max:50',
            'analytics.google_analytics_enabled' => 'nullable|boolean',
            'analytics.mixpanel_token' => 'nullable|string',
            'analytics.mixpanel_enabled' => 'nullable|boolean',
            'analytics.sentry_dsn' => 'nullable|string',
            'analytics.sentry_environment' => 'nullable|string|in:production,staging,development',
            'analytics.sentry_enabled' => 'nullable|boolean',
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
            'performance.cache_driver' => 'nullable|string|in:file,redis,memcached,database',
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
            'features.beta_features' => 'nullable|boolean',
            'features.maintenance_mode' => 'nullable|boolean',
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
            'mail.encryption' => 'nullable|string|in:tls,ssl',
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
            'branding.footer_text' => 'nullable|string|max:500',
            'branding.show_powered_by' => 'nullable|boolean',
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
            // WhatsApp Meta
            'whatsapp.embedded_enabled' => 'nullable|boolean',
            'whatsapp.meta_app_id' => 'nullable|string|max:255',
            'whatsapp.meta_app_secret' => 'nullable|string|max:255',
            'whatsapp.system_user_token' => 'nullable|string',
            'whatsapp.embedded_signup_config_id' => 'nullable|string|max:255',
            'whatsapp.api_version' => 'nullable|string|max:10',
            // Support
            'support.live_chat_enabled' => 'nullable|boolean',
            'support.ticket_support_enabled' => 'nullable|boolean',
            'support.faqs' => 'nullable|array',
            'support.faqs.*.question' => 'required_with:support.faqs|string|max:255',
            'support.faqs.*.answer' => 'required_with:support.faqs|string|max:5000',
            'support.faqs.*.category' => 'nullable|string|max:100',
            'support.faqs.*.enabled' => 'nullable|boolean',
            'support.faqs.*.order' => 'nullable|integer|min:0',
            'support.faqs.*.tags' => 'nullable|array',
            'support.faqs.*.tags.*' => 'nullable|string|max:50',
            'support.sla_hours' => 'nullable|integer|min:1|max:720',
            'support.first_response_hours' => 'nullable|integer|min:1|max:168',
            'support.email_notifications_enabled' => 'nullable|boolean',
            'support.notify_admins' => 'nullable|boolean',
            'support.notify_customers' => 'nullable|boolean',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'favicon' => 'nullable|image|mimes:ico,png|max:512']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $brandingService = app(\App\Services\BrandingService::class);
            $path = $brandingService->uploadLogo($request->file('logo'));
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            $brandingService = app(\App\Services\BrandingService::class);
            $path = $brandingService->uploadFavicon($request->file('favicon'));
        }

        // Update all settings groups
        $groups = ['general', 'security', 'payment', 'integrations', 'analytics', 'compliance', 'performance', 'features', 'pusher', 'mail', 'storage', 'branding', 'ai', 'whatsapp', 'support'];
        
        // Define boolean fields that need explicit handling (for unchecked checkboxes)
        $booleanFields = [
            'payment' => ['razorpay_enabled'],
            'security' => ['password_require_uppercase', 'password_require_lowercase', 'password_require_numbers', 'password_require_symbols', 'require_2fa'],
            'integrations' => ['api_enabled', 'webhooks_enabled'],
            'analytics' => ['google_analytics_enabled', 'mixpanel_enabled', 'sentry_enabled', 'log_api_requests'],
            'compliance' => ['gdpr_enabled', 'cookie_consent_required', 'allow_data_export', 'allow_data_deletion'],
            'performance' => ['cache_enabled', 'query_logging_enabled'],
            'features' => ['user_registration', 'email_verification', 'account_creation', 'public_api', 'webhooks', 'analytics', 'beta_features', 'maintenance_mode'],
            'general' => ['maintenance_mode'],
            'branding' => ['show_powered_by'],
            'ai' => ['enabled'],
            'whatsapp' => ['embedded_enabled'],
            'support' => ['live_chat_enabled', 'ticket_support_enabled', 'email_notifications_enabled', 'notify_admins', 'notify_customers']];
        
        foreach ($groups as $group) {
            // Handle both nested array format and dot-notation format
            $groupData = $validated[$group] ?? $request->input($group, []);
            
            // For boolean fields, explicitly set to false if not present (unchecked checkbox)
            if (isset($booleanFields[$group])) {
                foreach ($booleanFields[$group] as $boolKey) {
                    if (!isset($groupData[$boolKey])) {
                        $groupData[$boolKey] = false;
                    }
                }
            }
            
            if (is_array($groupData) && !empty($groupData)) {
                foreach ($groupData as $key => $value) {
                    // Skip null values but allow false/0/empty string
                    if ($value !== null) {
                        if ($group === 'support' && $key === 'faqs' && is_array($value)) {
                            $value = json_encode($value);
                        }
                        
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

        return redirect()->route('platform.settings')
            ->with('success', 'Settings updated successfully.');
    }
}
