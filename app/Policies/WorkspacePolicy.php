<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUser;

class WorkspacePolicy
{
    /**
     * Determine if user can view team members.
     */
    public function viewTeam(User $user, Workspace $workspace): bool
    {
        // Owner and admins can view team
        if ($workspace->owner_id === $user->id) {
            return true;
        }

        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $workspaceUser && in_array($workspaceUser->role, ['owner', 'admin']);
    }

    /**
     * Determine if user can manage team members.
     */
    public function manageTeam(User $user, Workspace $workspace): bool
    {
        // Only owner and admins can manage team
        if ($workspace->owner_id === $user->id) {
            return true;
        }

        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $workspaceUser && $workspaceUser->role === 'admin';
    }

    /**
     * Determine if user can update workspace settings.
     */
    public function updateSettings(User $user, Workspace $workspace): bool
    {
        // Only owner and admins can update settings
        if ($workspace->owner_id === $user->id) {
            return true;
        }

        $workspaceUser = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        return $workspaceUser && $workspaceUser->role === 'admin';
    }
}

