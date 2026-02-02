<?php

namespace App\Modules\Chatbots\Policies;

use App\Models\User;
use App\Models\Workspace;
use App\Modules\Chatbots\Models\Bot;

class ChatbotPolicy
{
    /**
     * Determine if user can view bots.
     */
    public function viewAny(User $user, Workspace $workspace): bool
    {
        // Owner and admin can view
        return $workspace->owner_id === $user->id ||
               $workspace->users()->where('user_id', $user->id)->where('role', 'admin')->exists();
    }

    /**
     * Determine if user can manage bots.
     */
    public function manage(User $user, Workspace $workspace): bool
    {
        // Only owner and admin can manage
        return $workspace->owner_id === $user->id ||
               $workspace->users()->where('user_id', $user->id)->where('role', 'admin')->exists();
    }

    /**
     * Determine if user can run test.
     */
    public function runTest(User $user, Workspace $workspace): bool
    {
        return $this->manage($user, $workspace);
    }
}
