<?php

namespace App\Modules\WhatsApp\Services;

use App\Models\Account;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppEmbeddedSignupEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmbeddedSignupEventService
{
    public function record(Account $account, ?int $userId, array $payload, Request $request): WhatsAppEmbeddedSignupEvent
    {
        $context = (array) ($payload['context'] ?? []);
        $wabaId = $this->stringOrNull($context['waba_id'] ?? $context['business_account_id'] ?? null);
        $phoneNumberId = $this->stringOrNull($context['phone_number_id'] ?? null);

        $connection = WhatsAppConnection::query()
            ->where('account_id', $account->id)
            ->when($phoneNumberId, fn ($query) => $query->where('phone_number_id', $phoneNumberId))
            ->when(!$phoneNumberId && $wabaId, fn ($query) => $query->where('waba_id', $wabaId))
            ->latest('updated_at')
            ->first();

        $event = WhatsAppEmbeddedSignupEvent::query()->create([
            'account_id' => $account->id,
            'user_id' => $userId,
            'whatsapp_connection_id' => $connection?->id,
            'event' => (string) $payload['step'],
            'status' => (string) $payload['status'],
            'current_step' => $this->stringOrNull($context['current_step'] ?? null),
            'message' => $this->stringOrNull($payload['message'] ?? null),
            'waba_id' => $wabaId,
            'phone_number_id' => $phoneNumberId,
            'payload' => $context,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 65535),
        ]);

        DB::table('activity_logs')->insert([
            'type' => 'system_event',
            'description' => sprintf('Embedded Signup %s: %s', $payload['status'], $payload['step']),
            'user_id' => $userId,
            'account_id' => $account->id,
            'metadata' => json_encode([
                'module' => 'whatsapp.embedded_signup',
                'step' => $payload['step'],
                'status' => $payload['status'],
                'message' => $payload['message'] ?? null,
                'context' => $context,
                'embedded_signup_event_id' => $event->id,
                'connection_id' => $connection?->id,
            ]),
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 65535),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $event;
    }

    protected function stringOrNull(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
