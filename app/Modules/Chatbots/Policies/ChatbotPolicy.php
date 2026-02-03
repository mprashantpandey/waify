<?php

namespace App\Modules\Chatbots\Policies;

use App\Models\User;
use App\Models\Account;
use App\Modules\Chatbots\Models\Bot;

class ChatbotPolicy
{
    /**
     * Determine if user can view bots.
     */
    public function viewAny(User $user, Account $account): bool
    {
        // Owner and admin can view
        return $account->owner_id === $user->id ||
               $account->users()->where('user_id', $user->id)->where('role', 'admin')->exists();
    }

    /**
     * Determine if user can manage bots.
     */
    public function manage(User $user, Account $account): bool
    {
        // Only owner and admin can manage
        return $account->owner_id === $user->id ||
               $account->users()->where('user_id', $user->id)->where('role', 'admin')->exists();
    }

    /**
     * Determine if user can run test.
     */
    public function runTest(User $user, Account $account): bool
    {
        return $this->manage($user, $account);
    }
}
