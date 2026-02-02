<?php

namespace Tests;

use App\Core\Billing\SubscriptionService;
use App\Models\Plan;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUsage;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Act as workspace owner.
     */
    protected function actingAsWorkspaceOwner(Workspace $workspace): User
    {
        $user = $workspace->owner;
        $this->actingAs($user);
        return $user;
    }

    /**
     * Create workspace with plan.
     */
    protected function createWorkspaceWithPlan(string $planKey, string $status = 'active'): Workspace
    {
        $plan = Plan::where('key', $planKey)->firstOrFail();
        $workspace = Workspace::factory()->create();
        
        $subscriptionService = app(SubscriptionService::class);
        
        if ($status === 'trialing' && $plan->trial_days > 0) {
            $subscriptionService->startTrial($workspace, $plan);
        } else {
            $subscriptionService->changePlan($workspace, $plan);
        }
        
        return $workspace->fresh();
    }

    /**
     * Set workspace usage for a period.
     */
    protected function setUsage(Workspace $workspace, string $period, int $messagesSent = 0, int $templateSends = 0, int $aiCredits = 0): WorkspaceUsage
    {
        return WorkspaceUsage::updateOrCreate(
            [
                'workspace_id' => $workspace->id,
                'period' => $period,
            ],
            [
                'messages_sent' => $messagesSent,
                'template_sends' => $templateSends,
                'ai_credits_used' => $aiCredits,
            ]
        );
    }

    /**
     * Set test time for month boundaries.
     */
    protected function setTestTime(string $dateTime): void
    {
        Carbon::setTestNow(Carbon::parse($dateTime));
    }

    /**
     * Reset test time.
     */
    protected function resetTestTime(): void
    {
        Carbon::setTestNow();
    }
}
