<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBotRequest;
use App\Http\Requests\UpdateBotRequest;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotActionJob;
use App\Modules\Chatbots\Models\BotExecution;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotEdge;
use App\Modules\Chatbots\Models\BotNode;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class BotController extends Controller
{
    protected function flowHealth(BotFlow $flow): array
    {
        $nodes = $flow->nodes;
        $hasNodes = $nodes->isNotEmpty();
        $hasExecutableNode = $nodes->contains(fn (BotNode $node) => in_array($node->type, ['action', 'delay', 'webhook'], true));
        $hasStartNode = $nodes->contains(fn (BotNode $node) => (bool) ($node->config['is_start'] ?? false));
        $hasEdges = $flow->edges->isNotEmpty();

        return [
            'has_nodes' => $hasNodes,
            'has_executable_node' => $hasExecutableNode,
            'has_start_node' => $hasStartNode,
            'has_edges' => $hasEdges,
            'is_runnable' => $flow->enabled && $hasNodes && $hasExecutableNode,
        ];
    }

    /**
     * Display a listing of bots.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('viewAny', [Bot::class, $account]);

        $sevenDaysAgo = now()->subDays(7);
        $bots = Bot::where('account_id', $account->id)
            ->with(['creator', 'updater', 'flows' => ['nodes', 'edges']])
            ->withCount([
                'executions as executions_last_7_count' => fn ($q) => $q->where('created_at', '>=', $sevenDaysAgo),
                'executions as errors_last_7_count' => fn ($q) => $q->where('created_at', '>=', $sevenDaysAgo)->where('status', 'failed'),
            ])
            ->withAggregate(['executions as last_run_at' => fn ($q) => $q->where('created_at', '>=', $sevenDaysAgo)], 'created_at', 'max')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($bot) {
                $enabledFlows = $bot->flows->where('enabled', true);
                $runnableFlows = $enabledFlows->filter(function (BotFlow $flow) {
                    $health = $this->flowHealth($flow);
                    return $health['is_runnable'] === true;
                });

                $lastRunAt = isset($bot->last_run_at) && $bot->last_run_at !== null
                    ? \Illuminate\Support\Carbon::parse($bot->last_run_at)
                    : null;

                return [
                    'id' => $bot->id,
                    'name' => $bot->name,
                    'description' => $bot->description,
                    'status' => $bot->status,
                    'is_default' => $bot->is_default,
                    'applies_to' => $bot->applies_to,
                    'version' => $bot->version,
                    'flows_count' => $bot->flows->count(),
                    'enabled_flows_count' => $enabledFlows->count(),
                    'runnable_flows_count' => $runnableFlows->count(),
                    'is_runnable' => $bot->status === 'active' ? $runnableFlows->isNotEmpty() : true,
                    'executions_count' => (int) ($bot->executions_last_7_count ?? 0),
                    'errors_count' => (int) ($bot->errors_last_7_count ?? 0),
                    'last_run_at' => $lastRunAt?->toIso8601String(),
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
    public function store(StoreBotRequest $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        Gate::authorize('manage', [Bot::class, $account]);

        $validated = $request->validated();
        $bot = Bot::create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'applies_to' => $validated['applies_to'],
            'stop_on_first_flow' => $validated['stop_on_first_flow'] ?? true,
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
        $flowHealthById = $bot->flows->mapWithKeys(function (BotFlow $flow) {
            return [(int) $flow->id => $this->flowHealth($flow)];
        });

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        $templates = \App\Modules\WhatsApp\Models\WhatsAppTemplate::where('account_id', $account->id)
            ->whereRaw('LOWER(TRIM(status)) = ?', ['approved'])
            ->where(function ($query) {
                $query->where('is_archived', false)
                    ->orWhereNull('is_archived');
            })
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
                'stop_on_first_flow' => $bot->stop_on_first_flow ?? true,
                'version' => $bot->version,
                'flows' => $bot->flows->map(function ($flow) {
                    return [
                        'id' => $flow->id,
                        'name' => $flow->name,
                        'trigger' => $flow->trigger,
                        'enabled' => $flow->enabled,
                        'priority' => $flow->priority,
                        'health' => $flowHealthById[(int) $flow->id] ?? null,
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
                'health' => [
                    'enabled_flows_count' => $bot->flows->where('enabled', true)->count(),
                    'runnable_flows_count' => $bot->flows
                        ->filter(fn (BotFlow $flow) => (($flowHealthById[(int) $flow->id]['is_runnable'] ?? false) === true))
                        ->count(),
                ],
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
    public function update(UpdateBotRequest $request, Bot $bot)
    {
        $account = $request->attributes->get('account') ?? current_account();
        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($bot->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validated();
        $wasDraft = $bot->status === 'draft';
        $isPublishing = $wasDraft && $validated['status'] === 'active';

        $bot->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'applies_to' => $validated['applies_to'],
            'stop_on_first_flow' => $validated['stop_on_first_flow'] ?? $bot->stop_on_first_flow ?? true,
            'version' => $isPublishing ? $bot->version + 1 : $bot->version,
            'updated_by' => $request->user()->id]);

        $runnableFlowsCount = $bot->flows()
            ->where('enabled', true)
            ->whereHas('nodes', function ($query) {
                $query->whereIn('type', ['action', 'delay', 'webhook']);
            })
            ->count();

        if ($bot->status === 'active' && $runnableFlowsCount === 0) {
            return redirect()->back()
                ->with('success', 'Bot updated successfully.')
                ->with('warning', 'Bot is active but has no runnable flow yet.');
        }

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

        try {
            DB::transaction(function () use ($bot, $account) {
                // If we are deleting the default bot, promote another bot (if any) so UI/runtime stays sane.
                if ($bot->is_default) {
                    $replacement = Bot::where('account_id', $account->id)
                        ->where('id', '!=', $bot->id)
                        ->orderBy('id')
                        ->first();

                    if ($replacement) {
                        $replacement->update(['is_default' => true]);
                    }
                }

                // Explicitly delete related records even though FK cascades should handle it.
                // This prevents "cannot delete" issues when constraints are missing/misconfigured in prod.
                $executionIds = BotExecution::where('bot_id', $bot->id)->pluck('id');
                if ($executionIds->isNotEmpty()) {
                    BotActionJob::whereIn('bot_execution_id', $executionIds)->delete();
                }

                BotExecution::where('bot_id', $bot->id)->delete();

                // Delete flows (and their nodes/edges via FK cascades, but delete edges first to avoid ordering issues).
                $flowIds = BotFlow::where('bot_id', $bot->id)->pluck('id');
                if ($flowIds->isNotEmpty()) {
                    // Edges depend on nodes; safest is to delete edges explicitly.
                    BotEdge::whereIn('bot_flow_id', $flowIds)->delete();
                    BotNode::whereIn('bot_flow_id', $flowIds)->delete();
                }
                BotFlow::where('bot_id', $bot->id)->delete();

                $bot->delete();
            });
        } catch (\Throwable $e) {
            Log::error('Failed to delete bot', [
                'bot_id' => $bot->id,
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Unable to delete bot right now. Please try again.',
            ]);
        }

        return redirect()->route('app.chatbots.index')
            ->with('success', 'Bot deleted successfully.');
    }
}
