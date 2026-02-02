<?php

namespace App\Core\Billing\Contracts;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Workspace;
use App\Models\User;

/**
 * Billing Provider Interface
 * 
 * All payment gateways must implement this interface to integrate with the billing system.
 */
interface BillingProvider
{
    /**
     * Get the provider name/key.
     */
    public function getName(): string;

    /**
     * Check if this provider is enabled.
     */
    public function isEnabled(): bool;

    /**
     * Create a subscription for a workspace.
     * 
     * @param Workspace $workspace
     * @param Plan $plan
     * @param User $actor The user performing the action
     * @param array $metadata Additional metadata (e.g., payment method, billing address)
     * @return Subscription
     */
    public function createSubscription(Workspace $workspace, Plan $plan, User $actor, array $metadata = []): Subscription;

    /**
     * Update subscription (e.g., change plan).
     * 
     * @param Subscription $subscription
     * @param Plan $newPlan
     * @param User $actor
     * @param array $metadata
     * @return Subscription
     */
    public function updateSubscription(Subscription $subscription, Plan $newPlan, User $actor, array $metadata = []): Subscription;

    /**
     * Cancel subscription.
     * 
     * @param Subscription $subscription
     * @param User $actor
     * @param bool $immediately Cancel immediately or at period end
     * @return Subscription
     */
    public function cancelSubscription(Subscription $subscription, User $actor, bool $immediately = false): Subscription;

    /**
     * Resume a canceled subscription.
     * 
     * @param Subscription $subscription
     * @param User $actor
     * @return Subscription
     */
    public function resumeSubscription(Subscription $subscription, User $actor): Subscription;

    /**
     * Sync subscription status from provider.
     * 
     * @param Subscription $subscription
     * @return Subscription
     */
    public function syncSubscription(Subscription $subscription): Subscription;

    /**
     * Handle webhook from provider.
     * 
     * @param array $payload
     * @return void
     */
    public function handleWebhook(array $payload): void;

    /**
     * Get checkout URL for a plan.
     * 
     * @param Workspace $workspace
     * @param Plan $plan
     * @param User $actor
     * @param array $metadata
     * @return string|null Checkout URL or null if not supported
     */
    public function getCheckoutUrl(Workspace $workspace, Plan $plan, User $actor, array $metadata = []): ?string;
}

