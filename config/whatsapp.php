<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Meta (Cloud API) Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Meta Graph API + Embedded Signup.
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
    | WhatsApp Webhook Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for WhatsApp webhook security and rate limiting.
    |
    */

    'webhook' => [
        /*
        |--------------------------------------------------------------------------
        | Allowed IPs
        |--------------------------------------------------------------------------
        |
        | If set, only these IPs will be allowed to send webhooks.
        | Leave empty to allow all IPs (not recommended for production).
        | Meta's IP ranges can be found in their documentation.
        |
        */
        'allowed_ips' => env('WHATSAPP_WEBHOOK_ALLOWED_IPS', ''), // Comma-separated list

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
