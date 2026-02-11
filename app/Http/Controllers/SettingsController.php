<?php

namespace App\Http\Controllers;

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
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display unified settings page.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'account' => $account,
            'auth' => [
                'user' => $user,
            ],
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'cronSettings' => $this->buildCronSettings((int) $account->id),
        ]);
    }

    /**
     * Update inbox settings.
     */
    public function updateInbox(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'auto_assign_enabled' => 'required|boolean',
            'auto_assign_strategy' => 'required|in:round_robin',
        ]);

        $account->update([
            'auto_assign_enabled' => $validated['auto_assign_enabled'],
            'auto_assign_strategy' => $validated['auto_assign_strategy'],
        ]);

        return back()->with('success', 'Inbox settings updated.');
    }

    /**
     * Update notification preferences.
     */
    public function updateNotifications(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'notify_assignment_enabled' => 'required|boolean',
            'notify_mention_enabled' => 'required|boolean',
            'notify_sound_enabled' => 'required|boolean',
        ]);

        $user->update($validated);

        return back()->with('success', 'Notification preferences updated.');
    }

    protected function buildCronSettings(int $accountId): array
    {
        $now = now();
        $appPath = base_path();
        $nullRedirect = '>> /dev/null 2>&1';

        $commands = [
            [
                'id' => 'queue-worker',
                'title' => 'Queue Worker (Primary)',
                'schedule' => '* * * * *',
                'description' => 'Recommended for cPanel cron. Processes inbox, chatbot, and campaign jobs every minute.',
                'command' => "cd {$appPath} && php artisan queue:work --queue=default,chatbots,campaigns --stop-when-empty --sleep=1 --tries=3 --timeout=120 {$nullRedirect}",
            ],
            [
                'id' => 'scheduler',
                'title' => 'Laravel Scheduler',
                'schedule' => '* * * * *',
                'description' => 'Optional but recommended. Enables any current or future scheduled tasks.',
                'command' => "cd {$appPath} && php artisan schedule:run {$nullRedirect}",
            ],
            [
                'id' => 'chatbots-diagnose',
                'title' => 'Chatbots Diagnostics',
                'schedule' => '*/15 * * * *',
                'description' => 'Optional health-check command to catch non-runnable bot configurations.',
                'command' => "cd {$appPath} && php artisan chatbots:diagnose --account={$accountId} {$nullRedirect}",
            ],
        ];

        $queuePendingDefault = DB::table('jobs')->where('queue', 'default')->count();
        $queuePendingCampaigns = DB::table('jobs')->where('queue', 'campaigns')->count();
        $queuePendingChatbots = DB::table('jobs')->where('queue', 'chatbots')->count();
        $failedQueue24h = DB::table('failed_jobs')->where('failed_at', '>=', $now->copy()->subDay())->count();

        $latestMessageAt = WhatsAppMessage::where('account_id', $accountId)->max('created_at');
        $openConversations = WhatsAppConversation::where('account_id', $accountId)->where('status', 'open')->count();
        $inbound24h = WhatsAppMessage::where('account_id', $accountId)
            ->where('direction', 'inbound')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->count();

        $activeConnections = WhatsAppConnection::where('account_id', $accountId)->where('is_active', true)->count();
        $lastWebhookAt = WhatsAppConnection::where('account_id', $accountId)->max('webhook_last_received_at');
        $staleWebhookConnections = WhatsAppConnection::where('account_id', $accountId)
            ->where('is_active', true)
            ->where(function ($query) use ($now) {
                $query->whereNull('webhook_last_received_at')
                    ->orWhere('webhook_last_received_at', '<', $now->copy()->subDay());
            })
            ->count();
        $webhookErrors = WhatsAppConnection::where('account_id', $accountId)
            ->whereNotNull('webhook_last_error')
            ->count();

        $campaignsSending = Campaign::where('account_id', $accountId)->where('status', 'sending')->count();
        $campaignsScheduled = Campaign::where('account_id', $accountId)->where('status', 'scheduled')->count();
        $campaignLastMessageAt = CampaignMessage::whereHas('campaign', function ($query) use ($accountId) {
            $query->where('account_id', $accountId);
        })->max('created_at');

        $activeBots = Bot::where('account_id', $accountId)->where('status', 'active')->count();
        $failedBotExecutions24h = BotExecution::where('account_id', $accountId)
            ->where('status', 'failed')
            ->where('created_at', '>=', $now->copy()->subDay())
            ->count();
        $lastBotExecutionAt = BotExecution::where('account_id', $accountId)->max('created_at');

        $subscription = Subscription::where('account_id', $accountId)->latest('id')->first();
        $subscriptionStatus = $subscription?->status ?? 'missing';
        $subscriptionEndsAt = $subscription?->current_period_end?->toIso8601String();

        return [
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
                    'status' => in_array($subscriptionStatus, ['active', 'trialing'], true) ? 'healthy' : 'warning',
                    'last_activity_at' => $subscriptionEndsAt,
                    'metrics' => [
                        'status' => $subscriptionStatus,
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
