<?php

namespace App\Core\Billing;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Account;
use App\Models\BillingEvent;
use App\Models\AccountUser;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Services\WalletService;
use Carbon\Carbon;

class SubscriptionService
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected BillingProviderManager $providerManager,
        protected WalletService $walletService,
        protected UsageService $usageService
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
        $this->assertPlanChangeAllowed($account, $newPlan, $oldPlan);

        $subscription = $account->subscription;
        $shouldApplyWalletProration = (!$providerKey && !($metadata['skip_proration'] ?? false)) || ($metadata['force_proration'] ?? false);
        $proration = $shouldApplyWalletProration
            ? $this->calculateProration($subscription, $oldPlan, $newPlan)
            : ['applied' => false, 'amount_minor' => 0, 'remaining_ratio' => 0];
        $this->assertProrationChargeAffordable($account, $proration);

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
            'proration' => $proration,
            'metadata' => $metadata], $actor);

        $this->applyProrationToWallet($account, $proration, $actor, $subscription);

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

    protected function calculateProration(?Subscription $subscription, ?Plan $oldPlan, Plan $newPlan): array
    {
        if (!$subscription || !$oldPlan) {
            return ['applied' => false, 'amount_minor' => 0, 'remaining_ratio' => 0];
        }

        if ($subscription->status !== 'active') {
            return ['applied' => false, 'amount_minor' => 0, 'remaining_ratio' => 0];
        }

        $cycle = $this->resolveBillingCycle($subscription);
        $oldPrice = $this->getPlanPriceForCycle($oldPlan, $cycle);
        $newPrice = $this->getPlanPriceForCycle($newPlan, $cycle);
        $delta = $newPrice - $oldPrice;

        if ($delta === 0) {
            return ['applied' => false, 'amount_minor' => 0, 'remaining_ratio' => 0];
        }

        $periodStart = $subscription->current_period_start ?: now();
        $periodEnd = $subscription->current_period_end ?: now();
        $now = now();

        if ($periodEnd->lte($now) || $periodEnd->lte($periodStart)) {
            return ['applied' => false, 'amount_minor' => 0, 'remaining_ratio' => 0];
        }

        $periodSeconds = max(1, $periodEnd->diffInSeconds($periodStart));
        $remainingSeconds = max(0, $periodEnd->diffInSeconds($now));
        if ($remainingSeconds <= 0) {
            return ['applied' => false, 'amount_minor' => 0, 'remaining_ratio' => 0];
        }

        $remainingRatio = $remainingSeconds / $periodSeconds;
        $proratedAmount = (int) round($delta * $remainingRatio);

        return [
            'applied' => $proratedAmount !== 0,
            'amount_minor' => $proratedAmount,
            'remaining_ratio' => round($remainingRatio, 6),
            'old_price_minor' => $oldPrice,
            'new_price_minor' => $newPrice,
            'cycle' => $cycle,
            'remaining_seconds' => $remainingSeconds,
            'period_seconds' => $periodSeconds,
        ];
    }

    protected function applyProrationToWallet(Account $account, array $proration, ?User $actor, Subscription $subscription): void
    {
        if (!($proration['applied'] ?? false)) {
            return;
        }

        $amountMinor = (int) ($proration['amount_minor'] ?? 0);
        if ($amountMinor === 0) {
            return;
        }

        $reference = 'sub:'.$subscription->slug.':'.now()->timestamp;

        if ($amountMinor > 0) {
            $tx = $this->walletService->debit(
                account: $account,
                amountMinor: $amountMinor,
                source: 'plan_proration_charge',
                actor: $actor,
                reference: $reference,
                notes: 'Prorated plan upgrade charge',
                meta: $proration
            );

            if ($tx->status !== 'success') {
                throw new \RuntimeException('Proration charge failed due to insufficient wallet balance.');
            }
        } else {
            $this->walletService->credit(
                account: $account,
                amountMinor: abs($amountMinor),
                source: 'plan_proration_credit',
                actor: $actor,
                reference: $reference,
                notes: 'Prorated plan downgrade credit',
                meta: $proration
            );
        }
    }

    protected function assertPlanChangeAllowed(Account $account, Plan $newPlan, ?Plan $oldPlan): void
    {
        if (!$oldPlan || (int) $oldPlan->id === (int) $newPlan->id) {
            return;
        }

        $targetLimits = $newPlan->limits ?? [];
        if (!$targetLimits) {
            return;
        }

        $usage = $this->usageService->getCurrentUsage($account);
        $violations = [];

        $limitChecks = [
            'messages_monthly' => (int) ($usage->messages_sent ?? 0),
            'template_sends_monthly' => (int) ($usage->template_sends ?? 0),
            'ai_credits_monthly' => (int) ($usage->ai_credits_used ?? 0),
        ];

        foreach ($limitChecks as $limitKey => $currentValue) {
            $limit = $targetLimits[$limitKey] ?? null;
            if ($limit === null || (int) $limit === -1) {
                continue;
            }

            if ($currentValue > (int) $limit) {
                $violations[] = "{$limitKey}: {$currentValue} > {$limit}";
            }
        }

        $agentsLimit = $targetLimits['agents'] ?? null;
        if ($agentsLimit !== null && (int) $agentsLimit !== -1) {
            $activeAgents = AccountUser::where('account_id', $account->id)
                ->whereIn('role', ['admin', 'member'])
                ->count();
            if ($activeAgents > (int) $agentsLimit) {
                $violations[] = "agents: {$activeAgents} > {$agentsLimit}";
            }
        }

        $connectionsLimit = $targetLimits['whatsapp_connections'] ?? null;
        if ($connectionsLimit !== null && (int) $connectionsLimit !== -1) {
            $activeConnections = WhatsAppConnection::where('account_id', $account->id)
                ->where('is_active', true)
                ->count();
            if ($activeConnections > (int) $connectionsLimit) {
                $violations[] = "whatsapp_connections: {$activeConnections} > {$connectionsLimit}";
            }
        }

        if (!empty($violations)) {
            throw new \InvalidArgumentException(
                'Cannot switch to this plan because your account currently exceeds one or more limits: '.implode('; ', $violations)
            );
        }
    }

    protected function assertProrationChargeAffordable(Account $account, array $proration): void
    {
        if (!($proration['applied'] ?? false)) {
            return;
        }

        $amountMinor = (int) ($proration['amount_minor'] ?? 0);
        if ($amountMinor <= 0) {
            return;
        }

        $wallet = $this->walletService->getOrCreateWallet($account);
        if ((int) $wallet->balance_minor < $amountMinor) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Insufficient wallet balance for prorated upgrade charge (%d required, %d available).',
                    $amountMinor,
                    (int) $wallet->balance_minor
                )
            );
        }
    }

    protected function resolveBillingCycle(Subscription $subscription): string
    {
        $start = $subscription->current_period_start;
        $end = $subscription->current_period_end;

        if (!$start || !$end) {
            return 'monthly';
        }

        $days = max(1, $start->diffInDays($end));
        return $days > 45 ? 'yearly' : 'monthly';
    }

    protected function getPlanPriceForCycle(Plan $plan, string $cycle): int
    {
        if ($cycle === 'yearly') {
            $yearly = (int) ($plan->price_yearly ?? 0);
            if ($yearly > 0) {
                return $yearly;
            }
        }

        return (int) ($plan->price_monthly ?? 0);
    }
}
