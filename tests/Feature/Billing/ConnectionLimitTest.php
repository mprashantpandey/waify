<?php

namespace Tests\Feature\Billing;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Models\Plan;
use App\Models\Account;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConnectionLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_free_plan_allows_one_connection(): void
    {
        
        $account = $this->createAccountWithPlan('free');
        $user = $this->actingAsAccountOwner($account);

        // Create first connection (should succeed)
        $response = $this->post(route('app.whatsapp.connections.store', ['account' => $account->slug]), [
            'name' => 'Test Connection',
            'phone_number_id' => '123456789',
            'access_token' => 'test_token',
        ]);

        $response->assertRedirect();
        $this->assertEquals(1, WhatsAppConnection::where('account_id', $account->id)->count());

        // Try to create second connection (should fail)
        $response = $this->post(route('app.whatsapp.connections.store', ['account' => $account->slug]), [
            'name' => 'Test Connection 2',
            'phone_number_id' => '987654321',
            'access_token' => 'test_token_2',
        ]);

        $response->assertStatus(402);
        $this->assertEquals(1, WhatsAppConnection::where('account_id', $account->id)->count());
    }

    public function test_starter_plan_allows_two_connections(): void
    {
        
        $account = $this->createAccountWithPlan('starter');
        $user = $this->actingAsAccountOwner($account);

        // Create first connection
        $this->post(route('app.whatsapp.connections.store', ['account' => $account->slug]), [
            'name' => 'Connection 1',
            'phone_number_id' => '111',
            'access_token' => 'token1',
        ]);

        // Create second connection
        $this->post(route('app.whatsapp.connections.store', ['account' => $account->slug]), [
            'name' => 'Connection 2',
            'phone_number_id' => '222',
            'access_token' => 'token2',
        ]);

        $this->assertEquals(2, WhatsAppConnection::where('account_id', $account->id)->count());

        // Try third (should fail)
        $response = $this->post(route('app.whatsapp.connections.store', ['account' => $account->slug]), [
            'name' => 'Connection 3',
            'phone_number_id' => '333',
            'access_token' => 'token3',
        ]);

        $response->assertStatus(402);
        $this->assertEquals(2, WhatsAppConnection::where('account_id', $account->id)->count());
    }
}
