<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\User;
use App\Services\AppNotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlatformUserController extends Controller
{
    /**
     * Display a listing of all users.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn ($user) => $this->userPayload($user));

        return Inertia::render('Platform/Users/Index', [
            'users' => $users,
            'accounts' => Account::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
                ->map(fn (Account $account) => [
                    'id' => $account->id,
                    'name' => $account->name,
                    'slug' => $account->slug,
                ]),
            'filters' => [
                'search' => $request->search],
            'selectedUser' => $this->selectedUserPayload($request)]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'is_super_admin' => ['nullable', 'boolean'],
            'account_id' => ['nullable', 'integer', 'exists:accounts,id'],
            'account_role' => ['nullable', Rule::in(['admin', 'member'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => strtolower($validated['email']),
            'password' => Hash::make($validated['password']),
            'is_platform_admin' => (bool) ($validated['is_super_admin'] ?? false),
        ]);

        if (! empty($validated['account_id']) && ! $user->isSuperAdmin()) {
            $account = Account::findOrFail((int) $validated['account_id']);
            $account->users()->syncWithoutDetaching([
                $user->id => ['role' => $validated['account_role'] ?? 'member'],
            ]);
        }

        return redirect()
            ->route('platform.users.index', ['user' => $user->id])
            ->with('success', 'User created successfully.');
    }

    protected function selectedUserPayload(Request $request): ?array
    {
        if (! $request->filled('user')) {
            return null;
        }

        $user = User::where('id', $request->input('user'))->first();

        return $user ? $this->userPayload($user, true) : null;
    }

    protected function userPayload(User $user, bool $full = false): array
    {
        $payload = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'is_super_admin' => $user->isSuperAdmin(),
            'created_at' => $user->created_at->toIso8601String(),
            'two_factor_enabled' => $user->two_factor_enabled_at !== null,
            'force_password_reset_at' => $user->force_password_reset_at?->toIso8601String(),
        ];

        if (! $full) {
            return $payload;
        }

        $user->load(['ownedAccounts', 'accounts']);

        return $payload + [
            'owned_accounts_count' => $user->ownedAccounts->count(),
            'member_accounts_count' => $user->accounts->count(),
        ];
    }

    /**
     * Make a user a super admin.
     */
    public function makeSuperAdmin(User $user)
    {
        // Prevent removing the last super admin
        $superAdminCount = User::where('is_platform_admin', true)->count();
        if ($user->isSuperAdmin() && $superAdminCount <= 1) {
            return redirect()->back()->withErrors([
                'error' => 'Cannot remove the last super admin.']);
        }

        $user->update(['is_platform_admin' => true]);
        app(AppNotificationService::class)->auditDestructive(
            'platform_user_admin_granted',
            "Platform admin access granted to {$user->email}",
            request()->user(),
            null,
            $user,
            ['target_user_id' => $user->id, 'target_email' => $user->email],
            request()
        );

        return redirect()->back()->with('success', 'User is now a super admin.');
    }

    /**
     * Remove super admin status from a user.
     */
    public function removeSuperAdmin(User $user)
    {
        // Prevent removing the last super admin
        $superAdminCount = User::where('is_platform_admin', true)->count();
        if ($superAdminCount <= 1) {
            return redirect()->back()->withErrors([
                'error' => 'Cannot remove the last super admin.']);
        }

        $user->update(['is_platform_admin' => false]);
        app(AppNotificationService::class)->auditDestructive(
            'platform_user_admin_removed',
            "Platform admin access removed from {$user->email}",
            request()->user(),
            null,
            $user,
            ['target_user_id' => $user->id, 'target_email' => $user->email],
            request()
        );

        return redirect()->back()->with('success', 'Super admin status removed.');
    }

    public function forcePasswordReset(Request $request, User $user)
    {
        $user->forceFill(['force_password_reset_at' => now()])->save();
        $this->revokeUserSessions($user, $request->user());
        app(AppNotificationService::class)->auditDestructive(
            'platform_user_force_password_reset',
            "Password reset forced for {$user->email}",
            $request->user(),
            null,
            $user,
            ['target_user_id' => $user->id, 'target_email' => $user->email],
            $request
        );

        return redirect()->back()->with('success', 'Password reset required and sessions revoked.');
    }

    public function clearPasswordReset(Request $request, User $user)
    {
        $user->forceFill(['force_password_reset_at' => null])->save();
        app(AppNotificationService::class)->auditDestructive(
            'platform_user_clear_password_reset',
            "Forced password reset cleared for {$user->email}",
            $request->user(),
            null,
            $user,
            ['target_user_id' => $user->id, 'target_email' => $user->email],
            $request
        );

        return redirect()->back()->with('success', 'Password reset requirement cleared.');
    }

    public function revokeSessions(Request $request, User $user)
    {
        $this->revokeUserSessions($user, $request->user());
        app(AppNotificationService::class)->auditDestructive(
            'platform_user_sessions_revoked',
            "Sessions revoked for {$user->email}",
            $request->user(),
            null,
            $user,
            ['target_user_id' => $user->id, 'target_email' => $user->email],
            $request
        );

        return redirect()->back()->with('success', 'User sessions revoked.');
    }

    protected function revokeUserSessions(User $user, ?User $actor = null): void
    {
        if (config('session.driver') === 'database' && \Illuminate\Support\Facades\Schema::hasTable(config('session.table', 'sessions'))) {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->when($actor && (int) $actor->id === (int) $user->id, fn ($query) => $query->where('id', '!=', request()->session()->getId()))
                ->delete();
        }

        $user->forceFill(['sessions_revoked_at' => now()])->save();
    }
}
