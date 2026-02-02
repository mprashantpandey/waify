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
        return $widget->workspace->users->contains($user) ||
            $widget->workspace->owner_id === $user->id;
    }

    public function create(User $user): bool
    {
        $workspace = current_workspace();
        if (!$workspace) {
            return false;
        }

        $membership = $workspace->users()->where('user_id', $user->id)->first();
        if ($membership) {
            return in_array($membership->pivot->role, ['owner', 'admin'], true);
        }

        return $workspace->owner_id === $user->id;
    }

    public function update(User $user, FloaterWidget $widget): bool
    {
        $workspace = $widget->workspace;
        $membership = $workspace->users()->where('user_id', $user->id)->first();

        if ($membership) {
            return in_array($membership->pivot->role, ['owner', 'admin'], true);
        }

        return $workspace->owner_id === $user->id;
    }

    public function delete(User $user, FloaterWidget $widget): bool
    {
        return $this->update($user, $widget);
    }
}
