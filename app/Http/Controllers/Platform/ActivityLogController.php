<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs.
     */
    public function index(Request $request): Response
    {
        // For now, we'll aggregate logs from multiple sources
        // In the future, this can be replaced with a dedicated activity_logs table
        
        $logs = collect();

        // Webhook events (from connections with errors or recent activity)
        $webhookLogs = WhatsAppConnection::where(function ($query) {
            $query->whereNotNull('webhook_last_error')
                ->orWhereNotNull('webhook_last_received_at');
        })
            ->get()
            ->map(function ($conn) {
                return [
                    'id' => 'webhook_' . $conn->id,
                    'type' => $conn->webhook_last_error ? 'webhook_error' : 'webhook_success',
                    'description' => $conn->webhook_last_error 
                        ? "Webhook error for connection: {$conn->name}" 
                        : "Webhook received for connection: {$conn->name}",
                    'workspace_id' => $conn->workspace_id,
                    'metadata' => [
                        'connection_id' => $conn->id,
                        'connection_name' => $conn->name,
                        'error' => $conn->webhook_last_error,
                        'last_received_at' => $conn->webhook_last_received_at?->toIso8601String(),
                    ],
                    'created_at' => $conn->webhook_last_received_at ?? $conn->updated_at,
                ];
            });

        // Failed jobs
        $failedJobLogs = DB::table('failed_jobs')
            ->orderBy('failed_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($job) {
                $payload = json_decode($job->payload, true);
                return [
                    'id' => 'failed_job_' . $job->id,
                    'type' => 'system_error',
                    'description' => "Failed job: " . ($payload['displayName'] ?? $payload['job'] ?? 'Unknown'),
                    'workspace_id' => null,
                    'metadata' => [
                        'queue' => $job->queue,
                        'connection' => $job->connection,
                        'exception' => substr($job->exception, 0, 200),
                    ],
                    'created_at' => $job->failed_at,
                ];
            });

        // Workspace status changes (from workspace updates)
        $workspaceLogs = Workspace::whereNotNull('disabled_at')
            ->orWhereNotNull('disabled_reason')
            ->get()
            ->map(function ($workspace) {
                return [
                    'id' => 'workspace_' . $workspace->id,
                    'type' => 'workspace_status_change',
                    'description' => "Workspace '{$workspace->name}' status changed to: {$workspace->status}",
                    'workspace_id' => $workspace->id,
                    'metadata' => [
                        'workspace_id' => $workspace->id,
                        'workspace_name' => $workspace->name,
                        'status' => $workspace->status,
                        'disabled_reason' => $workspace->disabled_reason,
                        'disabled_at' => $workspace->disabled_at?->toIso8601String(),
                    ],
                    'created_at' => $workspace->disabled_at ?? $workspace->updated_at,
                ];
            });

        // Combine and sort
        $allLogs = $webhookLogs->concat($failedJobLogs)->concat($workspaceLogs)
            ->sortByDesc('created_at')
            ->values();

        // Apply filters
        if ($request->has('type') && $request->type) {
            $allLogs = $allLogs->filter(fn($log) => $log['type'] === $request->type);
        }

        if ($request->has('workspace_id') && $request->workspace_id) {
            $allLogs = $allLogs->filter(fn($log) => $log['workspace_id'] == $request->workspace_id);
        }

        // Paginate manually
        $page = $request->get('page', 1);
        $perPage = 50;
        $total = $allLogs->count();
        $paginatedLogs = $allLogs->slice(($page - 1) * $perPage, $perPage)->values();

        // Get filter options
        $types = $allLogs->pluck('type')->unique()->values()->toArray();
        $workspaces = Workspace::select('id', 'name')->get();

        return Inertia::render('Platform/ActivityLogs', [
            'logs' => [
                'data' => $paginatedLogs,
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
            'filters' => [
                'type' => $request->type,
                'workspace_id' => $request->workspace_id,
            ],
            'filter_options' => [
                'types' => $types,
                'workspaces' => $workspaces,
            ],
        ]);
    }
}

