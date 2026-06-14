<?php

namespace App\Services;

use App\Models\Account;
use App\Models\AccountRole;
use App\Models\User;

class WorkspacePermissionService
{
    public function can(User $user, Account $account, string $permission): bool
    {
        if ($user->isSuperAdmin() || (int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $membership = $account->users()->where('user_id', $user->id)->first();
        $role = $membership?->pivot?->role;
        if ($role === 'owner') {
            return true;
        }
        if ($role === 'admin') {
            return ! str_ends_with($permission, '.owner');
        }
        if ($role === 'member' || ! $role) {
            return in_array($permission, ['inbox', 'contacts.view'], true);
        }

        $permissions = AccountRole::where('account_id', $account->id)->where('key', $role)->value('permissions') ?? [];
        if (is_string($permissions)) {
            $permissions = json_decode($permissions, true) ?: [];
        }

        return in_array($permission, $permissions, true)
            || in_array(str($permission)->before('.')->toString(), $permissions, true);
    }

    public function assert(User $user, Account $account, string $permission): void
    {
        abort_unless($this->can($user, $account, $permission), 403, 'Your role does not have permission for this action.');
    }

    public function assertOwner(User $user, Account $account): void
    {
        abort_unless($user->isSuperAdmin() || (int) $account->owner_id === (int) $user->id, 403, 'Only the workspace owner can perform this action.');
    }
}
