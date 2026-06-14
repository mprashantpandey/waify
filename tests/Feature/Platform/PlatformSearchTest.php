<?php

namespace Tests\Feature\Platform;

use App\Models\Account;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PlatformSearchTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_platform_admin_can_search_platform_records(): void
    {
        $admin = User::factory()->create(['is_platform_admin' => true]);
        $owner = User::factory()->create(['name' => 'Anika Owner', 'email' => 'anika@example.test']);
        Account::factory()->create([
            'name' => 'Anika Retail',
            'slug' => 'anika-retail',
            'owner_id' => $owner->id,
        ]);
        Plan::where('key', 'starter')->update(['name' => 'Starter Growth']);

        $response = $this->actingAs($admin)->getJson(route('platform.search', ['q' => 'anika']));

        $response->assertOk()
            ->assertJsonPath('query', 'anika')
            ->assertJsonFragment(['type' => 'workspace', 'label' => 'Anika Retail'])
            ->assertJsonFragment(['type' => 'user', 'label' => 'Anika Owner']);
    }

    public function test_non_admin_cannot_use_platform_search(): void
    {
        $user = User::factory()->create(['is_platform_admin' => false]);

        $this->actingAs($user)
            ->getJson(route('platform.search', ['q' => 'starter']))
            ->assertForbidden();
    }
}
