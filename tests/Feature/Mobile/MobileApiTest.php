<?php

namespace Tests\Feature\Mobile;

use App\Models\AppNotification;
use App\Models\MobileAccessToken;
use App\Models\Plan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MobileApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    public function test_mobile_user_can_mark_workspace_notification_read(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $user = $account->owner;
        [$token, $plainTextToken] = MobileAccessToken::issue($user, $account);
        $notification = AppNotification::create([
            'account_id' => $account->id,
            'scope' => 'workspace',
            'type' => 'automation_failed',
            'severity' => 'warning',
            'title' => 'Automation failed',
        ]);

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$plainTextToken)
            ->withHeader('X-Zyptos-Account', (string) $account->id)
            ->postJson(route('api.mobile.notifications.read', $notification));

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('notification.id', $notification->id);

        $this->assertNotNull($notification->fresh()->read_at);
        $this->assertNotNull($token->fresh()->last_used_at);
    }

    public function test_mobile_user_can_manage_profile_workspace_and_billing(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $user = $account->owner;
        [$token, $plainTextToken] = MobileAccessToken::issue($user, $account);

        $profile = $this
            ->withHeader('Authorization', 'Bearer '.$plainTextToken)
            ->withHeader('X-Zyptos-Account', (string) $account->id)
            ->patchJson(route('api.mobile.profile.update'), [
                'name' => 'Mobile Owner',
                'email' => $user->email,
                'country_code' => '+91',
                'phone' => '9410650131',
                'timezone' => 'Asia/Kolkata',
            ]);

        $profile->assertOk()
            ->assertJsonPath('user.name', 'Mobile Owner')
            ->assertJsonPath('user.phone', '9410650131');

        $workspace = $this
            ->withHeader('Authorization', 'Bearer '.$plainTextToken)
            ->withHeader('X-Zyptos-Account', (string) $account->id)
            ->patchJson(route('api.mobile.workspace.update'), [
                'name' => 'Mobile Workspace',
                'workspace_type' => 'business',
                'industry' => 'SaaS',
                'timezone' => 'Asia/Kolkata',
                'billing_name' => 'Zyptos Pvt Ltd',
                'billing_email' => 'billing@zyptos.com',
                'billing_country' => 'IN',
            ]);

        $workspace->assertOk()
            ->assertJsonPath('workspace.name', 'Mobile Workspace')
            ->assertJsonPath('workspace.billing_email', 'billing@zyptos.com');

        $billing = $this
            ->withHeader('Authorization', 'Bearer '.$plainTextToken)
            ->withHeader('X-Zyptos-Account', (string) $account->id)
            ->getJson(route('api.mobile.billing'));

        $billing->assertOk()
            ->assertJsonPath('current_plan.key', 'starter')
            ->assertJsonPath('subscription.status', 'trialing')
            ->assertJsonCount(Plan::where('is_active', true)->where('is_public', true)->count(), 'plans');

        $this->assertNotNull($token->fresh()->last_used_at);
    }

    public function test_mobile_workspace_update_requires_owner_or_admin(): void
    {
        $account = $this->createAccountWithPlan('starter');
        $member = \App\Models\User::factory()->create();
        $account->users()->attach($member->id, ['role' => 'member']);
        [, $plainTextToken] = MobileAccessToken::issue($member, $account);

        $response = $this
            ->withHeader('Authorization', 'Bearer '.$plainTextToken)
            ->withHeader('X-Zyptos-Account', (string) $account->id)
            ->patchJson(route('api.mobile.workspace.update'), [
                'name' => 'Blocked Update',
                'workspace_type' => 'business',
                'timezone' => 'Asia/Kolkata',
            ]);

        $response->assertForbidden();
        $this->assertNotSame('Blocked Update', $account->fresh()->name);
    }
}
