<?php

namespace App\Core\Billing;

use App\Models\Account;
use App\Models\Subscription;

class SubscriptionAccessService
{
    /**
     * Route namespaces always allowed when subscription is blocked.
     * Keep this narrow and explicit.
     *
     * @var list<string>
     */
    protected array $allowedWhenBlocked = [
        'app.billing.',
        'app.settings',
        'profile.',
        'app.support.',
        'onboarding',
        'app.onboarding',
        'app.activity-logs',
        'app.alerts.',
    ];

    public function evaluate(Account $account, ?Subscription $subscription): array
    {
        if (!$subscription) {
            return [
                'state' => 'no_subscription',
                'blocked' => true,
                'reason' => 'No active subscription found. Select a plan to continue.',
                'can_access_modules' => false,
                'recovery_actions' => $this->defaultRecoveryActions('no_subscription'),
            ];
        }

        if ($subscription->status === 'trialing') {
            if ($subscription->trial_ends_at && $subscription->trial_ends_at->isFuture()) {
                return [
                    'state' => 'trial_active',
                    'blocked' => false,
                    'reason' => null,
                    'can_access_modules' => true,
                    'recovery_actions' => [],
                ];
            }

            return [
                'state' => 'trial_expired',
                'blocked' => true,
                'reason' => 'Trial ended. Renew or choose a paid plan to continue.',
                'can_access_modules' => false,
                'recovery_actions' => $this->defaultRecoveryActions('trial_expired'),
            ];
        }

        if ($subscription->status === 'past_due') {
            return [
                'state' => 'past_due',
                'blocked' => true,
                'reason' => $subscription->last_error ?: 'Payment past due. Update payment method to restore access.',
                'can_access_modules' => false,
                'recovery_actions' => $this->defaultRecoveryActions('past_due'),
            ];
        }

        if ($subscription->status === 'canceled') {
            $inGrace = $subscription->current_period_end && $subscription->current_period_end->isFuture();
            return [
                'state' => $inGrace ? 'canceled_grace' : 'canceled_ended',
                'blocked' => !$inGrace,
                'reason' => $inGrace
                    ? 'Subscription canceled but still active until period end.'
                    : 'Subscription ended. Renew to continue.',
                'can_access_modules' => $inGrace,
                'recovery_actions' => $inGrace
                    ? $this->defaultRecoveryActions('canceled_grace')
                    : $this->defaultRecoveryActions('canceled_ended'),
            ];
        }

        if ($subscription->status === 'active') {
            if ($subscription->current_period_end && $subscription->current_period_end->isPast()) {
                return [
                    'state' => 'period_ended',
                    'blocked' => true,
                    'reason' => 'Subscription period ended. Renew to continue.',
                    'can_access_modules' => false,
                    'recovery_actions' => $this->defaultRecoveryActions('period_ended'),
                ];
            }

            return [
                'state' => 'active',
                'blocked' => false,
                'reason' => null,
                'can_access_modules' => true,
                'recovery_actions' => [],
            ];
        }

        return [
            'state' => 'unknown',
            'blocked' => true,
            'reason' => 'Subscription state unknown. Contact support.',
            'can_access_modules' => false,
            'recovery_actions' => $this->defaultRecoveryActions('unknown'),
        ];
    }

    public function routeAllowedWhenBlocked(?string $routeName): bool
    {
        if (!$routeName) {
            return false;
        }

        foreach ($this->allowedWhenBlocked as $prefix) {
            if (str_starts_with($routeName, $prefix)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return list<string>
     */
    protected function defaultRecoveryActions(string $state): array
    {
        return match ($state) {
            'canceled_grace' => ['resume_plan', 'contact_support'],
            'no_subscription' => ['choose_plan', 'contact_support'],
            default => ['renew_now', 'update_payment', 'contact_support'],
        };
    }
}
