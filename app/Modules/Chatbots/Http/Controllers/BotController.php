<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
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
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('viewAny', [Bot::class, $account]);

        $bots = Bot::where('account_id', $account->id)
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
                    'created_at' => $bot->created_at->toIso8601String()];
            });

        return Inertia::render('Chatbots/Index', [
            'account' => $account,
            'bots' => $bots]);
    }

    /**
     * Show the form for creating a new bot.
     */
    public function create(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('Chatbots/Create', [
            'account' => $account,
            'connections' => $connections]);
    }

    /**
     * Store a newly created bot.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,active,paused',
            'applies_to' => 'required|array',
            'applies_to.all_connections' => 'boolean',
            'applies_to.connection_ids' => 'array',
            'applies_to.connection_ids.*' => 'integer',
        ]);

        $appliesTo = $validated['applies_to'] ?? [];
        $allConnections = (bool) ($appliesTo['all_connections'] ?? false);
        $connectionIds = $appliesTo['connection_ids'] ?? [];
        if (!$allConnections && empty($connectionIds)) {
            return redirect()->back()
                ->withErrors(['applies_to.connection_ids' => 'Select at least one connection or enable "All connections".'])
                ->withInput();
        }
        if (!empty($connectionIds)) {
            $count = WhatsAppConnection::where('account_id', $account->id)
                ->whereIn('id', $connectionIds)
                ->count();
            if ($count !== count($connectionIds)) {
                return redirect()->back()
                    ->withErrors(['applies_to.connection_ids' => 'One or more selected connections are invalid.'])
                    ->withInput();
            }
        }

        $bot = Bot::create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'applies_to' => $validated['applies_to'],
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id]);

        return redirect()->route('app.chatbots.show', [
            'bot' => $bot->id])->with('success', 'Bot created successfully.');
    }

    /**
     * Display the specified bot.
     */
    public function show(Request $request, Bot $bot): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('viewAny', [Bot::class, $account]);

        if (!account_ids_match($bot->account_id, $account->id)) {
            abort(404);
        }

        $bot->load(['flows.nodes', 'flows.edges', 'creator', 'updater']);

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        $templates = \App\Modules\WhatsApp\Models\WhatsAppTemplate::where('account_id', $account->id)
            ->where('is_archived', false)
            ->orderBy('name')
            ->get(['id', 'name', 'language', 'status']);

        $tags = \App\Modules\Contacts\Models\ContactTag::where('account_id', $account->id)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $agents = collect();
        if ($account->owner) {
            $agents->push([
                'id' => $account->owner->id,
                'name' => $account->owner->name,
                'email' => $account->owner->email,
                'role' => 'owner',
            ]);
        }

        $accountMembers = $account->users()
            ->get(['users.id', 'users.name', 'users.email', 'account_users.role'])
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->pivot?->role ?? 'member',
                ];
            });

        $agents = $agents->merge($accountMembers)->unique('id')->values();

        return Inertia::render('Chatbots/Show', [
            'account' => $account,
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
                                'pos_x' => $node->pos_x,
                                'pos_y' => $node->pos_y];
                        }),
                        'edges' => $flow->edges->map(function ($edge) {
                            return [
                                'id' => $edge->id,
                                'from_node_id' => $edge->from_node_id,
                                'to_node_id' => $edge->to_node_id,
                                'label' => $edge->label,
                                'sort_order' => $edge->sort_order,
                            ];
                        }),
                    ];
                }),
            ],
            'connections' => $connections,
            'templates' => $templates,
            'tags' => $tags,
            'agents' => $agents,
        ]);
    }

    /**
     * Update the specified bot.
     */
    public function update(Request $request, Bot $bot)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($bot->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string|in:draft,active,paused',
            'applies_to' => 'required|array',
            'applies_to.all_connections' => 'boolean',
            'applies_to.connection_ids' => 'array',
            'applies_to.connection_ids.*' => 'integer',
        ]);

        $appliesTo = $validated['applies_to'] ?? [];
        $allConnections = (bool) ($appliesTo['all_connections'] ?? false);
        $connectionIds = $appliesTo['connection_ids'] ?? [];
        if (!$allConnections && empty($connectionIds)) {
            return redirect()->back()
                ->withErrors(['applies_to.connection_ids' => 'Select at least one connection or enable "All connections".'])
                ->withInput();
        }
        if (!empty($connectionIds)) {
            $count = WhatsAppConnection::where('account_id', $account->id)
                ->whereIn('id', $connectionIds)
                ->count();
            if ($count !== count($connectionIds)) {
                return redirect()->back()
                    ->withErrors(['applies_to.connection_ids' => 'One or more selected connections are invalid.'])
                    ->withInput();
            }
        }

        $wasDraft = $bot->status === 'draft';
        $isPublishing = $wasDraft && $validated['status'] === 'active';

        $bot->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'applies_to' => $validated['applies_to'],
            'version' => $isPublishing ? $bot->version + 1 : $bot->version,
            'updated_by' => $request->user()->id]);

        return redirect()->back()->with('success', 'Bot updated successfully.');
    }

    /**
     * Remove the specified bot.
     */
    public function destroy(Request $request, Bot $bot)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($bot->account_id, $account->id)) {
            abort(404);
        }

        $bot->delete();

        return redirect()->route('app.chatbots.index')
            ->with('success', 'Bot deleted successfully.');
    }
}
