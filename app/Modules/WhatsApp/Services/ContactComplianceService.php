<?php

namespace App\Modules\WhatsApp\Services;

use App\Models\Account;
use App\Models\AccountModule;
use App\Models\PlatformSetting;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppContactPolicyEvent;

class ContactComplianceService
{
    /**
     * @return array<string>
     */
    public function getGlobalOptOutKeywords(): array
    {
        $raw = PlatformSetting::get('integrations.whatsapp_opt_out_keywords', '');
        if (is_array($raw)) {
            return $this->parseKeywords($raw);
        }

        if (is_string($raw) && trim($raw) !== '') {
            return $this->parseKeywords($raw);
        }

        return $this->parseKeywords((array) config('whatsapp.compliance.global_opt_out_keywords', []));
    }

    /**
     * @return array<string>
     */
    public function getTenantOptOutKeywords(Account $account): array
    {
        $module = AccountModule::query()
            ->where('account_id', $account->id)
            ->where('module_key', 'whatsapp')
            ->first();

        $tenantKeywords = data_get($module?->config, 'compliance.opt_out_keywords', []);
        return $this->parseKeywords($tenantKeywords);
    }

    /**
     * @return array<string>
     */
    public function getOptOutKeywords(Account $account): array
    {
        return array_values(array_unique(array_merge(
            $this->getGlobalOptOutKeywords(),
            $this->getTenantOptOutKeywords($account)
        )));
    }

    public function detectOptOutKeyword(Account $account, ?string $messageText): ?string
    {
        $normalizedMessage = $this->normalizeMessage($messageText);
        $canonicalMessage = $this->canonicalize($normalizedMessage);
        if ($canonicalMessage === '') {
            return null;
        }

        foreach ($this->getOptOutKeywords($account) as $keyword) {
            $canonicalKeyword = $this->canonicalize($keyword);
            if ($canonicalKeyword === '') {
                continue;
            }

            if ($canonicalMessage === $canonicalKeyword) {
                return $keyword;
            }

            if (str_starts_with($canonicalMessage, $canonicalKeyword . ' ')) {
                return $keyword;
            }
        }

        return null;
    }

    public function applyOptOut(
        WhatsAppContact $contact,
        string $reason,
        string $source = 'manual',
        ?string $keyword = null,
        ?int $messageId = null,
        ?int $userId = null,
        array $metadata = []
    ): void {
        $now = now();

        $contact->forceFill([
            'status' => 'opt_out',
            'do_not_contact' => true,
            'opted_out_at' => $contact->opted_out_at ?? $now,
            'opt_out_reason' => $reason,
            'opt_out_channel' => $source,
            'last_policy_event_at' => $now,
        ])->save();

        $this->recordPolicyEvent($contact, [
            'whatsapp_message_id' => $messageId,
            'user_id' => $userId,
            'event_type' => 'opt_out',
            'source' => $source,
            'keyword' => $keyword,
            'channel' => 'whatsapp',
            'reason' => $reason,
            'metadata' => $metadata,
        ]);
    }

    public function applyOptIn(
        WhatsAppContact $contact,
        string $source = 'manual',
        ?string $notes = null,
        ?int $messageId = null,
        ?int $userId = null,
        array $metadata = []
    ): void {
        $now = now();

        $contact->forceFill([
            'status' => 'active',
            'do_not_contact' => false,
            'opted_in_at' => $contact->opted_in_at ?? $now,
            'opt_in_source' => $source,
            'opt_in_notes' => $notes,
            'opted_out_at' => null,
            'opt_out_reason' => null,
            'opt_out_channel' => null,
            'last_policy_event_at' => $now,
        ])->save();

        $this->recordPolicyEvent($contact, [
            'whatsapp_message_id' => $messageId,
            'user_id' => $userId,
            'event_type' => 'opt_in',
            'source' => $source,
            'channel' => 'whatsapp',
            'reason' => $notes,
            'metadata' => $metadata,
        ]);
    }

    public function isSuppressed(?WhatsAppContact $contact): bool
    {
        if (!$contact) {
            return false;
        }

        return (bool) ($contact->do_not_contact || in_array((string) ($contact->status ?? ''), ['opt_out', 'blocked'], true));
    }

    /**
     * @param  array<string,mixed>|string  $keywords
     * @return array<string>
     */
    protected function parseKeywords(array|string $keywords): array
    {
        if (is_string($keywords)) {
            $keywords = preg_split('/[\n,]+/', $keywords) ?: [];
        }

        return array_values(array_filter(array_unique(array_map(
            fn ($keyword) => $this->normalizeKeyword((string) $keyword),
            $keywords
        ))));
    }

    protected function normalizeKeyword(string $keyword): string
    {
        return preg_replace('/\s+/', ' ', strtoupper(trim($keyword))) ?? '';
    }

    protected function normalizeMessage(?string $messageText): string
    {
        if ($messageText === null) {
            return '';
        }

        $normalized = preg_replace('/\s+/', ' ', strtoupper(trim($messageText))) ?? '';
        return trim($normalized);
    }

    protected function canonicalize(string $value): string
    {
        $value = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', strtoupper(trim($value))) ?? '';
        $value = preg_replace('/\s+/', ' ', $value) ?? $value;

        return trim($value);
    }

    /**
     * @param array<string,mixed> $payload
     */
    protected function recordPolicyEvent(WhatsAppContact $contact, array $payload): void
    {
        WhatsAppContactPolicyEvent::create([
            'account_id' => $contact->account_id,
            'whatsapp_contact_id' => $contact->id,
            'whatsapp_message_id' => $payload['whatsapp_message_id'] ?? null,
            'user_id' => $payload['user_id'] ?? null,
            'event_type' => (string) ($payload['event_type'] ?? 'unknown'),
            'source' => $payload['source'] ?? null,
            'keyword' => $payload['keyword'] ?? null,
            'channel' => $payload['channel'] ?? null,
            'reason' => $payload['reason'] ?? null,
            'metadata' => $payload['metadata'] ?? null,
        ]);
    }
}
