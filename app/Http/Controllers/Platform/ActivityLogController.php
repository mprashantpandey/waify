<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\BillingEvent;
use App\Models\DestructiveAuditLog;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs.
     */
    public function index(Request $request)
    {
        $filters = $request->validate([
            'scope' => ['nullable', 'in:all,destructive,system,billing,webhook'],
            'type' => ['nullable', 'string', 'max:120'],
            'account_id' => ['nullable', 'integer'],
            'actor_id' => ['nullable', 'integer'],
            'action' => ['nullable', 'string', 'max:120'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'export' => ['nullable', 'in:csv'],
        ]);

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
                    'id' => 'webhook_'.$conn->id,
                    'scope' => 'webhook',
                    'type' => $conn->webhook_last_error ? 'webhook_error' : 'webhook_success',
                    'description' => $conn->webhook_last_error
                        ? "Webhook error for connection: {$conn->name}"
                        : "Webhook received for connection: {$conn->name}",
                    'account_id' => $conn->account_id,
                    'actor_id' => null,
                    'action' => null,
                    'metadata' => [
                        'connection_id' => $conn->id,
                        'connection_name' => $conn->name,
                        'error' => $conn->webhook_last_error,
                        'last_received_at' => $conn->webhook_last_received_at?->toIso8601String()],
                    'created_at' => $conn->webhook_last_received_at ?? $conn->updated_at];
            });

        // Failed jobs
        $failedJobLogs = DB::table('failed_jobs')
            ->orderBy('failed_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($job) {
                $payload = json_decode($job->payload, true);

                return [
                    'id' => 'failed_job_'.$job->id,
                    'scope' => 'system',
                    'type' => 'system_error',
                    'description' => 'Failed job: '.($payload['displayName'] ?? $payload['job'] ?? 'Unknown'),
                    'account_id' => null,
                    'actor_id' => null,
                    'action' => null,
                    'metadata' => [
                        'queue' => $job->queue,
                        'connection' => $job->connection,
                        'exception' => substr($job->exception, 0, 200)],
                    'created_at' => $job->failed_at];
            });

        // Account status changes (from account updates)
        $accountLogs = Account::whereNotNull('disabled_at')
            ->orWhereNotNull('disabled_reason')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => 'account_'.$account->id,
                    'scope' => 'system',
                    'type' => 'account_status_change',
                    'description' => "Account '{$account->name}' status changed to: {$account->status}",
                    'account_id' => $account->id,
                    'actor_id' => null,
                    'action' => 'account_status_change',
                    'metadata' => [
                        'account_id' => $account->id,
                        'account_name' => $account->name,
                        'status' => $account->status,
                        'disabled_reason' => $account->disabled_reason,
                        'disabled_at' => $account->disabled_at?->toIso8601String()],
                    'created_at' => $account->disabled_at ?? $account->updated_at];
            });

        $billingLogs = BillingEvent::with(['account:id,name', 'actor:id,name,email'])
            ->latest()
            ->limit(150)
            ->get()
            ->map(function (BillingEvent $event) {
                $label = $event->data['label'] ?? str($event->type)->replace('_', ' ')->headline()->toString();

                return [
                    'id' => 'billing_'.$event->id,
                    'scope' => 'billing',
                    'type' => 'billing_'.$event->type,
                    'description' => $label.' for '.($event->account?->name ?? 'workspace #'.$event->account_id),
                    'account_id' => $event->account_id,
                    'actor_id' => $event->actor_id,
                    'action' => $event->type,
                    'metadata' => [
                        'actor' => $event->actor ? $event->actor->name.' <'.$event->actor->email.'>' : null,
                        ...($event->data ?: []),
                    ],
                    'created_at' => $event->created_at,
                ];
            });

        $destructiveLogs = DestructiveAuditLog::with(['account:id,name', 'actor:id,name,email'])
            ->latest()
            ->limit(150)
            ->get()
            ->map(fn (DestructiveAuditLog $log) => [
                'id' => 'destructive_'.$log->id,
                'scope' => 'destructive',
                'type' => 'audit_'.$log->action,
                'action' => $log->action,
                'description' => $log->description,
                'account_id' => $log->account_id,
                'actor_id' => $log->actor_id,
                'metadata' => [
                    'actor' => $log->actor ? $log->actor->name.' <'.$log->actor->email.'>' : null,
                    'ip_address' => $log->ip_address,
                    'auditable_type' => $log->auditable_type,
                    'auditable_id' => $log->auditable_id,
                    ...($log->data ?: []),
                ],
                'created_at' => $log->created_at,
            ]);

        // Combine and sort
        $allLogs = $webhookLogs->concat($failedJobLogs)->concat($accountLogs)->concat($billingLogs)->concat($destructiveLogs)
            ->sortByDesc('created_at')
            ->values();

        // Apply filters
        if (($filters['scope'] ?? 'all') !== 'all' && ! empty($filters['scope'])) {
            $allLogs = $allLogs->filter(fn ($log) => ($log['scope'] ?? null) === $filters['scope']);
        }

        if (! empty($filters['type'])) {
            $allLogs = $allLogs->filter(fn ($log) => $log['type'] === $filters['type']);
        }

        if (! empty($filters['account_id'])) {
            $allLogs = $allLogs->filter(fn ($log) => $log['account_id'] == $filters['account_id']);
        }

        if (! empty($filters['actor_id'])) {
            $allLogs = $allLogs->filter(fn ($log) => ($log['actor_id'] ?? null) == $filters['actor_id']);
        }

        if (! empty($filters['action'])) {
            $allLogs = $allLogs->filter(fn ($log) => ($log['action'] ?? null) === $filters['action']);
        }

        if (! empty($filters['date_from'])) {
            $from = \Carbon\Carbon::parse($filters['date_from'])->startOfDay();
            $allLogs = $allLogs->filter(fn ($log) => \Carbon\Carbon::parse($log['created_at'])->greaterThanOrEqualTo($from));
        }

        if (! empty($filters['date_to'])) {
            $to = \Carbon\Carbon::parse($filters['date_to'])->endOfDay();
            $allLogs = $allLogs->filter(fn ($log) => \Carbon\Carbon::parse($log['created_at'])->lessThanOrEqualTo($to));
        }

        if (($filters['export'] ?? null) === 'csv') {
            return response()->streamDownload(function () use ($allLogs) {
                $handle = fopen('php://output', 'w');
                fputcsv($handle, ['time', 'scope', 'type', 'action', 'workspace_id', 'actor_id', 'description']);
                foreach ($allLogs as $log) {
                    fputcsv($handle, [
                        \Carbon\Carbon::parse($log['created_at'])->toDateTimeString(),
                        $log['scope'] ?? '',
                        $log['type'] ?? '',
                        $log['action'] ?? '',
                        $log['account_id'] ?? '',
                        $log['actor_id'] ?? '',
                        $log['description'] ?? '',
                    ]);
                }
                fclose($handle);
            }, 'platform-audit-logs-'.now()->format('Ymd-His').'.csv');
        }

        // Paginate manually
        $page = $request->get('page', 1);
        $perPage = 50;
        $total = $allLogs->count();
        $paginatedLogs = $allLogs->slice(($page - 1) * $perPage, $perPage)->values();

        // Get filter options
        $types = $allLogs->pluck('type')->unique()->values()->toArray();
        $actions = $allLogs->pluck('action')->filter()->unique()->values()->toArray();
        $accounts = Account::select('id', 'name')->get();
        $actors = User::query()
            ->whereIn('id', $allLogs->pluck('actor_id')->filter()->unique()->values())
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('Platform/ActivityLogs', [
            'logs' => [
                'data' => $paginatedLogs,
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total],
            'filters' => [
                'scope' => $filters['scope'] ?? 'all',
                'type' => $filters['type'] ?? null,
                'account_id' => $filters['account_id'] ?? null,
                'actor_id' => $filters['actor_id'] ?? null,
                'action' => $filters['action'] ?? null,
                'date_from' => $filters['date_from'] ?? null,
                'date_to' => $filters['date_to'] ?? null],
            'filter_options' => [
                'types' => $types,
                'actions' => $actions,
                'accounts' => $accounts,
                'actors' => $actors],
            'audit_stats' => [
                'destructive' => $allLogs->where('scope', 'destructive')->count(),
                'with_actor' => $allLogs->whereNotNull('actor_id')->count(),
            ],
        ]);
    }
}
