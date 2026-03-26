<?php

namespace Tests\Feature\WhatsApp;

use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Http\Controllers\WebhookController;
use App\Modules\WhatsApp\Http\Middleware\WebhookSecurity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Mockery;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class WebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_security_middleware_logs_redacted_context_for_missing_signature(): void
    {
        config()->set('whatsapp.tech_provider.verified_mode', true);
        config()->set('whatsapp.meta.app_secret', 'test-secret');

        Log::shouldReceive('channel')->once()->with('whatsapp')->andReturnSelf();
        Log::shouldReceive('warning')
            ->once()
            ->with('Webhook POST rejected: missing signature', Mockery::on(function (array $context): bool {
                return isset($context['method'], $context['path'], $context['ip'])
                    && !array_key_exists('query_params', $context)
                    && !array_key_exists('full_url', $context)
                    && !array_key_exists('allowed_ips', $context)
                    && !array_key_exists('trace', $context);
            }));

        $middleware = new WebhookSecurity();
        $request = Request::create('/webhooks/whatsapp?hub_verify_token=secret', 'POST', [], [], [], [], json_encode([
            'entry' => [],
        ]));

        try {
            $middleware->handle($request, fn () => response()->json(['ok' => true]));
            $this->fail('Expected missing signature request to abort.');
        } catch (HttpException $e) {
            $this->assertSame(401, $e->getStatusCode());
        }
    }

    public function test_verify_logging_does_not_include_sensitive_query_details(): void
    {
        config()->set('whatsapp.webhook.debug_logging', true);
        PlatformSetting::set('whatsapp.webhook_verify_token', 'test-verify-token', 'string', 'whatsapp');

        Log::shouldReceive('channel')->with('whatsapp')->andReturnSelf()->times(2);
        Log::shouldReceive('info')
            ->once()
            ->with('Central webhook verify called', Mockery::on(function (array $context): bool {
                return isset($context['method'], $context['path'])
                    && !array_key_exists('full_url', $context)
                    && !array_key_exists('query_params', $context);
            }));
        Log::shouldReceive('info')
            ->once()
            ->with('Central webhook verification attempt', Mockery::on(function (array $context): bool {
                return ($context['mode'] ?? null) === 'subscribe'
                    && ($context['has_challenge'] ?? false) === true
                    && ($context['verify_token_configured'] ?? false) === true
                    && !array_key_exists('query_params', $context)
                    && !array_key_exists('token_received_length', $context)
                    && !array_key_exists('token_expected_length', $context);
            }));

        $controller = app(WebhookController::class);
        $request = Request::create('/webhooks/whatsapp', 'GET', [
            'hub.mode' => 'subscribe',
            'hub.verify_token' => 'test-verify-token',
            'hub.challenge' => 'challenge-123',
        ]);

        $response = $controller->verify($request);

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame('challenge-123', $response->getContent());
    }
}
