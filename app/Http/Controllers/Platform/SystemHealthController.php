<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\AccountIntegrationSyncLog;
use App\Models\PlatformSetting;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Services\CampaignService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    public function __construct(protected CampaignService $campaignService) {}

    /**
     * Display system health dashboard.
     */
    public function index(Request $request): Response
    {
        // Webhook Health
        $connections = WhatsAppConnection::all();
        $webhookHealth = [
            'total' => $connections->count(),
            'subscribed' => $connections->where('webhook_subscribed', true)->count(),
            'with_errors' => $connections->whereNotNull('webhook_last_error')->count(),
            'recent_activity' => $connections->filter(function ($conn) {
                return $conn->webhook_last_received_at &&
                       $conn->webhook_last_received_at->isAfter(now()->subHours(24));
            })->count()];

        $webhookEventHealth = [
            'total_24h' => 0,
            'processed_24h' => 0,
            'skipped_24h' => 0,
            'failed_24h' => 0,
            'processing_24h' => 0,
            'stuck_processing' => 0,
        ];
        $recentWebhookEvents = collect();

        if (Schema::hasTable('whatsapp_webhook_events')) {
            $eventCounts = DB::table('whatsapp_webhook_events')
                ->selectRaw('status, count(*) as aggregate')
                ->where('last_received_at', '>=', now()->subDay())
                ->groupBy('status')
                ->pluck('aggregate', 'status');

            $webhookEventHealth = [
                'total_24h' => (int) $eventCounts->sum(),
                'processed_24h' => (int) ($eventCounts['processed'] ?? 0),
                'skipped_24h' => (int) ($eventCounts['skipped'] ?? 0),
                'failed_24h' => (int) ($eventCounts['failed'] ?? 0),
                'processing_24h' => (int) ($eventCounts['processing'] ?? 0),
                'stuck_processing' => DB::table('whatsapp_webhook_events')
                    ->where('status', 'processing')
                    ->where('updated_at', '<=', now()->subMinutes(10))
                    ->count(),
            ];

            $recentWebhookEvents = DB::table('whatsapp_webhook_events as events')
                ->leftJoin('whatsapp_connections as connections', 'connections.id', '=', 'events.whatsapp_connection_id')
                ->leftJoin('accounts', 'accounts.id', '=', 'events.account_id')
                ->where(function ($query) {
                    $query->where('events.status', 'failed')
                        ->orWhere(function ($nested) {
                            $nested->where('events.status', 'processing')
                                ->where('events.updated_at', '<=', now()->subMinutes(10));
                        });
                })
                ->orderByDesc('events.updated_at')
                ->limit(12)
                ->get([
                    'events.id',
                    'events.account_id',
                    'events.whatsapp_connection_id',
                    'events.event_key',
                    'events.event_type',
                    'events.status',
                    'events.attempts',
                    'events.last_error',
                    'events.first_received_at',
                    'events.last_received_at',
                    'events.updated_at',
                    'connections.name as connection_name',
                    'accounts.name as account_name',
                ])
                ->map(fn ($event) => [
                    'id' => $event->id,
                    'account' => $event->account_name ?? 'Workspace #'.$event->account_id,
                    'connection' => $event->connection_name ?? ($event->whatsapp_connection_id ? 'Connection #'.$event->whatsapp_connection_id : 'Unknown'),
                    'event_key' => $event->event_key,
                    'event_type' => $event->event_type,
                    'status' => $event->status,
                    'attempts' => (int) $event->attempts,
                    'last_error' => $event->last_error,
                    'first_received_at' => $event->first_received_at,
                    'last_received_at' => $event->last_received_at,
                    'updated_at' => $event->updated_at,
                ])
                ->values();
        }

        // Connection details with health status
        $connectionDetails = $connections->map(function ($conn) {
            $lastReceived = $conn->webhook_last_received_at;
            $webhookAgeMinutes = $lastReceived ? (int) $lastReceived->diffInMinutes(now()) : null;
            $isHealthy = $conn->webhook_subscribed &&
                        ! $conn->webhook_last_error &&
                        $lastReceived &&
                        $lastReceived->isAfter(now()->subHours(24));

            $diagnostics = [];
            if (! $conn->webhook_subscribed) {
                $diagnostics[] = 'Webhook is not subscribed.';
            }
            if ($conn->webhook_last_error) {
                $diagnostics[] = $conn->webhook_last_error;
                if (str_contains(strtolower($conn->webhook_last_error), 'oauth') || str_contains(strtolower($conn->webhook_last_error), 'token')) {
                    \App\Models\AppNotification::firstOrCreate(
                        [
                            'scope' => 'platform',
                            'type' => 'expired_waba_token',
                            'account_id' => $conn->account_id,
                            'title' => 'Possible expired WABA token',
                        ],
                        [
                            'severity' => 'critical',
                            'body' => "Connection {$conn->name}: {$conn->webhook_last_error}",
                            'action_url' => route('platform.system-health'),
                            'data' => ['connection_id' => $conn->id],
                        ]
                    );
                }
            }
            if (! $lastReceived) {
                $diagnostics[] = 'No inbound webhook has been received yet.';
            } elseif (! $lastReceived->isAfter(now()->subHours(24))) {
                $diagnostics[] = 'No inbound webhook activity in the last 24 hours.';
            }

            return [
                'id' => $conn->id,
                'name' => $conn->name,
                'account_id' => $conn->account_id,
                'waba_id' => $conn->waba_id,
                'phone_number_id' => $conn->phone_number_id,
                'quality_rating' => $conn->quality_rating,
                'phone_number_status' => $conn->phone_number_status,
                'is_active' => $conn->is_active,
                'webhook_subscribed' => $conn->webhook_subscribed,
                'has_error' => ! empty($conn->webhook_last_error),
                'last_received_at' => $conn->webhook_last_received_at?->toIso8601String(),
                'last_error' => $conn->webhook_last_error,
                'webhook_age_minutes' => $webhookAgeMinutes,
                'diagnostics' => $diagnostics,
                'is_healthy' => $isHealthy];
        });

        // Queue Status
        $queueStatus = [
            'driver' => config('queue.default'),
            'connection' => config('queue.connections.'.config('queue.default').'.connection'),
            'required_queues' => ['default', 'chatbots', 'campaigns'],
            'recommended_worker' => 'php artisan queue:work --queue=default,chatbots,campaigns --sleep=1 --tries=3 --timeout=120',
        ];

        // Try to get queue size (if supported)
        try {
            if (config('queue.default') === 'database') {
                $queueStatus['pending_jobs'] = DB::table('jobs')->count();
                $queueStatus['pending_by_queue'] = DB::table('jobs')
                    ->selectRaw('queue, count(*) as count')
                    ->groupBy('queue')
                    ->orderBy('queue')
                    ->get()
                    ->map(fn ($row) => [
                        'queue' => $row->queue,
                        'count' => (int) $row->count,
                    ])
                    ->values()
                    ->all();
                $queueStatus['failed_jobs'] = DB::table('failed_jobs')->count();
                $queueStatus['oldest_pending_at'] = DB::table('jobs')
                    ->min('created_at');
                $pendingQueueNames = collect($queueStatus['pending_by_queue'])->pluck('queue')->all();
                $queueStatus['pending_required_queues'] = array_values(array_intersect(
                    $queueStatus['required_queues'],
                    $pendingQueueNames
                ));
            } else {
                $queueStatus['pending_jobs'] = null;
                $queueStatus['pending_by_queue'] = [];
                $queueStatus['failed_jobs'] = DB::table('failed_jobs')->count();
                $queueStatus['oldest_pending_at'] = null;
                $queueStatus['pending_required_queues'] = [];
            }
        } catch (\Exception $e) {
            $queueStatus['pending_jobs'] = null;
            $queueStatus['pending_by_queue'] = [];
            $queueStatus['failed_jobs'] = null;
            $queueStatus['oldest_pending_at'] = null;
            $queueStatus['pending_required_queues'] = [];
        }

        $queueStatus['cron'] = [
            'last_status' => PlatformSetting::get('system.external_cron_last_status'),
            'last_run_at' => PlatformSetting::get('system.external_cron_last_run_at'),
            'last_error' => PlatformSetting::get('system.external_cron_last_error'),
            'last_summary' => PlatformSetting::get('system.external_cron_last_summary', []),
            'external_url_configured' => (string) PlatformSetting::get('system.external_cron_token', '') !== '',
        ];

        $campaignHealth = [
            'sending' => Campaign::where('status', 'sending')->count(),
            'scheduled_due' => Campaign::where('status', 'scheduled')
                ->whereNotNull('scheduled_at')
                ->where('scheduled_at', '<=', now())
                ->count(),
            'scheduled_future' => Campaign::where('status', 'scheduled')
                ->where(function ($query) {
                    $query->whereNull('scheduled_at')
                        ->orWhere('scheduled_at', '>', now());
                })
                ->count(),
            'stalled_sending' => Campaign::where('status', 'sending')
                ->whereHas('recipients', fn ($query) => $query->whereIn('status', ['pending', 'sending']))
                ->where('updated_at', '<=', now()->subMinutes(2))
                ->count(),
            'pending_recipients' => DB::table('campaign_recipients')->where('status', 'pending')->count(),
            'failed_recipients' => DB::table('campaign_recipients')->where('status', 'failed')->count(),
            'latest_campaign_activity_at' => Campaign::max('updated_at'),
        ];

        // Storage Status
        $storageStatus = [
            'public_available' => Storage::disk('public')->exists('.'),
            'public_writable' => is_writable(Storage::disk('public')->path('.'))];

        try {
            $storageStatus['public_size'] = $this->getDirectorySize(Storage::disk('public')->path('.'));
        } catch (\Exception $e) {
            $storageStatus['public_size'] = null;
        }

        // Database Status
        try {
            DB::connection()->getPdo();
            $databaseStatus = [
                'connected' => true,
                'driver' => config('database.default'),
                'connection' => config('database.connections.'.config('database.default').'.database')];
        } catch (\Exception $e) {
            $databaseStatus = [
                'connected' => false,
                'error' => $e->getMessage()];
        }

        // Recent Errors (from failed_jobs)
        $recentErrors = DB::table('failed_jobs')
            ->orderBy('failed_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($job) {
                return [
                    'id' => $job->id,
                    'uuid' => $job->uuid ?? null,
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'payload' => json_decode($job->payload, true),
                    'exception' => $job->exception,
                    'exception_summary' => str($job->exception)->before("\n")->limit(220)->toString(),
                    'failed_at' => $job->failed_at];
            });

        return Inertia::render('Platform/SystemHealth', [
            'webhook_health' => $webhookHealth,
            'webhook_event_health' => $webhookEventHealth,
            'recent_webhook_events' => $recentWebhookEvents,
            'connection_details' => $connectionDetails,
            'queue_status' => $queueStatus,
            'campaign_health' => $campaignHealth,
            'storage_status' => $storageStatus,
            'database_status' => $databaseStatus,
            'recent_errors' => $recentErrors,
            'integration_sync_logs' => AccountIntegrationSyncLog::with('account')
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (AccountIntegrationSyncLog $log) => [
                    'id' => $log->id,
                    'account' => $log->account?->name ?? 'Workspace #'.$log->account_id,
                    'provider' => $log->provider,
                    'status' => $log->status,
                    'trigger' => $log->trigger,
                    'started_at' => $log->started_at?->toIso8601String(),
                    'duration_ms' => $log->duration_ms,
                    'created_count' => $log->created_count,
                    'updated_count' => $log->updated_count,
                    'error_count' => $log->error_count,
                    'error_message' => $log->error_message,
                ])
                ->values()]);
    }

    public function recoverCampaigns(Request $request)
    {
        $result = $this->campaignService->recoverStalledCampaigns(50);

        $count = count($result['started_scheduled'] ?? [])
            + count($result['requeued_sending'] ?? [])
            + count($result['completed'] ?? []);

        return redirect()
            ->route('platform.system-health')
            ->with($count > 0 ? 'success' : 'info', $count > 0
                ? "Campaign recovery processed {$count} campaign(s)."
                : 'No due or stalled campaigns needed recovery.');
    }

    public function replayWebhookEvent(Request $request, int $event, WebhookProcessor $processor)
    {
        try {
            $processor->replayWebhookEvent($event);

            return redirect()
                ->route('platform.system-health')
                ->with('success', 'Webhook event replayed.');
        } catch (\Throwable $e) {
            return redirect()
                ->route('platform.system-health')
                ->withErrors(['error' => 'Webhook replay failed: '.$e->getMessage()]);
        }
    }

    public function runQueueOnce(Request $request)
    {
        Artisan::call('queue:work', [
            '--queue' => 'default,chatbots,campaigns',
            '--sleep' => 1,
            '--tries' => 3,
            '--timeout' => 120,
            '--stop-when-empty' => true,
            '--no-interaction' => true,
        ]);

        return redirect()
            ->route('platform.system-health')
            ->with('success', 'Queue worker ran once. '.mb_substr(trim(Artisan::output()), -300));
    }

    public function retryFailedJob(Request $request, string $failedJob)
    {
        $job = $this->findFailedJob($failedJob);
        $identifier = $job->uuid ?: (string) $job->id;

        Artisan::call('queue:retry', ['id' => [$identifier], '--no-interaction' => true]);

        return redirect()
            ->route('platform.system-health')
            ->with('success', 'Failed job queued for retry.');
    }

    public function forgetFailedJob(Request $request, string $failedJob)
    {
        $job = $this->findFailedJob($failedJob);
        $identifier = $job->uuid ?: (string) $job->id;

        $exitCode = Artisan::call('queue:forget', ['id' => $identifier, '--no-interaction' => true]);
        if ($exitCode !== 0 && DB::table('failed_jobs')->where('id', $job->id)->exists()) {
            DB::table('failed_jobs')->where('id', $job->id)->delete();
        }

        return redirect()
            ->route('platform.system-health')
            ->with('success', 'Failed job removed.');
    }

    public function retryAllFailedJobs(Request $request)
    {
        $count = DB::table('failed_jobs')->count();
        Artisan::call('queue:retry', ['id' => ['all'], '--no-interaction' => true]);

        return redirect()
            ->route('platform.system-health')
            ->with($count > 0 ? 'success' : 'info', $count > 0 ? "Queued {$count} failed job(s) for retry." : 'No failed jobs to retry.');
    }

    public function flushFailedJobs(Request $request)
    {
        $count = DB::table('failed_jobs')->count();
        Artisan::call('queue:flush', ['--no-interaction' => true]);

        return redirect()
            ->route('platform.system-health')
            ->with($count > 0 ? 'success' : 'info', $count > 0 ? "Removed {$count} failed job(s)." : 'No failed jobs to flush.');
    }

    /**
     * Get directory size in bytes.
     */
    private function getDirectorySize(string $directory): int
    {
        $size = 0;
        foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($directory)) as $file) {
            if ($file->isFile()) {
                $size += $file->getSize();
            }
        }

        return $size;
    }

    private function findFailedJob(string $failedJob): object
    {
        $query = DB::table('failed_jobs');

        if (is_numeric($failedJob)) {
            $query->where('id', (int) $failedJob);
        } else {
            $query->where('uuid', $failedJob);
        }

        $job = $query->first();
        abort_unless($job, 404);

        return $job;
    }
}
