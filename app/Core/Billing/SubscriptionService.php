<?php

namespace App\Core\Billing;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Workspace;
use App\Models\BillingEvent;
use Carbon\Carbon;

class SubscriptionService
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected BillingProviderManager $providerManager
    ) {}

    /**
     * Start a trial for a workspace.
     */
    public function startTrial(Workspace $workspace, Plan $plan, ?User $actor = null, ?string $providerKey = null): Subscription
    {
        if ($plan->trial_days <= 0) {
            throw new \InvalidArgumentException('Plan does not support trials.');
        }

        $provider = $providerKey ? $this->providerManager->get($providerKey) : $this->providerManager->getDefault();
        if (!$provider) {
            throw new \InvalidArgumentException("Billing provider '{$providerKey}' not found.");
        }

        $subscription = $provider->createSubscription($workspace, $plan, $actor ?? $workspace->owner);

        $this->logEvent($workspace, 'trial_started', [
            'plan_key' => $plan->key,
            'trial_days' => $plan->trial_days,
            'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
            'provider' => $provider->getName(),
        ], $actor);

        return $subscription;
    }

    /**
     * Change workspace plan.
     */
    public function changePlan(Workspace $workspace, Plan $newPlan, ?User $actor = null, ?string $providerKey = null, array $metadata = []): Subscription
    {
        $oldPlan = $this->planResolver->getWorkspacePlan($workspace);
        $subscription = $workspace->subscription;

        if (!$subscription) {
            // Create new subscription
            $provider = $providerKey ? $this->providerManager->get($providerKey) : $this->providerManager->getDefault();
            if (!$provider) {
                throw new \InvalidArgumentException("Billing provider '{$providerKey}' not found.");
            }
            $subscription = $provider->createSubscription($workspace, $newPlan, $actor ?? $workspace->owner, $metadata);
        } else {
            // Update existing subscription using specified provider or current provider
            $provider = $providerKey ? $this->providerManager->get($providerKey) : $this->providerManager->getForSubscription($subscription);
            if (!$provider) {
                throw new \InvalidArgumentException("Billing provider '{$providerKey}' not found.");
            }
            $subscription = $provider->updateSubscription($subscription, $newPlan, $actor ?? $workspace->owner, $metadata);
        }

        $this->logEvent($workspace, 'plan_changed', [
            'old_plan_key' => $oldPlan?->key,
            'new_plan_key' => $newPlan->key,
            'provider' => $subscription->provider,
            'metadata' => $metadata,
        ], $actor);

        return $subscription->fresh();
    }

    /**
     * Cancel subscription at period end.
     */
    public function cancelAtPeriodEnd(Workspace $workspace, ?User $actor = null, bool $immediately = false): Subscription
    {
        $subscription = $workspace->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Workspace has no subscription.');
        }

        $provider = $this->providerManager->getForSubscription($subscription);
        $subscription = $provider->cancelSubscription($subscription, $actor ?? $workspace->owner, $immediately);

        $this->logEvent($workspace, 'subscription_canceled', [
            'cancel_at_period_end' => !$immediately,
            'immediately' => $immediately,
            'provider' => $provider->getName(),
        ], $actor);

        return $subscription->fresh();
    }

    /**
     * Resume a canceled subscription.
     */
    public function resume(Workspace $workspace, ?User $actor = null): Subscription
    {
        $subscription = $workspace->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Workspace has no subscription.');
        }

        $provider = $this->providerManager->getForSubscription($subscription);
        $subscription = $provider->resumeSubscription($subscription, $actor ?? $workspace->owner);

        $this->logEvent($workspace, 'subscription_resumed', [
            'provider' => $provider->getName(),
        ], $actor);

        return $subscription->fresh();
    }

    /**
     * Mark subscription as past due.
     */
    public function markPastDue(Workspace $workspace, ?string $reason = null, ?User $actor = null): Subscription
    {
        $subscription = $workspace->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Workspace has no subscription.');
        }

        $subscription->update([
            'status' => 'past_due',
            'last_payment_failed_at' => now(),
            'last_error' => $reason,
        ]);

        $this->logEvent($workspace, 'payment_failed', [
            'reason' => $reason,
        ], $actor);

        return $subscription->fresh();
    }

    /**
     * Record a manual payment.
     */
    public function recordManualPayment(Workspace $workspace, int $amount, ?User $actor = null): Subscription
    {
        $subscription = $workspace->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Workspace has no subscription.');
        }

        // Extend period by 1 month
        $periodEnd = $subscription->current_period_end 
            ? Carbon::parse($subscription->current_period_end)->addMonth()
            : now()->addMonth();

        $subscription->update([
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => $periodEnd,
            'last_payment_at' => now(),
            'last_payment_failed_at' => null,
            'last_error' => null,
            'cancel_at_period_end' => false,
            'canceled_at' => null,
        ]);

        $this->logEvent($workspace, 'payment_recorded', [
            'amount' => $amount,
            'currency' => 'INR',
            'period_end' => $periodEnd->toIso8601String(),
        ], $actor);

        return $subscription->fresh();
    }

    /**
     * Log a billing event.
     */
    protected function logEvent(Workspace $workspace, string $type, array $data = [], ?User $actor = null): void
    {
        BillingEvent::create([
            'workspace_id' => $workspace->id,
            'actor_id' => $actor?->id,
            'type' => $type,
            'data' => $data,
        ]);
    }
}
