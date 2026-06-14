<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\User;
use App\Services\AppNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function start(Request $request, Account $account): RedirectResponse
    {
        $owner = $account->owner;
        if (! $owner) {
            return redirect()->back()->with('error', 'Account owner not found.');
        }

        if ($owner->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Super admin users cannot be impersonated.');
        }

        if ((int) $request->user()->id === (int) $owner->id) {
            return redirect()->back()->with('error', 'You cannot impersonate yourself.');
        }

        if (! $request->session()->has('impersonator_id')) {
            $request->session()->put('impersonator_id', $request->user()->id);
        }

        $request->session()->put('impersonated_user_id', $owner->id);
        $request->session()->put('impersonated_account_id', $account->id);
        $request->session()->put('current_account_id', $account->id);

        Auth::loginUsingId($owner->id);
        app(AppNotificationService::class)->auditDestructive(
            'platform_impersonation_started',
            "Started impersonating workspace {$account->name}",
            User::find($request->session()->get('impersonator_id')),
            $account,
            $owner,
            ['target_user_id' => $owner->id, 'target_email' => $owner->email, 'account_id' => $account->id],
            $request
        );

        return redirect()->route('app.dashboard')
            ->with('success', "You are now impersonating {$account->name}.");
    }

    public function startUser(Request $request, User $user): RedirectResponse
    {
        if ($user->isSuperAdmin()) {
            return redirect()->back()->with('error', 'Super admin users cannot be impersonated.');
        }

        if ((int) $request->user()->id === (int) $user->id) {
            return redirect()->back()->with('error', 'You cannot impersonate yourself.');
        }

        if (! $request->session()->has('impersonator_id')) {
            $request->session()->put('impersonator_id', $request->user()->id);
        }

        $request->session()->put('impersonated_user_id', $user->id);

        $account = $user->ownedAccounts()->first() ?? $user->accounts()->first();
        if ($account) {
            $request->session()->put('current_account_id', $account->id);
            $request->session()->put('impersonated_account_id', $account->id);
        } else {
            $request->session()->forget(['current_account_id', 'impersonated_account_id']);
        }

        Auth::loginUsingId($user->id);
        app(AppNotificationService::class)->auditDestructive(
            'platform_impersonation_started',
            "Started impersonating user {$user->email}",
            User::find($request->session()->get('impersonator_id')),
            $account,
            $user,
            ['target_user_id' => $user->id, 'target_email' => $user->email, 'account_id' => $account?->id],
            $request
        );

        return $account
            ? redirect()->route('app.dashboard')->with('success', "You are now impersonating {$user->email}.")
            : redirect()->route('onboarding')->with('success', "You are now impersonating {$user->email}.");
    }

    public function leave(Request $request): RedirectResponse
    {
        $impersonatorId = $request->session()->get('impersonator_id');
        if (! $impersonatorId) {
            return redirect()->back();
        }

        $impersonatedUserId = $request->session()->get('impersonated_user_id');
        $impersonatedAccountId = $request->session()->get('impersonated_account_id');
        $impersonator = User::find($impersonatorId);
        $impersonated = $impersonatedUserId ? User::find($impersonatedUserId) : null;
        $account = $impersonatedAccountId ? Account::find($impersonatedAccountId) : null;

        Auth::loginUsingId($impersonatorId);
        $request->session()->forget([
            'impersonator_id',
            'impersonated_account_id',
            'impersonated_user_id',
            'current_account_id',
        ]);
        app(AppNotificationService::class)->auditDestructive(
            'platform_impersonation_ended',
            $impersonated ? "Ended impersonation for {$impersonated->email}" : 'Ended impersonation',
            $impersonator,
            $account,
            $impersonated,
            ['target_user_id' => $impersonated?->id, 'target_email' => $impersonated?->email, 'account_id' => $account?->id],
            $request
        );

        return redirect()->route('platform.dashboard')
            ->with('success', 'Impersonation ended.');
    }
}
