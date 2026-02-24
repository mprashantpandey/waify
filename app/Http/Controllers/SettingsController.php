<?php

namespace App\Http\Controllers;

use App\Services\PhoneVerificationService;
use App\Services\PlatformSettingsService;
use Illuminate\Support\Facades\DB;
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
        $security = app(PlatformSettingsService::class)->getSecurity();

        $sessionRows = collect();
        if (DB::getSchemaBuilder()->hasTable('sessions')) {
            $sessionRows = DB::table('sessions')
                ->where('user_id', $user->id)
                ->orderByDesc('last_activity')
                ->limit(20)
                ->get();
        }

        $currentSessionId = $request->session()->getId();
        $sessions = $sessionRows->map(function ($row) use ($currentSessionId) {
            return [
                'id' => (string) $row->id,
                'ip_address' => $row->ip_address,
                'user_agent' => $row->user_agent,
                'last_activity_at' => \Carbon\Carbon::createFromTimestamp((int) $row->last_activity)->toIso8601String(),
                'is_current' => (string) $row->id === (string) $currentSessionId,
            ];
        })->values();

        return Inertia::render('Settings/Index', [
            'account' => $account,
            'auth' => [
                'user' => $user,
            ],
            'mustVerifyEmail' => $user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail,
            'emailVerified' => (bool) $user?->hasVerifiedEmail(),
            'phoneVerified' => !empty($user?->phone_verified_at),
            'securityPolicy' => [
                'password_min_length' => (int) ($security['password_min_length'] ?? 8),
                'password_require_uppercase' => (bool) ($security['password_require_uppercase'] ?? false),
                'password_require_lowercase' => (bool) ($security['password_require_lowercase'] ?? false),
                'password_require_numbers' => (bool) ($security['password_require_numbers'] ?? false),
                'password_require_symbols' => (bool) ($security['password_require_symbols'] ?? false),
                'require_2fa' => (bool) ($security['require_2fa'] ?? false),
                'session_timeout' => (int) ($security['session_timeout'] ?? 120),
                'max_login_attempts' => (int) ($security['max_login_attempts'] ?? 5),
                'lockout_duration' => (int) ($security['lockout_duration'] ?? 15),
            ],
            'sessions' => $sessions,
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
        ]);

        $user->update($validated);

        return back()->with('success', 'Notification preferences updated.');
    }

    public function revokeOtherSessions(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors([
                'revoke_other_sessions_password' => 'Current password is incorrect.',
            ]);
        }

        if (DB::getSchemaBuilder()->hasTable('sessions')) {
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        }

        return back()->with('success', 'Signed out from other devices.');
    }

    public function revokeSession(Request $request, string $sessionId)
    {
        $user = $request->user();

        if ((string) $sessionId === (string) $request->session()->getId()) {
            return back()->with('error', 'You cannot revoke the current session from this action.');
        }

        if (DB::getSchemaBuilder()->hasTable('sessions')) {
            DB::table('sessions')
                ->where('id', $sessionId)
                ->where('user_id', $user->id)
                ->delete();
        }

        return back()->with('success', 'Session revoked.');
    }

    public function resendVerification(Request $request)
    {
        $user = $request->user();

        if (!($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail)) {
            return back()->with('info', 'Email verification is not required for this account.');
        }

        if ($user->hasVerifiedEmail()) {
            return back()->with('info', 'Your email is already verified.');
        }

        $user->sendEmailVerificationNotification();

        return back()->with('success', 'Verification email sent.');
    }

    public function sendPhoneVerificationCode(Request $request, PhoneVerificationService $service)
    {
        $user = $request->user();

        $result = $service->sendCode($user);

        if (!$result['ok']) {
            return back()->with('error', $result['message']);
        }

        $channel = $result['delivery_channel'] ?? 'unknown';
        $message = $channel === 'email_fallback'
            ? 'Verification code sent (email fallback delivery is active for now).'
            : 'Verification code sent.';

        return back()->with('success', $message);
    }

    public function verifyPhoneVerificationCode(Request $request, PhoneVerificationService $service)
    {
        $validated = $request->validate([
            'otp_code' => 'required|string|min:4|max:10',
        ]);

        $result = $service->verifyCode($request->user(), (string) $validated['otp_code']);

        if (!$result['ok']) {
            return back()->withErrors([
                'otp_code' => $result['message'],
            ])->with('error', $result['message']);
        }

        return back()->with('success', $result['message']);
    }
}
