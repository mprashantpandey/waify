<?php

namespace App\Modules\Developer\Services;

use App\Models\Account;
use App\Models\GoogleSheetsDelivery;
use App\Models\GoogleSheetsIntegration;
use App\Modules\Developer\Jobs\AppendGoogleSheetsDeliveryJob;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class GoogleSheetsIntegrationService
{
    public function __construct(protected GoogleSheetsClient $client)
    {
    }

    public function dispatchEvent(Account $account, string $eventKey, array $payload, ?string $eventId = null, ?string $idempotencyKey = null): int
    {
        $integrations = $this->eligibleIntegrations($account, $eventKey);
        if ($integrations->isEmpty()) {
            return 0;
        }

        $eventId = $eventId ?: (string) Str::uuid();
        $created = 0;

        foreach ($integrations as $integration) {
            $delivery = GoogleSheetsDelivery::firstOrCreate(
                [
                    'google_sheets_integration_id' => $integration->id,
                    'event_id' => $eventId,
                ],
                [
                    'account_id' => $account->id,
                    'event_key' => $eventKey,
                    'idempotency_key' => $idempotencyKey,
                    'payload' => $payload,
                    'status' => 'pending',
                    'attempts' => 0,
                ]
            );

            if ($delivery->wasRecentlyCreated) {
                $created++;
                AppendGoogleSheetsDeliveryJob::dispatch($delivery->id);
            }
        }

        return $created;
    }

    public function deliver(GoogleSheetsDelivery $delivery): void
    {
        $integration = $delivery->integration;
        if (!$integration) {
            return;
        }

        $appendRows = [];
        $hasSuccessfulRows = $integration->deliveries()
            ->whereNotNull('delivered_at')
            ->exists();

        if ($integration->append_headers && !$hasSuccessfulRows) {
            $appendRows[] = $this->headers($integration);
        }
        $appendRows[] = $this->rowForDelivery($integration, $delivery);

        $result = $this->client->appendRows($integration, $appendRows);
        $summary = (string) data_get($result, 'updates.updatedRange', 'Row appended');

        $delivery->update([
            'attempts' => ((int) $delivery->attempts) + 1,
            'status' => 'delivered',
            'response_summary' => mb_substr($summary, 0, 1000),
            'error_message' => null,
            'delivered_at' => now(),
        ]);

        $integration->update([
            'last_delivery_at' => now(),
            'last_delivery_error' => null,
        ]);
    }

    public function parseServiceAccountJson(string $json): array
    {
        $decoded = json_decode($json, true);
        if (!is_array($decoded)) {
            throw new \InvalidArgumentException('Service account JSON is invalid.');
        }

        if (($decoded['type'] ?? null) !== 'service_account') {
            throw new \InvalidArgumentException('Only Google service account credentials are supported.');
        }

        foreach (['client_email', 'private_key'] as $required) {
            if (empty($decoded[$required]) || !is_string($decoded[$required])) {
                throw new \InvalidArgumentException('Service account JSON is missing required credentials.');
            }
        }

        return [
            'project_id' => (string) ($decoded['project_id'] ?? ''),
            'service_account_email' => (string) $decoded['client_email'],
            'service_account_private_key' => (string) $decoded['private_key'],
            'service_account_client_id' => (string) ($decoded['client_id'] ?? ''),
        ];
    }

    protected function headers(GoogleSheetsIntegration $integration): array
    {
        $headers = [
            'Timestamp',
            'Event',
            'Contact Name',
            'Phone',
            'WA ID',
            'Conversation ID',
            'Connection ID',
            'Status',
            'Message Preview',
        ];

        if ($integration->include_payload_json) {
            $headers[] = 'Payload JSON';
        }

        return $headers;
    }

    protected function rowForDelivery(GoogleSheetsIntegration $integration, GoogleSheetsDelivery $delivery): array
    {
        $payload = is_array($delivery->payload) ? $delivery->payload : [];

        $row = [
            now()->toIso8601String(),
            $delivery->event_key,
            (string) ($payload['name'] ?? $payload['contact_name'] ?? ''),
            (string) ($payload['phone'] ?? ''),
            (string) ($payload['wa_id'] ?? ''),
            (string) ($payload['conversation_id'] ?? ''),
            (string) ($payload['connection_id'] ?? ''),
            (string) ($payload['status'] ?? ''),
            (string) ($payload['last_message_preview'] ?? $payload['body_text'] ?? $payload['message'] ?? ''),
        ];

        if ($integration->include_payload_json) {
            $row[] = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }

        return $row;
    }

    /** @return Collection<int, GoogleSheetsIntegration> */
    protected function eligibleIntegrations(Account $account, string $eventKey): Collection
    {
        return GoogleSheetsIntegration::query()
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->get()
            ->filter(fn (GoogleSheetsIntegration $integration) => in_array($eventKey, (array) $integration->event_keys, true))
            ->values();
    }
}
