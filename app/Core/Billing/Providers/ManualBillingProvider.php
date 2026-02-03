<?php

namespace App\Core\Billing\Providers;

use App\Core\Billing\Contracts\BillingProvider;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Account;
use App\Models\User;
use Carbon\Carbon;

/**
 * Manual Billing Provider
 * 
 * Handles subscriptions without external payment processing.
 * Useful for enterprise customers, invoicing, or manual payment handling.
 */
class ManualBillingProvider implements BillingProvider
{
    public function getName(): string
    {
        return 'manual';
    }

    public function isEnabled(): bool
    {
        // Manual provider is always enabled
        return true;
    }

    public function createSubscription(Account $account, Plan $plan, User $actor, array $metadata = []): Subscription
    {
        $now = now();
        $trialEndsAt = $plan->trial_days > 0 
            ? $now->copy()->addDays($plan->trial_days) 
            : null;

        $status = $plan->trial_days > 0 ? 'trialing' : 'active';
        $periodEnd = $trialEndsAt ?? $now->copy()->addMonth();

        return Subscription::updateOrCreate(
            ['account_id' => $account->id],
            [
                'plan_id' => $plan->id,
                'status' => $status,
                'started_at' => $now,
                'trial_ends_at' => $trialEndsAt,
                'current_period_start' => $now,
                'current_period_end' => $periodEnd,
                'provider' => $this->getName(),
                'provider_ref' => null]
        );
    }

    public function updateSubscription(Subscription $subscription, Plan $newPlan, User $actor, array $metadata = []): Subscription
    {
        $subscription->update([
            'plan_id' => $newPlan->id,
            'status' => $subscription->status === 'canceled' ? 'active' : $subscription->status,
            'cancel_at_period_end' => false,
            'canceled_at' => null]);

        return $subscription->fresh();
    }

    public function cancelSubscription(Subscription $subscription, User $actor, bool $immediately = false): Subscription
    {
        if ($immediately) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
                'cancel_at_period_end' => false]);
        } else {
            $subscription->update([
                'cancel_at_period_end' => true]);
        }

        return $subscription->fresh();
    }

    public function resumeSubscription(Subscription $subscription, User $actor): Subscription
    {
        $subscription->update([
            'status' => 'active',
            'cancel_at_period_end' => false,
            'canceled_at' => null]);

        return $subscription->fresh();
    }

    public function syncSubscription(Subscription $subscription): Subscription
    {
        // Manual provider doesn't sync from external source
        // Just ensure status is correct based on dates
        
        if ($subscription->status === 'trialing' && $subscription->trial_ends_at && $subscription->trial_ends_at->isPast()) {
            $subscription->update([
                'status' => 'active',
                'current_period_start' => $subscription->trial_ends_at,
                'current_period_end' => $subscription->trial_ends_at->copy()->addMonth()]);
        }

        if ($subscription->status === 'active' && $subscription->current_period_end && $subscription->current_period_end->isPast()) {
            // Extend period by one month (manual renewal)
            $subscription->update([
                'current_period_start' => $subscription->current_period_end,
                'current_period_end' => $subscription->current_period_end->copy()->addMonth()]);
        }

        if ($subscription->cancel_at_period_end && $subscription->current_period_end && $subscription->current_period_end->isPast()) {
            $subscription->update([
                'status' => 'canceled',
                'canceled_at' => now(),
                'cancel_at_period_end' => false]);
        }

        return $subscription->fresh();
    }

    public function handleWebhook(array $payload): void
    {
        // Manual provider doesn't receive webhooks
    }

    public function getCheckoutUrl(Account $account, Plan $plan, User $actor, array $metadata = []): ?string
    {
        // Manual provider doesn't have checkout URLs
        return null;
    }
}

