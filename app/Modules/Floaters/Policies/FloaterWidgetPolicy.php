<?php

namespace App\Modules\Floaters\Policies;

use App\Models\User;
use App\Modules\Floaters\Models\FloaterWidget;

class FloaterWidgetPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, FloaterWidget $widget): bool
    {
        return $widget->account->users->contains($user) ||
            (int) $widget->account->owner_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        $account = current_account();
        if (!$account) {
            return false;
        }

        $membership = $account->users()->where('user_id', $user->id)->first();
        if ($membership) {
            return in_array($membership->pivot->role, ['owner', 'admin'], true);
        }

        return (int) $account->owner_id === (int) $user->id;
    }

    public function update(User $user, FloaterWidget $widget): bool
    {
        $account = $widget->account;
        $membership = $account->users()->where('user_id', $user->id)->first();

        if ($membership) {
            return in_array($membership->pivot->role, ['owner', 'admin'], true);
        }

        return (int) $account->owner_id === (int) $user->id;
    }

    public function delete(User $user, FloaterWidget $widget): bool
    {
        return $this->update($user, $widget);
    }
}
