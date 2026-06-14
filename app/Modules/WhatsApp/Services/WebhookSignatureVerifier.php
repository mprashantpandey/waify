<?php

namespace App\Modules\WhatsApp\Services;

use App\Models\AccountIntegration;
use App\Models\PlatformSetting;
use App\Support\SchemaCache;
use Illuminate\Http\Request;

class WebhookSignatureVerifier
{
    public function isStrict(): bool
    {
        return filter_var(config('whatsapp.webhook.strict_signature', true), FILTER_VALIDATE_BOOLEAN);
    }

    public function isValid(Request $request): bool
    {
        $secrets = $this->secrets();
        if ($secrets === []) {
            return true;
        }

        $signature = $request->header('X-Hub-Signature-256');
        if (! is_string($signature) || ! str_starts_with($signature, 'sha256=')) {
            return false;
        }

        $body = $request->getContent();
        foreach ($secrets as $secret) {
            $expected = 'sha256='.hash_hmac('sha256', $body, $secret);
            if (hash_equals($expected, $signature)) {
                return true;
            }
        }

        return false;
    }

    public function secrets(): array
    {
        $secrets = [];
        $this->pushSecret($secrets, PlatformSetting::get('whatsapp.meta_app_secret', config('whatsapp.meta.app_secret')));
        $this->pushSecret($secrets, config('whatsapp.meta.app_secret'));

        foreach (explode(',', (string) config('whatsapp.webhook.app_secrets', '')) as $secret) {
            $this->pushSecret($secrets, $secret);
        }

        if (SchemaCache::hasTable('account_integrations')) {
            AccountIntegration::query()
                ->whereIn('provider', ['meta', 'meta-leads', 'facebook', 'whatsapp'])
                ->whereNotNull('config')
                ->get()
                ->each(function (AccountIntegration $integration) use (&$secrets) {
                    $this->pushSecret($secrets, $integration->secret('app_secret'));
                    $this->pushSecret($secrets, $integration->secret('meta_app_secret'));
                });
        }

        return array_values(array_unique($secrets));
    }

    protected function pushSecret(array &$secrets, mixed $secret): void
    {
        if (! is_string($secret)) {
            return;
        }

        $secret = trim($secret);
        if ($secret !== '') {
            $secrets[] = $secret;
        }
    }
}
