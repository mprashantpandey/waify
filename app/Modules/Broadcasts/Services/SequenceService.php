<?php

namespace App\Modules\Broadcasts\Services;

use App\Models\Account;
use App\Models\User;
use App\Modules\Broadcasts\Jobs\SendSequenceStepJob;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Models\CampaignSequenceEnrollment;
use App\Modules\Broadcasts\Models\CampaignSequenceStep;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\CustomerCareWindowService;
use App\Modules\WhatsApp\Services\OutboundMessagePipelineService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class SequenceService
{
    public function __construct(
        protected WhatsAppClient $whatsappClient,
        protected OutboundMessagePipelineService $outboundPipeline,
        protected CustomerCareWindowService $customerCareWindowService,
    ) {
    }

    public function createSequence(Account $account, User $user, array $data): CampaignSequence
    {
        return DB::transaction(function () use ($account, $user, $data): CampaignSequence {
            $sequence = CampaignSequence::create([
                'account_id' => $account->id,
                'whatsapp_connection_id' => $data['whatsapp_connection_id'],
                'created_by' => $user->id,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => 'draft',
                'audience_type' => $data['audience_type'],
                'audience_filters' => $data['audience_filters'] ?? null,
                'custom_recipients' => $data['custom_recipients'] ?? null,
            ]);

            foreach ($data['steps'] as $index => $step) {
                CampaignSequenceStep::create([
                    'campaign_sequence_id' => $sequence->id,
                    'step_order' => $index + 1,
                    'delay_minutes' => max(0, (int) ($step['delay_minutes'] ?? 0)),
                    'type' => $step['type'],
                    'whatsapp_template_id' => $step['whatsapp_template_id'] ?? null,
                    'message_text' => $step['message_text'] ?? null,
                    'template_params' => $step['template_params'] ?? null,
                ]);
            }

            return $sequence->fresh(['steps']);
        });
    }

    public function activateSequence(CampaignSequence $sequence): void
    {
        DB::transaction(function () use ($sequence): void {
            $sequence->refresh();
            $sequence->loadMissing(['steps', 'connection']);

            if ($sequence->steps->isEmpty()) {
                throw new \RuntimeException('Sequence requires at least one step.');
            }

            if (!$sequence->connection || !(bool) $sequence->connection->is_active) {
                throw new \RuntimeException('Sequence needs an active WhatsApp connection.');
            }

            $enrollments = $this->enrollAudience($sequence);

            $sequence->update([
                'status' => 'active',
                'activated_at' => $sequence->activated_at ?: now(),
                'paused_at' => null,
            ]);

            $this->syncEnrollmentCounts($sequence);

            foreach ($enrollments as $enrollment) {
                $this->dispatchPendingSteps($sequence, $enrollment);
            }
        });
    }

    public function pauseSequence(CampaignSequence $sequence): void
    {
        $sequence->update([
            'status' => 'paused',
            'paused_at' => now(),
        ]);

        $sequence->enrollments()
            ->where('status', 'active')
            ->update(['status' => 'paused']);

        $this->syncEnrollmentCounts($sequence);
    }

    public function executeStep(int $sequenceId, int $enrollmentId, int $stepId): void
    {
        $sequence = CampaignSequence::query()->with(['connection'])->find($sequenceId);
        $enrollment = CampaignSequenceEnrollment::query()->with(['contact'])->find($enrollmentId);
        $step = CampaignSequenceStep::query()->with(['template'])->find($stepId);

        if (!$sequence || !$enrollment || !$step) {
            return;
        }

        if ((int) $step->campaign_sequence_id !== (int) $sequence->id || (int) $enrollment->campaign_sequence_id !== (int) $sequence->id) {
            return;
        }

        if ($sequence->status !== 'active' || $enrollment->status !== 'active') {
            return;
        }

        if ($enrollment->hasSentStep($step->id)) {
            return;
        }

        $connection = $sequence->connection;
        if (!$connection) {
            $this->markEnrollmentFailed($sequence, $enrollment, 'Sequence connection is unavailable.');
            return;
        }

        $contact = $enrollment->contact;
        if (!$contact) {
            $contact = WhatsAppContact::query()->firstOrCreate(
                ['account_id' => $sequence->account_id, 'wa_id' => $enrollment->wa_id],
                ['name' => $enrollment->name ?: $enrollment->wa_id]
            );
            $enrollment->update(['whatsapp_contact_id' => $contact->id]);
        }

        $conversation = WhatsAppConversation::query()->firstOrCreate(
            [
                'account_id' => $sequence->account_id,
                'whatsapp_connection_id' => $connection->id,
                'whatsapp_contact_id' => $contact->id,
            ],
            [
                'status' => 'open',
                'last_message_preview' => null,
            ]
        );

        $payloadSource = [
            'source' => 'sequence',
            'sequence_id' => $sequence->id,
            'sequence_step_id' => $step->id,
            'sequence_enrollment_id' => $enrollment->id,
        ];

        $bodyPreview = $step->type === 'template'
            ? ('Template: ' . ($step->template?->name ?: 'template'))
            : (string) $step->message_text;

        $outbound = WhatsAppMessage::create([
            'account_id' => $sequence->account_id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => $step->type === 'template' ? 'template' : 'text',
            'text_body' => $step->type === 'text' ? (string) $step->message_text : $bodyPreview,
            'status' => 'queued',
            'payload' => $payloadSource,
        ]);

        event(new MessageCreated($outbound));

        try {
            $this->outboundPipeline->assertSendPrerequisites($connection, (string) $contact->wa_id, $step->type);

            if ($step->type === 'text') {
                $window = $this->customerCareWindowService->forConversation($conversation);
                if (!($window['is_open'] ?? false)) {
                    throw new \RuntimeException('Text sequence steps require an open 24-hour window.');
                }

                $response = $this->whatsappClient->sendTextMessage(
                    $connection,
                    (string) $contact->wa_id,
                    (string) $step->message_text
                );
            } else {
                if (!$step->template) {
                    throw new \RuntimeException('Sequence template step is missing its template.');
                }

                $response = $this->whatsappClient->sendTemplateMessage(
                    $connection,
                    (string) $contact->wa_id,
                    (string) $step->template->name,
                    (string) ($step->template->language ?: 'en_US'),
                    is_array($step->template_params) ? $step->template_params : []
                );
            }
        } catch (\Throwable $e) {
            $outbound->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'payload' => array_merge($outbound->payload ?? [], ['error' => $e->getMessage()]),
            ]);

            event(new MessageUpdated($outbound));
            $this->markEnrollmentFailed($sequence, $enrollment, $e->getMessage());
            return;
        }

        $metaMessageId = $response['messages'][0]['id'] ?? null;

        $outbound->update([
            'meta_message_id' => $metaMessageId,
            'status' => 'sent',
            'sent_at' => now(),
            'payload' => array_merge($outbound->payload ?? [], $response),
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'last_message_preview' => mb_substr($bodyPreview, 0, 100),
        ]);

        $sentStepIds = collect(data_get($enrollment->metadata, 'sent_step_ids', []))
            ->map(fn ($value) => (int) $value)
            ->push($step->id)
            ->unique()
            ->values()
            ->all();

        $enrollment->update([
            'sent_steps_count' => count($sentStepIds),
            'last_step_sent_at' => now(),
            'metadata' => array_merge($enrollment->metadata ?? [], [
                'sent_step_ids' => $sentStepIds,
            ]),
        ]);

        if ((int) $enrollment->sent_steps_count >= $sequence->steps()->count()) {
            $enrollment->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        }

        $this->syncEnrollmentCounts($sequence);

        event(new MessageUpdated($outbound));
        event(new ConversationUpdated($conversation));
    }

    /**
     * @return Collection<int, CampaignSequenceEnrollment>
     */
    protected function enrollAudience(CampaignSequence $sequence): Collection
    {
        $sequence->loadMissing('steps');

        $contacts = match ($sequence->audience_type) {
            'segment' => $this->resolveSegmentAudience($sequence),
            'custom' => $this->resolveCustomAudience($sequence),
            default => WhatsAppContact::query()
                ->where('account_id', $sequence->account_id)
                ->whereNull('deleted_at')
                ->get(),
        };

        $enrollments = collect();

        foreach ($contacts as $contact) {
            $waId = $this->normalizeWaId((string) ($contact->wa_id ?? ''));
            if ($waId === '') {
                continue;
            }

            $enrollment = CampaignSequenceEnrollment::query()->firstOrCreate(
                [
                    'campaign_sequence_id' => $sequence->id,
                    'wa_id' => $waId,
                ],
                [
                    'whatsapp_contact_id' => $contact->id,
                    'name' => $contact->name ?: $waId,
                    'status' => 'active',
                    'enrolled_at' => now(),
                    'metadata' => ['sent_step_ids' => []],
                ]
            );

            if ($enrollment->status === 'paused') {
                $enrollment->update(['status' => 'active']);
            }

            $enrollments->push($enrollment->fresh());
        }

        return $enrollments;
    }

    protected function resolveSegmentAudience(CampaignSequence $sequence): Collection
    {
        $segmentIds = collect(data_get($sequence->audience_filters, 'segment_ids', []))
            ->map(fn ($value) => (int) $value)
            ->filter()
            ->all();

        if (empty($segmentIds)) {
            return collect();
        }

        return ContactSegment::query()
            ->where('account_id', $sequence->account_id)
            ->whereIn('id', $segmentIds)
            ->get()
            ->flatMap(fn (ContactSegment $segment) => $segment->contactsQuery()->get())
            ->unique('id')
            ->values();
    }

    protected function resolveCustomAudience(CampaignSequence $sequence): Collection
    {
        return collect($sequence->custom_recipients ?? [])
            ->map(function (array $recipient) use ($sequence) {
                $waId = $this->normalizeWaId((string) ($recipient['phone'] ?? ''));
                if ($waId === '') {
                    return null;
                }

                return WhatsAppContact::query()->firstOrCreate(
                    ['account_id' => $sequence->account_id, 'wa_id' => $waId],
                    ['name' => trim((string) ($recipient['name'] ?? '')) ?: $waId]
                );
            })
            ->filter()
            ->values();
    }

    protected function dispatchPendingSteps(CampaignSequence $sequence, CampaignSequenceEnrollment $enrollment): void
    {
        $steps = $sequence->steps()->orderBy('step_order')->get();
        foreach ($steps as $step) {
            if ($enrollment->hasSentStep($step->id)) {
                continue;
            }

            SendSequenceStepJob::dispatch($sequence->id, $enrollment->id, $step->id)
                ->delay(now()->addMinutes(max(0, (int) $step->delay_minutes)));
        }
    }

    protected function syncEnrollmentCounts(CampaignSequence $sequence): void
    {
        $sequence->update([
            'enrolled_count' => $sequence->enrollments()->count(),
            'active_enrollment_count' => $sequence->enrollments()->where('status', 'active')->count(),
            'completed_enrollment_count' => $sequence->enrollments()->where('status', 'completed')->count(),
            'failed_enrollment_count' => $sequence->enrollments()->where('status', 'failed')->count(),
        ]);
    }

    protected function markEnrollmentFailed(CampaignSequence $sequence, CampaignSequenceEnrollment $enrollment, string $reason): void
    {
        $enrollment->update([
            'status' => 'failed',
            'failed_at' => now(),
            'failure_reason' => mb_substr($reason, 0, 1000),
        ]);

        $this->syncEnrollmentCounts($sequence);
    }

    protected function normalizeWaId(string $value): string
    {
        return preg_replace('/\D+/', '', $value) ?? '';
    }
}
