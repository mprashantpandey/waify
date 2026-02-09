<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotEdge;
use App\Modules\Chatbots\Models\BotFlow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BotEdgeController extends Controller
{
    /**
     * Store a newly created edge.
     */
    public function store(Request $request, BotFlow $flow)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($flow->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'from_node_id' => 'required|integer|exists:bot_nodes,id',
            'to_node_id' => 'required|integer|exists:bot_nodes,id',
            'label' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0|max:100000',
        ]);

        BotEdge::create([
            'account_id' => $account->id,
            'bot_flow_id' => $flow->id,
            'from_node_id' => $validated['from_node_id'],
            'to_node_id' => $validated['to_node_id'],
            'label' => $validated['label'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return redirect()->back()->with('success', 'Edge created successfully.');
    }

    /**
     * Update the specified edge.
     */
    public function update(Request $request, BotEdge $edge)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($edge->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'from_node_id' => 'sometimes|required|integer|exists:bot_nodes,id',
            'to_node_id' => 'sometimes|required|integer|exists:bot_nodes,id',
            'label' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0|max:100000',
        ]);

        $edge->update($validated);

        return redirect()->back()->with('success', 'Edge updated successfully.');
    }

    /**
     * Remove the specified edge.
     */
    public function destroy(Request $request, BotEdge $edge)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [Bot::class, $account]);

        if (!account_ids_match($edge->account_id, $account->id)) {
            abort(404);
        }

        $edge->delete();

        return redirect()->back()->with('success', 'Edge deleted successfully.');
    }
}
