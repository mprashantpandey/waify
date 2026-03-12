<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConnectionHealthSnapshot;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class ConnectionHealthSyncService
{
    public function __construct(
        protected MetaGraphService $metaGraphService,
        protected ConnectionLifecycleService $connectionLifecycleService
    ) {
    }

    public function syncConnection(WhatsAppConnection $connection, string $source = 'api_sync'): ?WhatsAppConnectionHealthSnapshot
    {
        if (!Schema::hasTable('whatsapp_connection_health_snapshots')) {
            return null;
        }

        if (!$connection->access_token || !$connection->phone_number_id) {
            return null;
        }

        $phone = $this->metaGraphService->getPhoneNumberDetails($connection->phone_number_id, $connection->access_token);
        $waba = [];
        if (!empty($connection->waba_id)) {
            try {
                $waba = $this->metaGraphService->getWabaDetails($connection->waba_id, $connection->access_token);
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('WABA health sync failed', [
                    'connection_id' => $connection->id,
                    'waba_id' => $connection->waba_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $payload = [
            'quality_rating' => $this->normalizeString($phone['quality_rating'] ?? null),
            'messaging_limit_tier' => $this->normalizeString($phone['messaging_limit_tier'] ?? null),
            'code_verification_status' => $this->normalizeString($phone['code_verification_status'] ?? null),
            'display_name_status' => $this->normalizeString($phone['name_status'] ?? $phone['new_name_status'] ?? null),
            'account_review_status' => $this->normalizeString($waba['account_review_status'] ?? null),
            'business_verification_status' => $this->normalizeString($waba['business_verification_status'] ?? null),
        ];

        $snapshot = $this->persistSnapshot($connection, $payload, $source, [
            'sync_mode' => 'api',
            'phone_number_id' => $connection->phone_number_id,
            'waba_id' => $connection->waba_id,
            'raw_payload' => [
                'phone' => $this->sanitizeRawPayload($phone),
                'waba' => $this->sanitizeRawPayload($waba),
            ],
        ]);

        $this->connectionLifecycleService->markMetadataSync($connection, 'fresh', null, [
            'source' => $source,
            'snapshot_id' => $snapshot->id,
        ]);

        return $snapshot;
    }

    public function syncFromWebhook(WhatsAppConnection $connection, string $field, array $value): ?WhatsAppConnectionHealthSnapshot
    {
        if (!Schema::hasTable('whatsapp_connection_health_snapshots')) {
            return null;
        }

        $field = strtolower(trim($field));

        $quality = $this->normalizeString(
            $value['quality_rating'] ?? $value['current_quality_rating'] ?? $value['new_quality_rating'] ?? null
        );
        $codeVerification = $this->normalizeString(
            $value['code_verification_status'] ?? $value['verification_status'] ?? null
        );
        $displayNameStatus = $this->normalizeString(
            $value['name_status'] ?? $value['new_name_status'] ?? $value['display_name_status'] ?? null
        );
        $businessVerification = $this->normalizeString(
            $value['business_verification_status'] ?? null
        );
        $accountReview = $this->normalizeString(
            $value['account_review_status'] ?? $value['status'] ?? null
        );

        $payload = [
            'quality_rating' => $quality ?? $connection->quality_rating,
            'messaging_limit_tier' => $this->normalizeString($value['messaging_limit_tier'] ?? null) ?? $connection->messaging_limit_tier,
            'code_verification_status' => $codeVerification ?? $connection->code_verification_status,
            'display_name_status' => $displayNameStatus ?? $connection->display_name_status,
            'account_review_status' => $accountReview ?? $connection->account_review_status,
            'business_verification_status' => $businessVerification ?? $connection->business_verification_status,
        ];

        $snapshot = $this->persistSnapshot($connection, $payload, 'webhook', [
            'sync_mode' => 'webhook',
            'field' => $field,
            'event' => $value['event'] ?? null,
            'value_keys' => array_keys($value),
            'raw_payload' => $this->sanitizeRawPayload($value),
        ]);

        $this->connectionLifecycleService->markMetadataSync($connection, 'fresh', null, [
            'source' => 'webhook',
            'field' => $field,
            'snapshot_id' => $snapshot->id,
        ]);

        return $snapshot;
    }

    protected function persistSnapshot(
        WhatsAppConnection $connection,
        array $state,
        string $source,
        array $notes = []
    ): WhatsAppConnectionHealthSnapshot {
        [$healthState, $restrictionState, $warningState, $recommendations] = $this->evaluateHealthState($state);

        $snapshot = WhatsAppConnectionHealthSnapshot::create([
            'account_id' => $connection->account_id,
            'whatsapp_connection_id' => $connection->id,
            'source' => $source,
            'quality_rating' => $state['quality_rating'] ?? null,
            'messaging_limit_tier' => $state['messaging_limit_tier'] ?? null,
            'account_review_status' => $state['account_review_status'] ?? null,
            'business_verification_status' => $state['business_verification_status'] ?? null,
            'code_verification_status' => $state['code_verification_status'] ?? null,
            'display_name_status' => $state['display_name_status'] ?? null,
            'restriction_state' => $restrictionState,
            'warning_state' => $warningState,
            'health_state' => $healthState,
            'health_notes' => array_merge($notes, ['recommendations' => $recommendations]),
            'captured_at' => now(),
        ]);

        $connection->update([
            'quality_rating' => $snapshot->quality_rating,
            'messaging_limit_tier' => $snapshot->messaging_limit_tier,
            'account_review_status' => $snapshot->account_review_status,
            'business_verification_status' => $snapshot->business_verification_status,
            'code_verification_status' => $snapshot->code_verification_status,
            'display_name_status' => $snapshot->display_name_status,
            'restriction_state' => $snapshot->restriction_state,
            'warning_state' => $snapshot->warning_state,
            'health_state' => $snapshot->health_state,
            'health_last_synced_at' => $snapshot->captured_at,
        ]);

        return $snapshot;
    }

    /**
     * @return array{0:string,1:?string,2:?string,3:array<int,string>}
     */
    protected function evaluateHealthState(array $state): array
    {
        $quality = strtoupper((string) ($state['quality_rating'] ?? ''));
        $accountReview = strtoupper((string) ($state['account_review_status'] ?? ''));
        $businessVerification = strtoupper((string) ($state['business_verification_status'] ?? ''));

        $restrictionState = null;
        $warningState = null;
        $recommendations = [];

        if ($accountReview !== '' && in_array($accountReview, ['DISABLED', 'RESTRICTED', 'REJECTED', 'BLOCKED'], true)) {
            $restrictionState = strtolower($accountReview);
            $recommendations[] = 'Connection is restricted. Review Meta Business Account status immediately.';
        }

        if ($quality !== '' && in_array($quality, ['LOW', 'RED'], true)) {
            $warningState = 'low_quality';
            $recommendations[] = 'Reduce outbound volume and improve message quality/opt-ins.';
        }

        if ($businessVerification !== '' && !in_array($businessVerification, ['VERIFIED', 'APPROVED'], true)) {
            $warningState = $warningState ?? 'verification_pending';
            $recommendations[] = 'Complete Meta business verification to reduce delivery risk.';
        }

        if ($restrictionState !== null) {
            return ['restricted', $restrictionState, $warningState, $recommendations];
        }

        if ($warningState !== null) {
            return ['warning', null, $warningState, $recommendations];
        }

        if (
            $quality !== '' ||
            !empty($state['messaging_limit_tier']) ||
            !empty($state['account_review_status']) ||
            !empty($state['business_verification_status'])
        ) {
            return ['healthy', null, null, ['Health metadata is synced and currently stable.']];
        }

        return ['unknown', null, null, ['No sufficient metadata received yet.']];
    }

    protected function normalizeString(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $value = trim($value);
        if ($value === '') {
            return null;
        }

        return strtoupper($value);
    }

    protected function sanitizeRawPayload(mixed $payload): mixed
    {
        if (!is_array($payload)) {
            return $payload;
        }

        // Keep payload diagnostics bounded for activity + snapshot storage.
        $json = json_encode($payload);
        if ($json !== false && strlen($json) > 6000) {
            return [
                '_truncated' => true,
                'keys' => array_keys($payload),
            ];
        }

        return $payload;
    }
}
