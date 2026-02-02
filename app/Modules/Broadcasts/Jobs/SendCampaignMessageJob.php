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
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 60); // 1 minute lock

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

            // Get next pending recipient (use lock to prevent race conditions)
            $recipient = \DB::transaction(function () use ($campaign) {
                return $campaign->recipients()
                    ->where('status', 'pending')
                    ->lockForUpdate() // Row-level lock
                    ->orderBy('id')
                    ->first();
            });

            if (!$recipient) {
                // No more recipients, check if campaign is complete
                $campaignService->checkCampaignCompletion($campaign);
                return;
            }

            // Send message to recipient
            $campaignService->sendToRecipient($campaign, $recipient);

            // Schedule next message if there's a delay
            if ($campaign->send_delay_seconds > 0) {
                dispatch(new SendCampaignMessageJob($this->campaignId))
                    ->delay(now()->addSeconds($campaign->send_delay_seconds))
                    ->onQueue('campaigns');
            } else {
                // Send next message immediately (but on queue to avoid blocking)
                dispatch(new SendCampaignMessageJob($this->campaignId))
                    ->onQueue('campaigns');
            }
        } finally {
            $lock->release();
        }
    }
}

