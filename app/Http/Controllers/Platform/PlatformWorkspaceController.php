<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformWorkspaceController extends Controller
{
    /**
     * Display a listing of all workspaces.
     */
    public function index(Request $request): Response
    {
        $query = Workspace::with('owner');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $workspaces = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($workspace) {
                return [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'status' => $workspace->status,
                    'disabled_reason' => $workspace->disabled_reason,
                    'disabled_at' => $workspace->disabled_at?->toIso8601String(),
                    'owner' => [
                        'id' => $workspace->owner->id,
                        'name' => $workspace->owner->name,
                        'email' => $workspace->owner->email,
                    ],
                    'created_at' => $workspace->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Platform/Workspaces/Index', [
            'workspaces' => $workspaces,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Display the specified workspace.
     */
    public function show(Workspace $workspace): Response
    {
        $workspace->load(['owner', 'users', 'modules']);

        // Get WhatsApp connection count
        $whatsappConnectionsCount = 0;
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConnection::class)) {
            $whatsappConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('workspace_id', $workspace->id)->count();
        }

        // Get conversation count
        $conversationsCount = 0;
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConversation::class)) {
            $conversationsCount = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('workspace_id', $workspace->id)->count();
        }

        return Inertia::render('Platform/Workspaces/Show', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'status' => $workspace->status,
                'disabled_reason' => $workspace->disabled_reason,
                'disabled_at' => $workspace->disabled_at?->toIso8601String(),
                'owner' => [
                    'id' => $workspace->owner->id,
                    'name' => $workspace->owner->name,
                    'email' => $workspace->owner->email,
                ],
                'members_count' => $workspace->users->count(),
                'modules_enabled' => $workspace->modules->where('enabled', true)->count(),
                'whatsapp_connections_count' => $whatsappConnectionsCount,
                'conversations_count' => $conversationsCount,
                'created_at' => $workspace->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Disable a workspace.
     */
    public function disable(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $workspace->disable($validated['reason'] ?? null);

        return redirect()->back()->with('success', 'Workspace disabled successfully.');
    }

    /**
     * Enable a workspace.
     */
    public function enable(Workspace $workspace)
    {
        $workspace->enable();

        return redirect()->back()->with('success', 'Workspace enabled successfully.');
    }
}
