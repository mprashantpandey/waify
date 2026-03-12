<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Exceptions\SendPolicyViolationException;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use Illuminate\Support\Carbon;

class SendPolicyService
{
    public function __construct(
        protected CustomerCareWindowService $customerCareWindowService
    ) {
    }

    /**
     * @return array{
     *   allowed: bool,
     *   reason_code: ?string,
     *   reason_message: ?string,
     *   window: array
     * }
     */
    public function evaluateConversationFreeForm(WhatsAppConversation $conversation, ?Carbon $now = null): array
    {
        $window = $this->customerCareWindowService->forConversation($conversation, $now);
        if (($window['is_open'] ?? false) === true) {
            return [
                'allowed' => true,
                'reason_code' => null,
                'reason_message' => null,
                'window' => $window,
            ];
        }

        return [
            'allowed' => false,
            'reason_code' => 'outside_24h',
            'reason_message' => '24-hour customer care window is closed. Send an approved template message to reopen the conversation.',
            'window' => $window,
        ];
    }

    public function assertConversationFreeFormAllowed(WhatsAppConversation $conversation, ?Carbon $now = null): void
    {
        $evaluation = $this->evaluateConversationFreeForm($conversation, $now);
        if (($evaluation['allowed'] ?? false) === true) {
            return;
        }

        throw new SendPolicyViolationException(
            (string) ($evaluation['reason_code'] ?? 'policy_blocked'),
            (string) ($evaluation['reason_message'] ?? 'Message cannot be sent due to policy restrictions.'),
            422
        );
    }

    /**
     * @return array{
     *   allowed: bool,
     *   reason_code: ?string,
     *   reason_message: ?string,
     *   conversation_id: ?int,
     *   window: array
     * }
     */
    public function evaluateRecipientFreeForm(
        int $accountId,
        int $connectionId,
        string $waId,
        ?Carbon $now = null
    ): array {
        $conversation = WhatsAppConversation::query()
            ->where('account_id', $accountId)
            ->where('whatsapp_connection_id', $connectionId)
            ->whereHas('contact', function ($query) use ($waId) {
                $query->where('wa_id', $waId);
            })
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->first();

        if (!$conversation) {
            return [
                'allowed' => false,
                'reason_code' => 'template_required',
                'reason_message' => 'No active customer-care window found for this recipient. Use an approved template message.',
                'conversation_id' => null,
                'window' => [
                    'is_open' => false,
                    'last_inbound_at' => null,
                    'expires_at' => null,
                    'seconds_remaining' => 0,
                ],
            ];
        }

        $evaluation = $this->evaluateConversationFreeForm($conversation, $now);

        return [
            'allowed' => (bool) ($evaluation['allowed'] ?? false),
            'reason_code' => $evaluation['allowed'] ? null : 'template_required',
            'reason_message' => $evaluation['allowed']
                ? null
                : '24-hour customer care window is closed for this recipient. Use an approved template message.',
            'conversation_id' => $conversation->id,
            'window' => $evaluation['window'] ?? [],
        ];
    }

    public function isProvider24HourPolicyError(\Throwable $e): bool
    {
        $message = strtolower($e->getMessage());
        $code = (int) $e->getCode();

        return $code === 131047
            || str_contains($message, '131047')
            || str_contains($message, '24 hour')
            || str_contains($message, 'outside')
            || str_contains($message, 'template')
            || str_contains($message, 'session');
    }
}

