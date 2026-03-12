<?php

namespace App\Http\Controllers;

use App\Models\OperationalAlertEvent;
use App\Services\DiagnosticsBundleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OperationalAlertsController extends Controller
{
    public function __construct(
        protected DiagnosticsBundleService $diagnosticsBundleService
    ) {
    }

    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');

        $status = (string) $request->query('status', '');
        $severity = (string) $request->query('severity', '');
        $ack = (string) $request->query('ack', '');
        $search = trim((string) $request->query('q', ''));

        $query = $this->applyFilters(
            OperationalAlertEvent::query()
                ->where('account_id', $account->id)
                ->latest('id'),
            $status,
            $severity,
            $ack,
            $search
        );

        $events = $query
            ->paginate(30)
            ->through(function (OperationalAlertEvent $event) {
                $context = (array) ($event->context ?? []);
                return [
                    'id' => $event->id,
                    'event_key' => $event->event_key,
                    'title' => $event->title,
                    'severity' => $event->severity,
                    'scope' => $event->scope,
                    'correlation_id' => $event->correlation_id,
                    'status' => $event->status,
                    'channels' => $event->channels ?? [],
                    'context' => $context,
                    'error_message' => $event->error_message,
                    'acknowledged_at' => $event->acknowledged_at?->toIso8601String(),
                    'acknowledged_by' => $event->acknowledged_by,
                    'resolve_note' => $event->resolve_note,
                    'sent_at' => $event->sent_at?->toIso8601String(),
                    'created_at' => $event->created_at?->toIso8601String(),
                    'troubleshoot_link' => $this->resolveTroubleshootLink($event->scope, $context),
                ];
            });

        return Inertia::render('OperationalAlerts/Index', [
            'filters' => [
                'status' => $status,
                'severity' => $severity,
                'ack' => $ack,
                'q' => $search,
            ],
            'events' => $events,
            'stats' => [
                'total' => OperationalAlertEvent::query()->where('account_id', $account->id)->count(),
                'failed' => OperationalAlertEvent::query()->where('account_id', $account->id)->where('status', 'failed')->count(),
                'critical_24h' => OperationalAlertEvent::query()
                    ->where('account_id', $account->id)
                    ->where('severity', 'critical')
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
            ],
        ]);
    }

    public function acknowledge(Request $request, OperationalAlertEvent $event): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account && (int) $event->account_id === (int) $account->id, 404);

        $validated = $request->validate([
            'resolve_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $resolveNote = trim((string) ($validated['resolve_note'] ?? ''));
        if (!$event->acknowledged_at) {
            $event->forceFill([
                'acknowledged_at' => now(),
                'acknowledged_by' => $request->user()?->id,
                'resolve_note' => $resolveNote !== '' ? $resolveNote : null,
            ])->save();
        } elseif ($resolveNote !== '') {
            $event->forceFill(['resolve_note' => $resolveNote])->save();
        }

        return back()->with('success', 'Alert acknowledged.');
    }

    public function export(Request $request): StreamedResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');

        $status = (string) $request->query('status', '');
        $severity = (string) $request->query('severity', '');
        $ack = (string) $request->query('ack', '');
        $search = trim((string) $request->query('q', ''));

        $query = $this->applyFilters(
            OperationalAlertEvent::query()
                ->where('account_id', $account->id)
                ->latest('id'),
            $status,
            $severity,
            $ack,
            $search
        );

        $filename = 'tenant-alerts-' . now()->format('Ymd-His') . '.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'id',
                'event_key',
                'title',
                'severity',
                'status',
                'scope',
                'correlation_id',
                'error_message',
                'acknowledged_at',
                'resolve_note',
                'created_at',
            ]);

            $query->chunk(500, function ($events) use ($handle) {
                foreach ($events as $event) {
                    fputcsv($handle, [
                        $event->id,
                        $event->event_key,
                        $event->title,
                        $event->severity,
                        $event->status,
                        $event->scope,
                        $event->correlation_id,
                        $event->error_message,
                        $event->acknowledged_at?->toIso8601String(),
                        $event->resolve_note,
                        $event->created_at?->toIso8601String(),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function diagnosticsBundle(Request $request): StreamedResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless($account, 404, 'Account not found.');

        $eventId = (int) $request->query('event_id', 0);
        $alert = null;
        if ($eventId > 0) {
            $alert = OperationalAlertEvent::query()
                ->where('account_id', $account->id)
                ->findOrFail($eventId);
            $bundle = $this->diagnosticsBundleService->buildForAlert($alert, (int) ($request->user()?->id ?? 0));
        } else {
            $targets = [
                'account_id' => $account->id,
                'connection_id' => (int) $request->query('connection_id', 0) ?: null,
                'campaign_id' => (int) $request->query('campaign_id', 0) ?: null,
                'conversation_id' => (int) $request->query('conversation_id', 0) ?: null,
                'message_id' => (int) $request->query('message_id', 0) ?: null,
                'template_id' => (int) $request->query('template_id', 0) ?: null,
                'webhook_event_id' => (int) $request->query('webhook_event_id', 0) ?: null,
                'meta_message_id' => trim((string) $request->query('meta_message_id', '')),
                'correlation_id' => trim((string) $request->query('correlation_id', '')),
                'scope' => trim((string) $request->query('scope', '')),
            ];

            $bundle = $this->diagnosticsBundleService->buildForTargets(
                targets: $targets,
                accountId: (int) $account->id,
                actorUserId: (int) ($request->user()?->id ?? 0),
            );
        }

        $filename = 'tenant-diagnostics-' . ($alert?->id ? "alert-{$alert->id}-" : '') . now()->format('Ymd-His') . '.json';
        $json = json_encode($bundle, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

        return response()->streamDownload(function () use ($json) {
            echo $json ?: '{}';
        }, $filename, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    protected function applyFilters($query, string $status, string $severity, string $ack, string $search)
    {
        if (in_array($status, ['sent', 'skipped', 'failed'], true)) {
            $query->where('status', $status);
        }

        if (in_array($severity, ['info', 'warning', 'critical'], true)) {
            $query->where('severity', $severity);
        }

        if ($ack === 'yes') {
            $query->whereNotNull('acknowledged_at');
        } elseif ($ack === 'no') {
            $query->whereNull('acknowledged_at');
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('event_key', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('scope', 'like', "%{$search}%")
                    ->orWhere('correlation_id', 'like', "%{$search}%")
                    ->orWhere('error_message', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * @param  array<string,mixed>  $context
     */
    protected function resolveTroubleshootLink(?string $scope, array $context): ?string
    {
        $scopeValue = (string) ($scope ?? '');

        if (str_starts_with($scopeValue, 'connection:')) {
            $id = (int) substr($scopeValue, strlen('connection:'));
            if ($id > 0) {
                return route('app.whatsapp.connections.edit', ['connection' => $id]);
            }
        }

        if (str_starts_with($scopeValue, 'campaign:')) {
            $id = (int) substr($scopeValue, strlen('campaign:'));
            if ($id > 0) {
                return route('app.broadcasts.show', ['campaign' => $id]);
            }
        }

        $conversationId = (int) ($context['conversation_id'] ?? 0);
        if ($conversationId > 0) {
            return route('app.whatsapp.conversations.show', ['conversation' => $conversationId]);
        }

        $messageId = (int) ($context['message_id'] ?? $context['whatsapp_message_id'] ?? 0);
        if ($messageId > 0) {
            return route('app.whatsapp.conversations.index') . '?message_id=' . $messageId;
        }

        $templateId = (int) ($context['template_id'] ?? 0);
        if ($templateId > 0) {
            return route('app.whatsapp.templates.show', ['template' => $templateId]);
        }

        $connectionId = (int) ($context['connection_id'] ?? 0);
        if ($connectionId > 0) {
            return route('app.whatsapp.connections.edit', ['connection' => $connectionId]);
        }

        $campaignId = (int) ($context['campaign_id'] ?? 0);
        if ($campaignId > 0) {
            return route('app.broadcasts.show', ['campaign' => $campaignId]);
        }

        $webhookEventId = (int) ($context['webhook_event_id'] ?? 0);
        if ($webhookEventId > 0 && $connectionId > 0) {
            return route('app.whatsapp.connections.webhook-diagnostics', ['connection' => $connectionId]) . '?event_id=' . $webhookEventId;
        }

        return null;
    }
}
