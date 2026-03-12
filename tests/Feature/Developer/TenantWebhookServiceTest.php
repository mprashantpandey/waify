<?php

namespace Tests\Feature\Developer;

use App\Models\Account;
use App\Models\TenantWebhookDelivery;
use App\Models\TenantWebhookEndpoint;
use App\Models\TenantWebhookSubscription;
use App\Models\User;
use App\Modules\Developer\Jobs\DeliverTenantWebhookJob;
use App\Modules\Developer\Services\TenantWebhookService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TenantWebhookServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_update_and_replay_webhook_delivery_via_controller_routes(): void
    {
        $this->withoutMiddleware();

        $owner = User::factory()->create();
        $account = Account::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.developer.webhooks.store'), [
                'name' => 'My endpoint',
                'url' => 'https://example.test/webhook',
                'event_keys' => ['message.sent', 'message.read'],
                'timeout_seconds' => 8,
                'max_retries' => 4,
            ])
            ->assertRedirect();

        $endpoint = TenantWebhookEndpoint::query()->where('account_id', $account->id)->first();
        $this->assertNotNull($endpoint);
        $this->assertSame('My endpoint', $endpoint->name);

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->patch(route('app.developer.webhooks.update', ['id' => $endpoint->id]), [
                'is_active' => false,
                'event_keys' => ['message.failed'],
            ])
            ->assertRedirect();

        $endpoint->refresh();
        $this->assertFalse($endpoint->is_active);
        $this->assertDatabaseHas('tenant_webhook_subscriptions', [
            'tenant_webhook_endpoint_id' => $endpoint->id,
            'event_key' => 'message.failed',
            'is_enabled' => true,
        ]);

        $delivery = TenantWebhookDelivery::create([
            'account_id' => $account->id,
            'tenant_webhook_endpoint_id' => $endpoint->id,
            'event_key' => 'message.failed',
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'payload' => ['k' => 'v'],
            'status' => 'giving_up',
            'attempts' => 3,
            'error_message' => 'HTTP 500',
        ]);

        Bus::fake();
        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.developer.webhook-deliveries.replay', ['id' => $delivery->id]))
            ->assertRedirect();

        $delivery->refresh();
        $this->assertSame('pending', $delivery->status);
        $this->assertNull($delivery->error_message);
        Bus::assertDispatched(DeliverTenantWebhookJob::class, 1);
    }

    public function test_dispatch_event_creates_deliveries_only_for_subscribed_endpoints(): void
    {
        Bus::fake();

        $account = Account::factory()->create();
        $subscribed = TenantWebhookEndpoint::create([
            'account_id' => $account->id,
            'name' => 'Subscribed',
            'url' => 'https://example.test/subscribed',
            'signing_secret' => 'secret_subscribed_123456',
            'is_active' => true,
            'timeout_seconds' => 10,
            'max_retries' => 3,
        ]);
        TenantWebhookSubscription::create([
            'tenant_webhook_endpoint_id' => $subscribed->id,
            'event_key' => 'message.sent',
            'is_enabled' => true,
        ]);

        $unsubscribed = TenantWebhookEndpoint::create([
            'account_id' => $account->id,
            'name' => 'Unsubscribed',
            'url' => 'https://example.test/unsubscribed',
            'signing_secret' => 'secret_unsubscribed_123456',
            'is_active' => true,
            'timeout_seconds' => 10,
            'max_retries' => 3,
        ]);
        TenantWebhookSubscription::create([
            'tenant_webhook_endpoint_id' => $unsubscribed->id,
            'event_key' => 'message.read',
            'is_enabled' => true,
        ]);

        $count = app(TenantWebhookService::class)->dispatchEvent($account, 'message.sent', [
            'message_id' => 1,
        ]);

        $this->assertSame(1, $count);
        $this->assertDatabaseHas('tenant_webhook_deliveries', [
            'account_id' => $account->id,
            'tenant_webhook_endpoint_id' => $subscribed->id,
            'event_key' => 'message.sent',
        ]);
        $this->assertDatabaseMissing('tenant_webhook_deliveries', [
            'account_id' => $account->id,
            'tenant_webhook_endpoint_id' => $unsubscribed->id,
            'event_key' => 'message.sent',
        ]);
        Bus::assertDispatched(DeliverTenantWebhookJob::class, 1);
    }

    public function test_delivery_job_signs_payload_and_marks_delivery_successful(): void
    {
        Http::fake([
            'https://receiver.example.com/*' => Http::response(['ok' => true], 200),
        ]);

        $account = Account::factory()->create();
        $endpoint = TenantWebhookEndpoint::create([
            'account_id' => $account->id,
            'name' => 'Receiver',
            'url' => 'https://receiver.example.com/hook',
            'signing_secret' => 'my_test_signing_secret_123456',
            'is_active' => true,
            'timeout_seconds' => 10,
            'max_retries' => 3,
        ]);

        $delivery = TenantWebhookDelivery::create([
            'account_id' => $account->id,
            'tenant_webhook_endpoint_id' => $endpoint->id,
            'event_key' => 'message.sent',
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'idempotency_key' => 'idemp_123',
            'payload' => ['hello' => 'world'],
            'status' => 'pending',
            'attempts' => 0,
        ]);

        (new DeliverTenantWebhookJob($delivery->id))->handle();

        $delivery->refresh();
        $this->assertSame('delivered', $delivery->status);
        $this->assertSame(1, $delivery->attempts);
        $this->assertSame(200, $delivery->http_status);
        $this->assertNotNull($delivery->delivered_at);

        Http::assertSent(function ($request) use ($delivery) {
            return $request->hasHeader('X-Waify-Event', 'message.sent')
                && $request->hasHeader('X-Waify-Event-Id', $delivery->event_id)
                && $request->hasHeader('X-Waify-Idempotency-Key', 'idemp_123')
                && $request->hasHeader('X-Waify-Timestamp')
                && $request->hasHeader('X-Waify-Signature');
        });
    }

    public function test_replay_delivery_resets_status_and_dispatches_delivery_job(): void
    {
        Bus::fake();

        $account = Account::factory()->create();
        $endpoint = TenantWebhookEndpoint::create([
            'account_id' => $account->id,
            'name' => 'Replay endpoint',
            'url' => 'https://example.test/replay',
            'signing_secret' => 'replay_secret_123456',
            'is_active' => true,
            'timeout_seconds' => 10,
            'max_retries' => 3,
        ]);
        $delivery = TenantWebhookDelivery::create([
            'account_id' => $account->id,
            'tenant_webhook_endpoint_id' => $endpoint->id,
            'event_key' => 'message.failed',
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'payload' => ['error' => 'timeout'],
            'status' => 'giving_up',
            'attempts' => 4,
            'error_message' => 'HTTP 500',
        ]);

        app(TenantWebhookService::class)->replayDelivery($delivery);

        $delivery->refresh();
        $this->assertSame('pending', $delivery->status);
        $this->assertNull($delivery->error_message);
        Bus::assertDispatched(DeliverTenantWebhookJob::class, 1);
    }
}
