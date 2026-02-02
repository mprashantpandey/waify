<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function start(Request $request, Workspace $workspace): RedirectResponse
    {
        $ownerId = $workspace->owner_id;
        if (!$ownerId) {
            return redirect()->back()->with('error', 'Workspace owner not found.');
        }

        if (!$request->session()->has('impersonator_id')) {
            $request->session()->put('impersonator_id', $request->user()->id);
        }
        $request->session()->put('impersonated_workspace_id', $workspace->id);

        Auth::loginUsingId($ownerId);

        return redirect()->route('app.dashboard', ['workspace' => $workspace->slug])
            ->with('success', 'You are now impersonating this workspace owner.');
    }

    public function leave(Request $request): RedirectResponse
    {
        $impersonatorId = $request->session()->get('impersonator_id');
        if (!$impersonatorId) {
            return redirect()->back();
        }

        Auth::loginUsingId($impersonatorId);
        $request->session()->forget(['impersonator_id', 'impersonated_workspace_id']);

        return redirect()->route('platform.dashboard')
            ->with('success', 'Impersonation ended.');
    }
}
