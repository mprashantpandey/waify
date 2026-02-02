<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\User;
use App\Models\WorkspaceUser;
use App\Models\WorkspaceInvitation;
use App\Mail\WorkspaceInvitationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Check if user can view team.
     */
    private function canViewTeam(User $user, Workspace $workspace): bool
    {
        if ($workspace->owner_id === $user->id) {
            return true;
        }

        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return (bool) $workspaceUser;
    }

    /**
     * Check if user can manage team.
     */
    private function canManageTeam(User $user, Workspace $workspace): bool
    {
        if ($workspace->owner_id === $user->id) {
            return true;
        }

        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $workspaceUser && $workspaceUser->role === 'admin';
    }

    /**
     * Display team members.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        if (!$workspace) {
            abort(404, 'Workspace not found.');
        }
        $user = $request->user();
        
        // Check if user can view team
        if (!$this->canViewTeam($user, $workspace)) {
            abort(403, 'You do not have permission to view team members.');
        }

        // Get all members including owner
        $members = collect();
        
        // Add owner
        if ($workspace->owner) {
            $members->push([
                'id' => $workspace->owner->id,
                'name' => $workspace->owner->name,
                'email' => $workspace->owner->email,
                'role' => 'owner',
                'joined_at' => $workspace->created_at->toIso8601String(),
                'is_owner' => true,
            ]);
        }

        // Add workspace users (exclude owner to avoid duplicates)
        $workspaceUsersQuery = WorkspaceUser::where('workspace_id', $workspace->id)
            ->with('user');
            
        // Exclude owner if owner_id exists
        if ($workspace->owner_id) {
            $workspaceUsersQuery->where('user_id', '!=', $workspace->owner_id);
        }
        
        $workspaceUsers = $workspaceUsersQuery->get()
            ->map(function ($workspaceUser) {
                return [
                    'id' => $workspaceUser->user->id,
                    'name' => $workspaceUser->user->name,
                    'email' => $workspaceUser->user->email,
                    'role' => $workspaceUser->role,
                    'joined_at' => $workspaceUser->created_at->toIso8601String(),
                    'is_owner' => false,
                    'workspace_user_id' => $workspaceUser->id,
                ];
            });

        $members = $members->merge($workspaceUsers);

        $currentUser = $request->user();
        $canManage = $this->canManageTeam($currentUser, $workspace);

        $pendingInvites = WorkspaceInvitation::where('workspace_id', $workspace->id)
            ->whereNull('accepted_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (WorkspaceInvitation $invitation) {
                return [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role,
                    'invited_at' => $invitation->created_at?->toIso8601String(),
                    'expires_at' => $invitation->expires_at?->toIso8601String(),
                ];
            });

        return Inertia::render('App/Team/Index', [
            'workspace' => $workspace,
            'members' => $members->values(),
            'can_manage' => $canManage,
            'current_user_id' => $currentUser->id,
            'pending_invites' => $pendingInvites->values(),
        ]);
    }

    /**
     * Invite a new member.
     */
    public function invite(Request $request): \Illuminate\Http\RedirectResponse
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        if (!$workspace) {
            abort(404, 'Workspace not found.');
        }
        $user = $request->user();
        
        if (!$this->canManageTeam($user, $workspace)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,member',
        ]);

        $inviteEmail = strtolower(trim($request->email));
        $existingUser = User::where('email', $inviteEmail)->first();

        if ($existingUser && $existingUser->isSuperAdmin()) {
            return back()->with('error', 'You cannot add the platform admin user to a workspace.');
        }

        // Check if user is already a member
        if ($existingUser && $workspace->users()->where('user_id', $existingUser->id)->exists()) {
            return back()->with('error', 'User is already a member of this workspace.');
        }

        // Check if user is the owner
        if ($existingUser && $workspace->owner_id === $existingUser->id) {
            return back()->with('error', 'User is already the owner of this workspace.');
        }

        if ($existingUser) {
            $workspace->users()->attach($existingUser->id, [
                'role' => $request->role,
            ]);

            return back()->with('success', 'Member added successfully.');
        }

        WorkspaceInvitation::where('workspace_id', $workspace->id)
            ->where('email', $inviteEmail)
            ->whereNull('accepted_at')
            ->delete();

        $invitation = WorkspaceInvitation::create([
            'workspace_id' => $workspace->id,
            'invited_by' => $user->id,
            'email' => $inviteEmail,
            'role' => $request->role,
            'token' => WorkspaceInvitation::generateToken(),
            'expires_at' => now()->addDays(7),
        ]);

        try {
            Mail::to($inviteEmail)->send(new WorkspaceInvitationMail($invitation));
        } catch (\Throwable $e) {
            Log::warning('Failed to send workspace invitation email', [
                'email' => $inviteEmail,
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Invitation sent successfully.');
    }

    /**
     * Update member role.
     */
    public function updateRole(Request $request, $user): \Illuminate\Http\RedirectResponse
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        if (!$workspace) {
            abort(404, 'Workspace not found.');
        }
        $currentUser = $request->user();
        
        // Resolve user if not already a User instance
        if (!$user instanceof User) {
            $user = User::findOrFail($user);
        }
        
        if (!$this->canManageTeam($currentUser, $workspace)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        // Cannot change owner role
        if ($workspace->owner_id === $user->id) {
            return back()->with('error', 'Cannot change owner role.');
        }
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Cannot change platform admin role.');
        }

        $request->validate([
            'role' => 'required|in:admin,member',
        ]);

        if (!$workspace->users()->where('user_id', $user->id)->exists()) {
            return back()->with('error', 'User is not a member of this workspace.');
        }

        $workspace->users()->updateExistingPivot($user->id, [
            'role' => $request->role,
        ]);

        return back()->with('success', 'Member role updated successfully.');
    }

    /**
     * Remove a member.
     */
    public function remove(Request $request, $user)
    {
        $workspace = null;
        try {
            $workspace = $request->attributes->get('workspace') ?? current_workspace();
            if (!$workspace) {
                abort(404, 'Workspace not found.');
            }
            $currentUser = $request->user();
            
            // Resolve user if not already a User instance
            if (!$user instanceof User) {
                $userId = is_numeric($user) ? (int) $user : $user;
                $user = User::findOrFail($userId);
            }
            
            if (!$this->canManageTeam($currentUser, $workspace)) {
                abort(403, 'You do not have permission to manage team members.');
            }

            // Cannot remove owner
            if ($workspace->owner_id === $user->id) {
                return back()->with('error', 'Cannot remove workspace owner.');
            }
            if ($user->isSuperAdmin()) {
                return back()->with('error', 'Cannot remove platform admin from workspace.');
            }

            // Cannot remove yourself
            if ($user->id === $request->user()->id) {
                return back()->with('error', 'Cannot remove yourself from the workspace.');
            }

            if (!$workspace->users()->where('user_id', $user->id)->exists()) {
                return back()->with('error', 'User is not a member of this workspace.');
            }

            $workspace->users()->detach($user->id);

            // For Inertia requests, return a proper response
            if ($request->header('X-Inertia')) {
                return redirect()->route('app.team.index', ['workspace' => $workspace->slug])
                    ->with('success', 'Member removed successfully.');
            }

            return back()->with('success', 'Member removed successfully.');
        } catch (\Exception $e) {
            Log::error('Team member removal failed', [
                'user_id' => $user instanceof User ? $user->id : $user,
                'workspace_id' => $workspace?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return back()->with('error', 'Failed to remove member: ' . $e->getMessage());
        }
    }

    /**
     * Revoke a pending invite.
     */
    public function revokeInvite(Request $request, WorkspaceInvitation $invitation): \Illuminate\Http\RedirectResponse
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        if (!$workspace) {
            abort(404, 'Workspace not found.');
        }
        $currentUser = $request->user();

        if (!$this->canManageTeam($currentUser, $workspace)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        if ($invitation->workspace_id !== $workspace->id) {
            abort(403, 'Invite does not belong to this workspace.');
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
    public function resendInvite(Request $request, WorkspaceInvitation $invitation): \Illuminate\Http\RedirectResponse
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        if (!$workspace) {
            abort(404, 'Workspace not found.');
        }
        $currentUser = $request->user();

        if (!$this->canManageTeam($currentUser, $workspace)) {
            abort(403, 'You do not have permission to manage team members.');
        }

        if ($invitation->workspace_id !== $workspace->id) {
            abort(403, 'Invite does not belong to this workspace.');
        }

        if ($invitation->accepted_at) {
            return back()->with('error', 'Invite has already been accepted.');
        }

        if (!$invitation->isExpired()) {
            return back()->with('error', 'Invite is still active. You can resend after it expires.');
        }

        if ($invitation->isExpired()) {
            $invitation->update([
                'token' => WorkspaceInvitation::generateToken(),
                'expires_at' => now()->addDays(7),
            ]);
        }

        try {
            Mail::to($invitation->email)->send(new WorkspaceInvitationMail($invitation->fresh()));
        } catch (\Throwable $e) {
            Log::warning('Failed to resend workspace invitation email', [
                'email' => $invitation->email,
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage(),
            ]);
        }

        return back()->with('success', 'Invitation resent successfully.');
    }
}
