<?php

namespace Tests\Feature\WhatsApp;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConnectionHealthSnapshot;
use App\Modules\WhatsApp\Services\ConnectionHealthSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ConnectionHealthSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_sync_persists_snapshot_and_updates_connection_fields(): void
    {
        Http::fake([
            'https://graph.facebook.com/*/123456789012345*' => Http::response([
                'display_phone_number' => '+91 90000 00000',
                'verified_name' => 'Zyptos',
                'quality_rating' => 'GREEN',
                'messaging_limit_tier' => 'TIER_1K',
                'code_verification_status' => 'VERIFIED',
                'name_status' => 'APPROVED',
            ], 200),
            'https://graph.facebook.com/*/987654321012345*' => Http::response([
                'id' => '987654321012345',
                'name' => 'Demo WABA',
                'account_review_status' => 'APPROVED',
                'business_verification_status' => 'VERIFIED',
            ], 200),
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'waba_id' => '987654321012345',
            'phone_number_id' => '123456789012345',
            'access_token' => 'test-token',
            'is_active' => true,
        ]);

        /** @var ConnectionHealthSyncService $service */
        $service = app(ConnectionHealthSyncService::class);
        $snapshot = $service->syncConnection($connection, 'api_sync');

        $this->assertNotNull($snapshot);
        $this->assertDatabaseHas('whatsapp_connection_health_snapshots', [
            'id' => $snapshot->id,
            'whatsapp_connection_id' => $connection->id,
            'quality_rating' => 'GREEN',
            'health_state' => 'healthy',
            'source' => 'api_sync',
        ]);

        $connection->refresh();
        $this->assertSame('GREEN', $connection->quality_rating);
        $this->assertSame('TIER_1K', $connection->messaging_limit_tier);
        $this->assertSame('HEALTHY', strtoupper((string) $connection->health_state));
        $this->assertNotNull($connection->health_last_synced_at);
        $this->assertSame('fresh', $connection->metadata_sync_status);
        $this->assertNull($connection->metadata_last_sync_error);
        $this->assertArrayHasKey('raw_payload', $snapshot->health_notes ?? []);
    }

    public function test_webhook_sync_marks_connection_as_warning_for_low_quality(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'is_active' => true,
            'quality_rating' => 'GREEN',
        ]);

        /** @var ConnectionHealthSyncService $service */
        $service = app(ConnectionHealthSyncService::class);
        $snapshot = $service->syncFromWebhook($connection, 'phone_number_quality_update', [
            'event' => 'quality_update',
            'quality_rating' => 'LOW',
            'messaging_limit_tier' => 'TIER_1K',
        ]);

        $this->assertNotNull($snapshot);
        $this->assertSame('warning', $snapshot->health_state);
        $this->assertSame('LOW', $snapshot->quality_rating);

        $connection->refresh();
        $this->assertSame('LOW', $connection->quality_rating);
        $this->assertSame('warning', $connection->health_state);
        $this->assertSame('low_quality', $connection->warning_state);
    }
}
