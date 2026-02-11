<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\User;
use App\Models\AccountUser;
use App\Models\AccountInvitation;
use App\Mail\AccountInvitationMail;
use App\Core\Billing\EntitlementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(
        protected EntitlementService $entitlementService
    ) {
    }

    /**
     * Check if user can view team.
     */
    private function canViewTeam(User $user, Account $account): bool
    {
        if ((int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $accountUser = AccountUser::where('account_id', $account->id)
            ->where('user_id', $user->id)
            ->first();

        return (bool) $accountUser;
    }

    /**
     * Check if user can manage team.
     */
    private function canManageTeam(User $user, Account $account): bool
    {
        if ((int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $accountUser = AccountUser::where('account_id', $account->id)
            ->where('user_id', $user->id)
            ->first();

        return $accountUser && $accountUser->role === 'admin';
    }

    /**
     * Display team members.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!$account) {
            abort(404, 'Account not found.');
        }
        $user = $request->user();
        
        // Check if user can view team
        if (!$this->canViewTeam($user, $account)) {
            abort(403, 'You do not have permission to view team members.');
        }

        // Get all members including owner
        $members = collect();
        
        // Add owner
        if ($account->owner) {
            $members->push([
                'id' => $account->owner->id,
                'name' => $account->owner->name,
                'email' => $account->owner->email,
                'role' => 'owner',
                'joined_at' => $account->created_at->toIso8601String(),
                'is_owner' => true]);
        }

        // Add account users (exclude owner to avoid duplicates)
        $accountUsersQuery = AccountUser::where('account_id', $account->id)
            ->with('user');
            
        // Exclude owner if owner_id exists
        if ($account->owner_id) {
            $accountUsersQuery->where('user_id', '!=', $account->owner_id);
        }
        
        $accountUsers = $accountUsersQuery->get()
            ->map(function ($accountUser) {
                return [
                    'id' => $accountUser->user->id,
                    'name' => $accountUser->user->name,
                    'email' => $accountUser->user->email,
                    'role' => $accountUser->role,
                    'joined_at' => $accountUser->created_at->toIso8601String(),
                    'is_owner' => false,
                    'account_user_id' => $accountUser->id];
            });

        $members = $members->merge($accountUsers);

        $currentUser = $request->user();
        $canManage = $this->canManageTeam($currentUser, $account);

        $pendingInvites = AccountInvitation::where('account_id', $account->id)
            ->whereNull('accepted_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (AccountInvitation $invitation) {
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role,
                    'invited_at' => $invitation->created_at?->toIso8601String(),
                    'expires_at' => $invitation->expires_at?->toIso8601String()];
            });

        return Inertia::render('App/Team/Index', [
            'account' => $account,
            'members' => $members->values(),
            'can_manage' => $canManage,
            'current_user_id' => $currentUser->id,
            'pending_invites' => $pendingInvites->values()]);
    }

    /**
     * Invite a new member.
     */
    public function invite(Request $request): \Illuminate\Http\RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!$account) {
            abort(404, 'Account not found.');
        }
        $user = $request->user();
        
        if (!$this->canManageTeam($user, $account)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,member']);

        $inviteEmail = strtolower(trim($request->email));
        $existingUser = User::where('email', $inviteEmail)->first();

        if ($existingUser && $existingUser->isSuperAdmin()) {
            return back()->with('error', 'You cannot add the platform admin user to a account.');
        }

        // Check if user is already a member
        if ($existingUser && $account->users()->where('user_id', $existingUser->id)->exists()) {
            return back()->with('error', 'User is already a member of this account.');
        }

        // Check if user is the owner
        if ($existingUser && (int) $account->owner_id === (int) $existingUser->id) {
            return back()->with('error', 'User is already the owner of this account.');
        }

        if (!$this->entitlementService->canCreateAgent($account)) {
            return back()->with('error', 'Your plan team limit has been reached. Upgrade to add more members.');
        }

        if ($existingUser) {
            // Enforce single-team membership for agents:
            // move user from any previous account memberships before adding here.
            $ownsAnotherAccount = Account::query()
                ->where('owner_id', $existingUser->id)
                ->where('id', '!=', $account->id)
                ->exists();

            if ($ownsAnotherAccount) {
                return back()->with('error', 'This user owns another account and cannot be auto-moved. Transfer ownership first.');
            }

            $removedMemberships = AccountUser::query()
                ->where('user_id', $existingUser->id)
                ->where('account_id', '!=', $account->id)
                ->delete();

            $account->users()->attach($existingUser->id, [
                'role' => $request->role]);

            $message = $removedMemberships > 0
                ? 'Member moved from previous team and added successfully.'
                : 'Member added successfully.';

            return back()->with('success', $message);
        }

        AccountInvitation::where('account_id', $account->id)
            ->where('email', $inviteEmail)
            ->whereNull('accepted_at')
            ->delete();

        $invitation = AccountInvitation::create([
            'account_id' => $account->id,
            'invited_by' => $user->id,
            'email' => $inviteEmail,
            'role' => $request->role,
            'token' => AccountInvitation::generateToken(),
            'expires_at' => now()->addDays(7)]);

        $inviteUrl = route('register', [
            'invite' => $invitation->token,
            'email' => $invitation->email,
        ]);

        try {
            Mail::to($inviteEmail)->send(new AccountInvitationMail($invitation));
        } catch (\Throwable $e) {
            Log::warning('Failed to send account invitation email', [
                'email' => $inviteEmail,
                'account_id' => $account->id,
                'error' => $e->getMessage()]);
            return back()
                ->with('warning', 'Invitation created, but email could not be sent. Share the invite link manually.')
                ->with('info', $inviteUrl);
        }

        return back()
            ->with('success', 'Invitation sent successfully.')
            ->with('info', "Invite link: {$inviteUrl}");
    }

    /**
     * Update member role.
     */
    public function updateRole(Request $request, $user): \Illuminate\Http\RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!$account) {
            abort(404, 'Account not found.');
        }
        $currentUser = $request->user();
        
        // Resolve user if not already a User instance
        if (!$user instanceof User) {
            $user = User::findOrFail($user);
        }
        
        if (!$this->canManageTeam($currentUser, $account)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        // Cannot change owner role
        if ((int) $account->owner_id === (int) $user->id) {
            return back()->with('error', 'Cannot change owner role.');
        }
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Cannot change platform admin role.');
        }

        $request->validate([
            'role' => 'required|in:admin,member']);

        if (!$account->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is not a member of this account.');
        }

        $account->users()->updateExistingPivot($user->id, [
            'role' => $request->role]);

        return back()->with('success', 'Member role updated successfully.');
    }

    /**
     * Remove a member.
     */
    public function remove(Request $request, $user)
    {
        $account = null;
        try {
            $account = $request->attributes->get('account') ?? current_account();
            if (!$account) {
                abort(404, 'Account not found.');
            }
            $currentUser = $request->user();
            
            // Resolve user if not already a User instance
            if (!$user instanceof User) {
                $userId = is_numeric($user) ? (int) $user : $user;
                $user = User::findOrFail($userId);
            }
            
            if (!$this->canManageTeam($currentUser, $account)) {
                abort(403, 'You do not have permission to manage team members.');
            }

            // Cannot remove owner
            if ((int) $account->owner_id === (int) $user->id) {
                return back()->with('error', 'Cannot remove account owner.');
            }
            if ($user->isSuperAdmin()) {
                return back()->with('error', 'Cannot remove platform admin from account.');
            }

            // Cannot remove yourself
            if ((int) $user->id === (int) $request->user()->id) {
                return back()->with('error', 'Cannot remove yourself from the account.');
            }

            if (!$account->users()->where('user_id', $user->id)->exists()) {
                return back()->with('error', 'User is not a member of this account.');
            }

            $account->users()->detach($user->id);

            // For Inertia requests, return a proper response
            if ($request->header('X-Inertia')) {
                return redirect()->route('app.team.index')
                    ->with('success', 'Member removed successfully.');
            }

            return back()->with('success', 'Member removed successfully.');
        } catch (\Exception $e) {
            Log::error('Team member removal failed', [
                'user_id' => $user instanceof User ? $user->id : $user,
                'account_id' => $account?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()]);
            
            return back()->with('error', 'Failed to remove member: ' . $e->getMessage());
        }
    }

    /**
     * Revoke a pending invite.
     */
    public function revokeInvite(Request $request, AccountInvitation $invitation): \Illuminate\Http\RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!$account) {
            abort(404, 'Account not found.');
        }
        $currentUser = $request->user();

        if (!$this->canManageTeam($currentUser, $account)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        if (!account_ids_match($invitation->account_id, $account->id)) {
            abort(403, 'Invite does not belong to this account.');
        }

        if ($invitation->accepted_at) {
            return back()->with('error', 'Invite has already been accepted.');
        }

        $invitation->delete();

        return back()->with('success', 'Invitation revoked successfully.');
    }

    /**
     * Resend a pending invite.
     */
    public function resendInvite(Request $request, AccountInvitation $invitation): \Illuminate\Http\RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!$account) {
            abort(404, 'Account not found.');
        }
        $currentUser = $request->user();

        if (!$this->canManageTeam($currentUser, $account)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        if (!account_ids_match($invitation->account_id, $account->id)) {
            abort(403, 'Invite does not belong to this account.');
        }

        if ($invitation->accepted_at) {
            return back()->with('error', 'Invite has already been accepted.');
        }

        // Always refresh token and expiry on resend.
        $invitation->update([
            'token' => AccountInvitation::generateToken(),
            'expires_at' => now()->addDays(7),
        ]);

        $invitation = $invitation->fresh();
        $inviteUrl = route('register', [
            'invite' => $invitation->token,
            'email' => $invitation->email,
        ]);

        try {
            Mail::to($invitation->email)->send(new AccountInvitationMail($invitation));
        } catch (\Throwable $e) {
            Log::warning('Failed to resend account invitation email', [
                'email' => $invitation->email,
                'account_id' => $account->id,
                'error' => $e->getMessage()]);
            return back()
                ->with('warning', 'Invite refreshed, but email could not be sent. Share the invite link manually.')
                ->with('info', $inviteUrl);
        }

        return back()
            ->with('success', 'Invitation resent successfully.')
            ->with('info', "Invite link: {$inviteUrl}");
    }
}
