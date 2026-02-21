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
        // Use lock to prevent concurrent processing of the same campaign
        $lockKey = "campaign_send:{$this->campaignId}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 120); // lock while a batch is processed

        if (!$lock->get()) {
            // Another job is processing this campaign, retry later
            $this->release(10); // Release back to queue for 10 seconds
            return;
        }

        try {
            $campaign = Campaign::find($this->campaignId);

            if (!$campaign || !$campaign->isActive()) {
                Log::info('Campaign not found or not active', ['campaign_id' => $this->campaignId]);
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
                return;
            }

            $hasPending = $campaign->recipients()
                ->where('status', 'pending')
                ->exists();

            if ($hasPending) {
                $next = (new SendCampaignMessageJob($this->campaignId))->onQueue('campaigns');
                $delaySeconds = $campaignService->getDispatchDelaySeconds($campaign);
                if ($delaySeconds > 0) {
                    $next->delay(now()->addSeconds($delaySeconds));
                }
                dispatch($next);
            }
        } finally {
            $lock->release();
        }
    }
}
