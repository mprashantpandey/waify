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
        'embedded_signup_config_id' => env('META_EMBEDDED_SIGNUP_CONFIG_ID'),
        'embedded_enabled' => env('META_EMBEDDED_SIGNUP_ENABLED'),
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
    ],
];
