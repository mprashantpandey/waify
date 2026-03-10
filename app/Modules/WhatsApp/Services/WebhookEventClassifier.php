<?php

namespace App\Modules\WhatsApp\Services;

class WebhookEventClassifier
{
    public function classify(array $payload): array
    {
        $entry = $payload['entry'][0] ?? [];
        $change = $entry['changes'][0] ?? [];
        $value = $change['value'] ?? [];

        $field = (string) ($change['field'] ?? 'unknown');
        $objectType = (string) ($payload['object'] ?? 'whatsapp_business_account');
        $messages = is_array($value['messages'] ?? null) ? $value['messages'] : [];
        $statuses = is_array($value['statuses'] ?? null) ? $value['statuses'] : [];

        $eventType = $field;
        if (!empty($messages)) {
            $messageType = strtolower((string) ($messages[0]['type'] ?? 'message'));
            $eventType = "messages.{$messageType}";
        } elseif (!empty($statuses)) {
            $statusType = strtolower((string) ($statuses[0]['status'] ?? 'status'));
            $eventType = "statuses.{$statusType}";
        }

        return [
            'event_type' => $eventType,
            'object_type' => $objectType,
        ];
    }
}

