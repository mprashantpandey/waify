<?php

namespace Tests\Unit;

use App\Models\Account;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\OutboundMessagePipelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class OutboundMessagePipelineServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_begin_creates_outbound_pipeline_record(): void
    {
        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);

        $service = app(OutboundMessagePipelineService::class);
        $job = $service->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'message_type' => 'text',
            'to_wa_id' => '919999999999',
            'idempotency_key' => sha1('demo'),
            'request_payload' => ['message' => 'hello'],
        ]);

        $this->assertNotNull($job);
        $this->assertDatabaseHas('whatsapp_outbound_message_jobs', [
            'id' => $job->id,
            'status' => 'queued',
            'message_type' => 'text',
        ]);
    }

    public function test_rate_limit_throws_when_tenant_cap_is_exceeded(): void
    {
        Cache::flush();

        config()->set('whatsapp.outbound.per_tenant_per_minute', 1);
        config()->set('whatsapp.outbound.per_connection_per_minute', 0);
        config()->set('whatsapp.outbound.per_campaign_per_minute', 0);
        config()->set('whatsapp.outbound.global_per_minute', 0);

        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);

        $service = app(OutboundMessagePipelineService::class);
        $service->assertRateLimits($account, $connection);

        $this->expectException(\RuntimeException::class);
        $service->assertRateLimits($account, $connection);
    }
}

