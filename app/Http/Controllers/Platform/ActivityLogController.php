<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\ActivityLogSavedView;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use App\Models\Account;
use App\Models\OperationalAlertEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'type' => trim((string) $request->query('type', '')),
            'account_id' => (int) $request->query('account_id', 0),
            'correlation_id' => trim((string) $request->query('correlation_id', '')),
            'entity_type' => trim((string) $request->query('entity_type', '')),
            'entity_id' => (int) $request->query('entity_id', 0),
            'q' => trim((string) $request->query('q', '')),
        ];

        $allLogs = $this->collectLogs();
        $allLogs = $this->applyFilters($allLogs, $filters);

        $page = max((int) $request->get('page', 1), 1);
        $perPage = 50;
        $total = $allLogs->count();
        $paginatedLogs = $allLogs->slice(($page - 1) * $perPage, $perPage)->values();

        $types = $allLogs->pluck('type')->filter()->unique()->values()->toArray();
        $entityTypes = $allLogs->pluck('entity_type')->filter()->unique()->values()->toArray();
        $accounts = Account::select('id', 'name')->orderBy('name')->get();
        $savedViews = $this->querySavedViews((int) ($request->user()?->id ?? 0));

        return Inertia::render('Platform/ActivityLogs', [
            'logs' => [
                'data' => $paginatedLogs,
                'current_page' => $page,
                'last_page' => (int) ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
            'filters' => $filters,
            'filter_options' => [
                'types' => $types,
                'entity_types' => $entityTypes,
                'accounts' => $accounts,
            ],
            'saved_views' => $savedViews,
            'can_manage_shared_views' => true,
        ]);
    }

    public function storeSavedView(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['nullable', 'in:preset,correlation'],
            'correlation_id' => ['nullable', 'string', 'max:255'],
            'filters' => ['nullable', 'array'],
            'is_shared' => ['nullable', 'boolean'],
        ]);

        ActivityLogSavedView::create([
            'user_id' => $request->user()?->id,
            'account_id' => null,
            'scope' => 'platform',
            'kind' => $validated['kind'] ?? 'preset',
            'name' => $validated['name'],
            'correlation_id' => trim((string) ($validated['correlation_id'] ?? '')) ?: null,
            'filters' => $validated['filters'] ?? [],
            'is_shared' => (bool) ($validated['is_shared'] ?? false),
        ]);

        return back()->with('success', 'Saved view created.');
    }

    public function deleteSavedView(Request $request, ActivityLogSavedView $savedView): RedirectResponse
    {
        abort_unless($savedView->scope === 'platform', 404);
        $userId = (int) ($request->user()?->id ?? 0);
        abort_unless((int) ($savedView->user_id ?? 0) === $userId || is_super_admin(), 403);

        $savedView->delete();

        return back()->with('success', 'Saved view deleted.');
    }

    public function updateSavedView(Request $request, ActivityLogSavedView $savedView): RedirectResponse
    {
        abort_unless($savedView->scope === 'platform', 404);
        $userId = (int) ($request->user()?->id ?? 0);
        abort_unless((int) ($savedView->user_id ?? 0) === $userId || is_super_admin(), 403);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'is_shared' => ['sometimes', 'boolean'],
            'kind' => ['sometimes', Rule::in(['preset', 'correlation'])],
            'correlation_id' => ['nullable', 'string', 'max:255'],
            'filters' => ['nullable', 'array'],
        ]);

        $savedView->fill([
            'name' => $validated['name'] ?? $savedView->name,
            'kind' => $validated['kind'] ?? $savedView->kind,
            'correlation_id' => array_key_exists('correlation_id', $validated)
                ? (trim((string) ($validated['correlation_id'] ?? '')) ?: null)
                : $savedView->correlation_id,
            'filters' => $validated['filters'] ?? $savedView->filters,
            'is_shared' => array_key_exists('is_shared', $validated) ? (bool) $validated['is_shared'] : (bool) $savedView->is_shared,
        ])->save();

        return back()->with('success', 'Saved view updated.');
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = [
            'type' => trim((string) $request->query('type', '')),
            'account_id' => (int) $request->query('account_id', 0),
            'correlation_id' => trim((string) $request->query('correlation_id', '')),
            'entity_type' => trim((string) $request->query('entity_type', '')),
            'entity_id' => (int) $request->query('entity_id', 0),
            'q' => trim((string) $request->query('q', '')),
        ];

        $logs = $this->applyFilters($this->collectLogs(), $filters);
        $filename = 'platform-activity-logs-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'type', 'description', 'account_id', 'entity_type', 'entity_id', 'correlation_id', 'created_at', 'metadata']);
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log['id'] ?? '',
                    $log['type'] ?? '',
                    $log['description'] ?? '',
                    $log['account_id'] ?? '',
                    $log['entity_type'] ?? '',
                    $log['entity_id'] ?? '',
                    $log['correlation_id'] ?? '',
                    $log['created_at'] ?? '',
                    json_encode($log['metadata'] ?? [], JSON_UNESCAPED_SLASHES),
                ]);
            }
            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    protected function collectLogs()
    {
        $logs = collect();

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
                    'account_id' => $conn->account_id,
                    'entity_type' => 'connection',
                    'entity_id' => (int) $conn->id,
                    'correlation_id' => null,
                    'metadata' => [
                        'connection_id' => $conn->id,
                        'connection_name' => $conn->name,
                        'error' => $conn->webhook_last_error,
                        'last_received_at' => $conn->webhook_last_received_at?->toIso8601String(),
                    ],
                    'created_at' => ($conn->webhook_last_received_at ?? $conn->updated_at)?->toIso8601String(),
                ];
            });

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
                    'account_id' => null,
                    'entity_type' => 'failed_job',
                    'entity_id' => (int) $job->id,
                    'correlation_id' => null,
                    'metadata' => [
                        'queue' => $job->queue,
                        'connection' => $job->connection,
                        'exception' => substr($job->exception, 0, 200),
                    ],
                    'created_at' => (string) $job->failed_at,
                ];
            });

        $accountLogs = Account::whereNotNull('disabled_at')
            ->orWhereNotNull('disabled_reason')
            ->get()
            ->map(function ($account) {
                return [
                    'id' => 'account_' . $account->id,
                    'type' => 'account_status_change',
                    'description' => "Account '{$account->name}' status changed to: {$account->status}",
                    'account_id' => $account->id,
                    'entity_type' => 'account',
                    'entity_id' => (int) $account->id,
                    'correlation_id' => null,
                    'metadata' => [
                        'account_id' => $account->id,
                        'account_name' => $account->name,
                        'status' => $account->status,
                        'disabled_reason' => $account->disabled_reason,
                        'disabled_at' => $account->disabled_at?->toIso8601String(),
                    ],
                    'created_at' => ($account->disabled_at ?? $account->updated_at)?->toIso8601String(),
                ];
            });

        $alertLogs = OperationalAlertEvent::query()
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(function (OperationalAlertEvent $event) {
                return [
                    'id' => 'alert_' . $event->id,
                    'type' => 'alert_' . ($event->severity ?: 'info'),
                    'description' => $event->title,
                    'account_id' => $event->account_id,
                    'entity_type' => 'alert',
                    'entity_id' => (int) $event->id,
                    'correlation_id' => $event->correlation_id,
                    'metadata' => [
                        'event_key' => $event->event_key,
                        'scope' => $event->scope,
                        'severity' => $event->severity,
                        'status' => $event->status,
                        'error_message' => $event->error_message,
                        'resolve_note' => $event->resolve_note,
                    ],
                    'created_at' => $event->created_at?->toIso8601String(),
                ];
            });

        $webhookEventLogs = collect();
        if (Schema::hasTable('whatsapp_webhook_events')) {
            $webhookEventLogs = WhatsAppWebhookEvent::query()
                ->latest('id')
                ->limit(200)
                ->get()
                ->map(function (WhatsAppWebhookEvent $event) {
                    return [
                        'id' => 'webhook_event_' . $event->id,
                        'type' => $event->status === 'failed' ? 'webhook_failed' : 'webhook_processed',
                        'description' => "Webhook {$event->event_type} ({$event->status})",
                        'account_id' => $event->account_id,
                        'entity_type' => 'webhook_event',
                        'entity_id' => (int) $event->id,
                        'correlation_id' => $event->correlation_id,
                        'metadata' => [
                            'event_type' => $event->event_type,
                            'object_type' => $event->object_type,
                            'status' => $event->status,
                            'connection_id' => $event->whatsapp_connection_id,
                            'signature_valid' => $event->signature_valid,
                            'error_message' => $event->error_message,
                            'retry_count' => $event->retry_count,
                        ],
                        'created_at' => $event->created_at?->toIso8601String(),
                    ];
                });
        }

        return $logs->concat($webhookLogs)
            ->concat($failedJobLogs)
            ->concat($accountLogs)
            ->concat($alertLogs)
            ->concat($webhookEventLogs)
            ->sortByDesc('created_at')
            ->values();
    }

    protected function applyFilters($logs, array $filters)
    {
        if (($filters['type'] ?? '') !== '') {
            $logs = $logs->filter(fn ($log) => (string) ($log['type'] ?? '') === $filters['type']);
        }

        if ((int) ($filters['account_id'] ?? 0) > 0) {
            $accountId = (int) $filters['account_id'];
            $logs = $logs->filter(fn ($log) => (int) ($log['account_id'] ?? 0) === $accountId);
        }

        if (($filters['correlation_id'] ?? '') !== '') {
            $needle = mb_strtolower((string) $filters['correlation_id']);
            $logs = $logs->filter(function ($log) use ($needle) {
                return str_contains(mb_strtolower((string) ($log['correlation_id'] ?? '')), $needle);
            });
        }

        if (($filters['entity_type'] ?? '') !== '') {
            $logs = $logs->filter(fn ($log) => (string) ($log['entity_type'] ?? '') === $filters['entity_type']);
        }

        if ((int) ($filters['entity_id'] ?? 0) > 0) {
            $entityId = (int) $filters['entity_id'];
            $logs = $logs->filter(fn ($log) => (int) ($log['entity_id'] ?? 0) === $entityId);
        }

        if (($filters['q'] ?? '') !== '') {
            $needle = mb_strtolower((string) $filters['q']);
            $logs = $logs->filter(function ($log) use ($needle) {
                $description = mb_strtolower((string) ($log['description'] ?? ''));
                $type = mb_strtolower((string) ($log['type'] ?? ''));
                $corr = mb_strtolower((string) ($log['correlation_id'] ?? ''));
                $metadata = mb_strtolower(json_encode($log['metadata'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '');
                return str_contains($description, $needle)
                    || str_contains($type, $needle)
                    || str_contains($corr, $needle)
                    || str_contains($metadata, $needle);
            });
        }

        return $logs->values();
    }

    protected function querySavedViews(int $userId)
    {
        return ActivityLogSavedView::query()
            ->where('scope', 'platform')
            ->where(function ($q) use ($userId) {
                $q->where('is_shared', true)
                    ->orWhere('user_id', $userId);
            })
            ->latest('id')
            ->limit(50)
            ->get([
                'id',
                'name',
                'kind',
                'correlation_id',
                'filters',
                'is_shared',
                'user_id',
                'created_at',
            ])
            ->map(fn (ActivityLogSavedView $view) => [
                'id' => $view->id,
                'name' => $view->name,
                'kind' => $view->kind,
                'correlation_id' => $view->correlation_id,
                'filters' => $view->filters ?? [],
                'is_shared' => (bool) $view->is_shared,
                'user_id' => $view->user_id,
                'created_at' => $view->created_at?->toIso8601String(),
            ])
            ->values();
    }
}
