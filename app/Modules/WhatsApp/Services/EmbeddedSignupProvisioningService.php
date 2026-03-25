<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Support\Facades\DB;

class EmbeddedSignupProvisioningService
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_SKIPPED = 'skipped';
    public const STATUS_FAILED = 'failed';

    public function start(WhatsAppConnection $connection, string $step, array $context = []): WhatsAppConnection
    {
        return $this->record($connection, $step, self::STATUS_IN_PROGRESS, null, $context);
    }

    public function complete(WhatsAppConnection $connection, string $step, array $context = []): WhatsAppConnection
    {
        return $this->record($connection, $step, self::STATUS_COMPLETED, null, $context);
    }

    public function skip(WhatsAppConnection $connection, string $step, ?string $reason = null, array $context = []): WhatsAppConnection
    {
        if ($reason) {
            $context['reason'] = $reason;
        }

        return $this->record($connection, $step, self::STATUS_SKIPPED, null, $context);
    }

    public function fail(WhatsAppConnection $connection, string $step, string $error, array $context = []): WhatsAppConnection
    {
        return $this->record($connection, $step, self::STATUS_FAILED, $error, $context);
    }

    public function stepLabel(string $step): string
    {
        return match ($step) {
            'oauth_complete' => 'OAuth complete',
            'assets_resolved' => 'Asset lookup',
            'system_user_assignment' => 'System user access',
            'credit_line_attachment' => 'Credit line attach',
            'app_subscription' => 'Webhook subscription',
            'phone_registration' => 'Phone registration',
            'metadata_sync' => 'Metadata sync',
            'connection_ready' => 'Connection ready',
            default => ucwords(str_replace('_', ' ', $step)),
        };
    }

    protected function record(
        WhatsAppConnection $connection,
        string $step,
        string $status,
        ?string $error = null,
        array $context = []
    ): WhatsAppConnection {
        $contextPayload = (array) ($connection->provisioning_context ?? []);
        $steps = (array) ($contextPayload['steps'] ?? []);
        $now = now()->toIso8601String();

        $steps[$step] = [
            'label' => $this->stepLabel($step),
            'status' => $status,
            'error' => $error ? mb_substr($error, 0, 1000) : null,
            'context' => $context,
            'updated_at' => $now,
            'completed_at' => in_array($status, [self::STATUS_COMPLETED, self::STATUS_SKIPPED], true) ? $now : null,
        ];

        $contextPayload['steps'] = $steps;

        $update = [
            'provisioning_step' => $step,
            'provisioning_status' => $status,
            'provisioning_last_error' => $error ? mb_substr($error, 0, 1000) : null,
            'provisioning_context' => $contextPayload,
        ];

        if ($step === 'connection_ready' && $status === self::STATUS_COMPLETED) {
            $update['provisioning_completed_at'] = now();
        }

        $connection->forceFill($update)->save();
        $connection->refresh();

        DB::table('activity_logs')->insert([
            'type' => 'system_event',
            'description' => sprintf('Embedded signup %s: %s', strtoupper($status), $this->stepLabel($step)),
            'user_id' => null,
            'account_id' => $connection->account_id,
            'metadata' => json_encode([
                'module' => 'whatsapp.embedded_signup',
                'event' => 'provisioning_step',
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'step' => $step,
                'label' => $this->stepLabel($step),
                'status' => $status,
                'error' => $error ? mb_substr($error, 0, 500) : null,
                'context' => $context,
            ]),
            'ip_address' => null,
            'user_agent' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $connection;
    }
}
