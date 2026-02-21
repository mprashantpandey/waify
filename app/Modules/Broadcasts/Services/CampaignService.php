<?php

namespace App\Modules\Broadcasts\Services;

use App\Core\Billing\PlanResolver;
use App\Core\Billing\UsageService;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Models\CampaignMessage;
use App\Modules\Broadcasts\Models\CampaignRecipient;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Services\TemplateComposer;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CampaignService
{
    public function __construct(
        protected WhatsAppClient $whatsappClient,
        protected TemplateComposer $templateComposer,
        protected PlanResolver $planResolver,
        protected UsageService $usageService
    ) {
    }

    /**
     * Prepare recipients for a campaign.
     * Uses lock to prevent concurrent preparation.
     */
    public function prepareRecipients(Campaign $campaign): int
    {
        // Use lock to prevent concurrent recipient preparation
        $lockKey = "campaign_prepare_recipients:{$campaign->id}";
        $lock = Cache::lock($lockKey, 300); // 5 minute lock

        if (!$lock->get()) {
            throw new \Exception('Recipient preparation is already in progress for this campaign.');
        }

        try {
            return $this->performPrepareRecipients($campaign);
        } finally {
            $lock->release();
        }
    }

    /**
     * Perform the actual recipient preparation.
     */
    protected function performPrepareRecipients(Campaign $campaign): int
    {
        // Delete existing recipients if re-preparing.
        $campaign->recipients()->delete();

        $recipients = [];

        switch ($campaign->recipient_type) {
            case 'contacts':
                $recipients = $this->getRecipientsFromContacts($campaign);
                break;
            case 'custom':
                $recipients = $this->getCustomRecipients($campaign);
                break;
            case 'segment':
                $recipients = $this->getRecipientsFromSegment($campaign);
                break;
        }

        // Filter out opt-out and blocked contacts if respect_opt_out is enabled
        if ($campaign->respect_opt_out) {
            $recipients = array_filter($recipients, function ($recipient) use ($campaign) {
                if (isset($recipient['contact_id'])) {
                    $contact = WhatsAppContact::find($recipient['contact_id']);
                    if ($contact && in_array($contact->status ?? 'active', ['opt_out', 'blocked'])) {
                        return false;
                    }
                }
                return true;
            });
        }

        $sampleSize = max(0, (int) Arr::get($campaign->metadata, 'recipient_sample_size', 0));
        $isDryRun = (bool) Arr::get($campaign->metadata, 'dry_run', false);
        if ($sampleSize > 0 && count($recipients) > $sampleSize) {
            shuffle($recipients);
            $recipients = array_slice($recipients, 0, $sampleSize);
        }

        // Create recipient records in transaction
        DB::transaction(function () use ($campaign, $recipients) {
            foreach ($recipients as $recipient) {
                CampaignRecipient::create([
                    'campaign_id' => $campaign->id,
                    'whatsapp_contact_id' => $recipient['contact_id'] ?? null,
                    'phone_number' => $recipient['phone_number'],
                    'name' => $recipient['name'] ?? null,
                    'template_params' => $recipient['template_params'] ?? null,
                    'status' => 'pending']);
            }

            $campaign->update([
                'total_recipients' => count($recipients),
                'sent_count' => 0,
                'delivered_count' => 0,
                'read_count' => 0,
                'failed_count' => 0,
                'completed_at' => null,
                'metadata' => array_merge($campaign->metadata ?? [], [
                    'effective_recipient_count' => count($recipients),
                    'dry_run' => $isDryRun,
                ]),
            ]);
        });
        
        return count($recipients);
    }

    /**
     * Get recipients from contacts.
     */
    protected function getRecipientsFromContacts(Campaign $campaign): array
    {
        $query = WhatsAppContact::where('account_id', $campaign->account_id);

        // Exclude opt-out and blocked contacts by default
        if ($campaign->respect_opt_out) {
            $query->whereNotIn('status', ['opt_out', 'blocked']);
        }

        // Apply filters if provided
        if ($campaign->recipient_filters) {
            $filters = $campaign->recipient_filters;
            
            if (isset($filters['has_conversation']) && $filters['has_conversation']) {
                $query->whereHas('conversations');
            }
            
            if (isset($filters['last_seen_days'])) {
                $days = (int) $filters['last_seen_days'];
                $query->where('last_seen_at', '>=', now()->subDays($days));
            }

            // Allow status filter override
            if (isset($filters['status'])) {
                $query->where('status', $filters['status']);
            }
        }

        $contacts = $query->get();

        return $contacts->map(function ($contact) {
            return [
                'contact_id' => $contact->id,
                'phone_number' => $contact->wa_id,
                'name' => $contact->name];
        })->toArray();
    }

    /**
     * Get custom recipients.
     */
    protected function getCustomRecipients(Campaign $campaign): array
    {
        if (!$campaign->custom_recipients) {
            return [];
        }
        
        return collect($campaign->custom_recipients)
            ->map(function ($recipient) {
                return [
                    'phone_number' => trim((string) ($recipient['phone'] ?? $recipient)),
                    'name' => $recipient['name'] ?? null,
                    'template_params' => $recipient['params'] ?? null,
                ];
            })
            ->filter(fn ($recipient) => $recipient['phone_number'] !== '')
            ->values()
            ->all();
    }

    /**
     * Get recipients from segment (placeholder for future implementation).
     */
    protected function getRecipientsFromSegment(Campaign $campaign): array
    {
        $filters = $campaign->recipient_filters ?? [];
        $segmentIds = [];

        if (isset($filters['segment_id'])) {
            $segmentIds[] = (int) $filters['segment_id'];
        }
        if (isset($filters['segment_ids']) && is_array($filters['segment_ids'])) {
            $segmentIds = array_merge($segmentIds, array_map('intval', $filters['segment_ids']));
        }
        if (isset($filters['segments']) && is_array($filters['segments'])) {
            $segmentIds = array_merge($segmentIds, array_map('intval', $filters['segments']));
        }

        $segmentIds = array_values(array_unique(array_filter($segmentIds)));

        if (empty($segmentIds)) {
            Log::warning('Campaign segment recipients requested without segment IDs', [
                'campaign_id' => $campaign->id,
                'account_id' => $campaign->account_id,
            ]);
            return [];
        }

        $segments = ContactSegment::where('account_id', $campaign->account_id)
            ->whereIn('id', $segmentIds)
            ->get();

        if ($segments->isEmpty()) {
            Log::warning('No segments found for campaign', [
                'campaign_id' => $campaign->id,
                'segment_ids' => $segmentIds,
            ]);
            return [];
        }

        $contacts = collect();

        foreach ($segments as $segment) {
            $query = $segment->contactsQuery();

            if ($campaign->respect_opt_out) {
                $query->whereNotIn('status', ['opt_out', 'blocked']);
            }

            $segmentContacts = $query->get(['id', 'wa_id', 'name']);
            $contacts = $contacts->merge($segmentContacts);
        }

        return $contacts
            ->unique('id')
            ->map(function ($contact) {
                return [
                    'contact_id' => $contact->id,
                    'phone_number' => $contact->wa_id,
                    'name' => $contact->name,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Start sending a campaign.
     */
    public function startCampaign(Campaign $campaign): void
    {
        if (!$campaign->canStart()) {
            throw new \Exception('Campaign cannot be started in its current state.');
        }

        $preflight = $this->runPreflightChecks($campaign);
        if (!$preflight['ok']) {
            throw new \RuntimeException('Campaign preflight failed: ' . implode(' | ', $preflight['errors']));
        }

        if ((bool) Arr::get($campaign->metadata, 'dry_run', false)) {
            $campaign->recipients()
                ->where('status', 'pending')
                ->update([
                    'status' => 'skipped',
                    'failure_reason' => 'Dry run mode: send skipped.',
                ]);

            $campaign->update([
                'status' => 'completed',
                'started_at' => $campaign->started_at ?? now(),
                'completed_at' => now(),
                'metadata' => array_merge($campaign->metadata ?? [], [
                    'dry_run_completed_at' => now()->toIso8601String(),
                    'dry_run_preflight' => $preflight,
                ]),
            ]);

            return;
        }

        $campaign->update([
            'status' => 'sending',
            'started_at' => $campaign->started_at ?? now(),
            'completed_at' => null,
            'metadata' => array_merge($campaign->metadata ?? [], ['last_preflight' => $preflight]),
        ]);

        // Dispatch job to send campaign messages (on dedicated queue)
        $this->dispatchNextSend($campaign->id);
    }

    /**
     * Send message to a single recipient.
     */
    public function sendToRecipient(Campaign $campaign, CampaignRecipient $recipient): bool
    {
        if (!$campaign->connection) {
            Log::error('Campaign has no connection', ['campaign_id' => $campaign->id]);
            $this->markRecipientFailed($recipient, 'No WhatsApp connection configured');
            return false;
        }

        // Check if contact has opted out or is blocked (if respect_opt_out is enabled)
        if ($campaign->respect_opt_out && $recipient->whatsapp_contact_id) {
            $contact = WhatsAppContact::find($recipient->whatsapp_contact_id);
            if ($contact && in_array($contact->status ?? 'active', ['opt_out', 'blocked'])) {
                $recipient->lockForUpdate()->update([
                    'status' => 'skipped',
                    'failure_reason' => "Contact has {$contact->status} status"]);
                return false;
            }
        }

        try {
            $response = null;

            switch ($campaign->type) {
                case 'template':
                    $response = $this->sendTemplateMessage($campaign, $recipient);
                    break;
                case 'text':
                    $response = $this->sendTextMessage($campaign, $recipient);
                    break;
                case 'media':
                    $response = $this->sendMediaMessage($campaign, $recipient);
                    break;
            }

            if ($response && isset($response['messages'][0]['id'])) {
                $wamid = $response['messages'][0]['id'];
                
                $recipient->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'wamid' => $wamid,
                    'message_id' => $wamid]);

                // Create campaign message record (use updateOrCreate to handle unique constraint)
                CampaignMessage::updateOrCreate(
                    [
                        'campaign_recipient_id' => $recipient->id, // Unique constraint
                    ],
                    [
                        'campaign_id' => $campaign->id,
                        'wamid' => $wamid,
                        'status' => 'sent',
                        'sent_at' => now()]
                );

                // Update campaign stats (with lock to prevent race conditions)
                Campaign::whereKey($campaign->id)->increment('sent_count');
                if ($campaign->account) {
                    $this->usageService->incrementMessageUsage($campaign->account, 1);
                    if ($campaign->type === 'template') {
                        $this->usageService->incrementTemplateUsage($campaign->account, 1);
                    }
                }
                $this->clearConnectionBackoff($campaign);

                return true;
            }

            $this->markRecipientFailed($recipient, 'No message ID in response');
            return false;
        } catch (\Exception $e) {
            Log::error('Failed to send campaign message', [
                'campaign_id' => $campaign->id,
                'recipient_id' => $recipient->id,
                'error' => $e->getMessage()]);

            if ($this->isRateLimitError($e->getMessage())) {
                $this->applyConnectionBackoff($campaign, $e->getMessage());
                $recipient->update([
                    'status' => 'pending',
                    'failure_reason' => 'Rate limited by provider. Retrying with adaptive delay.',
                ]);
                return false;
            }

            $this->markRecipientFailed($recipient, $e->getMessage());
            return false;
        }
    }

    /**
     * Send template message.
     */
    protected function sendTemplateMessage(Campaign $campaign, CampaignRecipient $recipient): array
    {
        if (!$campaign->template) {
            throw new \Exception('Template not found for campaign');
        }

        $template = $campaign->template;
        $components = [];

        // Build template components from params
        $components = [];
        $params = array_merge(
            $campaign->template_params ?? [],
            $recipient->template_params ?? []
        );

        if (!empty($params)) {
            // Extract components from prepared payload
            $payload = $this->templateComposer->preparePayload($template, $recipient->phone_number, $params);
            $components = $payload['template']['components'] ?? [];
        }

        return $this->whatsappClient->sendTemplateMessage(
            $campaign->connection,
            $recipient->phone_number,
            $template->name,
            $template->language,
            $components
        );
    }

    /**
     * Send text message.
     */
    protected function sendTextMessage(Campaign $campaign, CampaignRecipient $recipient): array
    {
        if (!$campaign->message_text) {
            throw new \Exception('Message text not provided');
        }

        return $this->whatsappClient->sendTextMessage(
            $campaign->connection,
            $recipient->phone_number,
            $campaign->message_text
        );
    }

    /**
     * Send media message (placeholder).
     */
    protected function sendMediaMessage(Campaign $campaign, CampaignRecipient $recipient): array
    {
        if (!$campaign->media_url || !$campaign->media_type) {
            throw new \Exception('Media URL or media type not provided');
        }

        $caption = null;
        if (in_array($campaign->media_type, ['image', 'video', 'document'], true)) {
            $caption = $campaign->message_text ?: null;
        }

        $filename = null;
        if ($campaign->media_type === 'document') {
            $path = parse_url($campaign->media_url, PHP_URL_PATH);
            $filename = $path ? basename($path) : null;
        }

        return $this->whatsappClient->sendMediaMessage(
            $campaign->connection,
            $recipient->phone_number,
            $campaign->media_type,
            $campaign->media_url,
            $caption,
            $filename
        );
    }

    /**
     * Mark recipient as failed.
     */
    protected function markRecipientFailed(CampaignRecipient $recipient, string $reason): void
    {
        $recipient->lockForUpdate()->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => $reason]);

        Campaign::whereKey($recipient->campaign_id)->increment('failed_count');
    }

    /**
     * Update message status from webhook.
     * Uses lock to prevent concurrent status updates.
     */
    public function updateMessageStatus(string $wamid, string $status, ?\DateTime $timestamp = null): void
    {
        // Use lock to prevent concurrent status updates
        $lockKey = "campaign_status_update:{$wamid}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 30);

        if (!$lock->get()) {
            // Another process is updating this status
            return;
        }

        try {
            $message = CampaignMessage::where('wamid', $wamid)
                ->lockForUpdate() // Row-level lock
                ->first();

            if (!$message) {
                return;
            }

            $updateData = ['status' => $status];
            $recipientUpdate = ['status' => $status];

            switch ($status) {
                case 'delivered':
                    $updateData['delivered_at'] = $timestamp ?? now();
                    $recipientUpdate['delivered_at'] = $timestamp ?? now();
                    Campaign::whereKey($message->campaign_id)->increment('delivered_count');
                    break;
                case 'read':
                    $updateData['read_at'] = $timestamp ?? now();
                    $recipientUpdate['read_at'] = $timestamp ?? now();
                    Campaign::whereKey($message->campaign_id)->increment('read_count');
                    break;
                case 'failed':
                    $updateData['failed_at'] = $timestamp ?? now();
                    $recipientUpdate['failed_at'] = $timestamp ?? now();
                    Campaign::whereKey($message->campaign_id)->increment('failed_count');
                    break;
            }

            $message->update($updateData);
            $message->recipient->lockForUpdate()->update($recipientUpdate);
        } finally {
            $lock->release();
        }
    }

    /**
     * Check if campaign is complete.
     */
    public function checkCampaignCompletion(Campaign $campaign): void
    {
        $pendingCount = $campaign->recipients()
            ->whereIn('status', ['pending', 'sending'])
            ->count();

        if ($pendingCount === 0 && $campaign->status === 'sending') {
            $campaign->update([
                'status' => 'completed',
                'completed_at' => now()]);
        }
    }

    public function retryFailedRecipients(Campaign $campaign): int
    {
        $failedRecipients = $campaign->recipients()
            ->where('status', 'failed')
            ->get();

        $failedCount = $failedRecipients->count();
        if ($failedCount === 0) {
            return 0;
        }

        DB::transaction(function () use ($campaign, $failedRecipients, $failedCount) {
            foreach ($failedRecipients as $recipient) {
                $recipient->update([
                    'status' => 'pending',
                    'failed_at' => null,
                    'failure_reason' => null,
                    'sent_at' => null,
                    'delivered_at' => null,
                    'read_at' => null,
                    'message_id' => null,
                    'wamid' => null,
                ]);
            }

            $campaign->update([
                'status' => 'sending',
                'completed_at' => null,
                'failed_count' => max(0, (int) $campaign->failed_count - $failedCount),
            ]);
        });

        $this->dispatchNextSend($campaign->id);

        return $failedCount;
    }

    public function duplicateCampaign(Campaign $campaign, int $userId): Campaign
    {
        $copy = Campaign::create([
            'account_id' => $campaign->account_id,
            'whatsapp_connection_id' => $campaign->whatsapp_connection_id,
            'whatsapp_template_id' => $campaign->whatsapp_template_id,
            'created_by' => $userId,
            'name' => $campaign->name . ' (Copy)',
            'description' => $campaign->description,
            'type' => $campaign->type,
            'status' => 'draft',
            'template_params' => $campaign->template_params,
            'message_text' => $campaign->message_text,
            'media_url' => $campaign->media_url,
            'media_type' => $campaign->media_type,
            'scheduled_at' => null,
            'started_at' => null,
            'completed_at' => null,
            'recipient_type' => $campaign->recipient_type,
            'recipient_filters' => $campaign->recipient_filters,
            'custom_recipients' => $campaign->custom_recipients,
            'send_delay_seconds' => $campaign->send_delay_seconds,
            'respect_opt_out' => $campaign->respect_opt_out,
            'metadata' => $campaign->metadata,
        ]);

        $this->prepareRecipients($copy);

        return $copy;
    }

    protected function dispatchNextSend(int $campaignId): void
    {
        \App\Modules\Broadcasts\Jobs\SendCampaignMessageJob::dispatch($campaignId)
            ->onQueue('campaigns');
    }

    public function runPreflightChecks(Campaign $campaign): array
    {
        $errors = [];
        $warnings = [];

        $connection = $campaign->connection;
        if (!$connection) {
            $errors[] = 'No WhatsApp connection configured.';
        } else {
            if (!((bool) $connection->is_active)) {
                $errors[] = 'Selected WhatsApp connection is inactive.';
            }

            if ($connection->webhook_last_error) {
                $warnings[] = 'Connection has recent webhook errors.';
            }

            if (!$connection->webhook_last_received_at || $connection->webhook_last_received_at->lt(now()->subHours(24))) {
                $warnings[] = 'Connection webhook activity is stale (>24h).';
            }
        }

        if ($campaign->type === 'template') {
            $template = $campaign->template;
            if (!$template) {
                $errors[] = 'Template campaign requires an approved template.';
            } else {
                $status = strtolower(trim((string) $template->status));
                if ($status !== 'approved') {
                    $errors[] = 'Template is not approved.';
                }
                if ((bool) $template->is_archived) {
                    $errors[] = 'Template is archived.';
                }
                if (
                    $campaign->whatsapp_connection_id
                    && $template->whatsapp_connection_id
                    && (int) $template->whatsapp_connection_id !== (int) $campaign->whatsapp_connection_id
                ) {
                    $errors[] = 'Template does not belong to the selected connection.';
                }
            }
        }

        $pendingCount = (int) $campaign->recipients()->where('status', 'pending')->count();
        if ($pendingCount <= 0) {
            $errors[] = 'No pending recipients to send.';
        }

        $account = $campaign->account;
        if ($account) {
            $limits = $this->planResolver->getEffectiveLimits($account);
            $usage = $this->usageService->getCurrentUsage($account);

            $messageLimit = (int) ($limits['messages_monthly'] ?? 0);
            if ($messageLimit !== -1 && ($usage->messages_sent + $pendingCount) > $messageLimit) {
                $errors[] = "Message quota exceeded for this campaign (required {$pendingCount}, remaining " . max(0, $messageLimit - (int) $usage->messages_sent) . ').';
            }

            if ($campaign->type === 'template') {
                $templateLimit = (int) ($limits['template_sends_monthly'] ?? 0);
                if ($templateLimit !== -1 && ($usage->template_sends + $pendingCount) > $templateLimit) {
                    $errors[] = "Template send quota exceeded (required {$pendingCount}, remaining " . max(0, $templateLimit - (int) $usage->template_sends) . ').';
                }
            }
        }

        return [
            'ok' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
            'pending_recipients' => $pendingCount,
        ];
    }

    public function getDispatchDelaySeconds(Campaign $campaign): int
    {
        $baseDelay = max(0, (int) $campaign->send_delay_seconds);
        $backoffUntil = $this->getConnectionBackoffUntil($campaign);
        if ($backoffUntil === null) {
            return $baseDelay;
        }

        $remaining = max(0, now()->diffInSeconds($backoffUntil, false));
        return max($baseDelay, $remaining);
    }

    public function isConnectionCoolingDown(Campaign $campaign): bool
    {
        $until = $this->getConnectionBackoffUntil($campaign);
        return $until !== null && $until->isFuture();
    }

    protected function isRateLimitError(string $message): bool
    {
        $normalized = strtolower($message);
        return str_contains($normalized, 'rate limit')
            || str_contains($normalized, 'too many requests')
            || str_contains($normalized, 'error code: 4')
            || str_contains($normalized, '429');
    }

    protected function applyConnectionBackoff(Campaign $campaign, string $reason): void
    {
        if (!$campaign->whatsapp_connection_id) {
            return;
        }

        $penaltyKey = "campaign:connection:{$campaign->whatsapp_connection_id}:rate_penalty";
        $untilKey = "campaign:connection:{$campaign->whatsapp_connection_id}:rate_limited_until";

        $penalty = max(1, (int) Cache::increment($penaltyKey));
        Cache::put($penaltyKey, $penalty, now()->addMinutes(20));

        $waitSeconds = min(180, 5 * (2 ** max(0, $penalty - 1)));
        Cache::put($untilKey, now()->addSeconds($waitSeconds)->toIso8601String(), now()->addSeconds($waitSeconds + 120));

        Log::warning('Campaign connection rate-limited; adaptive backoff applied', [
            'campaign_id' => $campaign->id,
            'connection_id' => $campaign->whatsapp_connection_id,
            'wait_seconds' => $waitSeconds,
            'reason' => mb_substr($reason, 0, 500),
        ]);
    }

    protected function clearConnectionBackoff(Campaign $campaign): void
    {
        if (!$campaign->whatsapp_connection_id) {
            return;
        }

        Cache::forget("campaign:connection:{$campaign->whatsapp_connection_id}:rate_penalty");
        Cache::forget("campaign:connection:{$campaign->whatsapp_connection_id}:rate_limited_until");
    }

    protected function getConnectionBackoffUntil(Campaign $campaign): ?Carbon
    {
        if (!$campaign->whatsapp_connection_id) {
            return null;
        }

        $raw = Cache::get("campaign:connection:{$campaign->whatsapp_connection_id}:rate_limited_until");
        if (!is_string($raw) || $raw === '') {
            return null;
        }

        try {
            return Carbon::parse($raw);
        } catch (\Throwable) {
            return null;
        }
    }
}
