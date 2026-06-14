<?php

namespace App\Http\Controllers;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\ConnectionService;
use App\Modules\WhatsApp\Services\WebhookProcessor;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BaileysBridgeWebhookController extends Controller
{
    public function __construct(protected ConnectionService $connectionService) {}

    public function status(Request $request, $connection)
    {
        $this->authorizeBridge($request);
        $connection = $this->resolveConnection($connection);
        abort_unless($connection->connection_mode === 'baileys_qr', 404);

        $validated = $request->validate([
            'status' => ['required', 'string', 'max:40'],
            'phone' => ['nullable', 'string', 'max:60'],
            'error' => ['nullable', 'string', 'max:2000'],
        ]);

        $phone = isset($validated['phone']) ? preg_replace('/\D+/', '', (string) $validated['phone']) : null;

        $updates = [
            'qr_status' => $validated['status'],
            'qr_last_error' => $validated['error'] ?? null,
            'qr_last_seen_at' => $validated['status'] === 'connected' ? now() : null,
            'is_active' => in_array($validated['status'], ['starting', 'qr_pending', 'connected'], true),
            'phone_number_status' => $validated['status'] === 'connected' ? 'CONNECTED' : $connection->phone_number_status,
        ];

        if ($phone) {
            $this->connectionService->ensurePhoneAvailable($connection->account, 'qr-'.$phone, $phone, $connection);

            $updates['business_phone'] = $phone;
            $updates['phone_number_id'] = 'qr-'.$phone;
            $updates['waba_id'] = 'qr-'.$phone;
        }

        $connection->forceFill($updates)->save();

        return response()->json(['ok' => true]);
    }

    public function message(Request $request, $connection, WebhookProcessor $processor)
    {
        $this->authorizeBridge($request);
        $connection = $this->resolveConnection($connection);
        abort_unless($connection->connection_mode === 'baileys_qr', 404);

        $validated = $request->validate([
            'message_id' => ['required', 'string', 'max:255'],
            'from' => ['required', 'string', 'max:80'],
            'name' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:40'],
            'text' => ['nullable', 'string', 'max:10000'],
            'timestamp' => ['nullable'],
            'payload' => ['nullable', 'array'],
        ]);

        $from = preg_replace('/\D+/', '', (string) $validated['from']);
        abort_if($from === '', 422, 'Sender phone is required.');

        $messageType = $validated['type'] ?? 'text';
        $message = [
            'id' => 'baileys-'.$validated['message_id'],
            'from' => $from,
            'timestamp' => $validated['timestamp'] ?? time(),
            'type' => $messageType,
        ];

        if ($messageType === 'text') {
            $message['text'] = ['body' => (string) ($validated['text'] ?? '')];
        } else {
            $message[$messageType] = $validated['payload'] ?? [];
            if (! empty($validated['text'])) {
                $message[$messageType]['caption'] = $validated['text'];
            }
        }

        $payload = [
            'object' => 'whatsapp_business_account',
            'entry' => [[
                'id' => $connection->waba_id ?: 'baileys',
                'changes' => [[
                    'field' => 'messages',
                    'value' => [
                        'messaging_product' => 'whatsapp',
                        'metadata' => [
                            'display_phone_number' => $connection->business_phone,
                            'phone_number_id' => $connection->phone_number_id,
                        ],
                        'contacts' => [[
                            'profile' => ['name' => $validated['name'] ?? $from],
                            'wa_id' => $from,
                        ]],
                        'messages' => [$message],
                    ],
                ]],
            ]],
        ];

        $processor->process($payload, $connection, 'baileys-'.Str::uuid()->toString());

        $connection->forceFill([
            'qr_status' => 'connected',
            'qr_last_seen_at' => now(),
            'webhook_last_received_at' => now(),
            'webhook_last_error' => null,
        ])->save();

        return response()->json(['ok' => true]);
    }

    protected function authorizeBridge(Request $request): void
    {
        $secret = (string) config('services.baileys_bridge.secret', '');
        abort_if($secret === '', 503, 'Baileys bridge secret is not configured.');

        $sent = (string) $request->header('X-Baileys-Bridge-Secret', '');
        abort_unless(hash_equals($secret, $sent), 403);
    }

    protected function resolveConnection($value): WhatsAppConnection
    {
        if ($value instanceof WhatsAppConnection) {
            return $value;
        }

        return WhatsAppConnection::where('id', $value)
            ->orWhere('slug', (string) $value)
            ->firstOrFail();
    }
}
