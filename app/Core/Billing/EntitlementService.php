<?php

namespace App\Core\Billing;

use App\Models\Workspace;
use App\Models\BillingEvent;
use Symfony\Component\HttpFoundation\Response;

class EntitlementService
{
    public function __construct(
        protected PlanResolver $planResolver,
        protected UsageService $usageService
    ) {}

    /**
     * Assert that a module is enabled for the workspace.
     * 
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function assertModuleEnabled(Workspace $workspace, string $moduleKey): void
    {
        // First check: module must be enabled at platform level
        $module = \App\Models\Module::where('key', $moduleKey)->first();
        if (!$module || !$module->is_enabled) {
            abort(404, "Module '{$moduleKey}' is currently disabled at the platform level. Please contact support.");
        }
        
        // Second check: module must be available on plan and enabled in workspace
        $effectiveModules = $this->planResolver->getEffectiveModules($workspace);

        if (!in_array($moduleKey, $effectiveModules)) {
            abort(403, "Module '{$moduleKey}' is not available on your current plan. Please upgrade to access this feature.");
        }
    }

    /**
     * Assert that workspace is within a limit.
     * 
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException
     */
    public function assertWithinLimit(Workspace $workspace, string $limitKey, int $intendedIncrement = 1): void
    {
        $limits = $this->planResolver->getEffectiveLimits($workspace);
        $limit = $limits[$limitKey] ?? 0;

        // -1 means unlimited
        if ($limit === -1) {
            return;
        }

        // Get current usage
        $usage = $this->usageService->getCurrentUsage($workspace);
        
        $currentUsage = match ($limitKey) {
            'messages_monthly' => $usage->messages_sent,
            'template_sends_monthly' => $usage->template_sends,
            'ai_credits_monthly' => $usage->ai_credits_used,
            default => 0,
        };

        if (($currentUsage + $intendedIncrement) > $limit) {
            // Log limit blocked event
            BillingEvent::create([
                'workspace_id' => $workspace->id,
                'type' => 'limit_blocked',
                'data' => [
                    'limit_key' => $limitKey,
                    'current_usage' => $currentUsage,
                    'limit' => $limit,
                    'intended_increment' => $intendedIncrement,
                ],
            ]);

            abort(402, "You have reached your {$limitKey} limit ({$limit}). Please upgrade your plan to continue.");
        }
    }

    /**
     * Check if workspace can create an agent.
     */
    public function canCreateAgent(Workspace $workspace): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($workspace);
        $agentLimit = $limits['agents'] ?? 0;

        if ($agentLimit === -1) {
            return true; // Unlimited
        }

        // Count current agents (placeholder - implement when agents table exists)
        $currentAgents = 0; // TODO: Count actual agents

        return $currentAgents < $agentLimit;
    }

    /**
     * Check if workspace can create a WhatsApp connection.
     */
    public function canCreateConnection(Workspace $workspace): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($workspace);
        $connectionLimit = $limits['whatsapp_connections'] ?? 0;

        if ($connectionLimit === -1) {
            return true; // Unlimited
        }

        // Count current connections
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConnection::class)) {
            $currentConnections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('workspace_id', $workspace->id)
                ->where('is_active', true)
                ->count();
            
            return $currentConnections < $connectionLimit;
        }

        return true; // If module doesn't exist, allow
    }

    /**
     * Check if workspace can send a message.
     */
    public function canSendMessage(Workspace $workspace): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($workspace);
        $messageLimit = $limits['messages_monthly'] ?? 0;

        if ($messageLimit === -1) {
            return true; // Unlimited
        }

        $usage = $this->usageService->getCurrentUsage($workspace);
        return $usage->messages_sent < $messageLimit;
    }

    /**
     * Check if workspace can send a template.
     */
    public function canSendTemplate(Workspace $workspace): bool
    {
        $limits = $this->planResolver->getEffectiveLimits($workspace);
        $templateLimit = $limits['template_sends_monthly'] ?? 0;

        if ($templateLimit === -1) {
            return true; // Unlimited
        }

        $usage = $this->usageService->getCurrentUsage($workspace);
        return $usage->template_sends < $templateLimit;
    }
}

