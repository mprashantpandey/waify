<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Support\Carbon;

class CustomerCareWindowService
{
    public const WINDOW_HOURS = 24;

    /**
     * @return array{
     *   is_open: bool,
     *   last_inbound_at: ?Carbon,
     *   expires_at: ?Carbon,
     *   seconds_remaining: int
     * }
     */
    public function forConversation(WhatsAppConversation $conversation, ?Carbon $now = null): array
    {
        $now = $now ?: now();
        $lastInboundAt = $this->resolveLastInboundAt($conversation);

        if (! $lastInboundAt) {
            return [
                'is_open' => false,
                'last_inbound_at' => null,
                'expires_at' => null,
                'seconds_remaining' => 0,
            ];
        }

        $expiresAt = $lastInboundAt->copy()->addHours(self::WINDOW_HOURS);
        $secondsRemaining = max(0, $now->diffInSeconds($expiresAt, false));

        return [
            'is_open' => $now->lte($expiresAt),
            'last_inbound_at' => $lastInboundAt,
            'expires_at' => $expiresAt,
            'seconds_remaining' => $secondsRemaining,
        ];
    }

    private function resolveLastInboundAt(WhatsAppConversation $conversation): ?Carbon
    {
        if ($conversation->last_inbound_at) {
            return Carbon::parse($conversation->last_inbound_at);
        }

        $message = WhatsAppMessage::query()
            ->where('whatsapp_conversation_id', $conversation->id)
            ->where('direction', 'inbound')
            ->orderByRaw('COALESCE(received_at, created_at) DESC')
            ->orderByDesc('id')
            ->first(['received_at', 'created_at']);

        if (! $message) {
            return null;
        }

        $lastInbound = $message->received_at ?? $message->created_at;

        return $lastInbound ? Carbon::parse($lastInbound) : null;
    }
}
