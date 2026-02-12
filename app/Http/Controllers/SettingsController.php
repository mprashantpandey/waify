<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display unified settings page.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        return Inertia::render('Settings/Index', [
            'account' => $account,
            'auth' => [
                'user' => $user,
            ],
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
        ]);
    }

    /**
     * Update inbox settings.
     */
    public function updateInbox(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'auto_assign_enabled' => 'required|boolean',
            'auto_assign_strategy' => 'required|in:round_robin',
        ]);

        $account->update([
            'auto_assign_enabled' => $validated['auto_assign_enabled'],
            'auto_assign_strategy' => $validated['auto_assign_strategy'],
        ]);

        return back()->with('success', 'Inbox settings updated.');
    }

    /**
     * Update notification preferences.
     */
    public function updateNotifications(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'notify_assignment_enabled' => 'required|boolean',
            'notify_mention_enabled' => 'required|boolean',
            'notify_sound_enabled' => 'required|boolean',
            'ai_suggestions_enabled' => 'required|boolean',
        ]);

        $user->update($validated);

        return back()->with('success', 'Notification preferences updated.');
    }
}
