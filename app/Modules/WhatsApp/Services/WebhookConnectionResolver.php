<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;

class WebhookConnectionResolver
{
    /**
     * @return array{connection:?WhatsAppConnection,phone_number_id:?string,waba_id:?string}
     */
    public function resolve(array $payload): array
    {
        $phoneNumberId = null;
        $wabaId = null;

        foreach (($payload['entry'] ?? []) as $entry) {
            $entryWabaId = $this->normalize($entry['id'] ?? null);
            if ($entryWabaId !== null && $wabaId === null) {
                $wabaId = $entryWabaId;
            }

            foreach (($entry['changes'] ?? []) as $change) {
                $value = is_array($change['value'] ?? null) ? $change['value'] : [];

                $candidatePhoneNumberId = $this->normalize($value['metadata']['phone_number_id'] ?? null);
                if ($candidatePhoneNumberId !== null) {
                    $phoneNumberId = $candidatePhoneNumberId;
                }

                $candidateWabaId = $this->normalize($value['metadata']['waba_id'] ?? null)
                    ?? $this->normalize($value['whatsapp_business_account_id'] ?? null)
                    ?? $entryWabaId;

                if ($candidateWabaId !== null) {
                    $wabaId = $candidateWabaId;
                }

                if ($phoneNumberId !== null) {
                    break 2;
                }
            }
        }

        $connection = null;

        if ($phoneNumberId !== null) {
            $connection = WhatsAppConnection::query()
                ->where('phone_number_id', $phoneNumberId)
                ->latest('updated_at')
                ->first();
        }

        if (!$connection && $wabaId !== null) {
            $connection = WhatsAppConnection::query()
                ->where('waba_id', $wabaId)
                ->latest('updated_at')
                ->first();
        }

        return [
            'connection' => $connection,
            'phone_number_id' => $phoneNumberId,
            'waba_id' => $wabaId,
        ];
    }

    protected function normalize(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }
}
