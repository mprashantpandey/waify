<?php

namespace App\Modules\Broadcasts\Jobs;

use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Services\CampaignService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendScheduledCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public int $timeout = 120;

    public array $backoff = [10, 30, 90, 180];

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $campaignId
    ) {
        $this->onQueue('campaigns');
    }

    /**
     * Execute the job.
     */
    public function handle(CampaignService $campaignService): void
    {
        $campaign = Campaign::find($this->campaignId);

        if (!$campaign) {
            Log::warning('Scheduled campaign not found', ['campaign_id' => $this->campaignId]);
            return;
        }

        if ($campaign->status !== 'scheduled') {
            Log::info('Campaign is not in scheduled status', [
                'campaign_id' => $this->campaignId,
                'status' => $campaign->status]);
            return;
        }

        // Start the campaign
        $campaignService->startCampaign($campaign);
    }

    public function failed(\Throwable $e): void
    {
        Log::error('SendScheduledCampaignJob failed', [
            'campaign_id' => $this->campaignId,
            'error' => $e->getMessage(),
        ]);
    }
}
