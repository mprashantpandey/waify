<?php

namespace App\Core\Billing;

use App\Models\Account;
use App\Models\BillingEvent;
use Symfony\Component\HttpFoundation\Response;

class EntitlementService
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected UsageService $usageService
    ) {}

    /**
     * Assert that a module is enabled for the account.
     * 
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function assertModuleEnabled(Account $account, string $moduleKey): void
    {
        // First check: module must be enabled at platform level
        $module = \App\Models\Module::where('key', $moduleKey)->first();
        if (!$module || !$module->is_enabled) {
            abort(404, "Module '{$moduleKey}' is currently disabled at the platform level. Please contact support.");
        }
        
        // Second check: module must be available on plan and enabled in account
        $effectiveModules = $this->planResolver->getEffectiveModules($account);

        if (!in_array($moduleKey, $effectiveModules)) {
            abort(403, "Module '{$moduleKey}' is not available on your current plan. Please upgrade to access this feature.");
        }
    }

    /**
     * Assert that account is within a limit.
     * 
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function assertWithinLimit(Account $account, string $limitKey, int $intendedIncrement = 1): void
    {
        $limits = $this->planResolver->getEffectiveLimits($account);
        $limit = $limits[$limitKey] ?? 0;

        // -1 means unlimited
        if ($limit === -1) {
            return;
        }

        // Get current usage
        $usage = $this->usageService->getCurrentUsage($account);
        
        $currentUsage = match ($limitKey) {
            'messages_monthly' => $usage->messages_sent,
            'template_sends_monthly' => $usage->template_sends,
            'ai_credits_monthly' => $usage->ai_credits_used,
            default => 0,
        };

        if (($currentUsage + $intendedIncrement) > $limit) {
            // Log limit blocked event
            BillingEvent::create([
                'account_id' => $account->id,
                'type' => 'limit_blocked',
                'data' => [
                    'limit_key' => $limitKey,
                    'current_usage' => $currentUsage,
                    'limit' => $limit,
                    'intended_increment' => $intendedIncrement]]);

            abort(402, "You have reached your {$limitKey} limit ({$limit}). Please upgrade your plan to continue.");
        }
    }

    /**
     * Check if account can create an agent.
     */
    public function canCreateAgent(Account $account): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($account);
        $agentLimit = $limits['agents'] ?? 0;

        if ($agentLimit === -1) {
            return true; // Unlimited
        }

        // Count current agents (exclude owner)
        $currentAgents = \App\Models\AccountUser::where('account_id', $account->id)
            ->whereIn('role', ['admin', 'member'])
            ->count();

        return $currentAgents < $agentLimit;
    }

    /**
     * Check if account can create a WhatsApp connection.
     */
    public function canCreateConnection(Account $account): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($account);
        $connectionLimit = $limits['whatsapp_connections'] ?? 0;

        if ($connectionLimit === -1) {
            return true; // Unlimited
        }

        // Count current connections
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConnection::class)) {
            $currentConnections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
                ->where('is_active', true)
                ->count();
            
            return $currentConnections < $connectionLimit;
        }

        return true; // If module doesn't exist, allow
    }

    /**
     * Check if account can send a message.
     */
    public function canSendMessage(Account $account): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($account);
        $messageLimit = $limits['messages_monthly'] ?? 0;

        if ($messageLimit === -1) {
            return true; // Unlimited
        }

        $usage = $this->usageService->getCurrentUsage($account);
        return $usage->messages_sent < $messageLimit;
    }

    /**
     * Check if account can send a template.
     */
    public function canSendTemplate(Account $account): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($account);
        $templateLimit = $limits['template_sends_monthly'] ?? 0;

        if ($templateLimit === -1) {
            return true; // Unlimited
        }

        $usage = $this->usageService->getCurrentUsage($account);
        return $usage->template_sends < $templateLimit;
    }
}
