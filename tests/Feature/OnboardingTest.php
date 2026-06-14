<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OnboardingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_onboarding_creates_workspace_without_asking_for_timezone(): void
    {
        $user = User::factory()->create();
        $plan = Plan::where('key', 'starter')->firstOrFail();

        $response = $this->actingAs($user)->post(route('onboarding.store'), [
            'name' => 'Retail Launch',
            'workspace_type' => 'business',
            'industry' => 'Retail',
            'plan_key' => $plan->key,
            'connection_method' => 'embedded',
        ]);

        $workspace = Account::where('name', 'Retail Launch')->firstOrFail();

        $response->assertRedirect(route('app.whatsapp.connections.index', ['setup' => 'embedded']));
        $this->assertSame($user->id, (int) $workspace->owner_id);
        $this->assertSame(config('app.timezone'), $workspace->timezone);
        $this->assertSame($workspace->id, session('current_account_id'));
    }

    public function test_onboarding_can_create_workspace_when_billing_plans_are_missing(): void
    {
        Plan::query()->delete();

        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('onboarding.store'), [
            'name' => 'Fallback Workspace',
            'workspace_type' => 'business',
            'industry' => 'Retail',
            'plan_key' => 'starter',
            'connection_method' => 'later',
        ]);

        $workspace = Account::where('name', 'Fallback Workspace')->firstOrFail();

        $response->assertRedirect(route('app.dashboard'));
        $this->assertSame($user->id, (int) $workspace->owner_id);
        $this->assertDatabaseHas('plans', [
            'key' => 'starter',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('subscriptions', [
            'account_id' => $workspace->id,
        ]);
    }
}
