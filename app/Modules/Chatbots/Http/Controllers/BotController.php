<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Policies\ChatbotPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BotController extends Controller
{
    /**
     * Display a listing of bots.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('viewAny', [ChatbotPolicy::class, $workspace]);

        $bots = Bot::where('workspace_id', $workspace->id)
            ->with(['creator', 'updater'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bot) {
                $executions = $bot->executions()
                    ->where('created_at', '>=', now()->subDays(7))
                    ->get();

                return [
                    'id' => $bot->id,
                    'name' => $bot->name,
                    'description' => $bot->description,
                    'status' => $bot->status,
                    'is_default' => $bot->is_default,
                    'applies_to' => $bot->applies_to,
                    'version' => $bot->version,
                    'flows_count' => $bot->flows()->count(),
                    'executions_count' => $executions->count(),
                    'errors_count' => $executions->where('status', 'failed')->count(),
                    'last_run_at' => $executions->max('created_at')?->toIso8601String(),
                    'created_at' => $bot->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Chatbots/Index', [
            'workspace' => $workspace,
            'bots' => $bots,
        ]);
    }

    /**
     * Show the form for creating a new bot.
     */
    public function create(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('manage', [ChatbotPolicy::class, $workspace]);

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('Chatbots/Create', [
            'workspace' => $workspace,
            'connections' => $connections,
        ]);
    }

    /**
     * Store a newly created bot.
     */
    public function store(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('manage', [ChatbotPolicy::class, $workspace]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,active,paused',
            'applies_to' => 'required|array',
            'applies_to.all_connections' => 'boolean',
            'applies_to.connection_ids' => 'array',
        ]);

        $bot = Bot::create([
            'workspace_id' => $workspace->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'applies_to' => $validated['applies_to'],
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return redirect()->route('app.chatbots.show', [
            'workspace' => $workspace->slug,
            'bot' => $bot->id,
        ])->with('success', 'Bot created successfully.');
    }

    /**
     * Display the specified bot.
     */
    public function show(Request $request, Bot $bot): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('viewAny', [ChatbotPolicy::class, $workspace]);

        if ($bot->workspace_id !== $workspace->id) {
            abort(404);
        }

        $bot->load(['flows.nodes', 'creator', 'updater']);

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('Chatbots/Show', [
            'workspace' => $workspace,
            'bot' => [
                'id' => $bot->id,
                'name' => $bot->name,
                'description' => $bot->description,
                'status' => $bot->status,
                'is_default' => $bot->is_default,
                'applies_to' => $bot->applies_to,
                'version' => $bot->version,
                'flows' => $bot->flows->map(function ($flow) {
                    return [
                        'id' => $flow->id,
                        'name' => $flow->name,
                        'trigger' => $flow->trigger,
                        'enabled' => $flow->enabled,
                        'priority' => $flow->priority,
                        'nodes' => $flow->nodes->map(function ($node) {
                            return [
                                'id' => $node->id,
                                'type' => $node->type,
                                'config' => $node->config,
                                'sort_order' => $node->sort_order,
                            ];
                        }),
                    ];
                }),
            ],
            'connections' => $connections,
        ]);
    }

    /**
     * Update the specified bot.
     */
    public function update(Request $request, Bot $bot)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('manage', [ChatbotPolicy::class, $workspace]);

        if ($bot->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,active,paused',
            'applies_to' => 'required|array',
            'applies_to.all_connections' => 'boolean',
            'applies_to.connection_ids' => 'array',
        ]);

        $wasDraft = $bot->status === 'draft';
        $isPublishing = $wasDraft && $validated['status'] === 'active';

        $bot->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'applies_to' => $validated['applies_to'],
            'version' => $isPublishing ? $bot->version + 1 : $bot->version,
            'updated_by' => $request->user()->id,
        ]);

        return redirect()->back()->with('success', 'Bot updated successfully.');
    }

    /**
     * Remove the specified bot.
     */
    public function destroy(Request $request, Bot $bot)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('manage', [ChatbotPolicy::class, $workspace]);

        if ($bot->workspace_id !== $workspace->id) {
            abort(404);
        }

        $bot->delete();

        return redirect()->route('app.chatbots.index', ['workspace' => $workspace->slug])
            ->with('success', 'Bot deleted successfully.');
    }
}
