<?php

namespace Tests\Feature\Console;

use App\Models\MetaPricingVersion;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformMetaReadinessCheckCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_fails_when_pricing_snapshot_is_missing(): void
    {
        $this->artisan('platform:meta-readiness-check --json')
            ->assertExitCode(1);
    }

    public function test_command_succeeds_when_core_readiness_checks_pass_without_failures(): void
    {
        WhatsAppConnection::factory()->create([
            'is_active' => true,
            'webhook_last_received_at' => now()->subMinutes(10),
            'health_last_synced_at' => now()->subMinutes(5),
            'metadata_sync_status' => 'fresh',
        ]);

        MetaPricingVersion::query()->create([
            'provider' => 'meta',
            'country_code' => 'IN',
            'currency' => 'INR',
            'effective_from' => now()->subDay(),
            'effective_to' => null,
            'is_active' => true,
            'notes' => 'test',
            'created_by' => null,
        ]);

        $this->artisan('platform:meta-readiness-check --json')
            ->assertExitCode(0);
    }
}
