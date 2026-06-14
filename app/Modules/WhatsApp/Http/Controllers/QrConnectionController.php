<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Core\Billing\EntitlementService;
use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\BaileysBridgeClient;
use App\Modules\WhatsApp\Services\ConnectionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class QrConnectionController extends Controller
{
    public function __construct(
        protected ConnectionService $connectionService,
        protected EntitlementService $entitlementService,
        protected BaileysBridgeClient $bridge
    ) {}

    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('create', WhatsAppConnection::class);

        if (! $this->canConnectWabaAfterPayment($account)) {
            return $this->paymentRequiredRedirect($account);
        }

        if (! $this->entitlementService->canCreateConnection($account)) {
            abort(402, 'Your plan cannot add another WhatsApp connection.');
        }

        if (WhatsAppConnection::where('account_id', $account->id)->exists()) {
            return redirect()->route('app.whatsapp.connections.index')
                ->with('error', 'Only one WhatsApp connection can be connected to a workspace.');
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'throughput_cap_per_minute' => ['nullable', 'integer', 'min:1', 'max:60'],
            'quiet_hours_start' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_end' => ['nullable', 'regex:/^\d{2}:\d{2}$/'],
            'quiet_hours_timezone' => ['nullable', 'timezone'],
        ]);

        $connection = $this->connectionService->create($account, [
            'name' => $validated['name'] ?: 'WhatsApp QR (Unofficial)',
            'waba_id' => 'qr-'.$account->id.'-'.Str::lower(Str::random(8)),
            'phone_number_id' => 'qr-'.$account->id.'-'.Str::lower(Str::random(8)),
            'business_phone' => null,
            'setup_method' => 'qr',
            'connection_mode' => 'baileys_qr',
            'api_version' => 'baileys',
            'access_token_encrypted' => '',
            'qr_session_id' => 'qr-'.$account->id.'-'.$request->user()->id.'-'.Str::lower(Str::random(10)),
            'qr_status' => 'starting',
            'webhook_subscribed' => true,
            'is_active' => true,
            'throughput_cap_per_minute' => min((int) ($validated['throughput_cap_per_minute'] ?? 15), 60),
            'quiet_hours_start' => $validated['quiet_hours_start'] ?? null,
            'quiet_hours_end' => $validated['quiet_hours_end'] ?? null,
            'quiet_hours_timezone' => $validated['quiet_hours_timezone'] ?? config('app.timezone', 'UTC'),
            'qr_safety_settings' => [
                'one_to_one_only' => true,
                'block_groups' => true,
                'block_broadcasts' => true,
                'max_per_minute' => min((int) ($validated['throughput_cap_per_minute'] ?? 15), 60),
                'human_like_delay_ms' => 2500,
                'campaigns_enabled' => true,
                'unofficial_no_antiban_guarantee' => true,
            ],
        ]);

        try {
            $status = $this->bridge->startSession($connection);
            $this->applyBridgeStatus($connection, $status);
        } catch (\Throwable $e) {
            $connection->forceFill([
                'qr_status' => 'bridge_unavailable',
                'qr_last_error' => $e->getMessage(),
            ])->save();
        }

        return redirect()->route('app.whatsapp.connections.index')
            ->with('success', 'WhatsApp QR connection created. Scan the QR code to link the number.');
    }

    public function status(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $resolved = $this->resolveConnection($connection, $account);

        Gate::authorize('view', $resolved);

        abort_unless($resolved->connection_mode === 'baileys_qr', 404);

        try {
            $status = $this->bridge->status($resolved);
            $this->applyBridgeStatus($resolved, $status);
        } catch (\Throwable $e) {
            $resolved->forceFill([
                'qr_status' => 'bridge_unavailable',
                'qr_last_error' => $e->getMessage(),
            ])->save();

            $status = [
                'status' => 'bridge_unavailable',
                'error' => $e->getMessage(),
                'qr' => null,
            ];
        }

        return response()->json([
            'connection' => [
                'id' => $resolved->id,
                'slug' => $resolved->slug,
                'status' => $resolved->qr_status,
                'business_phone' => $resolved->business_phone,
                'last_seen_at' => $resolved->qr_last_seen_at?->toIso8601String(),
                'last_error' => $resolved->qr_last_error,
            ],
            'bridge' => $status,
        ]);
    }

    public function reconnect(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $resolved = $this->resolveConnection($connection, $account);

        Gate::authorize('update', $resolved);

        abort_unless($resolved->connection_mode === 'baileys_qr', 404);

        $status = $this->bridge->startSession($resolved, true);
        $this->applyBridgeStatus($resolved, $status);

        return back()->with('success', 'QR session restarted.');
    }

    public function reconnectRedirect(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $resolved = $this->resolveConnection($connection, $account);

        Gate::authorize('view', $resolved);

        abort_unless($resolved->connection_mode === 'baileys_qr', 404);

        return redirect()->route('app.whatsapp.connections.index')
            ->with('error', 'Use the Reconnect button to restart the QR session.');
    }

    public function disconnect(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $resolved = $this->resolveConnection($connection, $account);

        Gate::authorize('delete', $resolved);

        abort_unless($resolved->connection_mode === 'baileys_qr', 404);

        try {
            $this->bridge->disconnect($resolved);
        } catch (\Throwable) {
            // Keep local disconnect reliable even if the bridge is already down.
        }

        $resolved->delete();

        return redirect()->route('app.whatsapp.connections.index')
            ->with('success', 'WhatsApp QR session disconnected.');
    }

    protected function resolveConnection($connection, $account): WhatsAppConnection
    {
        if ($connection instanceof WhatsAppConnection) {
            abort_unless((int) $connection->account_id === (int) $account->id, 404);

            return $connection;
        }

        $resolved = WhatsAppConnection::where('account_id', $account->id)
            ->where(function ($query) use ($connection) {
                $query->where('slug', $connection)->orWhere('id', $connection);
            })
            ->firstOrFail();

        return $resolved;
    }

    protected function canConnectWabaAfterPayment($account): bool
    {
        $account->loadMissing('subscription.plan');
        $subscription = $account->subscription;
        $plan = $subscription?->plan;

        if (! $subscription || ! $plan) {
            return false;
        }

        $isZeroAmountPlan = (int) ($plan->price_monthly ?? 0) <= 0;
        if ($isZeroAmountPlan && $subscription->isActive()) {
            return true;
        }

        if ($subscription->isInTrial()) {
            return true;
        }

        return $subscription->isActive() && $subscription->last_payment_at !== null;
    }

    protected function paymentRequiredRedirect($account)
    {
        $account->loadMissing('subscription.plan');

        return redirect()->route('app.billing.index', [
            'tab' => 'plans',
            'checkout_plan' => $account->subscription?->plan?->key,
        ])->with('error', 'Payment is required before connecting WhatsApp.');
    }

    protected function applyBridgeStatus(WhatsAppConnection $connection, array $status): void
    {
        $state = (string) ($status['status'] ?? $status['state'] ?? $connection->qr_status ?? 'unknown');
        $phone = isset($status['phone']) ? preg_replace('/\D+/', '', (string) $status['phone']) : null;

        $updates = [
            'qr_status' => $state,
            'qr_last_error' => $status['error'] ?? null,
            'qr_last_seen_at' => $state === 'connected' ? now() : $connection->qr_last_seen_at,
        ];

        if ($phone) {
            $this->connectionService->ensurePhoneAvailable($connection->account, 'qr-'.$phone, $phone, $connection);

            $updates['business_phone'] = $phone;
            $updates['phone_number_id'] = 'qr-'.$phone;
            $updates['waba_id'] = 'qr-'.$phone;
        }

        $connection->forceFill($updates)->save();
    }
}
