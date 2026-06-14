<?php

namespace App\Console\Commands;

use App\Models\PlatformSetting;
use App\Models\Subscription;
use App\Services\AppNotificationService;
use App\Services\BillingEmailService;
use Illuminate\Console\Command;

class SendBillingRenewalRemindersCommand extends Command
{
    protected $signature = 'billing:send-renewal-reminders {--days=} {--respect-time}';

    protected $description = 'Send renewal reminders for subscriptions ending soon.';

    public function handle(BillingEmailService $emailService, AppNotificationService $notifications): int
    {
        if ($this->option('respect-time') && ! $this->isConfiguredReminderWindow()) {
            $this->info('Outside configured renewal reminder window.');

            return self::SUCCESS;
        }

        $days = max(1, (int) ($this->option('days') ?? PlatformSetting::get('payment.renewal_reminder_days', 7)));
        $start = now();
        $end = now()->addDays($days)->endOfDay();
        $sent = 0;

        Subscription::with('account.owner')
            ->whereIn('status', ['active', 'trialing', 'past_due'])
            ->whereBetween('current_period_end', [$start, $end])
            ->chunkById(100, function ($subscriptions) use ($emailService, $notifications, &$sent) {
                foreach ($subscriptions as $subscription) {
                    $key = 'renewal_reminder_sent_at';
                    $metadata = is_array($subscription->provider_payload ?? null) ? $subscription->provider_payload : [];
                    if (! empty($metadata[$key]) && now()->parse($metadata[$key])->isAfter(now()->subDays(3))) {
                        continue;
                    }

                    $emailService->renewalReminder($subscription);
                    $metadata[$key] = now()->toIso8601String();
                    $subscription->forceFill(['provider_payload' => $metadata])->save();

                    if ($subscription->account) {
                        $notifications->workspace(
                            $subscription->account,
                            'payment_due',
                            'Subscription renewal reminder',
                            'Your subscription renews on '.$subscription->current_period_end?->toFormattedDateString().'.',
                            'warning',
                            route('app.billing.index'),
                            ['subscription_id' => $subscription->id, 'dedupe_key' => 'subscription_'.$subscription->id]
                        );
                    }
                    $sent++;
                }
            });

        $this->info("Sent {$sent} renewal reminder(s).");

        return self::SUCCESS;
    }

    private function isConfiguredReminderWindow(): bool
    {
        $configured = (string) PlatformSetting::get('payment.renewal_reminder_time', '09:00');
        if (! preg_match('/^\d{2}:\d{2}$/', $configured)) {
            $configured = '09:00';
        }

        $target = now()->setTimeFromTimeString($configured);

        return now()->betweenIncluded($target, $target->copy()->addMinutes(29));
    }
}
