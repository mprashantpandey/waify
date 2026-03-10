<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Jobs\ProcessWebhookEventJob;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppWebhookEvent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebhookDiagnosticsController extends Controller
{
    public function index(Request $request, WhatsAppConnection $connection): Response
    {
        Gate::authorize('view', $connection);

        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($connection->account_id, $account->id)) {
            abort(404);
        }

        $events = WhatsAppWebhookEvent::query()
            ->where('account_id', $account->id)
            ->where('whatsapp_connection_id', $connection->id)
            ->orderByDesc('id')
            ->paginate(30)
            ->through(function (WhatsAppWebhookEvent $event) {
                return [
                    'id' => $event->id,
                    'status' => $event->status,
                    'event_type' => $event->event_type,
                    'object_type' => $event->object_type,
                    'signature_valid' => $event->signature_valid,
                    'retry_count' => (int) $event->retry_count,
                    'payload_size' => (int) $event->payload_size,
                    'error_message' => $event->error_message,
                    'correlation_id' => $event->correlation_id,
                    'processed_at' => $event->processed_at?->toIso8601String(),
                    'failed_at' => $event->failed_at?->toIso8601String(),
                    'created_at' => $event->created_at?->toIso8601String(),
                ];
            });

        return Inertia::render('WhatsApp/Connections/WebhookDiagnostics', [
            'connection' => [
                'id' => $connection->id,
                'name' => $connection->name,
                'slug' => $connection->slug,
                'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                'webhook_last_processed_at' => $connection->webhook_last_processed_at?->toIso8601String(),
                'webhook_consecutive_failures' => (int) $connection->webhook_consecutive_failures,
                'webhook_last_lag_seconds' => $connection->webhook_last_lag_seconds,
                'webhook_last_error' => $connection->webhook_last_error,
            ],
            'events' => $events,
        ]);
    }

    public function reprocess(Request $request, WhatsAppConnection $connection, string $eventId): RedirectResponse
    {
        Gate::authorize('view', $connection);

        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($connection->account_id, $account->id)) {
            abort(404);
        }

        $event = WhatsAppWebhookEvent::query()
            ->where('account_id', $account->id)
            ->where('whatsapp_connection_id', $connection->id)
            ->find($eventId);

        if (!$event) {
            return back()->withErrors(['error' => 'Webhook event not found.']);
        }

        ProcessWebhookEventJob::dispatch($event->id);

        return back()->with('success', 'Webhook event queued for reprocessing.');
    }
}

