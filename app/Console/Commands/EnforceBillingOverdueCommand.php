<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Models\PlatformSetting;
use App\Models\Subscription;
use Illuminate\Console\Command;

class EnforceBillingOverdueCommand extends Command
{
    protected $signature = 'billing:enforce-overdue';

    protected $description = 'Apply grace period and auto-disable rules to overdue subscriptions.';

    public function handle(): int
    {
        $graceDays = (int) PlatformSetting::get('payment.subscription_grace_days', 3);
        $disableDays = (int) PlatformSetting::get('payment.auto_disable_overdue_days', 7);
        $autoDisable = (bool) PlatformSetting::get('payment.auto_disable_overdue_enabled', false);
        $changed = 0;

        Subscription::with('account')
            ->whereIn('status', ['active', 'past_due', 'trialing'])
            ->whereNotNull('current_period_end')
            ->where('current_period_end', '<', now())
            ->chunkById(100, function ($subscriptions) use ($graceDays, $disableDays, $autoDisable, &$changed) {
                foreach ($subscriptions as $subscription) {
                    $daysOverdue = $subscription->current_period_end->diffInDays(now());

                    if ($subscription->status === 'active' && $daysOverdue >= $graceDays) {
                        $subscription->update([
                            'status' => 'past_due',
                            'last_payment_failed_at' => now(),
                            'last_error' => 'Subscription payment is overdue.',
                        ]);
                        $changed++;
                    }

                    if ($autoDisable && $subscription->account instanceof Account && $daysOverdue >= $disableDays && $subscription->account->status !== 'disabled') {
                        $subscription->account->update([
                            'status' => 'disabled',
                            'disabled_at' => now(),
                            'disabled_reason' => 'Auto-disabled after '.$daysOverdue.' overdue day(s).',
                        ]);
                        $changed++;
                    }
                }
            });

        $this->info("Updated {$changed} overdue billing record(s).");

        return self::SUCCESS;
    }
}
