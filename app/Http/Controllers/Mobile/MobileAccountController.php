<?php

namespace App\Http\Controllers\Mobile;

use App\Core\Billing\PlanResolver;
use App\Core\Billing\UsageService;
use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\MobileAccessToken;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\User;
use App\Services\PlatformSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MobileAccountController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => $this->userPayload($user),
            'security' => [
                'two_factor_enabled' => (bool) $user->two_factor_enabled_at,
                'force_password_reset' => (bool) $user->force_password_reset_at,
                'active_mobile_sessions' => MobileAccessToken::query()
                    ->where('user_id', $user->id)
                    ->whereNull('revoked_at')
                    ->count(),
            ],
            'notifications' => $this->notificationPayload($user),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'country_code' => ['nullable', 'string', 'max:8'],
            'phone' => ['nullable', 'string', 'max:32'],
            'job_title' => ['nullable', 'string', 'max:120'],
            'timezone' => ['nullable', 'timezone'],
            'locale' => ['nullable', 'string', 'max:12'],
        ]);

        $updates = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'job_title' => $validated['job_title'] ?? null,
        ];

        if (array_key_exists('timezone', $validated)) {
            $updates['timezone'] = $validated['timezone'];
        }

        if (array_key_exists('locale', $validated)) {
            $updates['locale'] = $validated['locale'];
        }

        $user->forceFill($updates)->save();

        return response()->json([
            'ok' => true,
            'user' => $this->userPayload($user->fresh()),
        ]);
    }

    public function updatePassword(Request $request, PlatformSettingsService $settings): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => $settings->getPasswordRules(),
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'force_password_reset_at' => null,
            'sessions_revoked_at' => now(),
        ])->save();

        return response()->json(['ok' => true, 'message' => 'Password updated.']);
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notify_assignment_enabled' => ['required', 'boolean'],
            'notify_mention_enabled' => ['required', 'boolean'],
            'notify_sound_enabled' => ['required', 'boolean'],
            'notify_billing_enabled' => ['required', 'boolean'],
            'notify_waba_enabled' => ['required', 'boolean'],
            'notify_automation_enabled' => ['required', 'boolean'],
            'notify_leads_enabled' => ['required', 'boolean'],
            'notify_templates_enabled' => ['required', 'boolean'],
            'notify_email_enabled' => ['required', 'boolean'],
            'notify_in_app_enabled' => ['required', 'boolean'],
            'quiet_hours_enabled' => ['required', 'boolean'],
            'quiet_hours_start' => ['nullable', 'date_format:H:i'],
            'quiet_hours_end' => ['nullable', 'date_format:H:i'],
        ]);

        $request->user()->forceFill($validated)->save();

        return response()->json([
            'ok' => true,
            'notifications' => $this->notificationPayload($request->user()->fresh()),
        ]);
    }

    public function workspaces(Request $request): JsonResponse
    {
        $user = $request->user();
        $current = $this->account($request);

        return response()->json([
            'current_account_id' => $current->id,
            'items' => $this->accountsPayload($user, $current),
        ]);
    }

    public function workspace(Request $request): JsonResponse
    {
        $account = $this->account($request);
        $user = $request->user();

        return response()->json([
            'workspace' => $this->workspacePayload($account, $user),
            'workspace_types' => Account::workspaceTypes(),
            'can_update' => $this->canManageWorkspace($account, $user),
        ]);
    }

    public function updateWorkspace(Request $request): JsonResponse
    {
        $account = $this->account($request);
        $user = $request->user();

        abort_unless($this->canManageWorkspace($account, $user), 403, 'Only workspace owners and admins can update workspace settings.');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'workspace_type' => ['required', 'string', Rule::in(array_keys(Account::workspaceTypes()))],
            'industry' => ['nullable', 'string', 'max:120'],
            'timezone' => ['required', 'timezone'],
            'billing_name' => ['nullable', 'string', 'max:255'],
            'billing_email' => ['nullable', 'email', 'max:255'],
            'billing_gstin' => ['nullable', 'string', 'max:20'],
            'billing_address_line1' => ['nullable', 'string', 'max:255'],
            'billing_address_line2' => ['nullable', 'string', 'max:255'],
            'billing_city' => ['nullable', 'string', 'max:120'],
            'billing_state' => ['nullable', 'string', 'max:120'],
            'billing_state_code' => ['nullable', 'string', 'max:8'],
            'billing_postal_code' => ['nullable', 'string', 'max:20'],
            'billing_country' => ['nullable', 'string', 'max:2'],
        ]);

        $account->forceFill([
            'name' => $validated['name'],
            'workspace_type' => $validated['workspace_type'],
            'industry' => $validated['industry'] ?? null,
            'timezone' => $validated['timezone'],
            'billing_name' => $validated['billing_name'] ?? null,
            'billing_email' => $validated['billing_email'] ?? null,
            'billing_gstin' => strtoupper((string) ($validated['billing_gstin'] ?? '')) ?: null,
            'billing_address_line1' => $validated['billing_address_line1'] ?? null,
            'billing_address_line2' => $validated['billing_address_line2'] ?? null,
            'billing_city' => $validated['billing_city'] ?? null,
            'billing_state' => $validated['billing_state'] ?? null,
            'billing_state_code' => strtoupper((string) ($validated['billing_state_code'] ?? '')) ?: null,
            'billing_postal_code' => $validated['billing_postal_code'] ?? null,
            'billing_country' => strtoupper((string) ($validated['billing_country'] ?? 'IN')) ?: 'IN',
        ])->save();

        return response()->json([
            'ok' => true,
            'workspace' => $this->workspacePayload($account->fresh(), $user),
        ]);
    }

    public function billing(Request $request, PlanResolver $plans, UsageService $usageService): JsonResponse
    {
        $account = $this->account($request)->loadMissing(['subscription.plan', 'wallet']);
        $currentPlan = $plans->getAccountPlan($account);
        $usage = $usageService->getCurrentUsage($account);
        $limits = $plans->getEffectiveLimits($account);

        return response()->json([
            'current_plan' => $currentPlan ? $this->planPayload($currentPlan, $currentPlan->id === $account->subscription?->plan_id) : null,
            'subscription' => $account->subscription ? [
                'id' => $account->subscription->id,
                'status' => $account->subscription->status,
                'provider' => $account->subscription->provider,
                'current_period_start' => $account->subscription->current_period_start?->toIso8601String(),
                'current_period_end' => $account->subscription->current_period_end?->toIso8601String(),
                'trial_ends_at' => $account->subscription->trial_ends_at?->toIso8601String(),
                'cancel_at_period_end' => (bool) $account->subscription->cancel_at_period_end,
                'last_payment_at' => $account->subscription->last_payment_at?->toIso8601String(),
                'last_payment_failed_at' => $account->subscription->last_payment_failed_at?->toIso8601String(),
                'last_error' => $account->subscription->last_error,
            ] : null,
            'wallet' => [
                'balance_minor' => $account->wallet?->balance_minor ?? 0,
                'currency' => $account->wallet?->currency ?? 'INR',
                'is_active' => (bool) ($account->wallet?->is_active ?? false),
            ],
            'usage' => $usage->only([
                'period',
                'messages_sent',
                'template_sends',
                'ai_credits_used',
                'ai_requests',
                'ai_estimated_tokens',
                'meta_conversations_free_used',
                'meta_conversations_paid',
                'storage_bytes',
            ]),
            'limits' => $limits,
            'plans' => Plan::query()
                ->where('is_active', true)
                ->where('is_public', true)
                ->orderBy('sort_order')
                ->orderBy('price_monthly')
                ->get()
                ->map(fn (Plan $plan) => $this->planPayload($plan, $currentPlan?->id === $plan->id))
                ->values(),
            'recent_orders' => Schema::hasTable('payment_orders')
                ? PaymentOrder::query()
                    ->where('account_id', $account->id)
                    ->with('plan:id,name,key')
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn (PaymentOrder $order) => [
                        'id' => $order->id,
                        'invoice_number' => $order->invoice_number,
                        'plan_name' => $order->plan?->name,
                        'amount' => $order->amount,
                        'currency' => $order->currency,
                        'status' => $order->status,
                        'payment_method' => $order->payment_method,
                        'created_at' => $order->created_at?->toIso8601String(),
                        'paid_at' => $order->paid_at?->toIso8601String(),
                    ])
                    ->values()
                : [],
        ]);
    }

    private function account(Request $request): Account
    {
        $account = $request->attributes->get('account');
        abort_unless($account instanceof Account, 422, 'No workspace is available for this user.');

        return $account;
    }

    private function canManageWorkspace(Account $account, User $user): bool
    {
        if ((int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $role = $account->users()->where('user_id', $user->id)->first()?->pivot?->role;

        return in_array($role, ['owner', 'admin'], true);
    }

    private function accountsPayload(User $user, Account $current): array
    {
        return $user->ownedAccounts()
            ->get()
            ->merge($user->accounts()->get())
            ->unique('id')
            ->values()
            ->map(fn (Account $account) => [
                ...$this->workspacePayload($account, $user),
                'is_current' => (int) $account->id === (int) $current->id,
            ])
            ->all();
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'country_code' => $user->country_code,
            'phone' => $user->phone,
            'job_title' => $user->job_title,
            'timezone' => $user->timezone,
            'locale' => $user->locale,
            'is_platform_admin' => (bool) $user->is_platform_admin,
        ];
    }

    private function workspacePayload(Account $account, User $user): array
    {
        $role = (int) $account->owner_id === (int) $user->id ? 'owner' : ($account->pivot?->role ?? 'member');

        return [
            'id' => $account->id,
            'name' => $account->name,
            'slug' => $account->slug,
            'role' => $role,
            'status' => $account->status,
            'workspace_type' => $account->workspace_type ?: 'business',
            'workspace_type_label' => $account->workspace_type_label,
            'industry' => $account->industry,
            'timezone' => $account->timezone ?: config('app.timezone', 'UTC'),
            'logo_url' => $account->logo_path ? Storage::disk('public')->url($account->logo_path) : null,
            'billing_name' => $account->billing_name,
            'billing_email' => $account->billing_email,
            'billing_gstin' => $account->billing_gstin,
            'billing_address_line1' => $account->billing_address_line1,
            'billing_address_line2' => $account->billing_address_line2,
            'billing_city' => $account->billing_city,
            'billing_state' => $account->billing_state,
            'billing_state_code' => $account->billing_state_code,
            'billing_postal_code' => $account->billing_postal_code,
            'billing_country' => $account->billing_country ?: 'IN',
            'team_count' => 1 + $account->users()->count(),
            'can_update' => $this->canManageWorkspace($account, $user),
        ];
    }

    private function notificationPayload(User $user): array
    {
        return [
            'notify_assignment_enabled' => $user->notify_assignment_enabled ?? true,
            'notify_mention_enabled' => $user->notify_mention_enabled ?? true,
            'notify_sound_enabled' => $user->notify_sound_enabled ?? true,
            'notify_billing_enabled' => $user->notify_billing_enabled ?? true,
            'notify_waba_enabled' => $user->notify_waba_enabled ?? true,
            'notify_automation_enabled' => $user->notify_automation_enabled ?? true,
            'notify_leads_enabled' => $user->notify_leads_enabled ?? true,
            'notify_templates_enabled' => $user->notify_templates_enabled ?? true,
            'notify_email_enabled' => $user->notify_email_enabled ?? true,
            'notify_in_app_enabled' => $user->notify_in_app_enabled ?? true,
            'quiet_hours_enabled' => $user->quiet_hours_enabled ?? false,
            'quiet_hours_start' => $user->quiet_hours_start,
            'quiet_hours_end' => $user->quiet_hours_end,
        ];
    }

    private function planPayload(Plan $plan, bool $isCurrent): array
    {
        return [
            'id' => $plan->id,
            'key' => $plan->key,
            'name' => $plan->name,
            'description' => $plan->description,
            'price_monthly' => $plan->price_monthly,
            'price_yearly' => $plan->price_yearly,
            'currency' => $plan->currency ?: 'INR',
            'trial_days' => $plan->trial_days,
            'limits' => $plan->limits ?? [],
            'modules' => $plan->modules ?? [],
            'features' => $plan->publicFeatures(),
            'is_current' => $isCurrent,
        ];
    }
}
