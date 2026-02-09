<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BotFlowController extends Controller
{
    /**
     * Store a newly created flow.
     */
    public function store(Request $request, Bot $bot)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($bot->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger' => 'required|array',
            'trigger.type' => 'required|string|in:inbound_message,keyword,button_reply',
            'enabled' => 'boolean',
            'priority' => 'integer|min:0|max:1000',
            'nodes' => 'nullable|array',
            'edges' => 'nullable|array',
        ]);

        $flow = BotFlow::create([
            'account_id' => $account->id,
            'bot_id' => $bot->id,
            'name' => $validated['name'],
            'trigger' => $validated['trigger'],
            'enabled' => $validated['enabled'] ?? true,
            'priority' => $validated['priority'] ?? 100]);

        $nodes = $validated['nodes'] ?? [];
        if (!empty($nodes)) {
            $sortOrder = 1;
            foreach ($nodes as $node) {
                if (!is_array($node)) {
                    continue;
                }

                $flow->nodes()->create([
                    'account_id' => $account->id,
                    'type' => $node['type'] ?? 'action',
                    'config' => $node['config'] ?? [],
                    'sort_order' => $node['sort_order'] ?? $sortOrder,
                    'pos_x' => $node['pos_x'] ?? null,
                    'pos_y' => $node['pos_y'] ?? null,
                ]);
                $sortOrder++;
            }
        }

        $edges = $validated['edges'] ?? [];
        if (!empty($edges)) {
            $sortOrder = 1;
            foreach ($edges as $edge) {
                if (!is_array($edge)) {
                    continue;
                }
                $flow->edges()->create([
                    'account_id' => $account->id,
                    'from_node_id' => $edge['from_node_id'] ?? null,
                    'to_node_id' => $edge['to_node_id'] ?? null,
                    'label' => $edge['label'] ?? null,
                    'sort_order' => $edge['sort_order'] ?? $sortOrder,
                ]);
                $sortOrder++;
            }
        }

        return redirect()->back()->with('success', 'Flow created successfully.');
    }

    /**
     * Update the specified flow.
     */
    public function update(Request $request, BotFlow $flow)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($flow->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'trigger' => 'sometimes|required|array',
            'enabled' => 'sometimes|boolean',
            'priority' => 'sometimes|integer|min:0|max:1000',
            'nodes' => 'sometimes|array',
            'edges' => 'sometimes|array',
        ]);

        $updates = $validated;
        unset($updates['nodes'], $updates['edges']);

        if (!empty($updates)) {
            $flow->update($updates);
        }

        if (array_key_exists('nodes', $validated)) {
            $nodes = $validated['nodes'] ?? [];
            foreach ($nodes as $node) {
                if (!is_array($node) || empty($node['id'])) {
                    continue;
                }

                $existing = $flow->nodes()->whereKey($node['id'])->first();
                if (!$existing) {
                    continue;
                }

                $nodeUpdates = [];
                if (array_key_exists('type', $node)) {
                    $nodeUpdates['type'] = $node['type'];
                }
                if (array_key_exists('config', $node)) {
                    $nodeUpdates['config'] = $node['config'];
                }
                if (array_key_exists('sort_order', $node)) {
                    $nodeUpdates['sort_order'] = $node['sort_order'];
                }
                if (array_key_exists('pos_x', $node)) {
                    $nodeUpdates['pos_x'] = $node['pos_x'];
                }
                if (array_key_exists('pos_y', $node)) {
                    $nodeUpdates['pos_y'] = $node['pos_y'];
                }

                if ($nodeUpdates) {
                    $existing->update($nodeUpdates);
                }
            }
        }

        if (array_key_exists('edges', $validated)) {
            $flow->edges()->delete();
            $nodeIds = $flow->nodes()->pluck('id')->map(fn ($id) => (int) $id)->all();
            $nodeIdSet = array_flip($nodeIds);
            $edges = $validated['edges'] ?? [];
            $sortOrder = 1;
            foreach ($edges as $edge) {
                if (!is_array($edge)) {
                    continue;
                }
                $fromId = isset($edge['from_node_id']) ? (int) $edge['from_node_id'] : null;
                $toId = isset($edge['to_node_id']) ? (int) $edge['to_node_id'] : null;
                if (!$fromId || !$toId) {
                    continue;
                }
                if (!isset($nodeIdSet[$fromId]) || !isset($nodeIdSet[$toId])) {
                    continue;
                }
                $flow->edges()->create([
                    'account_id' => $account->id,
                    'from_node_id' => $fromId,
                    'to_node_id' => $toId,
                    'label' => $edge['label'] ?? null,
                    'sort_order' => $edge['sort_order'] ?? $sortOrder,
                ]);
                $sortOrder++;
            }
        }

        return redirect()->back()->with('success', 'Flow updated successfully.');
    }

    /**
     * Remove the specified flow.
     */
    public function destroy(Request $request, BotFlow $flow)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($flow->account_id, $account->id)) {
            abort(404);
        }

        $flow->delete();

        return redirect()->back()->with('success', 'Flow deleted successfully.');
    }
}
