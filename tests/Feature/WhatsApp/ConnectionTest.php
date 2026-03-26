<?php

namespace Tests\Feature\WhatsApp;

use App\Models\User;
use App\Models\Account;
use App\Models\Plan;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConnectionHealthSnapshot;
use App\Modules\WhatsApp\Models\WhatsAppEmbeddedSignupEvent;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
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

    public function test_owner_cannot_create_connection_using_asset_linked_to_another_account(): void
    {
        $otherOwner = User::factory()->create();
        $otherAccount = Account::factory()->create([
            'owner_id' => $otherOwner->id,
        ]);
        $otherAccount->users()->attach($otherOwner->id, ['role' => 'owner']);

        WhatsAppConnection::factory()->create([
            'account_id' => $otherAccount->id,
            'phone_number_id' => '999000111',
            'waba_id' => 'waba-conflict',
        ]);

        $response = $this->actingAs($this->user)
            ->from(route('app.whatsapp.connections.create', ['account' => $this->account->slug]))
            ->post(route('app.whatsapp.connections.store', ['account' => $this->account->slug]), [
                'name' => 'Conflicting Connection',
                'phone_number_id' => '999000111',
                'waba_id' => 'waba-conflict',
                'access_token' => 'test-token',
                'api_version' => 'v21.0',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.create', ['account' => $this->account->slug]));
        $response->assertSessionHasErrors('connection');
        $this->assertSame(1, WhatsAppConnection::where('phone_number_id', '999000111')->count());
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

    public function test_connection_profile_page_loads_whatsapp_business_profile(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'name' => 'Support Number',
        ]);
        $connection->access_token = 'stored-token';
        $connection->save();

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('getWhatsAppBusinessProfile')
            ->once()
            ->with($connection->phone_number_id, 'stored-token')
            ->andReturn([
                'about' => 'Open today until 8 PM',
                'description' => 'Customer support',
                'address' => 'Noida',
                'email' => 'hello@example.com',
                'websites' => ['https://example.com'],
                'vertical' => 'Professional Services',
                'profile_picture_url' => 'https://example.com/logo.png',
            ]);
        $this->instance(MetaGraphService::class, $meta);

        $response = $this->actingAs($this->user)
            ->get(route('app.whatsapp.connections.profile.edit', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]));

        $response->assertInertia(fn ($page) => $page
            ->component('WhatsApp/Connections/Profile')
            ->where('connection.business_profile.about', 'Open today until 8 PM')
            ->where('connection.business_profile.website', 'https://example.com')
            ->where('connection.business_profile.vertical', 'Professional Services')
        );
    }

    public function test_owner_can_update_whatsapp_business_profile(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'name' => 'Original Name',
        ]);
        $connection->access_token = 'stored-token';
        $connection->save();

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('updateWhatsAppBusinessProfile')
            ->once()
            ->with($connection->phone_number_id, 'stored-token', [
                'about' => 'Open today until 8 PM',
                'description' => 'Updated support desk',
                'address' => 'Noida',
                'email' => 'hello@example.com',
                'vertical' => 'Professional Services',
                'websites' => ['https://example.com'],
            ])
            ->andReturn(['success' => true]);
        $this->instance(MetaGraphService::class, $meta);

        $response = $this->actingAs($this->user)
            ->put(route('app.whatsapp.connections.profile.update', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]), [
                'profile_about' => 'Open today until 8 PM',
                'profile_description' => 'Updated support desk',
                'profile_address' => 'Noida',
                'profile_email' => 'hello@example.com',
                'profile_website' => 'https://example.com',
                'profile_vertical' => 'Professional Services',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('whatsapp_connections', ['id' => $connection->id]);
        $connection->refresh();
        $this->assertSame('Open today until 8 PM', data_get($connection->token_metadata, 'business_profile_cache.about'));
        $this->assertSame('https://example.com', data_get($connection->token_metadata, 'business_profile_cache.website'));
    }

    public function test_connection_profile_page_uses_cached_profile_when_meta_fetch_fails(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'name' => 'Support Number',
            'token_metadata' => [
                'business_profile_cache' => [
                    'about' => 'Cached about',
                    'description' => 'Cached description',
                    'address' => 'Noida',
                    'email' => 'cached@example.com',
                    'website' => 'https://example.com',
                    'vertical' => 'Professional Services',
                    'profile_picture_url' => 'https://example.com/logo.png',
                ],
            ],
        ]);
        $connection->access_token = 'stored-token';
        $connection->save();

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('getWhatsAppBusinessProfile')
            ->once()
            ->with($connection->phone_number_id, 'stored-token')
            ->andThrow(new \RuntimeException('(#131000) Something went wrong'));
        $this->instance(MetaGraphService::class, $meta);

        $response = $this->actingAs($this->user)
            ->get(route('app.whatsapp.connections.profile.edit', [
                'account' => $this->account->slug,
                'connection' => $connection->id,
            ]));

        $response->assertInertia(fn ($page) => $page
            ->component('WhatsApp/Connections/Profile')
            ->where('connection.business_profile.about', 'Cached about')
            ->where('connection.business_profile.website', 'https://example.com')
            ->where('connection.business_profile_error', 'Showing the last saved WhatsApp profile details. Live refresh is unavailable right now.')
        );
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
        $meta->shouldReceive('appAccessToken')->times(2)->andReturnNull();
        $meta->shouldReceive('debugToken')->once()->with('embedded-token', 'embedded-token')->andReturn([
            'app_id' => 'app-id',
            'type' => 'USER',
            'application' => 'Zyptos',
            'granular_scopes' => [],
            'scopes' => ['whatsapp_business_management'],
        ]);
        $meta->shouldReceive('ensureAppSubscribedToWaba')->once()->with('waba-1', 'embedded-token')->andReturn(['already_subscribed' => false]);
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $meta->shouldReceive('getPhoneNumberDetails')->once()->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $this->instance(MetaGraphService::class, $meta);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $connection) {
            return new WhatsAppConnectionHealthSnapshot([
                'id' => 501,
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
        $this->assertSame('connection_ready', $existing->provisioning_step);
        $this->assertSame('completed', $existing->provisioning_status);
    }

    public function test_embedded_signup_strict_provisioning_fails_when_app_subscription_fails(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
            'whatsapp.meta.strict_embedded_provisioning' => true,
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('debugToken')->once()->with('embedded-token', 'embedded-token')->andReturn([
            'app_id' => 'app-id',
            'type' => 'USER',
            'application' => 'Zyptos',
            'granular_scopes' => [],
            'scopes' => ['whatsapp_business_management'],
        ]);
        $meta->shouldReceive('appAccessToken')->times(2)->andReturnNull();
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $meta->shouldReceive('getPhoneNumberDetails')->once()->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $meta->shouldReceive('ensureAppSubscribedToWaba')->once()->with('waba-strict', 'embedded-token')->andThrow(new \RuntimeException('Meta subscription failed'));
        $this->instance(MetaGraphService::class, $meta);

        $response = $this->actingAs($this->user)
            ->from(route('app.whatsapp.connections.create', ['account' => $this->account->slug]))
            ->post(route('app.whatsapp.connections.store-embedded', ['account' => $this->account->slug]), [
                'name' => 'Strict Failure',
                'waba_id' => 'waba-strict',
                'phone_number_id' => 'pn-strict',
                'access_token' => 'embedded-token',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.create', ['account' => $this->account->slug]));
        $response->assertSessionHasErrors([
            'embedded' => 'Webhook subscription failed: Meta subscription failed',
        ]);

        $this->assertDatabaseHas('whatsapp_connections', [
            'account_id' => $this->account->id,
            'waba_id' => 'waba-strict',
            'phone_number_id' => 'pn-strict',
            'provisioning_step' => 'app_subscription',
            'provisioning_status' => 'failed',
        ]);
    }

    public function test_embedded_signup_uses_app_access_token_for_app_subscription(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.app_secret' => 'app-secret',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('appAccessToken')->times(2)->andReturn('app-id|app-secret');
        $meta->shouldReceive('debugToken')->once()->with('embedded-token', 'app-id|app-secret')->andReturn([
            'app_id' => 'app-id',
            'type' => 'USER',
            'application' => 'Zyptos',
            'granular_scopes' => [],
            'scopes' => ['whatsapp_business_management'],
        ]);
        $meta->shouldReceive('ensureAppSubscribedToWaba')->once()->with('waba-app-token', 'app-id|app-secret')->andReturn(['already_subscribed' => false]);
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $meta->shouldReceive('getPhoneNumberDetails')->once()->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $this->instance(MetaGraphService::class, $meta);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $connection) {
            return new WhatsAppConnectionHealthSnapshot([
                'id' => 777,
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
                'name' => 'App Token Connection',
                'waba_id' => 'waba-app-token',
                'phone_number_id' => 'pn-app-token',
                'access_token' => 'embedded-token',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.index'));
        $this->assertDatabaseHas('whatsapp_connections', [
            'account_id' => $this->account->id,
            'waba_id' => 'waba-app-token',
            'phone_number_id' => 'pn-app-token',
            'provisioning_step' => 'connection_ready',
            'provisioning_status' => 'completed',
        ]);
    }

    public function test_embedded_signup_uses_app_access_token_for_debug_token(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.app_secret' => 'app-secret',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('exchangeCodeForToken')->once()->with('auth-code', null)->andReturn([
            'access_token' => 'embedded-token',
        ]);
        $meta->shouldReceive('appAccessToken')->times(2)->andReturn('app-id|app-secret');
        $meta->shouldReceive('debugToken')->once()->with('embedded-token', 'app-id|app-secret')->andReturn([
            'app_id' => 'app-id',
            'type' => 'USER',
            'application' => 'Zyptos',
            'granular_scopes' => [],
            'scopes' => ['whatsapp_business_management'],
        ]);
        $meta->shouldReceive('subscribeAppToWaba')->once()->with('waba-debug', 'app-id|app-secret')->andReturn(['success' => true]);
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $meta->shouldReceive('getPhoneNumberDetails')->once()->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $meta->shouldReceive('ensureAppSubscribedToWaba')->once()->with('waba-debug', 'app-id|app-secret')->andReturn([
            'already_subscribed' => true,
        ]);
        $this->instance(MetaGraphService::class, $meta);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $connection) {
            return new WhatsAppConnectionHealthSnapshot([
                'id' => 778,
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
                'name' => 'Debug Token Connection',
                'code' => 'auth-code',
                'code_source' => 'fb_login_callback',
                'session_waba_id' => 'waba-debug',
                'session_phone_number_id' => 'pn-debug',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.index'));
        $this->assertDatabaseHas('whatsapp_connections', [
            'account_id' => $this->account->id,
            'waba_id' => 'waba-debug',
            'phone_number_id' => 'pn-debug',
            'provisioning_step' => 'connection_ready',
            'provisioning_status' => 'completed',
        ]);
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

    public function test_embedded_signup_fb_login_callback_exchanges_code_without_redirect_uri(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('exchangeCodeForToken')
            ->once()
            ->with('auth-code', null)
            ->andReturn(['access_token' => 'embedded-token']);
        $meta->shouldReceive('debugToken')->once()->with('embedded-token', 'embedded-token')->andReturn([
            'app_id' => 'app-id',
            'type' => 'USER',
            'application' => 'Zyptos',
            'granular_scopes' => [],
            'scopes' => ['whatsapp_business_management'],
        ]);
        $meta->shouldReceive('getPhoneNumberDetails')->once()->with('pn-embedded', 'embedded-token')->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $meta->shouldReceive('appAccessToken')->times(2)->andReturnNull();
        $meta->shouldReceive('ensureAppSubscribedToWaba')->once()->with('waba-embedded', 'embedded-token')->andReturn([
            'already_subscribed' => false,
        ]);
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $this->instance(MetaGraphService::class, $meta);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $connection) {
            return new WhatsAppConnectionHealthSnapshot([
                'id' => 777,
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
                'code' => 'auth-code',
                'code_source' => 'fb_login_callback',
                'redirect_uri' => 'https://zyptos.com/app/connections/create',
                'waba_id' => 'waba-embedded',
                'phone_number_id' => 'pn-embedded',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.index'));
        $this->assertDatabaseHas('whatsapp_connections', [
            'account_id' => $this->account->id,
            'waba_id' => 'waba-embedded',
            'phone_number_id' => 'pn-embedded',
        ]);
    }

    public function test_embedded_signup_blocks_assets_already_owned_by_another_account(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $otherOwner = User::factory()->create();
        $otherAccount = Account::factory()->create([
            'owner_id' => $otherOwner->id,
        ]);
        $otherAccount->users()->attach($otherOwner->id, ['role' => 'owner']);

        WhatsAppConnection::factory()->create([
            'account_id' => $otherAccount->id,
            'waba_id' => 'waba-embedded-conflict',
            'phone_number_id' => 'pn-embedded-conflict',
        ]);

        $response = $this->actingAs($this->user)
            ->from(route('app.whatsapp.connections.create', ['account' => $this->account->slug]))
            ->post(route('app.whatsapp.connections.store-embedded', ['account' => $this->account->slug]), [
                'name' => 'Embedded Conflict',
                'waba_id' => 'waba-embedded-conflict',
                'phone_number_id' => 'pn-embedded-conflict',
                'access_token' => 'embedded-token',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.create', ['account' => $this->account->slug]));
        $response->assertSessionHasErrors('embedded');
        $this->assertSame(1, WhatsAppConnection::where('phone_number_id', 'pn-embedded-conflict')->count());
    }

    public function test_embedded_signup_prefers_session_asset_ids_and_stores_token_metadata(): void
    {
        config([
            'whatsapp.meta.app_id' => 'app-id',
            'whatsapp.meta.embedded_signup_config_id' => 'config-id',
        ]);

        $meta = Mockery::mock(MetaGraphService::class);
        $meta->shouldReceive('debugToken')->once()->with('embedded-token', 'embedded-token')->andReturn([
            'app_id' => 'app-id',
            'type' => 'USER',
            'application' => 'Zyptos',
            'granular_scopes' => [
                ['scope' => 'whatsapp_business_management', 'target_ids' => ['waba-fallback']],
            ],
            'scopes' => ['whatsapp_business_management'],
        ]);
        $meta->shouldReceive('getPhoneNumberDetails')->once()->with('pn-session', 'embedded-token')->andReturn([
            'display_phone_number' => '+91 99999 00000',
        ]);
        $meta->shouldReceive('appAccessToken')->times(2)->andReturnNull();
        $meta->shouldReceive('ensureAppSubscribedToWaba')->once()->with('waba-session', 'embedded-token')->andReturn([
            'already_subscribed' => false,
        ]);
        $meta->shouldReceive('getApiVersion')->andReturn('v21.0');
        $this->instance(MetaGraphService::class, $meta);

        $sync = Mockery::mock(ConnectionHealthSyncService::class);
        $sync->shouldReceive('syncConnection')->once()->andReturnUsing(function (WhatsAppConnection $connection) {
            return new WhatsAppConnectionHealthSnapshot([
                'id' => 601,
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
                'name' => 'Session-first Connection',
                'waba_id' => 'waba-fallback',
                'phone_number_id' => 'pn-fallback',
                'session_waba_id' => 'waba-session',
                'session_phone_number_id' => 'pn-session',
                'access_token' => 'embedded-token',
            ]);

        $response->assertRedirect(route('app.whatsapp.connections.index'));

        $this->assertDatabaseHas('whatsapp_connections', [
            'account_id' => $this->account->id,
            'name' => 'Session-first Connection',
            'waba_id' => 'waba-session',
            'phone_number_id' => 'pn-session',
            'token_source' => 'embedded_code_exchange',
        ]);

        $connection = WhatsAppConnection::query()
            ->where('account_id', $this->account->id)
            ->where('phone_number_id', 'pn-session')
            ->firstOrFail();

        $this->assertSame('business_exchange', $connection->token_type);
        $this->assertSame('waba-session', data_get($connection->token_metadata, 'session.waba_id'));
        $this->assertSame('pn-session', data_get($connection->token_metadata, 'session.phone_number_id'));
        $this->assertSame('app-id', data_get($connection->token_metadata, 'debug.app_id'));
    }

    public function test_embedded_signup_telemetry_creates_event_log_and_links_connection(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
            'waba_id' => 'waba-telemetry',
            'phone_number_id' => 'pn-telemetry',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('app.whatsapp.connections.embedded-telemetry', ['account' => $this->account->slug]), [
                'step' => 'session_event',
                'status' => 'progress',
                'message' => 'Meta session event: FINISH',
                'context' => [
                    'event' => 'FINISH',
                    'current_step' => 'VERIFY_NUMBER',
                    'waba_id' => 'waba-telemetry',
                    'phone_number_id' => 'pn-telemetry',
                ],
            ]);

        $response->assertOk()->assertJson(['ok' => true]);

        $event = WhatsAppEmbeddedSignupEvent::query()->latest('id')->first();
        $this->assertNotNull($event);
        $this->assertSame($this->account->id, $event->account_id);
        $this->assertSame($this->user->id, $event->user_id);
        $this->assertSame($connection->id, $event->whatsapp_connection_id);
        $this->assertSame('session_event', $event->event);
        $this->assertSame('progress', $event->status);
        $this->assertSame('VERIFY_NUMBER', $event->current_step);
        $this->assertSame('waba-telemetry', $event->waba_id);
        $this->assertSame('pn-telemetry', $event->phone_number_id);
    }

    public function test_connection_health_route_is_scoped_to_current_account(): void
    {
        $otherOwner = User::factory()->create();
        $otherAccount = Account::factory()->create([
            'owner_id' => $otherOwner->id,
        ]);
        $otherAccount->users()->attach($otherOwner->id, ['role' => 'owner']);

        $foreignConnection = WhatsAppConnection::factory()->create([
            'account_id' => $otherAccount->id,
            'slug' => 'shared-slug',
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.whatsapp.connections.health.api', [
                'connection' => $foreignConnection->slug,
            ]));

        $response->assertForbidden();
    }

    public function test_tenant_user_cannot_open_connection_health_page(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.whatsapp.connections.health', [
                'connection' => $connection->id,
            ]));

        $response->assertForbidden();
    }

    public function test_platform_support_can_open_connection_health_page_while_impersonating(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        $supportUser = User::factory()->create();

        $response = $this->actingAs($this->user)
            ->withSession([
                'current_account_id' => $this->account->id,
                'impersonator_id' => $supportUser->id,
                'impersonator_is_super_admin' => true,
            ])
            ->get(route('app.whatsapp.connections.health', [
                'connection' => $connection->id,
            ]));

        $response->assertOk();
    }

    public function test_tenant_user_cannot_open_webhook_diagnostics_page(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        WhatsAppWebhookEvent::query()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'event_type' => 'messages',
            'object_type' => 'whatsapp_business_account',
            'status' => 'processed',
            'signature_valid' => true,
            'payload_size' => 128,
            'payload' => ['entry' => []],
        ]);

        $response = $this->actingAs($this->user)
            ->withSession(['current_account_id' => $this->account->id])
            ->get(route('app.whatsapp.connections.webhook-diagnostics', [
                'connection' => $connection->id,
            ]));

        $response->assertForbidden();
    }

    public function test_platform_support_can_open_webhook_diagnostics_page_while_impersonating(): void
    {
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $this->account->id,
        ]);

        WhatsAppWebhookEvent::query()->create([
            'account_id' => $this->account->id,
            'whatsapp_connection_id' => $connection->id,
            'event_type' => 'messages',
            'object_type' => 'whatsapp_business_account',
            'status' => 'processed',
            'signature_valid' => true,
            'payload_size' => 128,
            'payload' => ['entry' => []],
        ]);

        $supportUser = User::factory()->create();

        $response = $this->actingAs($this->user)
            ->withSession([
                'current_account_id' => $this->account->id,
                'impersonator_id' => $supportUser->id,
                'impersonator_is_super_admin' => true,
            ])
            ->get(route('app.whatsapp.connections.webhook-diagnostics', [
                'connection' => $connection->id,
            ]));

        $response->assertOk();
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
            return new WhatsAppConnectionHealthSnapshot([
                'id' => 777,
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
