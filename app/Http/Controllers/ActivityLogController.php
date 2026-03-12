<?php

namespace App\Http\Controllers;

use App\Models\ActivityLogSavedView;
use App\Models\OperationalAlertEvent;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivityLogController extends Controller
{
    /**
     * Display account activity logs.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');

        $filters = [
            'type' => trim((string) $request->query('type', '')),
            'q' => trim((string) $request->query('q', '')),
            'correlation_id' => trim((string) $request->query('correlation_id', '')),
            'entity_type' => trim((string) $request->query('entity_type', '')),
            'entity_id' => (int) $request->query('entity_id', 0),
        ];

        $logs = $this->collectLogs((int) $account->id);
        $logs = $this->applyFilters($logs, $filters);

        $types = $logs->pluck('type')->filter()->unique()->values();
        $entityTypes = $logs->pluck('entity_type')->filter()->unique()->values();
        $limitedLogs = $logs->take(200)->values();
        $savedViews = $this->querySavedViews('tenant', (int) $account->id, (int) ($request->user()?->id ?? 0));

        return Inertia::render('App/ActivityLogs/Index', [
            'account' => $account,
            'logs' => $limitedLogs,
            'filters' => $filters,
            'filter_options' => [
                'types' => $types,
                'entity_types' => $entityTypes,
            ],
            'saved_views' => $savedViews,
            'can_manage_shared_views' => $this->canManageSharedViews($request, (int) $account->id),
        ]);
    }

    public function storeSavedView(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'kind' => ['nullable', 'in:preset,correlation'],
            'correlation_id' => ['nullable', 'string', 'max:255'],
            'filters' => ['nullable', 'array'],
            'is_shared' => ['nullable', 'boolean'],
        ]);

        $isShared = (bool) ($validated['is_shared'] ?? false);
        if ($isShared) {
            abort_unless($this->canManageSharedViews($request, (int) $account->id), 403);
        }

        ActivityLogSavedView::create([
            'user_id' => $request->user()?->id,
            'account_id' => $account->id,
            'scope' => 'tenant',
            'kind' => $validated['kind'] ?? 'preset',
            'name' => $validated['name'],
            'correlation_id' => trim((string) ($validated['correlation_id'] ?? '')) ?: null,
            'filters' => $validated['filters'] ?? [],
            'is_shared' => $isShared,
        ]);

        return back()->with('success', 'Saved view created.');
    }

    public function deleteSavedView(Request $request, ActivityLogSavedView $savedView): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');
        abort_unless($savedView->scope === 'tenant' && (int) $savedView->account_id === (int) $account->id, 404);

        $userId = (int) ($request->user()?->id ?? 0);
        abort_unless(
            (int) ($savedView->user_id ?? 0) === $userId
            || is_super_admin()
            || ($savedView->is_shared && $this->canManageSharedViews($request, (int) $account->id)),
            403
        );

        $savedView->delete();

        return back()->with('success', 'Saved view deleted.');
    }

    public function updateSavedView(Request $request, ActivityLogSavedView $savedView): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');
        abort_unless($savedView->scope === 'tenant' && (int) $savedView->account_id === (int) $account->id, 404);

        $userId = (int) ($request->user()?->id ?? 0);
        $canManageShared = $this->canManageSharedViews($request, (int) $account->id);
        $isCreator = (int) ($savedView->user_id ?? 0) === $userId;

        abort_unless($isCreator || is_super_admin() || ($savedView->is_shared && $canManageShared), 403);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'is_shared' => ['sometimes', 'boolean'],
            'kind' => ['sometimes', Rule::in(['preset', 'correlation'])],
            'correlation_id' => ['nullable', 'string', 'max:255'],
            'filters' => ['nullable', 'array'],
        ]);

        if (array_key_exists('is_shared', $validated) && (bool) $validated['is_shared'] === true) {
            abort_unless($canManageShared, 403);
        }
        if (array_key_exists('is_shared', $validated) && (bool) $validated['is_shared'] === false && $savedView->is_shared) {
            abort_unless($canManageShared || $isCreator || is_super_admin(), 403);
        }

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
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');

        $filters = [
            'type' => trim((string) $request->query('type', '')),
            'q' => trim((string) $request->query('q', '')),
            'correlation_id' => trim((string) $request->query('correlation_id', '')),
            'entity_type' => trim((string) $request->query('entity_type', '')),
            'entity_id' => (int) $request->query('entity_id', 0),
        ];

        $logs = $this->applyFilters($this->collectLogs((int) $account->id), $filters);
        $filename = 'tenant-activity-logs-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'type', 'description', 'entity_type', 'entity_id', 'correlation_id', 'created_at', 'metadata']);
            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log['id'] ?? '',
                    $log['type'] ?? '',
                    $log['description'] ?? '',
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

    protected function collectLogs(int $accountId)
    {
        $logs = collect();

        $recentMessages = WhatsAppMessage::where('account_id', $accountId)
            ->orderBy('created_at', 'desc')
            ->limit(120)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => 'message_' . $message->id,
                    'type' => 'message',
                    'description' => ucfirst($message->direction) . ' message ' . ($message->status ?? 'sent'),
                    'account_id' => $message->account_id,
                    'entity_type' => 'message',
                    'entity_id' => (int) $message->id,
                    'correlation_id' => null,
                    'metadata' => [
                        'message_id' => $message->id,
                        'meta_message_id' => $message->meta_message_id,
                        'conversation_id' => $message->whatsapp_conversation_id,
                        'direction' => $message->direction,
                        'status' => $message->status,
                        'type' => $message->type,
                    ],
                    'created_at' => $message->created_at?->toIso8601String(),
                ];
            });

        $connectionEvents = WhatsAppConnection::where('account_id', $accountId)
            ->where(function ($query) {
                $query->whereNotNull('webhook_last_received_at')
                    ->orWhereNotNull('webhook_last_error');
            })
            ->orderBy('updated_at', 'desc')
            ->limit(80)
            ->get()
            ->map(function ($connection) {
                return [
                    'id' => 'connection_' . $connection->id,
                    'type' => $connection->webhook_last_error ? 'connection_error' : 'connection_success',
                    'description' => $connection->webhook_last_error
                        ? "Connection error: {$connection->name}"
                        : "Webhook received: {$connection->name}",
                    'account_id' => $connection->account_id,
                    'entity_type' => 'connection',
                    'entity_id' => (int) $connection->id,
                    'correlation_id' => null,
                    'metadata' => [
                        'connection_id' => $connection->id,
                        'connection_name' => $connection->name,
                        'error' => $connection->webhook_last_error,
                    ],
                    'created_at' => ($connection->webhook_last_received_at ?? $connection->updated_at)?->toIso8601String(),
                ];
            });

        $alertEvents = OperationalAlertEvent::query()
            ->where('account_id', $accountId)
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(function (OperationalAlertEvent $alert) {
                return [
                    'id' => 'alert_' . $alert->id,
                    'type' => 'alert_' . ($alert->severity ?: 'info'),
                    'description' => $alert->title,
                    'account_id' => $alert->account_id,
                    'entity_type' => 'alert',
                    'entity_id' => (int) $alert->id,
                    'correlation_id' => $alert->correlation_id,
                    'metadata' => [
                        'event_key' => $alert->event_key,
                        'scope' => $alert->scope,
                        'severity' => $alert->severity,
                        'status' => $alert->status,
                        'error_message' => $alert->error_message,
                        'resolve_note' => $alert->resolve_note,
                    ],
                    'created_at' => $alert->created_at?->toIso8601String(),
                ];
            });

        $webhookEvents = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('whatsapp_webhook_events')) {
            $webhookEvents = WhatsAppWebhookEvent::query()
                ->where('account_id', $accountId)
                ->latest('id')
                ->limit(100)
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

        return $logs->merge($recentMessages)
            ->merge($connectionEvents)
            ->merge($alertEvents)
            ->merge($webhookEvents)
            ->sortByDesc('created_at')
            ->values();
    }

    protected function applyFilters($logs, array $filters)
    {
        if (($filters['type'] ?? '') !== '') {
            $logs = $logs->filter(fn ($log) => (string) ($log['type'] ?? '') === $filters['type']);
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

    protected function querySavedViews(string $scope, ?int $accountId, int $userId)
    {
        return ActivityLogSavedView::query()
            ->where('scope', $scope)
            ->when($scope === 'tenant', fn ($q) => $q->where('account_id', $accountId))
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

    protected function canManageSharedViews(Request $request, int $accountId): bool
    {
        $user = $request->user();
        if (!$user) {
            return false;
        }
        if (is_super_admin()) {
            return true;
        }

        $account = \App\Models\Account::find($accountId);
        if (!$account) {
            return false;
        }
        if ((int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $membership = $account->users()->where('user_id', $user->id)->first();
        return $membership && (($membership->pivot->role ?? null) === 'admin');
    }
}
