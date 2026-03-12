<?php

namespace App\Services;

use App\Models\OperationalAlertEvent;
use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class OperationalAlertService
{
    public function send(string $eventKey, string $title, array $context = [], string $severity = 'warning'): void
    {
        $accountId = $this->extractAccountId($context);
        $correlationId = $this->extractCorrelationId($context);
        $errorFingerprint = substr((string) ($context['error'] ?? ''), 0, 160);
        $scope = (string) ($context['scope'] ?? 'global');
        $dedupeKey = 'ops-alert:' . sha1($eventKey . '|' . $scope . '|' . $errorFingerprint . '|' . ($accountId ?: 'global'));
        $ttlMinutes = max(1, (int) PlatformSetting::get('alerts.dedupe_minutes', 15));
        if (!cache()->add($dedupeKey, now()->timestamp, now()->addMinutes($ttlMinutes))) {
            $this->recordEvent([
                'account_id' => $accountId,
                'event_key' => $eventKey,
                'title' => $title,
                'severity' => $severity,
                'scope' => $scope,
                'dedupe_key' => $dedupeKey,
                'correlation_id' => $correlationId,
                'status' => 'skipped',
                'channels' => ['dedupe' => 'skipped'],
                'context' => $context,
                'sent_at' => now(),
            ]);
            return;
        }

        $payload = [
            'event' => $eventKey,
            'severity' => $severity,
            'title' => $title,
            'timestamp' => now()->toIso8601String(),
            'context' => $context,
        ];

        $channels = [
            'email' => $this->sendEmailAlert($payload),
            ...$this->sendWebhookAlert($payload),
        ];

        $status = collect($channels)->contains(fn ($channelStatus) => str_starts_with((string) $channelStatus, 'sent'))
            ? 'sent'
            : 'failed';

        $this->recordEvent([
            'account_id' => $accountId,
            'event_key' => $eventKey,
            'title' => $title,
            'severity' => $severity,
            'scope' => $scope,
            'dedupe_key' => $dedupeKey,
            'correlation_id' => $correlationId,
            'status' => $status,
            'channels' => $channels,
            'context' => $context,
            'error_message' => $status === 'failed'
                ? collect($channels)->filter(fn ($s) => str_starts_with((string) $s, 'failed'))->implode('; ')
                : null,
            'sent_at' => now(),
        ]);
    }

    protected function sendEmailAlert(array $payload): string
    {
        $to = PlatformSetting::get('alerts.email_to')
            ?: PlatformSetting::get('branding.support_email')
            ?: PlatformSetting::get('general.support_email');
        if (!$to || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
            return 'skipped:not_configured';
        }

        $subject = "[Waify Alert] {$payload['title']}";
        $body = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        try {
            Mail::raw((string) $body, function ($message) use ($to, $subject) {
                $message->to((string) $to)->subject($subject);
            });
            return 'sent';
        } catch (\Throwable $e) {
            Log::warning('Failed to send operational email alert', ['error' => $e->getMessage()]);
            return 'failed:' . $e->getMessage();
        }
    }

    protected function sendWebhookAlert(array $payload): array
    {
        $webhookUrl = PlatformSetting::get('alerts.webhook_url')
            ?: PlatformSetting::get('integrations.webhook_url');
        $slackWebhook = PlatformSetting::get('alerts.slack_webhook_url');
        $result = [
            'webhook' => 'skipped:not_configured',
            'slack' => 'skipped:not_configured',
        ];

        if ($webhookUrl) {
            try {
                $response = Http::retry(2, 250)->timeout(8)->post((string) $webhookUrl, $payload);
                $result['webhook'] = $response->successful()
                    ? 'sent'
                    : 'failed:http_' . $response->status();
            } catch (\Throwable $e) {
                Log::warning('Failed to send operational webhook alert', ['error' => $e->getMessage()]);
                $result['webhook'] = 'failed:' . $e->getMessage();
            }
        }

        if ($slackWebhook) {
            try {
                $response = Http::retry(2, 250)->timeout(8)->post((string) $slackWebhook, [
                    'text' => "{$payload['title']} ({$payload['severity']})\n" . json_encode($payload['context'], JSON_UNESCAPED_SLASHES),
                ]);
                $result['slack'] = $response->successful()
                    ? 'sent'
                    : 'failed:http_' . $response->status();
            } catch (\Throwable $e) {
                Log::warning('Failed to send Slack operational alert', ['error' => $e->getMessage()]);
                $result['slack'] = 'failed:' . $e->getMessage();
            }
        }

        return $result;
    }

    protected function recordEvent(array $attributes): void
    {
        try {
            if (!Schema::hasTable('operational_alert_events')) {
                return;
            }
            OperationalAlertEvent::create($attributes);
        } catch (\Throwable $e) {
            Log::warning('Failed to record operational alert event', ['error' => $e->getMessage()]);
        }
    }

    protected function extractAccountId(array $context): ?int
    {
        $raw = $context['account_id'] ?? $context['tenant_id'] ?? null;
        if ($raw === null || $raw === '') {
            return null;
        }

        $id = (int) $raw;
        return $id > 0 ? $id : null;
    }

    protected function extractCorrelationId(array $context): ?string
    {
        $raw = (string) ($context['correlation_id'] ?? $context['request_id'] ?? request()?->attributes->get('request_id') ?? '');
        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        return mb_substr($raw, 0, 120);
    }
}
