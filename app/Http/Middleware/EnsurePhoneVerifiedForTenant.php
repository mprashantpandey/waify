<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePhoneVerifiedForTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $account = $request->attributes->get('account') ?? current_account();

        if (!$user || !$account || !(bool) ($account->phone_verification_required ?? false)) {
            return $next($request);
        }

        $isVerified = !empty($user->phone) && !empty($user->phone_verified_at);
        if ($isVerified) {
            return $next($request);
        }

        // Allow access to settings/security endpoints so the user can complete verification,
        // and account switching/logout flows so they are not trapped.
        $routeName = $request->route()?->getName();
        if (in_array($routeName, [
            'app.settings',
            'app.settings.inbox',
            'app.settings.notifications',
            'app.settings.security.revoke-other-sessions',
            'app.settings.security.sessions.revoke',
            'app.settings.security.resend-verification',
            'app.settings.security.phone.send-code',
            'app.settings.security.phone.verify-code',
            'app.accounts.switch',
            'profile.update',
            'profile.edit',
            'logout',
        ], true)) {
            return $next($request);
        }

        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'message' => 'Phone verification is required by your tenant.',
            ], 403);
        }

        return redirect()->route('app.settings')
            ->with('warning', 'Your tenant requires phone verification. Please verify your phone number in Settings to continue.');
    }
}

