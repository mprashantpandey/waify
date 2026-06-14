<?php

namespace Tests\Feature\Platform;

use App\Models\PlatformSetting;
use App\Models\User;
use App\Services\PlatformSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PlatformSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_platform_settings_persist_nested_values_and_unchecked_booleans(): void
    {
        PlatformSetting::set('payment.razorpay_enabled', true, 'boolean', 'payment');
        PlatformSetting::set('payment.wallet_self_topup_enabled', true, 'boolean', 'payment');

        $admin = User::factory()->create(['is_platform_admin' => true]);

        $response = $this->actingAs($admin)->post(route('platform.settings.update'), [
            'payment' => [
                'default_currency' => 'INR',
                'razorpay_key_id' => 'rzp_test_123',
            ],
            'branding' => [
                'platform_name' => 'Acme Desk',
                'primary_color' => '#22C55E',
                'secondary_color' => '#0F172A',
                'support_email' => 'support@example.com',
            ],
            'whatsapp' => [
                'central_webhook_verify_token' => 'custom-meta-verify-token',
            ],
        ]);

        $response->assertRedirect(route('platform.settings'));

        $this->assertSame('INR', PlatformSetting::get('payment.default_currency'));
        $this->assertFalse(PlatformSetting::get('payment.razorpay_enabled'));
        $this->assertFalse(PlatformSetting::get('payment.wallet_self_topup_enabled'));
        $this->assertSame('Acme Desk', PlatformSetting::get('branding.platform_name'));
        $this->assertSame('#22C55E', PlatformSetting::get('branding.primary_color'));
        $this->assertSame('custom-meta-verify-token', PlatformSetting::get('whatsapp.central_webhook_verify_token'));
    }

    public function test_branding_upload_and_remove_logo_work(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create(['is_platform_admin' => true]);

        $uploadResponse = $this->actingAs($admin)->post(route('platform.settings.update'), [
            'branding' => [
                'platform_name' => 'Acme Desk',
                'primary_color' => '#22C55E',
                'secondary_color' => '#0F172A',
            ],
            'logo' => UploadedFile::fake()->image('logo.png', 320, 120),
        ]);

        $uploadResponse->assertRedirect(route('platform.settings'));

        $path = PlatformSetting::get('branding.logo_path');
        $this->assertNotEmpty($path);
        Storage::disk('public')->assertExists($path);

        $removeResponse = $this->actingAs($admin)->post(route('platform.settings.update'), [
            'branding' => [
                'platform_name' => 'Acme Desk',
                'primary_color' => '#22C55E',
                'secondary_color' => '#0F172A',
                'remove_logo' => true,
            ],
        ]);

        $removeResponse->assertRedirect(route('platform.settings'));

        Storage::disk('public')->assertMissing($path);
        $this->assertSame('', PlatformSetting::get('branding.logo_path'));
        $this->assertNull(PlatformSetting::where('key', 'branding.remove_logo')->first());
    }

    public function test_mail_runtime_config_supports_none_encryption_and_clears_mailers(): void
    {
        PlatformSetting::set('mail.driver', 'smtp', 'string', 'mail');
        PlatformSetting::set('mail.host', 'smtp.example.com', 'string', 'mail');
        PlatformSetting::set('mail.port', 2525, 'integer', 'mail');
        PlatformSetting::set('mail.encryption', 'none', 'string', 'mail');
        PlatformSetting::set('mail.from_address', 'hello@example.com', 'string', 'mail');
        PlatformSetting::set('mail.from_name', 'Waify', 'string', 'mail');

        app(PlatformSettingsService::class)->applyMailConfig();

        $this->assertSame('smtp', config('mail.default'));
        $this->assertSame('smtp.example.com', config('mail.mailers.smtp.host'));
        $this->assertSame(2525, config('mail.mailers.smtp.port'));
        $this->assertNull(config('mail.mailers.smtp.encryption'));
        $this->assertNull(config('mail.mailers.smtp.scheme'));
        $this->assertSame('hello@example.com', config('mail.from.address'));
        $this->assertSame('Waify', config('mail.from.name'));
    }

    public function test_blank_pusher_settings_fall_back_to_config_values(): void
    {
        config([
            'broadcasting.default' => 'log',
            'broadcasting.connections.pusher.app_id' => 'config-app-id',
            'broadcasting.connections.pusher.key' => 'config-key',
            'broadcasting.connections.pusher.secret' => 'config-secret',
            'broadcasting.connections.pusher.options.cluster' => 'ap2',
        ]);

        PlatformSetting::set('pusher.app_id', '  ', 'string', 'pusher');
        PlatformSetting::set('pusher.key', '', 'string', 'pusher');
        PlatformSetting::set('pusher.secret', '', 'string', 'pusher');
        PlatformSetting::set('pusher.cluster', '  ', 'string', 'pusher');

        $service = app(PlatformSettingsService::class);
        $service->applyPusherConfig();

        $this->assertSame('config-app-id', $service->getNonBlank('pusher.app_id', 'config-app-id'));
        $this->assertSame('config-key', config('broadcasting.connections.pusher.key'));
        $this->assertSame('config-secret', config('broadcasting.connections.pusher.secret'));
        $this->assertSame('ap2', config('broadcasting.connections.pusher.options.cluster'));
        $this->assertSame('pusher', config('broadcasting.default'));
    }
}
