<?php

namespace Tests\Feature;

use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_core_user_pages_render_for_workspace_owner(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $this->actingAsAccountOwner($account);
        WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
            'is_active' => true,
        ]);

        $routes = [
            ['app.dashboard', 'App/Dashboard'],
            ['app.whatsapp.conversations.index', 'WhatsApp/Conversations/Index'],
            ['app.whatsapp.templates.index', 'WhatsApp/Templates/Index'],
            ['app.broadcasts.index', 'Broadcasts/Index'],
            ['app.billing.index', 'Billing/Index'],
            ['app.whatsapp.connections.index', 'WhatsApp/Connections/Index'],
            ['app.developer.index', 'Developer/Index'],
            ['app.support.index', 'Support/Index'],
            ['app.settings', 'Settings/Index'],
        ];

        foreach ($routes as [$routeName, $component]) {
            $this->get(route($routeName))
                ->assertOk()
                ->assertInertia(fn ($page) => $page->component($component));
        }
    }

    public function test_core_platform_pages_render_for_admin(): void
    {
        $admin = User::factory()->create(['is_platform_admin' => true]);

        $routes = [
            ['platform.dashboard', 'Platform/Dashboard'],
            ['platform.accounts.index', 'Platform/Accounts/Index'],
            ['platform.users.index', 'Platform/Users/Index'],
            ['platform.modules.index', 'Platform/Modules/Index'],
            ['platform.settings', 'Platform/Settings'],
            ['platform.subscriptions.index', 'Platform/Subscriptions/Index'],
            ['platform.templates.index', 'Platform/Templates/Index'],
            ['platform.support.index', 'Platform/Support/Index'],
        ];

        foreach ($routes as [$routeName, $component]) {
            $this->actingAs($admin)
                ->get(route($routeName))
                ->assertOk()
                ->assertInertia(fn ($page) => $page->component($component));
        }
    }
}
