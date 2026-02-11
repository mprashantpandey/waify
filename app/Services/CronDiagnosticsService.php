<?php

namespace App\Services;

use App\Models\Subscription;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Models\CampaignMessage;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotExecution;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class CronDiagnosticsService
{
    public function platformSummary(): array
    {
        $now = now();
        $appPath = base_path();
        $nullRedirect = '>> /dev/null 2>&1';

        $commands = [
            [
                'id' => 'central-worker',
                'title' => 'Central Cron Command',
                'schedule' => '* * * * *',
                'description' => 'Use this single command in cPanel. It processes inbox, chatbot, campaign, and other queued jobs in one worker pass.',
                'command' => "cd {$appPath} && php artisan queue:work --queue=default,chatbots,campaigns --stop-when-empty --sleep=1 --tries=3 --timeout=120 {$nullRedirect}",
            ],
        ];

        $queuePendingDefault = DB::table('jobs')->where('queue', 'default')->count();
        $queuePendingCampaigns = DB::table('jobs')->where('queue', 'campaigns')->count();
        $queuePendingChatbots = DB::table('jobs')->where('queue', 'chatbots')->count();
        $failedQueue24h = DB::table('failed_jobs')->where('failed_at', '>=', $now->copy()->subDay())->count();

        $latestMessageAt = WhatsAppMessage::max('created_at');
        $openConversations = WhatsAppConversation::where('status', 'open')->count();
        $inbound24h = WhatsAppMessage::where('direction', 'inbound')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->count();

        $activeConnections = WhatsAppConnection::where('is_active', true)->count();
        $lastWebhookAt = WhatsAppConnection::max('webhook_last_received_at');
        $staleWebhookConnections = WhatsAppConnection::where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('webhook_last_received_at')
                    ->orWhere('webhook_last_received_at', '<', $now->copy()->subDay());
            })
            ->count();
        $webhookErrors = WhatsAppConnection::whereNotNull('webhook_last_error')->count();

        $campaignsSending = Campaign::where('status', 'sending')->count();
        $campaignsScheduled = Campaign::where('status', 'scheduled')->count();
        $campaignLastMessageAt = CampaignMessage::max('created_at');

        $activeBots = Bot::where('status', 'active')->count();
        $failedBotExecutions24h = BotExecution::where('status', 'failed')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->count();
        $lastBotExecutionAt = BotExecution::max('created_at');

        $activeSubscriptions = Subscription::whereIn('status', ['active', 'trialing'])->count();
        $pastDueSubscriptions = Subscription::where('status', 'past_due')->count();
        $canceledSubscriptions = Subscription::where('status', 'canceled')->count();
        $latestSubscriptionChangeAt = Subscription::max('updated_at');

        return [
            'scope' => 'platform',
            'timezone' => config('app.timezone'),
            'commands' => $commands,
            'statuses' => [
                [
                    'key' => 'queue',
                    'label' => 'Queue Worker',
                    'status' => $this->statusFromQueue($queuePendingDefault + $queuePendingCampaigns + $queuePendingChatbots, $failedQueue24h),
                    'last_activity_at' => $this->latestDate([$latestMessageAt, $lastBotExecutionAt, $campaignLastMessageAt]),
                    'metrics' => [
                        'pending_default' => $queuePendingDefault,
                        'pending_chatbots' => $queuePendingChatbots,
                        'pending_campaigns' => $queuePendingCampaigns,
                        'failed_last_24h' => $failedQueue24h,
                    ],
                ],
                [
                    'key' => 'inbox',
                    'label' => 'Inbox',
                    'status' => $openConversations > 0 ? 'healthy' : 'warning',
                    'last_activity_at' => $this->isoOrNull($latestMessageAt),
                    'metrics' => [
                        'open_conversations' => $openConversations,
                        'inbound_last_24h' => $inbound24h,
                    ],
                ],
                [
                    'key' => 'webhooks',
                    'label' => 'Webhooks',
                    'status' => $this->statusFromWebhook($activeConnections, $staleWebhookConnections, $webhookErrors),
                    'last_activity_at' => $this->isoOrNull($lastWebhookAt),
                    'metrics' => [
                        'active_connections' => $activeConnections,
                        'stale_connections' => $staleWebhookConnections,
                        'connections_with_error' => $webhookErrors,
                    ],
                ],
                [
                    'key' => 'campaigns',
                    'label' => 'Campaigns',
                    'status' => $failedQueue24h > 0 ? 'warning' : 'healthy',
                    'last_activity_at' => $this->isoOrNull($campaignLastMessageAt),
                    'metrics' => [
                        'sending' => $campaignsSending,
                        'scheduled' => $campaignsScheduled,
                        'pending_queue' => $queuePendingCampaigns,
                    ],
                ],
                [
                    'key' => 'chatbots',
                    'label' => 'Chatbots',
                    'status' => $this->statusFromChatbots($activeBots, $failedBotExecutions24h),
                    'last_activity_at' => $this->isoOrNull($lastBotExecutionAt),
                    'metrics' => [
                        'active_bots' => $activeBots,
                        'pending_queue' => $queuePendingChatbots,
                        'failed_executions_last_24h' => $failedBotExecutions24h,
                    ],
                ],
                [
                    'key' => 'subscriptions',
                    'label' => 'Subscriptions',
                    'status' => $pastDueSubscriptions > 0 ? 'warning' : 'healthy',
                    'last_activity_at' => $this->isoOrNull($latestSubscriptionChangeAt),
                    'metrics' => [
                        'active_or_trialing' => $activeSubscriptions,
                        'past_due' => $pastDueSubscriptions,
                        'canceled' => $canceledSubscriptions,
                    ],
                ],
            ],
            'log_files' => [
                'laravel' => $this->logMeta('laravel.log'),
                'chatbots' => $this->logMeta('chatbots.log'),
                'whatsapp' => $this->logMeta('whatsapp.log'),
            ],
        ];
    }

    protected function statusFromQueue(int $pendingTotal, int $failedLast24h): string
    {
        if ($failedLast24h > 0) {
            return 'warning';
        }

        if ($pendingTotal > 250) {
            return 'critical';
        }

        if ($pendingTotal > 0) {
            return 'warning';
        }

        return 'healthy';
    }

    protected function statusFromWebhook(int $activeConnections, int $staleConnections, int $errorConnections): string
    {
        if ($activeConnections === 0) {
            return 'warning';
        }

        if ($errorConnections > 0 || $staleConnections > 0) {
            return 'warning';
        }

        return 'healthy';
    }

    protected function statusFromChatbots(int $activeBots, int $failedExecutions24h): string
    {
        if ($activeBots === 0) {
            return 'warning';
        }

        if ($failedExecutions24h > 0) {
            return 'warning';
        }

        return 'healthy';
    }

    protected function logMeta(string $filename): array
    {
        $path = storage_path('logs/' . $filename);

        if (!File::exists($path)) {
            return [
                'exists' => false,
                'path' => $path,
                'last_modified_at' => null,
            ];
        }

        return [
            'exists' => true,
            'path' => $path,
            'last_modified_at' => now()->setTimestamp(File::lastModified($path))->toIso8601String(),
        ];
    }

    protected function latestDate(array $values): ?string
    {
        $normalized = collect($values)
            ->filter()
            ->map(fn ($value) => $this->toTimestamp($value))
            ->filter()
            ->max();

        if (!$normalized) {
            return null;
        }

        return now()->setTimestamp($normalized)->toIso8601String();
    }

    protected function isoOrNull(mixed $value): ?string
    {
        if (!$value) {
            return null;
        }

        if ($value instanceof \DateTimeInterface) {
            return $value->format(\DateTimeInterface::ATOM);
        }

        try {
            return Carbon::parse((string) $value)->toIso8601String();
        } catch (\Throwable) {
            return null;
        }
    }

    protected function toTimestamp(mixed $value): ?int
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->getTimestamp();
        }

        try {
            return Carbon::parse((string) $value)->getTimestamp();
        } catch (\Throwable) {
            return null;
        }
    }
}
