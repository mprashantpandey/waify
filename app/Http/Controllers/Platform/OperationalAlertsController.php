<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\OperationalAlertEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;
use Inertia\Response;

class OperationalAlertsController extends Controller
{
    public function index(Request $request): Response
    {
        $status = (string) $request->query('status', '');
        $severity = (string) $request->query('severity', '');
        $ack = (string) $request->query('ack', '');
        $search = trim((string) $request->query('q', ''));

        $query = $this->applyFilters(
            OperationalAlertEvent::query()->latest('id'),
            $status,
            $severity,
            $ack,
            $search
        );

        $events = $query
            ->paginate(30)
            ->through(function (OperationalAlertEvent $event) {
                return [
                    'id' => $event->id,
                    'event_key' => $event->event_key,
                    'title' => $event->title,
                    'severity' => $event->severity,
                    'scope' => $event->scope,
                    'status' => $event->status,
                    'channels' => $event->channels ?? [],
                    'context' => $event->context ?? [],
                    'error_message' => $event->error_message,
                    'acknowledged_at' => $event->acknowledged_at?->toIso8601String(),
                    'acknowledged_by' => $event->acknowledged_by,
                    'resolve_note' => $event->resolve_note,
                    'sent_at' => $event->sent_at?->toIso8601String(),
                    'created_at' => $event->created_at?->toIso8601String(),
                ];
            });

        return Inertia::render('Platform/OperationalAlerts/Index', [
            'filters' => [
                'status' => $status,
                'severity' => $severity,
                'ack' => $ack,
                'q' => $search,
            ],
            'events' => $events,
            'stats' => [
                'total' => OperationalAlertEvent::query()->count(),
                'failed' => OperationalAlertEvent::query()->where('status', 'failed')->count(),
                'skipped' => OperationalAlertEvent::query()->where('status', 'skipped')->count(),
                'critical_24h' => OperationalAlertEvent::query()
                    ->where('severity', 'critical')
                    ->where('created_at', '>=', now()->subDay())
                    ->count(),
            ],
        ]);
    }

    public function acknowledge(Request $request, OperationalAlertEvent $event): RedirectResponse
    {
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
            $event->forceFill([
                'resolve_note' => $resolveNote,
            ])->save();
        }

        return back()->with('success', 'Operational alert acknowledged.');
    }

    public function bulkAcknowledge(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:operational_alert_events,id'],
            'resolve_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $resolveNote = trim((string) ($validated['resolve_note'] ?? ''));
        $updated = OperationalAlertEvent::query()
            ->whereIn('id', $validated['ids'])
            ->whereNull('acknowledged_at')
            ->update([
                'acknowledged_at' => now(),
                'acknowledged_by' => $request->user()?->id,
                'resolve_note' => $resolveNote !== '' ? $resolveNote : null,
                'updated_at' => now(),
            ]);

        return back()->with('success', "Acknowledged {$updated} alert(s).");
    }

    public function export(Request $request): StreamedResponse
    {
        $status = (string) $request->query('status', '');
        $severity = (string) $request->query('severity', '');
        $ack = (string) $request->query('ack', '');
        $search = trim((string) $request->query('q', ''));

        $query = $this->applyFilters(
            OperationalAlertEvent::query()->latest('id'),
            $status,
            $severity,
            $ack,
            $search
        );

        $filename = 'operational-alerts-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'id',
                'event_key',
                'title',
                'severity',
                'status',
                'scope',
                'channels',
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
                        json_encode($event->channels ?? [], JSON_UNESCAPED_SLASHES),
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

    public function sendTest(Request $request): RedirectResponse
    {
        Artisan::call('ops:alert:test', [
            '--scope' => 'platform-ui-'.now()->format('YmdHis'),
        ]);

        return back()->with('success', 'Test operational alert dispatched.');
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
                    ->orWhere('error_message', 'like', "%{$search}%");
            });
        }

        return $query;
    }
}
