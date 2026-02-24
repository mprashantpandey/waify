<?php

namespace App\Core\Billing;

use App\Models\Account;
use App\Models\AccountUsage;
use Carbon\Carbon;

class UsageService
{
    /**
     * Get current period string (e.g., "2026-01").
     */
    public function getCurrentPeriod(?string $timezone = null): string
    {
        $now = $timezone ? Carbon::now($timezone) : Carbon::now();
        return $now->format('Y-m');
    }

    /**
     * Get or create usage record for current period.
     */
    public function getCurrentUsage(Account $account): AccountUsage
    {
        $period = $this->getCurrentPeriod();

        return AccountUsage::firstOrCreate(
            [
                'account_id' => $account->id,
                'period' => $period],
            [
                'messages_sent' => 0,
                'template_sends' => 0,
                'ai_credits_used' => 0,
                'meta_conversations_free_used' => 0,
                'meta_conversations_paid' => 0,
                'meta_conversations_marketing' => 0,
                'meta_conversations_utility' => 0,
                'meta_conversations_authentication' => 0,
                'meta_conversations_service' => 0,
                'meta_estimated_cost_minor' => 0,
                'storage_bytes' => 0]
        );
    }

    /**
     * Increment messages sent count.
     */
    public function incrementMessages(Account $account, int $count = 1): void
    {
        $usage = $this->getCurrentUsage($account);
        $usage->increment('messages_sent', $count);
    }

    /**
     * Increment template sends count.
     */
    public function incrementTemplateSends(Account $account, int $count = 1): void
    {
        $usage = $this->getCurrentUsage($account);
        $usage->increment('template_sends', $count);
    }

    /**
     * Increment AI credits used.
     */
    public function incrementAiCredits(Account $account, int $count): void
    {
        $usage = $this->getCurrentUsage($account);
        $usage->increment('ai_credits_used', $count);
    }

    /**
     * Track Meta conversation billing counters (estimated).
     */
    public function incrementMetaConversationUsage(
        Account $account,
        bool $billable,
        ?string $category = null,
        int $estimatedCostMinor = 0
    ): void {
        $usage = $this->getCurrentUsage($account);

        if ($billable) {
            $usage->increment('meta_conversations_paid', 1);
        } else {
            $usage->increment('meta_conversations_free_used', 1);
        }

        $normalizedCategory = strtolower(trim((string) $category));
        $categoryColumn = match ($normalizedCategory) {
            'marketing' => 'meta_conversations_marketing',
            'utility' => 'meta_conversations_utility',
            'authentication' => 'meta_conversations_authentication',
            'service' => 'meta_conversations_service',
            default => null,
        };

        if ($categoryColumn) {
            $usage->increment($categoryColumn, 1);
        }

        if ($estimatedCostMinor > 0) {
            $usage->increment('meta_estimated_cost_minor', $estimatedCostMinor);
        }
    }

    /**
     * Get usage for a specific period.
     */
    public function getUsageForPeriod(Account $account, string $period): ?AccountUsage
    {
        return AccountUsage::where('account_id', $account->id)
            ->where('period', $period)
            ->first();
    }

    /**
     * Get usage history (last N periods).
     */
    public function getUsageHistory(Account $account, int $months = 3): array
    {
        $periods = [];
        $now = Carbon::now();

        for ($i = 0; $i < $months; $i++) {
            $period = $now->copy()->subMonths($i)->format('Y-m');
            $usage = $this->getUsageForPeriod($account, $period);
            
            $periods[] = [
                'period' => $period,
                'messages_sent' => $usage?->messages_sent ?? 0,
                'template_sends' => $usage?->template_sends ?? 0,
                'ai_credits_used' => $usage?->ai_credits_used ?? 0,
                'meta_conversations_free_used' => $usage?->meta_conversations_free_used ?? 0,
                'meta_conversations_paid' => $usage?->meta_conversations_paid ?? 0,
                'meta_conversations_marketing' => $usage?->meta_conversations_marketing ?? 0,
                'meta_conversations_utility' => $usage?->meta_conversations_utility ?? 0,
                'meta_conversations_authentication' => $usage?->meta_conversations_authentication ?? 0,
                'meta_conversations_service' => $usage?->meta_conversations_service ?? 0,
                'meta_estimated_cost_minor' => $usage?->meta_estimated_cost_minor ?? 0,
            ];
        }

        return $periods;
    }
}
