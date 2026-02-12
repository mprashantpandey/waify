<?php

namespace App\Core\Billing;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Account;
use App\Models\BillingEvent;
use Carbon\Carbon;

class SubscriptionService
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected BillingProviderManager $providerManager
    ) {}

    /**
     * Start a trial for a account.
     */
    public function startTrial(Account $account, Plan $plan, ?User $actor = null, ?string $providerKey = null): Subscription
    {
        if ($plan->trial_days <= 0) {
            throw new \InvalidArgumentException('Plan does not support trials.');
        }

        $provider = $providerKey ? $this->providerManager->get($providerKey) : $this->providerManager->getDefault();
        if (!$provider) {
            throw new \InvalidArgumentException("Billing provider '{$providerKey}' not found.");
        }

        $subscription = $provider->createSubscription($account, $plan, $actor ?? $account->owner);

        $this->logEvent($account, 'trial_started', [
            'plan_key' => $plan->key,
            'trial_days' => $plan->trial_days,
            'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
            'provider' => $provider->getName()], $actor);

        return $subscription;
    }

    /**
     * Change account plan.
     */
    public function changePlan(Account $account, Plan $newPlan, ?User $actor = null, ?string $providerKey = null, array $metadata = []): Subscription
    {
        $oldPlan = $this->planResolver->getAccountPlan($account);
        $subscription = $account->subscription;

        if (!$subscription) {
            // Create new subscription
            $provider = $providerKey ? $this->providerManager->get($providerKey) : $this->providerManager->getDefault();
            if (!$provider) {
                throw new \InvalidArgumentException("Billing provider '{$providerKey}' not found.");
            }
            $subscription = $provider->createSubscription($account, $newPlan, $actor ?? $account->owner, $metadata);
        } else {
            // Update existing subscription using specified provider or current provider
            $provider = $providerKey ? $this->providerManager->get($providerKey) : $this->providerManager->getForSubscription($subscription);
            if (!$provider) {
                throw new \InvalidArgumentException("Billing provider '{$providerKey}' not found.");
            }
            $subscription = $provider->updateSubscription($subscription, $newPlan, $actor ?? $account->owner, $metadata);
        }

        $this->logEvent($account, 'plan_changed', [
            'old_plan_key' => $oldPlan?->key,
            'new_plan_key' => $newPlan->key,
            'provider' => $subscription->provider,
            'metadata' => $metadata], $actor);

        return $subscription->fresh();
    }

    /**
     * Cancel subscription at period end.
     */
    public function cancelAtPeriodEnd(Account $account, ?User $actor = null, bool $immediately = false): Subscription
    {
        $subscription = $account->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Account has no subscription.');
        }

        $provider = $this->providerManager->getForSubscription($subscription);
        $subscription = $provider->cancelSubscription($subscription, $actor ?? $account->owner, $immediately);

        $this->logEvent($account, 'subscription_canceled', [
            'cancel_at_period_end' => !$immediately,
            'immediately' => $immediately,
            'provider' => $provider->getName()], $actor);

        return $subscription->fresh();
    }

    /**
     * Resume a canceled subscription.
     */
    public function resume(Account $account, ?User $actor = null): Subscription
    {
        $subscription = $account->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Account has no subscription.');
        }

        $provider = $this->providerManager->getForSubscription($subscription);
        $subscription = $provider->resumeSubscription($subscription, $actor ?? $account->owner);

        $this->logEvent($account, 'subscription_resumed', [
            'provider' => $provider->getName()], $actor);

        return $subscription->fresh();
    }

    /**
     * Mark subscription as past due.
     */
    public function markPastDue(Account $account, ?string $reason = null, ?User $actor = null): Subscription
    {
        $subscription = $account->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Account has no subscription.');
        }

        $subscription->update([
            'status' => 'past_due',
            'last_payment_failed_at' => now(),
            'last_error' => $reason]);

        $this->logEvent($account, 'payment_failed', [
            'reason' => $reason], $actor);

        return $subscription->fresh();
    }

    /**
     * Record a manual payment.
     */
    public function recordManualPayment(Account $account, int $amount, ?User $actor = null): Subscription
    {
        $subscription = $account->subscription;

        if (!$subscription) {
            throw new \InvalidArgumentException('Account has no subscription.');
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
            'canceled_at' => null]);

        $this->logEvent($account, 'payment_recorded', [
            'amount' => $amount,
            'currency' => 'INR',
            'period_end' => $periodEnd->toIso8601String()], $actor);

        return $subscription->fresh();
    }

    /**
     * Sync provider state and normalize local subscription status based on dates.
     */
    public function syncAndNormalize(Subscription $subscription): Subscription
    {
        $provider = $this->providerManager->getForSubscription($subscription);
        $subscription = $provider->syncSubscription($subscription)->fresh();

        // End of period cancellation.
        if (
            $subscription->cancel_at_period_end
            && $subscription->current_period_end
            && $subscription->current_period_end->isPast()
            && $subscription->status !== 'canceled'
        ) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
                'cancel_at_period_end' => false,
            ]);

            return $subscription->fresh();
        }

        // Expired trial without conversion.
        if (
            $subscription->status === 'trialing'
            && $subscription->trial_ends_at
            && $subscription->trial_ends_at->isPast()
        ) {
            $subscription->update([
                'status' => 'past_due',
                'last_payment_failed_at' => now(),
                'last_error' => $subscription->last_error ?: 'Trial ended. Upgrade plan to continue.',
            ]);

            return $subscription->fresh();
        }

        // Expired paid period.
        if (
            $subscription->status === 'active'
            && $subscription->current_period_end
            && $subscription->current_period_end->isPast()
        ) {
            $subscription->update([
                'status' => 'past_due',
                'last_payment_failed_at' => now(),
                'last_error' => $subscription->last_error ?: 'Subscription period ended. Renew to continue.',
            ]);
        }

        return $subscription->fresh();
    }

    /**
     * Log a billing event.
     */
    protected function logEvent(Account $account, string $type, array $data = [], ?User $actor = null): void
    {
        BillingEvent::create([
            'account_id' => $account->id,
            'actor_id' => $actor?->id,
            'type' => $type,
            'data' => $data]);
    }
}
