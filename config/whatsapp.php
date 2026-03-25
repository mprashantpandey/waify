<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Meta (Cloud API) Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Meta Graph API + Embedded Signup.
    | Required for Meta Verified Tech Provider: META_APP_ID, META_APP_SECRET,
    | and (for Embedded Signup) META_EMBEDDED_SIGNUP_CONFIG_ID.
    |
    */

    'meta' => [
        'base_url' => env('META_GRAPH_BASE_URL', 'https://graph.facebook.com'),
        'api_version' => env('META_GRAPH_API_VERSION', 'v21.0'),
        'app_id' => env('META_APP_ID'),
        'app_secret' => env('META_APP_SECRET'),
        'system_user_token' => env('META_SYSTEM_USER_TOKEN'),
        'system_user_id' => env('META_SYSTEM_USER_ID'),
        'partner_business_id' => env('META_PARTNER_BUSINESS_ID'),
        'credit_line_id' => env('META_CREDIT_LINE_ID'),
        'strict_embedded_provisioning' => env('META_STRICT_EMBEDDED_PROVISIONING', false),
        'embedded_signup_config_id' => env('META_EMBEDDED_SIGNUP_CONFIG_ID'),
        'embedded_enabled' => env('META_EMBEDDED_SIGNUP_ENABLED'),
        // direct|obo (On-Behalf-Of template create mode)
        'template_api_mode' => env('META_TEMPLATE_API_MODE', 'direct'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Meta Verified Tech Provider
    |--------------------------------------------------------------------------
    |
    | When enabled, webhook POST requests MUST be verified with X-Hub-Signature-256.
    | If META_APP_SECRET is missing or signature is invalid, requests are rejected (401).
    | Set META_VERIFIED_TECH_PROVIDER=true in production when you are a Meta Verified
    | Tech Provider. When false, signature is verified only if META_APP_SECRET is set.
    |
    */

    'tech_provider' => [
        'verified_mode' => env('META_VERIFIED_TECH_PROVIDER', env('APP_ENV') === 'production'),
    ],

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for WhatsApp webhook security and rate limiting.
    | Meta does not publish a static IP allowlist for Cloud API; use signature
    | verification (META_APP_SECRET) as the primary security measure.
    |
    */

    'webhook' => [
        'verify_token' => env('META_WEBHOOK_VERIFY_TOKEN'),

        /*
        |--------------------------------------------------------------------------
        | Allowed IPs (optional)
        |--------------------------------------------------------------------------
        |
        | If set, only these IPs/CIDRs will be allowed. Leave empty to rely on
        | signature verification. Meta's webhook IPs are dynamic (AS32934); see
        | docs/META_VERIFIED_TECH_PROVIDER.md for details.
        |
        */
        'allowed_ips' => env('WHATSAPP_WEBHOOK_ALLOWED_IPS', ''),

        /*
        |--------------------------------------------------------------------------
        | Rate Limit
        |--------------------------------------------------------------------------
        |
        | Maximum number of webhook requests per connection per time window.
        |
        */
        'rate_limit' => env('WHATSAPP_WEBHOOK_RATE_LIMIT', 100),

        /*
        |--------------------------------------------------------------------------
        | Rate Limit Decay Minutes
        |--------------------------------------------------------------------------
        |
        | Time window in minutes for rate limiting.
        |
        */
        'rate_limit_decay' => env('WHATSAPP_WEBHOOK_RATE_LIMIT_DECAY', 1),

        /*
        |--------------------------------------------------------------------------
        | Webhook Idempotency TTL (seconds)
        |--------------------------------------------------------------------------
        */
        'dedupe_ttl' => env('WHATSAPP_WEBHOOK_DEDUPE_TTL', 300),

        /*
        |--------------------------------------------------------------------------
        | Queue Name
        |--------------------------------------------------------------------------
        |
        | Queue used for asynchronous webhook event processing. Keep this aligned
        | with your worker command in production.
        |
        */
        'queue' => env('WHATSAPP_WEBHOOK_QUEUE', 'webhooks'),

        /*
        |--------------------------------------------------------------------------
        | Consecutive Failure Alert Threshold
        |--------------------------------------------------------------------------
        */
        'failure_alert_threshold' => env('WHATSAPP_WEBHOOK_FAILURE_ALERT_THRESHOLD', 5),
    ],

    /*
    |--------------------------------------------------------------------------
    | Outbound Pipeline Throttles
    |--------------------------------------------------------------------------
    */
    'outbound' => [
        'global_per_minute' => env('WHATSAPP_OUTBOUND_GLOBAL_PER_MINUTE', 0), // 0 = disabled
        'per_tenant_per_minute' => env('WHATSAPP_OUTBOUND_TENANT_PER_MINUTE', 120),
        'per_connection_per_minute' => env('WHATSAPP_OUTBOUND_CONNECTION_PER_MINUTE', 60),
        'per_campaign_per_minute' => env('WHATSAPP_OUTBOUND_CAMPAIGN_PER_MINUTE', 40),
    ],

    /*
    |--------------------------------------------------------------------------
    | Template Sync Lifecycle
    |--------------------------------------------------------------------------
    */
    'templates' => [
        'stale_after_hours' => env('WHATSAPP_TEMPLATE_STALE_AFTER_HOURS', 24),
    ],

    /*
    |--------------------------------------------------------------------------
    | Connection Health Sync
    |--------------------------------------------------------------------------
    */
    'connection' => [
        'health_stale_after_hours' => env('WHATSAPP_CONNECTION_HEALTH_STALE_AFTER_HOURS', 24),
    ],

    /*
    |--------------------------------------------------------------------------
    | Compliance / Consent
    |--------------------------------------------------------------------------
    */
    'compliance' => [
        'global_opt_out_keywords' => array_values(array_filter(array_map('trim', explode(',', (string) env(
            'WHATSAPP_GLOBAL_OPT_OUT_KEYWORDS',
            'STOP,UNSUBSCRIBE,CANCEL,QUIT,END'
        ))))),
        'global_opt_in_keywords' => array_values(array_filter(array_map('trim', explode(',', (string) env(
            'WHATSAPP_GLOBAL_OPT_IN_KEYWORDS',
            'START,UNSTOP,SUBSCRIBE'
        ))))),
    ],
];
