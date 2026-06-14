<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\BillingEvent;
use App\Models\Account;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\AppNotificationService;
use App\Services\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PlatformAccountController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    /**
     * Display a listing of all accounts.
     */
    public function index(Request $request): Response
    {
        $query = Account::with('owner');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $accounts = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn ($account) => $this->accountPayload($account));

        return Inertia::render('Platform/Accounts/Index', [
            'accounts' => $accounts,
            'plans' => Plan::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'key', 'name', 'price_monthly', 'price_yearly', 'currency'])
                ->map(fn (Plan $plan) => [
                    'id' => $plan->id,
                    'key' => $plan->key,
                    'name' => $plan->name,
                    'price_monthly' => $plan->price_monthly,
                    'price_yearly' => $plan->price_yearly,
                    'currency' => $plan->currency,
                ])
                ->values(),
            'filters' => [
                'search' => $request->search,
                'status' => $request->status],
            'selectedAccount' => $this->selectedAccountPayload($request)]);
    }

    /**
     * Display the specified account.
     */
    public function show(Account $account): RedirectResponse
    {
        return redirect()->route('platform.accounts.index', ['account' => $account->id]);
    }

    protected function selectedAccountPayload(Request $request): ?array
    {
        if (! $request->filled('account')) {
            return null;
        }

        $account = Account::with(['owner', 'users', 'modules', 'subscription.plan'])
            ->where('id', $request->input('account'))
            ->orWhere('slug', $request->input('account'))
            ->first();

        return $account ? $this->accountPayload($account, true) : null;
    }

    protected function accountPayload(Account $account, bool $full = false): array
    {
        $payload = [
            'id' => $account->id,
            'name' => $account->name,
            'slug' => $account->slug,
            'workspace_type' => $account->workspace_type,
            'workspace_type_label' => $account->workspaceTypeLabel(),
            'industry' => $account->industry,
            'timezone' => $account->timezone,
            'status' => $account->status,
            'disabled_reason' => $account->disabled_reason,
            'disabled_at' => $account->disabled_at?->toIso8601String(),
            'owner' => [
                'id' => $account->owner->id,
                'name' => $account->owner->name,
                'email' => $account->owner->email],
            'created_at' => $account->created_at->toIso8601String(),
        ];

        if (! $full) {
            return $payload;
        }

        $wallet = $this->walletService->getOrCreateWallet($account);
        $whatsappConnectionsCount = 0;
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConnection::class)) {
            $whatsappConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)->count();
        }

        $conversationsCount = 0;
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConversation::class)) {
            $conversationsCount = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('account_id', $account->id)->count();
        }

        return $payload + [
            'subscription' => $account->subscription ? [
                'id' => $account->subscription->id,
                'status' => $account->subscription->status,
                'provider' => $account->subscription->provider,
                'current_period_end' => $account->subscription->current_period_end?->toIso8601String(),
                'plan' => $account->subscription->plan ? [
                    'id' => $account->subscription->plan->id,
                    'key' => $account->subscription->plan->key,
                    'name' => $account->subscription->plan->name,
                ] : null,
            ] : null,
            'members_count' => $account->users
                ->reject(fn ($user) => $user->isSuperAdmin())
                ->count(),
            'modules_enabled' => $account->modules->where('enabled', true)->count(),
            'whatsapp_connections_count' => $whatsappConnectionsCount,
            'conversations_count' => $conversationsCount,
            'wallet' => [
                'balance_minor' => (int) $wallet->balance_minor,
                'currency' => $wallet->currency,
            ],
        ];
    }

    /**
     * Disable a account.
     */
    public function disable(Request $request, Account $account)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500']);

        $account->disable($validated['reason'] ?? null);
        app(AppNotificationService::class)->auditDestructive(
            'platform_workspace_disabled',
            "Workspace {$account->name} disabled",
            $request->user(),
            $account,
            $account,
            ['reason' => $validated['reason'] ?? null],
            $request
        );

        return redirect()->back()->with('success', 'Account disabled successfully.');
    }

    /**
     * Enable a account.
     */
    public function enable(Request $request, Account $account)
    {
        $account->enable();
        app(AppNotificationService::class)->auditDestructive(
            'platform_workspace_enabled',
            "Workspace {$account->name} enabled",
            $request->user(),
            $account,
            $account,
            [],
            $request
        );

        return redirect()->back()->with('success', 'Account enabled successfully.');
    }

    public function assignPlan(Request $request, Account $account): RedirectResponse
    {
        $validated = $request->validate([
            'plan_key' => ['required', 'string', 'exists:plans,key'],
            'billing_cycle' => ['nullable', 'string', 'in:monthly,yearly'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $plan = Plan::where('key', $validated['plan_key'])
            ->where('is_active', true)
            ->firstOrFail();

        $billingCycle = $validated['billing_cycle'] ?? 'monthly';

        try {
            DB::transaction(function () use ($account, $plan, $request, $billingCycle, $validated) {
                $now = now();
                $periodEnd = $billingCycle === 'yearly'
                    ? $now->copy()->addYear()
                    : $now->copy()->addMonth();

                Subscription::updateOrCreate([
                    'account_id' => $account->id,
                ], [
                    'plan_id' => $plan->id,
                    'status' => 'active',
                    'started_at' => $account->subscription?->started_at ?: $now,
                    'trial_ends_at' => null,
                    'current_period_start' => $now,
                    'current_period_end' => $periodEnd,
                    'provider' => 'manual',
                    'provider_ref' => null,
                    'last_payment_failed_at' => null,
                    'last_error' => null,
                    'cancel_at_period_end' => false,
                    'canceled_at' => null,
                ]);

                BillingEvent::create([
                    'account_id' => $account->id,
                    'actor_id' => $request->user()?->id,
                    'type' => 'platform_plan_assigned',
                    'data' => [
                        'plan_key' => $plan->key,
                        'plan_name' => $plan->name,
                        'billing_cycle' => $billingCycle,
                        'source' => 'platform_admin_assignment',
                        'notes' => $validated['notes'] ?? null,
                    ],
                ]);
                app(AppNotificationService::class)->auditDestructive(
                    'platform_workspace_plan_assigned',
                    "Plan {$plan->name} assigned to {$account->name}",
                    $request->user(),
                    $account,
                    $account,
                    [
                        'plan_key' => $plan->key,
                        'plan_name' => $plan->name,
                        'billing_cycle' => $billingCycle,
                        'notes' => $validated['notes'] ?? null,
                    ],
                    $request
                );
            });
        } catch (\Throwable $e) {
            return back()->withErrors(['plan_key' => $e->getMessage()])
                ->with('error', 'Plan assignment failed: '.$e->getMessage());
        }

        return back()->with('success', "{$plan->name} assigned to {$account->name}.");
    }
}
