<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
    public function __construct(
        protected WebhookProcessor $webhookProcessor
    ) {
    }

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

        // Connection details with health status
        $connectionDetails = $connections->map(function ($conn) {
            $isHealthy = $conn->webhook_subscribed && 
                        !$conn->webhook_last_error &&
                        $conn->webhook_last_received_at &&
                        $conn->webhook_last_received_at->isAfter(now()->subHours(24));
            
            return [
                'id' => $conn->id,
                'name' => $conn->name,
                'account_id' => $conn->account_id,
                'is_active' => $conn->is_active,
                'webhook_subscribed' => $conn->webhook_subscribed,
                'has_error' => !empty($conn->webhook_last_error),
                'last_received_at' => $conn->webhook_last_received_at?->toIso8601String(),
                'last_error' => $conn->webhook_last_error,
                'is_healthy' => $isHealthy];
        });

        // Queue Status
        $queueStatus = [
            'driver' => config('queue.default'),
            'connection' => config('queue.connections.' . config('queue.default') . '.connection'),
            'pending_by_queue' => [],
            'failed_by_queue' => [],
        ];

        // Try to get queue size (if supported)
        try {
            if (config('queue.default') === 'database') {
                $queueStatus['pending_jobs'] = DB::table('jobs')->count();
                $queueStatus['failed_jobs'] = DB::table('failed_jobs')->count();
                $queueStatus['pending_by_queue'] = DB::table('jobs')
                    ->select('queue', DB::raw('count(*) as total'))
                    ->groupBy('queue')
                    ->orderByDesc('total')
                    ->get()
                    ->mapWithKeys(fn ($row) => [(string) ($row->queue ?: 'default') => (int) $row->total])
                    ->toArray();
                $queueStatus['failed_by_queue'] = DB::table('failed_jobs')
                    ->select('queue', DB::raw('count(*) as total'))
                    ->groupBy('queue')
                    ->orderByDesc('total')
                    ->get()
                    ->mapWithKeys(fn ($row) => [(string) ($row->queue ?: 'default') => (int) $row->total])
                    ->toArray();
            } else {
                $queueStatus['pending_jobs'] = null;
                $queueStatus['failed_jobs'] = DB::table('failed_jobs')->count();
                $queueStatus['failed_by_queue'] = DB::table('failed_jobs')
                    ->select('queue', DB::raw('count(*) as total'))
                    ->groupBy('queue')
                    ->orderByDesc('total')
                    ->get()
                    ->mapWithKeys(fn ($row) => [(string) ($row->queue ?: 'default') => (int) $row->total])
                    ->toArray();
            }
        } catch (\Exception $e) {
            $queueStatus['pending_jobs'] = null;
            $queueStatus['failed_jobs'] = null;
        }

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
                'connection' => config('database.connections.' . config('database.default') . '.database')];
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
                    'connection' => $job->connection,
                    'queue' => $job->queue,
                    'payload' => json_decode($job->payload, true),
                    'exception' => $job->exception,
                    'failed_at' => $job->failed_at];
            });

        $recentWebhookEvents = collect();
        if (DB::getSchemaBuilder()->hasTable('whatsapp_webhook_events')) {
            $recentWebhookEvents = WhatsAppWebhookEvent::query()
                ->with('connection:id,name,slug')
                ->orderByDesc('created_at')
                ->limit(20)
                ->get()
                ->map(function (WhatsAppWebhookEvent $event) {
                    return [
                        'id' => $event->id,
                        'status' => $event->status,
                        'correlation_id' => $event->correlation_id,
                        'connection_id' => $event->whatsapp_connection_id,
                        'connection_name' => $event->connection?->name,
                        'payload_size' => (int) $event->payload_size,
                        'replay_count' => (int) $event->replay_count,
                        'error_message' => $event->error_message,
                        'processed_at' => $event->processed_at?->toIso8601String(),
                        'last_replayed_at' => $event->last_replayed_at?->toIso8601String(),
                        'created_at' => $event->created_at?->toIso8601String(),
                    ];
                });
        }

        return Inertia::render('Platform/SystemHealth', [
            'webhook_health' => $webhookHealth,
            'connection_details' => $connectionDetails,
            'queue_status' => $queueStatus,
            'storage_status' => $storageStatus,
            'database_status' => $databaseStatus,
            'recent_errors' => $recentErrors,
            'recent_webhook_events' => $recentWebhookEvents]);
    }

    public function retryFailedJob(Request $request, string $id): RedirectResponse
    {
        if (!DB::getSchemaBuilder()->hasTable('failed_jobs')) {
            return back()->withErrors(['error' => 'Failed jobs table is not available.']);
        }

        $exists = DB::table('failed_jobs')->where('id', $id)->exists();
        if (!$exists) {
            return back()->withErrors(['error' => 'Failed job not found.']);
        }

        Artisan::call('queue:retry', ['id' => [$id]]);

        return back()->with('success', 'Failed job queued for retry.');
    }

    public function retryAllFailedJobs(Request $request): RedirectResponse
    {
        if (!DB::getSchemaBuilder()->hasTable('failed_jobs')) {
            return back()->withErrors(['error' => 'Failed jobs table is not available.']);
        }

        $count = (int) DB::table('failed_jobs')->count();
        if ($count === 0) {
            return back()->with('success', 'No failed jobs to retry.');
        }

        Artisan::call('queue:retry', ['id' => ['all']]);

        return back()->with('success', "Queued {$count} failed job(s) for retry.");
    }

    public function forgetFailedJob(Request $request, string $id): RedirectResponse
    {
        if (!DB::getSchemaBuilder()->hasTable('failed_jobs')) {
            return back()->withErrors(['error' => 'Failed jobs table is not available.']);
        }

        $deleted = DB::table('failed_jobs')->where('id', $id)->delete();
        if ($deleted === 0) {
            return back()->withErrors(['error' => 'Failed job not found.']);
        }

        return back()->with('success', 'Failed job removed.');
    }

    public function clearWebhookError(Request $request, WhatsAppConnection $connection): RedirectResponse
    {
        $connection->update([
            'webhook_last_error' => null,
        ]);

        return back()->with('success', 'Webhook error cleared for connection.');
    }

    public function replayWebhookEvent(Request $request, string $id): RedirectResponse
    {
        if (!DB::getSchemaBuilder()->hasTable('whatsapp_webhook_events')) {
            return back()->withErrors(['error' => 'Webhook events table is not available.']);
        }

        $lock = Cache::lock('webhook-event-replay:'.$id, 30);
        if (! $lock->get()) {
            return back()->withErrors(['error' => 'Replay already in progress for this event.']);
        }

        /** @var WhatsAppWebhookEvent|null $event */
        $event = WhatsAppWebhookEvent::query()->find($id);
        if (!$event) {
            optional($lock)->release();
            return back()->withErrors(['error' => 'Webhook event not found.']);
        }

        $connection = WhatsAppConnection::query()->find($event->whatsapp_connection_id);
        if (!$connection) {
            optional($lock)->release();
            return back()->withErrors(['error' => 'Webhook connection not found for replay.']);
        }

        $payload = $event->payload;
        if (!is_array($payload) || empty($payload)) {
            optional($lock)->release();
            return back()->withErrors(['error' => 'Webhook payload is missing or invalid.']);
        }

        if ((int) $event->payload_size > (2 * 1024 * 1024)) {
            optional($lock)->release();
            return back()->withErrors(['error' => 'Webhook payload is too large to replay safely.']);
        }

        if ((int) $event->replay_count >= 10) {
            optional($lock)->release();
            return back()->withErrors(['error' => 'Replay limit reached for this webhook event.']);
        }

        $force = $request->boolean('force', false);
        if (!$force && $event->status === 'processed') {
            optional($lock)->release();
            return back()->withErrors(['error' => 'This event is already processed. Use force replay if required.']);
        }

        $replayCorrelationId = ($event->correlation_id ?: 'wh_replay_'.$event->id).'-replay-'.now()->timestamp;
        try {
            $this->webhookProcessor->process($payload, $connection, $replayCorrelationId);
            $event->update([
                'status' => 'processed',
                'processed_at' => now(),
                'error_message' => null,
                'replay_count' => (int) $event->replay_count + 1,
                'last_replayed_at' => now(),
            ]);

            optional($lock)->release();
            return back()->with('success', 'Webhook event replayed successfully.');
        } catch (\Throwable $e) {
            $event->update([
                'status' => 'failed',
                'processed_at' => now(),
                'error_message' => mb_substr($e->getMessage(), 0, 2000),
                'replay_count' => (int) $event->replay_count + 1,
                'last_replayed_at' => now(),
            ]);

            optional($lock)->release();
            return back()->withErrors(['error' => 'Webhook replay failed: '.$e->getMessage()]);
        }
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
}
