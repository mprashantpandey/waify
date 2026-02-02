<?php

namespace App\Services;

use App\Models\PlatformSetting;

class PlatformSettingsService
{
    /**
     * Get a setting value with fallback to config.
     */
    public function get(string $key, $default = null)
    {
        return PlatformSetting::get($key, $default);
    }

    /**
     * Get general settings.
     */
    public function getGeneral(): array
    {
        return [
            'platform_name' => $this->get('general.platform_name', config('app.name')),
            'platform_url' => $this->get('general.platform_url', config('app.url')),
            'support_email' => $this->get('general.support_email', config('mail.from.address')),
            'support_phone' => $this->get('general.support_phone'),
            'timezone' => $this->get('general.timezone', config('app.timezone', 'UTC')),
            'locale' => $this->get('general.locale', config('app.locale', 'en')),
            'date_format' => $this->get('general.date_format', 'Y-m-d'),
            'time_format' => $this->get('general.time_format', '24'),
            'maintenance_mode' => $this->get('general.maintenance_mode', false),
            'maintenance_message' => $this->get('general.maintenance_message', 'We are currently performing scheduled maintenance. Please check back shortly.'),
        ];
    }

    /**
     * Get security settings.
     */
    public function getSecurity(): array
    {
        return [
            'password_min_length' => $this->get('security.password_min_length', 8),
            'password_max_length' => $this->get('security.password_max_length', 128),
            'password_require_uppercase' => $this->get('security.password_require_uppercase', false),
            'password_require_lowercase' => $this->get('security.password_require_lowercase', false),
            'password_require_numbers' => $this->get('security.password_require_numbers', false),
            'password_require_symbols' => $this->get('security.password_require_symbols', false),
            'password_expiry_days' => $this->get('security.password_expiry_days', 0),
            'password_history_count' => $this->get('security.password_history_count', 0),
            'require_2fa' => $this->get('security.require_2fa', false),
            'session_timeout' => $this->get('security.session_timeout', 120),
            'max_login_attempts' => $this->get('security.max_login_attempts', 5),
            'lockout_duration' => $this->get('security.lockout_duration', 15),
            'api_rate_limit' => $this->get('security.api_rate_limit', 60),
            'web_rate_limit' => $this->get('security.web_rate_limit', 120),
            'ip_whitelist' => $this->get('security.ip_whitelist'),
        ];
    }

    /**
     * Get feature flags.
     */
    public function getFeatures(): array
    {
        return [
            'user_registration' => $this->get('features.user_registration', true),
            'email_verification' => $this->get('features.email_verification', false),
            'workspace_creation' => $this->get('features.workspace_creation', true),
            'public_api' => $this->get('features.public_api', false),
            'webhooks' => $this->get('features.webhooks', true),
            'analytics' => $this->get('features.analytics', true),
            'beta_features' => $this->get('features.beta_features', false),
            'maintenance_mode' => $this->get('features.maintenance_mode', false),
        ];
    }

    /**
     * Check if a feature is enabled.
     */
    public function isFeatureEnabled(string $feature): bool
    {
        $features = $this->getFeatures();
        return $features[$feature] ?? false;
    }

    /**
     * Check if maintenance mode is enabled.
     */
    public function isMaintenanceMode(): bool
    {
        $general = $this->getGeneral();
        return $general['maintenance_mode'] ?? false;
    }

    /**
     * Get password validation rules based on platform settings.
     */
    public function getPasswordRules(): array
    {
        $security = $this->getSecurity();
        
        $rules = ['required', 'confirmed'];
        
        $passwordRule = \Illuminate\Validation\Rules\Password::min($security['password_min_length']);
        
        if ($security['password_max_length'] < 128) {
            $passwordRule = $passwordRule->max($security['password_max_length']);
        }
        
        if ($security['password_require_uppercase']) {
            $passwordRule = $passwordRule->letters()->mixedCase();
        } elseif ($security['password_require_lowercase']) {
            $passwordRule = $passwordRule->letters();
        }
        
        if ($security['password_require_numbers']) {
            $passwordRule = $passwordRule->numbers();
        }
        
        if ($security['password_require_symbols']) {
            $passwordRule = $passwordRule->symbols();
        }
        
        $rules[] = $passwordRule;
        
        return $rules;
    }

    /**
     * Apply mail configuration from platform settings.
     */
    public function applyMailConfig(): void
    {
        $driver = $this->get('mail.driver', config('mail.default'));
        $host = $this->get('mail.host', config('mail.mailers.smtp.host'));
        $port = $this->get('mail.port', config('mail.mailers.smtp.port', 587));
        $username = $this->get('mail.username', config('mail.mailers.smtp.username'));
        $password = $this->get('mail.password', config('mail.mailers.smtp.password'));
        $encryption = $this->get('mail.encryption', config('mail.mailers.smtp.encryption', 'tls'));
        $fromAddress = $this->get('mail.from_address', config('mail.from.address'));
        $fromName = $this->get('mail.from_name', config('mail.from.name'));

        if ($driver) {
            config(['mail.default' => $driver]);
        }
        
        if ($host) {
            config(['mail.mailers.smtp.host' => $host]);
        }
        
        if ($port) {
            config(['mail.mailers.smtp.port' => $port]);
        }
        
        if ($username) {
            config(['mail.mailers.smtp.username' => $username]);
        }
        
        if ($password) {
            config(['mail.mailers.smtp.password' => $password]);
        }
        
        if ($encryption) {
            config(['mail.mailers.smtp.encryption' => $encryption]);
        }
        
        if ($fromAddress) {
            config(['mail.from.address' => $fromAddress]);
        }
        
        if ($fromName) {
            config(['mail.from.name' => $fromName]);
        }
    }

    /**
     * Apply Pusher configuration from platform settings.
     */
    public function applyPusherConfig(): void
    {
        $appId = $this->get('pusher.app_id', config('broadcasting.connections.pusher.app_id'));
        $key = $this->get('pusher.key', config('broadcasting.connections.pusher.key'));
        $secret = $this->get('pusher.secret', config('broadcasting.connections.pusher.secret'));
        $cluster = $this->get('pusher.cluster', config('broadcasting.connections.pusher.options.cluster'));
        $cluster = is_string($cluster) ? trim($cluster) : $cluster;

        if ($appId) {
            config(['broadcasting.connections.pusher.app_id' => $appId]);
        }
        
        if ($key) {
            config(['broadcasting.connections.pusher.key' => $key]);
        }
        
        if ($secret) {
            config(['broadcasting.connections.pusher.secret' => $secret]);
        }
        
        if ($cluster) {
            config(['broadcasting.connections.pusher.options.cluster' => $cluster]);
        }

        if ($appId && $key && $secret) {
            config(['broadcasting.default' => 'pusher']);
        }
    }

    /**
     * Apply WhatsApp Meta configuration from platform settings.
     */
    public function applyWhatsAppConfig(): void
    {
        $appId = $this->get('whatsapp.meta_app_id', config('whatsapp.meta.app_id'));
        $appSecret = $this->get('whatsapp.meta_app_secret', config('whatsapp.meta.app_secret'));
        $systemUserToken = $this->get('whatsapp.system_user_token', config('whatsapp.meta.system_user_token'));
        $embeddedConfigId = $this->get('whatsapp.embedded_signup_config_id', config('whatsapp.meta.embedded_signup_config_id'));
        $apiVersion = $this->get('whatsapp.api_version', config('whatsapp.meta.api_version', 'v21.0'));
        $embeddedEnabled = $this->get('whatsapp.embedded_enabled');

        if ($appId) {
            config(['whatsapp.meta.app_id' => $appId]);
        }
        if ($appSecret) {
            config(['whatsapp.meta.app_secret' => $appSecret]);
        }
        if ($systemUserToken) {
            config(['whatsapp.meta.system_user_token' => $systemUserToken]);
        }
        if ($embeddedConfigId) {
            config(['whatsapp.meta.embedded_signup_config_id' => $embeddedConfigId]);
        }
        if ($apiVersion) {
            config(['whatsapp.meta.api_version' => $apiVersion]);
        }
        if ($embeddedEnabled !== null) {
            config(['whatsapp.meta.embedded_enabled' => (bool) $embeddedEnabled]);
        }
    }

    /**
     * Apply timezone and locale from platform settings.
     */
    public function applyLocalization(): void
    {
        $timezone = $this->get('general.timezone', config('app.timezone', 'UTC'));
        $locale = $this->get('general.locale', config('app.locale', 'en'));

        if ($timezone) {
            config(['app.timezone' => $timezone]);
            date_default_timezone_set($timezone);
        }
        
        if ($locale) {
            config(['app.locale' => $locale]);
            app()->setLocale($locale);
        }
    }
}
