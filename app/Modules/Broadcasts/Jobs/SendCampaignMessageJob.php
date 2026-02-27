<?php

namespace App\Modules\Broadcasts\Jobs;

use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Models\CampaignRecipient;
use App\Modules\Broadcasts\Services\CampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendCampaignMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = 60;
    public $timeout = 120;

    protected int $batchSize = 20;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $campaignId
    ) {
        // Use a dedicated queue for campaign messages to avoid conflicts
        $this->onQueue('campaigns');
    }

    /**
     * Execute the job.
     */
    public function handle(CampaignService $campaignService): void
    {
        $dispatchGuardKey = "campaign_send:next_scheduled:{$this->campaignId}";
        // Use lock to prevent concurrent processing of the same campaign
        $lockKey = "campaign_send:{$this->campaignId}";
        $lock = Cache::lock($lockKey, 120); // lock while a batch is processed

        if (!$lock->get()) {
            // Another job is processing this campaign, retry later
            $this->release(10); // Release back to queue for 10 seconds
            return;
        }

        try {
            // This job is actively running now; allow scheduling another follow-up if needed.
            Cache::forget($dispatchGuardKey);

            $campaign = Campaign::find($this->campaignId);

            if (!$campaign || !$campaign->isActive()) {
                Log::info('Campaign not found or not active', ['campaign_id' => $this->campaignId]);
                Cache::forget($dispatchGuardKey);
                return;
            }

            $preflight = $campaignService->runPreflightChecks($campaign);
            if (!($preflight['ok'] ?? false)) {
                $campaignService->pauseCampaignForBackpressure(
                    $campaign,
                    implode(' | ', $preflight['errors'] ?? ['Queue/system preflight failed during send'])
                );
                Log::warning('Campaign auto-paused by worker preflight', [
                    'campaign_id' => $this->campaignId,
                    'errors' => $preflight['errors'] ?? [],
                ]);
                Cache::forget($dispatchGuardKey);
                return;
            }

            $iterations = $campaign->send_delay_seconds > 0 ? 1 : $this->batchSize;
            $processed = 0;

            for ($i = 0; $i < $iterations; $i++) {
                $recipient = \DB::transaction(function () use ($campaign) {
                    /** @var CampaignRecipient|null $next */
                    $next = $campaign->recipients()
                        ->where('status', 'pending')
                        ->lockForUpdate()
                        ->orderBy('id')
                        ->first();

                    return $next;
                });

                if (!$recipient) {
                    break;
                }

                $processed++;
                $sent = $campaignService->sendToRecipient($campaign, $recipient);
                if (!$sent && $campaignService->isConnectionCoolingDown($campaign)) {
                    break;
                }
            }

            if ($processed === 0) {
                $campaignService->checkCampaignCompletion($campaign);
                Cache::forget($dispatchGuardKey);
                return;
            }

            $hasPending = $campaign->recipients()
                ->where('status', 'pending')
                ->exists();

            if ($hasPending) {
                $delaySeconds = $campaignService->getDispatchDelaySeconds($campaign);
                // Prevent fan-out from duplicate follow-up dispatches while queue is under load.
                $guardTtl = max(15, min(300, $delaySeconds + 20));
                if (Cache::add($dispatchGuardKey, 1, now()->addSeconds($guardTtl))) {
                    $next = (new SendCampaignMessageJob($this->campaignId))->onQueue('campaigns');
                    if ($delaySeconds > 0) {
                        $next->delay(now()->addSeconds($delaySeconds));
                    }
                    dispatch($next);
                }
            } else {
                Cache::forget($dispatchGuardKey);
            }
        } finally {
            $lock->release();
        }
    }
}
