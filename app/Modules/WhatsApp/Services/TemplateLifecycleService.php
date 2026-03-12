<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Carbon\CarbonInterface;

class TemplateLifecycleService
{
    private const LANGUAGE_PATTERN = '/^[a-z]{2}(?:_[A-Z]{2})?$/';

    public function normalizeStatus(?string $status): string
    {
        $normalized = strtolower(trim((string) $status));
        if ($normalized === '') {
            return 'unknown';
        }

        return match ($normalized) {
            'approved', 'active', 'pending', 'rejected', 'paused', 'disabled', 'in_appeal' => $normalized,
            'pending_review' => 'pending',
            'rejected_by_policy', 'failed' => 'rejected',
            'archived' => 'disabled',
            default => 'unknown',
        };
    }

    public function isSendableStatus(string $status): bool
    {
        return in_array($this->normalizeStatus($status), ['approved', 'active'], true);
    }

    public function isTemplateStale(
        ?CarbonInterface $lastMetaSyncAt,
        ?string $status = null,
        ?bool $isRemoteDeleted = null
    ): bool {
        if ((bool) $isRemoteDeleted) {
            return true;
        }

        $normalizedStatus = $this->normalizeStatus($status);
        if (in_array($normalizedStatus, ['disabled', 'rejected', 'paused', 'in_appeal'], true)) {
            return false;
        }

        if (!$lastMetaSyncAt) {
            return true;
        }

        $staleAfterHours = max(1, (int) config('whatsapp.templates.stale_after_hours', 24));
        return $lastMetaSyncAt->lt(now()->subHours($staleAfterHours));
    }

    public function computeSyncState(
        string $status,
        ?CarbonInterface $lastMetaSyncAt,
        bool $isRemoteDeleted,
        ?string $lastMetaError
    ): string {
        if ($isRemoteDeleted) {
            return 'missing_remote';
        }

        if (!empty($lastMetaError) && $this->normalizeStatus($status) === 'unknown') {
            return 'sync_error';
        }

        if ($this->isTemplateStale($lastMetaSyncAt, $status, false)) {
            return 'stale';
        }

        $normalized = $this->normalizeStatus($status);
        if ($normalized === 'pending') {
            return 'pending_review';
        }

        return 'synced';
    }

    /**
     * @return array{ok:bool,reason:?string,code:?string}
     */
    public function evaluateSendability(WhatsAppTemplate $template): array
    {
        if ((bool) $template->is_archived) {
            return ['ok' => false, 'reason' => 'Template is archived.', 'code' => 'archived'];
        }

        if ((bool) ($template->is_remote_deleted ?? false)) {
            return ['ok' => false, 'reason' => 'Template no longer exists on Meta. Run template sync.', 'code' => 'missing_remote'];
        }

        $status = $this->normalizeStatus((string) $template->status);
        if (!$this->isSendableStatus($status)) {
            return [
                'ok' => false,
                'reason' => "Template is not sendable (status: {$status}).",
                'code' => 'status_not_sendable',
            ];
        }

        $stale = $this->isTemplateStale(
            $template->last_meta_sync_at ?? $template->last_synced_at,
            $status,
            (bool) ($template->is_remote_deleted ?? false)
        );
        if ($stale) {
            return [
                'ok' => false,
                'reason' => 'Template status is stale. Sync templates before sending.',
                'code' => 'stale',
            ];
        }

        if (empty($template->meta_template_id)) {
            return ['ok' => false, 'reason' => 'Template is missing Meta template ID. Sync templates first.', 'code' => 'missing_meta_id'];
        }

        return ['ok' => true, 'reason' => null, 'code' => null];
    }

    /**
     * @param array<int,string> $variables
     * @return array{ok:bool,reason:?string,code:?string}
     */
    public function evaluateSendPayload(
        WhatsAppTemplate $template,
        array $variables = [],
        ?string $headerMediaUrl = null
    ): array {
        if (!preg_match(self::LANGUAGE_PATTERN, (string) $template->language)) {
            return [
                'ok' => false,
                'reason' => 'Template language format is invalid. Re-sync or update template language.',
                'code' => 'invalid_language',
            ];
        }

        $headerType = strtoupper((string) ($template->header_type ?? 'NONE'));
        if (in_array($headerType, ['IMAGE', 'VIDEO', 'DOCUMENT'], true)) {
            $mediaUrl = trim((string) ($headerMediaUrl ?: $template->header_media_url));
            if ($mediaUrl === '') {
                return [
                    'ok' => false,
                    'reason' => "Template '{$template->name}' requires header media URL before sending.",
                    'code' => 'missing_header_media',
                ];
            }

            if ($this->isTemporaryMetaHostedUrl($mediaUrl)) {
                return [
                    'ok' => false,
                    'reason' => "Template '{$template->name}' uses temporary Meta-hosted media URL. Re-upload header media in template edit.",
                    'code' => 'temporary_header_media',
                ];
            }
        }

        $requiredCount = $this->requiredVariableCount($template);
        $provided = array_values(array_map(static fn ($v) => trim((string) $v), $variables));
        $nonEmptyCount = count(array_filter($provided, static fn (string $value) => $value !== ''));
        if ($nonEmptyCount < $requiredCount) {
            return [
                'ok' => false,
                'reason' => "Template requires {$requiredCount} variables, but only {$nonEmptyCount} non-empty value(s) were provided.",
                'code' => 'missing_variables',
            ];
        }

        return ['ok' => true, 'reason' => null, 'code' => null];
    }

    private function requiredVariableCount(WhatsAppTemplate $template): int
    {
        $max = 0;

        $extractMaxIndex = static function (?string $text) use (&$max): void {
            if (!$text) {
                return;
            }

            if (preg_match_all('/\{\{(\d+)\}\}/', $text, $matches)) {
                foreach ($matches[1] as $value) {
                    $max = max($max, (int) $value);
                }
            }
        };

        $extractMaxIndex((string) ($template->header_text ?? null));
        $extractMaxIndex((string) ($template->body_text ?? null));

        $buttons = is_array($template->buttons) ? $template->buttons : [];
        foreach ($buttons as $button) {
            if (!is_array($button)) {
                continue;
            }

            if (strtoupper((string) ($button['type'] ?? '')) !== 'URL') {
                continue;
            }

            $extractMaxIndex((string) ($button['url'] ?? null));
        }

        return $max;
    }

    private function isTemporaryMetaHostedUrl(string $url): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        if ($host === '') {
            return false;
        }

        return str_contains($host, 'facebook.com')
            || str_contains($host, 'fbcdn.net')
            || str_contains($host, 'fbsbx.com')
            || str_contains($host, 'lookaside');
    }
}
