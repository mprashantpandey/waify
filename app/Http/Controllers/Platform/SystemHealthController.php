<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemHealthController extends Controller
{
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

        return Inertia::render('Platform/SystemHealth', [
            'webhook_health' => $webhookHealth,
            'connection_details' => $connectionDetails,
            'queue_status' => $queueStatus,
            'storage_status' => $storageStatus,
            'database_status' => $databaseStatus,
            'recent_errors' => $recentErrors]);
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
