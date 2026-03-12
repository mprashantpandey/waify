<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Support\Facades\DB;

class ConnectionLifecycleService
{
    /**
     * @var array<string, list<string>>
     */
    protected array $allowedTransitions = [
        'pending_oauth' => ['provisioning', 'failed'],
        'provisioning' => ['active', 'degraded', 'failed'],
        'active' => ['provisioning', 'degraded', 'failed'],
        'degraded' => ['provisioning', 'active', 'failed'],
        'failed' => ['provisioning', 'active'],
    ];

    public function transition(
        WhatsAppConnection $connection,
        string $targetState,
        ?string $error = null,
        array $context = []
    ): WhatsAppConnection {
        $targetState = strtolower(trim($targetState));
        $currentState = strtolower((string) ($connection->activation_state ?: 'active'));

        $allowed = $this->allowedTransitions[$currentState] ?? [];
        $forceTransition = empty($allowed) || in_array($targetState, $allowed, true);

        if (!$forceTransition) {
            // Keep state unchanged but persist the context for diagnostics.
            $this->logTransition($connection, $currentState, $currentState, 'invalid_transition', array_merge($context, [
                'requested_target_state' => $targetState,
            ]));

            return $connection;
        }

        $isActive = $targetState !== 'failed';
        $connection->update([
            'activation_state' => $targetState,
            'activation_last_error' => $error ? mb_substr($error, 0, 1000) : null,
            'activation_updated_at' => now(),
            'is_active' => $isActive,
        ]);

        $this->logTransition($connection, $currentState, $targetState, $error ? 'error' : 'ok', $context);

        return $connection->fresh();
    }

    public function markMetadataSync(
        WhatsAppConnection $connection,
        string $status,
        ?string $error = null,
        array $context = []
    ): WhatsAppConnection {
        $status = strtolower(trim($status));
        if (!in_array($status, ['pending', 'fresh', 'stale', 'error'], true)) {
            $status = 'pending';
        }

        $connection->update([
            'metadata_sync_status' => $status,
            'metadata_last_sync_error' => $error ? mb_substr($error, 0, 1000) : null,
        ]);

        $this->logMetadataSync($connection, $status, $error, $context);

        return $connection->fresh();
    }

    protected function logTransition(
        WhatsAppConnection $connection,
        string $from,
        string $to,
        string $result,
        array $context = []
    ): void {
        DB::table('activity_logs')->insert([
            'type' => 'system_event',
            'description' => sprintf('WhatsApp connection activation %s → %s (%s)', strtoupper($from), strtoupper($to), $result),
            'user_id' => null,
            'account_id' => $connection->account_id,
            'metadata' => json_encode([
                'module' => 'whatsapp.connection',
                'event' => 'activation_transition',
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'from' => $from,
                'to' => $to,
                'result' => $result,
                'context' => $context,
            ]),
            'ip_address' => null,
            'user_agent' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function logMetadataSync(
        WhatsAppConnection $connection,
        string $status,
        ?string $error = null,
        array $context = []
    ): void {
        DB::table('activity_logs')->insert([
            'type' => 'system_event',
            'description' => sprintf('WhatsApp connection metadata sync status: %s', strtoupper($status)),
            'user_id' => null,
            'account_id' => $connection->account_id,
            'metadata' => json_encode([
                'module' => 'whatsapp.connection',
                'event' => 'metadata_sync_status',
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'status' => $status,
                'error' => $error ? mb_substr($error, 0, 500) : null,
                'context' => $context,
            ]),
            'ip_address' => null,
            'user_agent' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}

