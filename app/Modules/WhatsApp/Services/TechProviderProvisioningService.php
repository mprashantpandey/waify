<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;

class TechProviderProvisioningService
{
    public function __construct(
        protected MetaGraphService $metaGraphService,
        protected EmbeddedSignupProvisioningService $embeddedSignupProvisioningService,
        protected ConnectionHealthSyncService $connectionHealthSyncService,
        protected ConnectionLifecycleService $connectionLifecycleService,
        protected ConnectionService $connectionService,
    ) {
    }

    public function provision(
        WhatsAppConnection $connection,
        string $wabaId,
        string $phoneNumberId,
        string $rawAccessToken,
        ?string $pin = null,
        bool $strict = false
    ): WhatsAppConnection {
        $systemUserToken = (string) config('whatsapp.meta.system_user_token', '');
        $systemUserId = (string) config('whatsapp.meta.system_user_id', '');
        $creditLineId = (string) config('whatsapp.meta.credit_line_id', '');
        $operatingToken = $systemUserToken !== '' ? $systemUserToken : $rawAccessToken;

        if ($systemUserId !== '') {
            $this->embeddedSignupProvisioningService->start($connection, 'system_user_assignment');
            try {
                $assignmentResult = $this->metaGraphService->ensureSystemUserAssignedToWaba(
                    $wabaId,
                    $systemUserId,
                    $operatingToken
                );
                $this->embeddedSignupProvisioningService->complete($connection, 'system_user_assignment', [
                    'already_assigned' => (bool) ($assignmentResult['already_assigned'] ?? false),
                    'system_user_id' => $systemUserId,
                ]);
            } catch (\Throwable $e) {
                $this->embeddedSignupProvisioningService->fail($connection, 'system_user_assignment', $e->getMessage());
                if ($strict) {
                    throw new \RuntimeException('System user access failed: '.$e->getMessage(), 0, $e);
                }
            }
        } else {
            $this->embeddedSignupProvisioningService->skip($connection, 'system_user_assignment', 'System user is not configured');
        }

        if ($creditLineId !== '') {
            $this->embeddedSignupProvisioningService->start($connection, 'credit_line_attachment');
            try {
                $attachResult = $this->metaGraphService->attachCreditLineToWaba($creditLineId, $wabaId, $operatingToken);
                $this->embeddedSignupProvisioningService->complete($connection, 'credit_line_attachment', [
                    'credit_line_id' => $creditLineId,
                    'result' => $attachResult,
                ]);
            } catch (\Throwable $e) {
                $this->embeddedSignupProvisioningService->fail($connection, 'credit_line_attachment', $e->getMessage());
                if ($strict) {
                    throw new \RuntimeException('Credit line attach failed: '.$e->getMessage(), 0, $e);
                }
            }
        } else {
            $this->embeddedSignupProvisioningService->skip($connection, 'credit_line_attachment', 'Credit line is not configured');
        }

        if ($systemUserToken !== '') {
            $this->connectionService->update($connection, [
                'access_token' => $systemUserToken,
                'token_type' => 'system_user',
                'token_source' => 'provider_system_user',
            ]);
            $connection->refresh();
            $operatingToken = $systemUserToken;
        }

        $this->embeddedSignupProvisioningService->start($connection, 'app_subscription');
        try {
            $appSubscriptionToken = $this->metaGraphService->appAccessToken() ?: $operatingToken;
            $subscriptionResult = $this->metaGraphService->ensureAppSubscribedToWaba($wabaId, $appSubscriptionToken);
            $this->embeddedSignupProvisioningService->complete($connection, 'app_subscription', [
                'already_subscribed' => (bool) ($subscriptionResult['already_subscribed'] ?? false),
                'token_type' => $appSubscriptionToken === $operatingToken ? 'operating' : 'app',
            ]);
        } catch (\Throwable $e) {
            $this->embeddedSignupProvisioningService->fail($connection, 'app_subscription', $e->getMessage());
            if ($strict) {
                throw new \RuntimeException('Webhook subscription failed: '.$e->getMessage(), 0, $e);
            }
        }

        if ($pin) {
            $this->embeddedSignupProvisioningService->start($connection, 'phone_registration');
            try {
                $registration = $this->metaGraphService->registerPhoneNumber($phoneNumberId, $pin, $operatingToken);
                $this->embeddedSignupProvisioningService->complete($connection, 'phone_registration', [
                    'registration' => $registration,
                ]);
            } catch (\Throwable $e) {
                $this->embeddedSignupProvisioningService->fail($connection, 'phone_registration', $e->getMessage());
                throw new \RuntimeException('Phone registration failed: '.$e->getMessage(), 0, $e);
            }
        } else {
            $this->embeddedSignupProvisioningService->skip($connection, 'phone_registration', 'PIN was not provided');
        }

        try {
            $this->embeddedSignupProvisioningService->start($connection, 'metadata_sync');
            $snapshot = $this->connectionHealthSyncService->syncConnection($connection, 'embedded_signup');
            if ($snapshot) {
                $this->embeddedSignupProvisioningService->complete($connection, 'metadata_sync', [
                    'snapshot_id' => $snapshot->id,
                ]);
                $this->connectionLifecycleService->transition($connection, 'active', null, [
                    'source' => 'embedded_signup',
                    'snapshot_id' => $snapshot->id,
                ]);
                $this->embeddedSignupProvisioningService->complete($connection, 'connection_ready');
            } else {
                $this->embeddedSignupProvisioningService->fail($connection, 'metadata_sync', 'Connection health snapshot was not created');
                $this->connectionLifecycleService->transition($connection, 'degraded', null, [
                    'source' => 'embedded_signup',
                    'reason' => 'no_snapshot',
                ]);
            }
        } catch (\Throwable $syncError) {
            $this->embeddedSignupProvisioningService->fail($connection, 'metadata_sync', $syncError->getMessage());
            $this->connectionLifecycleService->markMetadataSync($connection, 'error', $syncError->getMessage(), [
                'source' => 'embedded_signup',
            ]);
            $this->connectionLifecycleService->transition($connection, 'degraded', $syncError->getMessage(), [
                'source' => 'embedded_signup',
                'phase' => 'metadata_sync',
            ]);
        }

        return $connection->fresh();
    }
}
