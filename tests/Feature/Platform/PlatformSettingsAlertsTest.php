<?php

namespace Tests\Feature\Platform;

use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformSettingsAlertsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_update_operational_alert_settings(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $response = $this->actingAs($superAdmin)
            ->post(route('platform.settings.update'), [
                '_settings_section' => 'integrations',
                '_settings_tab' => 'integrations',
                'alerts' => [
                    'queue_failure_enabled' => true,
                    'email_to' => 'ops@example.com',
                    'webhook_url' => 'https://example.com/hooks/ops',
                    'slack_webhook_url' => 'https://hooks.slack.com/services/T000/B000/XXXX',
                    'dedupe_minutes' => 10,
                ],
            ]);

        $response->assertRedirect(route('platform.settings.section', ['section' => 'integrations', 'tab' => 'integrations']));

        $this->assertSame('1', (string) PlatformSetting::get('alerts.queue_failure_enabled'));
        $this->assertSame('ops@example.com', PlatformSetting::get('alerts.email_to'));
        $this->assertSame('https://example.com/hooks/ops', PlatformSetting::get('alerts.webhook_url'));
        $this->assertSame('https://hooks.slack.com/services/T000/B000/XXXX', PlatformSetting::get('alerts.slack_webhook_url'));
        $this->assertSame('10', (string) PlatformSetting::get('alerts.dedupe_minutes'));
    }

    public function test_non_super_admin_cannot_update_operational_alert_settings(): void
    {
        $user = User::factory()->create([
            'is_platform_admin' => false,
        ]);

        $response = $this->actingAs($user)
            ->post(route('platform.settings.update'), [
                'alerts' => [
                    'queue_failure_enabled' => false,
                ],
            ]);

        $response->assertStatus(403);
    }
}
