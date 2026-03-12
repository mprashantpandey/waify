<?php

namespace App\Core\Billing;

use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use App\Modules\WhatsApp\Models\WhatsAppUsageEvent;
use Illuminate\Support\Facades\Log;

class UsageLedgerService
{
    /**
     * Persist a versioned usage ledger event from a billing record.
     */
    public function recordFromMessageBilling(
        WhatsAppMessageBilling $billing,
        ?WhatsAppMessage $message = null,
        array $sourcePayload = []
    ): WhatsAppUsageEvent {
        $message ??= $billing->message;
        $conversationId = $message?->whatsapp_conversation_id;

        $event = WhatsAppUsageEvent::updateOrCreate(
            [
                'account_id' => $billing->account_id,
                'meta_message_id' => $billing->meta_message_id,
            ],
            [
                'whatsapp_connection_id' => $message?->conversation?->whatsapp_connection_id,
                'whatsapp_message_id' => $billing->whatsapp_message_id,
                'whatsapp_conversation_id' => $conversationId,
                'whatsapp_message_billing_id' => $billing->id,
                'meta_pricing_version_id' => $billing->meta_pricing_version_id,
                'pricing_category' => $billing->category,
                'pricing_region_code' => $billing->pricing_country_code,
                'currency' => $billing->pricing_currency,
                'billable_unit' => 1,
                'billable' => (bool) $billing->billable,
                'estimated_cost_minor' => (int) $billing->estimated_cost_minor,
                'final_cost_minor' => null,
                'source_event' => 'webhook.status',
                'source_payload' => $sourcePayload,
                'occurred_at' => $billing->counted_at ?? now(),
            ]
        );

        Log::channel('whatsapp')->info('Usage ledger event recorded', [
            'usage_event_id' => $event->id,
            'account_id' => $event->account_id,
            'meta_message_id' => $event->meta_message_id,
            'billing_id' => $billing->id,
            'category' => $event->pricing_category,
            'billable' => $event->billable,
            'estimated_cost_minor' => $event->estimated_cost_minor,
        ]);

        return $event;
    }
}

