<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
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
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'created_at' => $user->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Platform/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): Response
    {
        $user->load(['ownedWorkspaces', 'workspaces']);

        return Inertia::render('Platform/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_super_admin' => $user->isSuperAdmin(),
                'owned_workspaces_count' => $user->ownedWorkspaces->count(),
                'member_workspaces_count' => $user->workspaces->count(),
                'created_at' => $user->created_at->toIso8601String(),
            ],
        ]);
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
                'error' => 'Cannot remove the last super admin.',
            ]);
        }

        $user->update(['is_platform_admin' => true]);

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
                'error' => 'Cannot remove the last super admin.',
            ]);
        }

        $user->update(['is_platform_admin' => false]);

        return redirect()->back()->with('success', 'Super admin status removed.');
    }
}
