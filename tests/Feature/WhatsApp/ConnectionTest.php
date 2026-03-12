<?php

namespace Tests\Feature\WhatsApp;

use App\Models\User;
use App\Models\Account;
use App\Models\Plan;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConnectionHealthSnapshot;
use App\Modules\WhatsApp\Services\ConnectionHealthSyncService;
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

    public function test_embedded_signup_reuses_existing_connection_for_same_assets(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $existing = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'name' => 'Old Name',
            'waba_id' => 'waba-1',
            'phone_number_id' => 'pn-1',
            'is_active' => true,
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('subscribeAppToWaba')->once()->andReturn(['success' => true]);
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $meta->shouldReceive('getPhoneNumberDetails')->once()->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $this->instance(MetaGraphService::class, $meta);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $connection) {
            return WhatsAppConnectionHealthSnapshot::create([
                'account_id' => $connection->account_id,
                'whatsapp_connection_id' => $connection->id,
                'source' => 'embedded_signup',
                'health_state' => 'healthy',
                'captured_at' => now(),
            ]);
        });
        $this->instance(ConnectionHealthSyncService::class, $sync);

        $response = $this->actingAs($this->user)
            ->post(route('app.whatsapp.connections.store-embedded', ['account' => $this->account->slug]), [
                'name' => 'Reauthorized Connection',
                'waba_id' => 'waba-1',
                'phone_number_id' => 'pn-1',
                'access_token' => 'embedded-token',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.index'));

        $this->assertSame(1, WhatsAppConnection::where('account_id', $this->account->id)->count());
        $existing->refresh();
        $this->assertSame('Reauthorized Connection', $existing->name);
        $this->assertSame('active', $existing->activation_state);
        $this->assertSame('pending', $existing->metadata_sync_status);
    }

    public function test_embedded_signup_redirect_uri_mismatch_returns_clear_error(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('exchangeCodeForToken')
            ->atLeast()
            ->once()
            ->andThrow(new \RuntimeException('Error validating verification code. Please make sure your redirect_uri is identical to the one you used in the OAuth dialog request'));
        $this->instance(MetaGraphService::class, $meta);

        $response = $this->actingAs($this->user)
            ->from(route('app.whatsapp.connections.create', ['account' => $this->account->slug]))
            ->post(route('app.whatsapp.connections.store-embedded', ['account' => $this->account->slug]), [
                'code' => 'auth-code',
                'redirect_uri' => 'https://zyptos.com/app/connections/create',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.create', ['account' => $this->account->slug]));
        $response->assertSessionHasErrors([
            'embedded' => 'Embedded signup could not complete because the OAuth redirect URI did not match exactly. Use the same redirect URI in Meta App settings and in the signup flow (including trailing slash/query).',
        ]);
    }

    public function test_owner_can_trigger_manual_connection_health_sync(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'access_token_encrypted' => encrypt('token'),
            'phone_number_id' => '1234567890',
        ]);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $target) {
            return WhatsAppConnectionHealthSnapshot::create([
                'account_id' => $target->account_id,
                'whatsapp_connection_id' => $target->id,
                'source' => 'manual_sync',
                'health_state' => 'healthy',
                'captured_at' => now(),
            ]);
        });
        $this->instance(ConnectionHealthSyncService::class, $sync);

        $response = $this->actingAs($this->user)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.connections.sync-health', [
                'connection' => $connection->id,
            ]));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Connection health synced successfully.');
    }

    public function test_manual_connection_health_sync_surfaces_actionable_error_when_no_snapshot_returned(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'access_token_encrypted' => encrypt('token'),
            'phone_number_id' => '1234567890',
        ]);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturn(null);
        $this->instance(ConnectionHealthSyncService::class, $sync);

        $response = $this->actingAs($this->user)
            ->withSession(['current_account_id' => $this->account->id])
            ->post(route('app.whatsapp.connections.sync-health', [
                'connection' => $connection->id,
            ]));

        $response->assertRedirect();
        $response->assertSessionHasErrors([
            'error' => 'Unable to sync health right now. Confirm access token and phone number are configured.',
        ]);
    }
}
