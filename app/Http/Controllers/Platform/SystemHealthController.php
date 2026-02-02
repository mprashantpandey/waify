<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Http\Request;
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
            })->count(),
        ];

        // Connection details with health status
        $connectionDetails = $connections->map(function ($conn) {
            $isHealthy = $conn->webhook_subscribed && 
                        !$conn->webhook_last_error &&
                        $conn->webhook_last_received_at &&
                        $conn->webhook_last_received_at->isAfter(now()->subHours(24));
            
            return [
                'id' => $conn->id,
                'name' => $conn->name,
                'workspace_id' => $conn->workspace_id,
                'is_active' => $conn->is_active,
                'webhook_subscribed' => $conn->webhook_subscribed,
                'has_error' => !empty($conn->webhook_last_error),
                'last_received_at' => $conn->webhook_last_received_at?->toIso8601String(),
                'last_error' => $conn->webhook_last_error,
                'is_healthy' => $isHealthy,
            ];
        });

        // Queue Status
        $queueStatus = [
            'driver' => config('queue.default'),
            'connection' => config('queue.connections.' . config('queue.default') . '.connection'),
        ];

        // Try to get queue size (if supported)
        try {
            if (config('queue.default') === 'database') {
                $queueStatus['pending_jobs'] = DB::table('jobs')->count();
                $queueStatus['failed_jobs'] = DB::table('failed_jobs')->count();
            } else {
                $queueStatus['pending_jobs'] = null;
                $queueStatus['failed_jobs'] = DB::table('failed_jobs')->count();
            }
        } catch (\Exception $e) {
            $queueStatus['pending_jobs'] = null;
            $queueStatus['failed_jobs'] = null;
        }

        // Storage Status
        $storageStatus = [
            'public_available' => Storage::disk('public')->exists('.'),
            'public_writable' => is_writable(Storage::disk('public')->path('.')),
        ];

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
                'connection' => config('database.connections.' . config('database.default') . '.database'),
            ];
        } catch (\Exception $e) {
            $databaseStatus = [
                'connected' => false,
                'error' => $e->getMessage(),
            ];
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
                    'failed_at' => $job->failed_at,
                ];
            });

        return Inertia::render('Platform/SystemHealth', [
            'webhook_health' => $webhookHealth,
            'connection_details' => $connectionDetails,
            'queue_status' => $queueStatus,
            'storage_status' => $storageStatus,
            'database_status' => $databaseStatus,
            'recent_errors' => $recentErrors,
        ]);
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

