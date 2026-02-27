<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\AccountInvitation;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status')]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->user()->isDirty('phone')) {
            $request->user()->phone_verified_at = null;
        }

        $request->user()->save();

        // Check if profile is now complete
        $user = $request->user();
        $isProfileComplete = !empty($user->name) && 
                             !empty($user->email) && 
                             !empty($user->phone);

        if ($isProfileComplete) {
            // If profile is complete and user came from onboarding, redirect to dashboard
            if (session('redirect_after_profile_complete')) {
                session()->forget('redirect_after_profile_complete');
                return Redirect::route('app.dashboard')->with('success', 'Profile updated successfully.');
            }
        }

        return Redirect::back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password']]);

        $user = $request->user();

        $ownedAccounts = $user->ownedAccounts()->get();
        $ownedAccountsCount = (int) $ownedAccounts->count();
        $memberAccountsCount = (int) $user->accounts()->count();

        // If user owns tenant accounts, we auto-delete those owned tenants only when no team members/invites exist.
        foreach ($ownedAccounts as $ownedAccount) {
            $teamMembersCount = (int) $ownedAccount->users()
                ->where('users.id', '!=', $user->id)
                ->count();
            $pendingInvitesCount = (int) AccountInvitation::where('account_id', $ownedAccount->id)->count();

            if ($teamMembersCount > 0 || $pendingInvitesCount > 0) {
                return Redirect::back()
                    ->withErrors([
                        'account' => 'Account deletion blocked: remove all team members and pending invites from your tenant first.',
                    ])
                    ->with('error', 'Account deletion blocked: remove all team members and pending invites from your tenant first.');
            }
        }

        if ($memberAccountsCount > 0) {
            return Redirect::back()
                ->withErrors([
                    'account' => 'Account deletion blocked: leave or be removed from all tenant teams first.',
                ])
                ->with('error', 'Account deletion blocked: leave or be removed from all tenant teams first.');
        }

        DB::transaction(function () use ($ownedAccounts) {
            foreach ($ownedAccounts as $ownedAccount) {
                AccountInvitation::where('account_id', $ownedAccount->id)->delete();
                $ownedAccount->users()->detach();
                $ownedAccount->delete();
            }
        });

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
