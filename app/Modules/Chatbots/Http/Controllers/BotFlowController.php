<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Policies\ChatbotPolicy;
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

        Gate::authorize('manage', [ChatbotPolicy::class, $account]);

        if ($bot->account_id !== $account->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger' => 'required|array',
            'trigger.type' => 'required|string|in:inbound_message,keyword,button_reply',
            'enabled' => 'boolean',
            'priority' => 'integer|min:0|max:1000']);

        $flow = BotFlow::create([
            'account_id' => $account->id,
            'bot_id' => $bot->id,
            'name' => $validated['name'],
            'trigger' => $validated['trigger'],
            'enabled' => $validated['enabled'] ?? true,
            'priority' => $validated['priority'] ?? 100]);

        return redirect()->back()->with('success', 'Flow created successfully.');
    }

    /**
     * Update the specified flow.
     */
    public function update(Request $request, BotFlow $flow)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [ChatbotPolicy::class, $account]);

        if ($flow->account_id !== $account->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'trigger' => 'sometimes|required|array',
            'enabled' => 'sometimes|boolean',
            'priority' => 'sometimes|integer|min:0|max:1000']);

        $flow->update($validated);

        return redirect()->back()->with('success', 'Flow updated successfully.');
    }

    /**
     * Remove the specified flow.
     */
    public function destroy(Request $request, BotFlow $flow)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [ChatbotPolicy::class, $account]);

        if ($flow->account_id !== $account->id) {
            abort(404);
        }

        $flow->delete();

        return redirect()->back()->with('success', 'Flow deleted successfully.');
    }
}
