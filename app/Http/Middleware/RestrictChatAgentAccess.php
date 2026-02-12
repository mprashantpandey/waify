<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictChatAgentAccess
{
    /**
     * Routes (or route name prefixes) that chat agents (role member) are allowed to access.
     */
    protected array $allowedForChatAgent = [
        'app.dashboard',
        'app.whatsapp.conversations',
        'app.whatsapp.inbox',
        'app.ai',
        'app.accounts.switch',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $account = $request->attributes->get('account') ?? current_account();

        if (!$user || !$account) {
            return $next($request);
        }

        // Platform admins have full access
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Owner has full access
        if ((int) $account->owner_id === (int) $user->id) {
            return $next($request);
        }

        $pivot = $account->users()->where('user_id', $user->id)->first()?->pivot;
        $role = $pivot?->role ?? null;

        // Only restrict members (chat agents); admin has full access
        if ($role !== 'member') {
            return $next($request);
        }

        $routeName = $request->route()?->getName();
        if (!$routeName) {
            return $next($request);
        }

        foreach ($this->allowedForChatAgent as $allowed) {
            if ($routeName === $allowed || str_starts_with($routeName, $allowed . '.')) {
                return $next($request);
            }
        }

        return redirect()->route('app.whatsapp.conversations.index')
            ->with('error', 'You do not have permission to access that page. Chat agents can only access Inbox and AI Assistant.');
    }
}
