<?php

namespace Tests\Feature\WhatsApp;

use App\Models\Account;
use App\Models\Plan;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\MetaGraphService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class ConnectionTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Account $account;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);

        $this->account = Account::factory()->create([
            'owner_id' => $this->user->id,
        ]);
        $this->account->users()->attach($this->user->id, ['role' => 'owner']);

        $starter = Plan::where('key', 'starter')->firstOrFail();
        app(\App\Core\Billing\SubscriptionService::class)->changePlan($this->account, $starter, $this->user);

        session(['current_account_id' => $this->account->id]);
    }

    public function test_account_member_can_view_connections(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'admin']);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.whatsapp.connections.index', ['account' => $this->account->slug]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('WhatsApp/Connections/Index')
            ->has('connections', 1)
        );
    }

    public function test_owner_can_create_connection(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.connections.store', ['account' => $this->account->slug]), [
                'name' => 'Test Connection',
                'phone_number_id' => '123456789',
                'access_token' => 'test-token',
                'api_version' => 'v20.0',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', [
            'account_id' => $this->account->id,
            'name' => 'Test Connection',
            'phone_number_id' => '123456789',
        ]);
    }

    public function test_member_cannot_create_connection(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.connections.store', ['account' => $this->account->slug]), [
                'name' => 'Test Connection',
                'phone_number_id' => '123456789',
                'access_token' => 'test-token',
            ]);

        $response->assertStatus(302);
    }

    public function test_owner_can_update_connection(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'name' => 'Original Name',
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('app.whatsapp.connections.update', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]), [
                'name' => 'Updated Name',
                'phone_number_id' => $connection->phone_number_id,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', [
            'id' => $connection->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_owner_can_rotate_verify_token(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $originalToken = $connection->webhook_verify_token;

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.connections.rotate-verify-token', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]));

        $response->assertRedirect();
        $connection->refresh();
        $this->assertNotEquals($originalToken, $connection->webhook_verify_token);
        $this->assertFalse($connection->webhook_subscribed);
    }

    public function test_owner_can_disconnect_connection(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'webhook_subscribed' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('app.whatsapp.connections.destroy', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]));

        $response->assertRedirect(route('app.whatsapp.connections.index'));
        $this->assertDatabaseMissing('whatsapp_connections', [
            'id' => $connection->id,
        ]);
    }

    public function test_member_cannot_disconnect_connection(): void
    {
        $member = User::factory()->create();
        $this->account->users()->attach($member->id, ['role' => 'member']);

        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $response = $this->actingAs($member)
            ->withSession(['current_account_id' => $this->account->id])
            ->delete(route('app.whatsapp.connections.destroy', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]));

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', [
            'id' => $connection->id,
        ]);
    }

    public function test_embedded_signup_uses_meta_oauth_token_not_system_user_token(): void
    {
        PlatformSetting::set('whatsapp.embedded_enabled', true, 'boolean', 'whatsapp');
        PlatformSetting::set('whatsapp.meta_app_id', 'app-id', 'string', 'whatsapp');
        PlatformSetting::set('whatsapp.meta_app_secret', 'app-secret', 'string', 'whatsapp');
        PlatformSetting::set('whatsapp.embedded_signup_config_id', 'config-id', 'string', 'whatsapp');
        config(['whatsapp.meta.system_user_token' => 'system-token-that-must-not-be-used']);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('exchangeForLongLivedToken')
            ->once()
            ->with('short-lived-token')
            ->andReturn(['access_token' => 'embedded-long-lived-token']);
        $meta->shouldReceive('getPhoneNumberDetails')
            ->once()
            ->with('phone-123', 'embedded-long-lived-token')
            ->andReturn([
                'display_phone_number' => '+91 99999 99999',
                'verified_name' => 'Waify Business',
                'status' => 'CONNECTED',
            ]);
        $meta->shouldReceive('getWabaDetails')
            ->once()
            ->with('waba-123', 'embedded-long-lived-token')
            ->andReturn(['name' => 'Waify WABA']);
        $meta->shouldReceive('subscribeAppToWabaWithCallback')
            ->once()
            ->with('waba-123', 'embedded-long-lived-token', Mockery::type('string'), Mockery::type('string'))
            ->andReturn(['success' => true]);
        $meta->shouldReceive('listSubscribedApps')
            ->once()
            ->with('waba-123', 'embedded-long-lived-token')
            ->andReturn([['id' => 'app-id']]);
        $meta->shouldReceive('getApiVersion')->once()->andReturn('v21.0');
        $this->app->instance(MetaGraphService::class, $meta);

        $response = $this->actingAs($this->user)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.connections.store-embedded', ['account' => $this->account->slug]), [
                'waba_id' => 'waba-123',
                'phone_number_id' => 'phone-123',
                'access_token' => 'short-lived-token',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.index'));

        $connection = WhatsAppConnection::where('account_id', $this->account->id)->firstOrFail();
        $this->assertSame('embedded-long-lived-token', $connection->access_token);
        $this->assertSame('embedded', $connection->setup_method);
    }
}
