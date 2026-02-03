<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function start(Request $request, Account $account): RedirectResponse
    {
        $ownerId = $account->owner_id;
        if (!$ownerId) {
            return redirect()->back()->with('error', 'Account owner not found.');
        }

        if (!$request->session()->has('impersonator_id')) {
            $request->session()->put('impersonator_id', $request->user()->id);
        }
        $request->session()->put('impersonated_account_id', $account->id);

        Auth::loginUsingId($ownerId);

        return redirect()->route('app.dashboard')
            ->with('success', 'You are now impersonating this account owner.');
    }

    public function leave(Request $request): RedirectResponse
    {
        $impersonatorId = $request->session()->get('impersonator_id');
        if (!$impersonatorId) {
            return redirect()->back();
        }

        Auth::loginUsingId($impersonatorId);
        $request->session()->forget(['impersonator_id', 'impersonated_account_id']);

        return redirect()->route('platform.dashboard')
            ->with('success', 'Impersonation ended.');
    }
}
