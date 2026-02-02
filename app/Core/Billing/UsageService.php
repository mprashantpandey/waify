<?php

namespace App\Core\Billing;

use App\Models\Workspace;
use App\Models\WorkspaceUsage;
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
    public function getCurrentUsage(Workspace $workspace): WorkspaceUsage
    {
        $period = $this->getCurrentPeriod();

        return WorkspaceUsage::firstOrCreate(
            [
                'workspace_id' => $workspace->id,
                'period' => $period,
            ],
            [
                'messages_sent' => 0,
                'template_sends' => 0,
                'ai_credits_used' => 0,
                'storage_bytes' => 0,
            ]
        );
    }

    /**
     * Increment messages sent count.
     */
    public function incrementMessages(Workspace $workspace, int $count = 1): void
    {
        $usage = $this->getCurrentUsage($workspace);
        $usage->increment('messages_sent', $count);
    }

    /**
     * Increment template sends count.
     */
    public function incrementTemplateSends(Workspace $workspace, int $count = 1): void
    {
        $usage = $this->getCurrentUsage($workspace);
        $usage->increment('template_sends', $count);
    }

    /**
     * Increment AI credits used.
     */
    public function incrementAiCredits(Workspace $workspace, int $count): void
    {
        $usage = $this->getCurrentUsage($workspace);
        $usage->increment('ai_credits_used', $count);
    }

    /**
     * Get usage for a specific period.
     */
    public function getUsageForPeriod(Workspace $workspace, string $period): ?WorkspaceUsage
    {
        return WorkspaceUsage::where('workspace_id', $workspace->id)
            ->where('period', $period)
            ->first();
    }

    /**
     * Get usage history (last N periods).
     */
    public function getUsageHistory(Workspace $workspace, int $months = 3): array
    {
        $periods = [];
        $now = Carbon::now();

        for ($i = 0; $i < $months; $i++) {
            $period = $now->copy()->subMonths($i)->format('Y-m');
            $usage = $this->getUsageForPeriod($workspace, $period);
            
            $periods[] = [
                'period' => $period,
                'messages_sent' => $usage?->messages_sent ?? 0,
                'template_sends' => $usage?->template_sends ?? 0,
                'ai_credits_used' => $usage?->ai_credits_used ?? 0,
            ];
        }

        return $periods;
    }
}

