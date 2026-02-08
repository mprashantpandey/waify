<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotNode;
use App\Modules\Chatbots\Policies\ChatbotPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class BotNodeController extends Controller
{
    /**
     * Store a newly created node.
     */
    public function store(Request $request, BotFlow $flow)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [ChatbotPolicy::class, $account]);

        if ((int) $flow->account_id !== (int) $account->id) {
            abort(404);
        }

        $validated = $this->validateNode($request);

        $nextSortOrder = ($flow->nodes()->max('sort_order') ?? 0) + 1;

        BotNode::create([
            'account_id' => $account->id,
            'bot_flow_id' => $flow->id,
            'type' => $validated['type'],
            'config' => $validated['config'] ?? [],
            'sort_order' => $validated['sort_order'] ?? $nextSortOrder,
        ]);

        return redirect()->back()->with('success', 'Node added successfully.');
    }

    /**
     * Update the specified node.
     */
    public function update(Request $request, BotNode $node)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [ChatbotPolicy::class, $account]);

        if ((int) $node->account_id !== (int) $account->id) {
            abort(404);
        }

        $validated = $this->validateNode($request, $node);

        $updates = [];
        if (array_key_exists('type', $validated)) {
            $updates['type'] = $validated['type'];
        }
        if (array_key_exists('config', $validated)) {
            $updates['config'] = $validated['config'];
        }
        if (array_key_exists('sort_order', $validated)) {
            $updates['sort_order'] = $validated['sort_order'];
        }

        if ($updates) {
            $node->update($updates);
        }

        return redirect()->back()->with('success', 'Node updated successfully.');
    }

    /**
     * Remove the specified node.
     */
    public function destroy(Request $request, BotNode $node)
    {
        $account = $request->attributes->get('account') ?? current_account();

        Gate::authorize('manage', [ChatbotPolicy::class, $account]);

        if ((int) $node->account_id !== (int) $account->id) {
            abort(404);
        }

        $node->delete();

        return redirect()->back()->with('success', 'Node deleted successfully.');
    }

    protected function validateNode(Request $request, ?BotNode $node = null): array
    {
        $typeInput = $request->input('type');
        $type = $typeInput ?: ($node?->type ?? null);

        $validator = Validator::make($request->all(), [
            'type' => [
                $node ? 'sometimes' : 'required',
                'string',
                Rule::in(['condition', 'action', 'delay', 'webhook']),
            ],
            'config' => [
                $node ? 'sometimes' : 'required',
                'array',
            ],
            'sort_order' => [
                'sometimes',
                'integer',
                'min:0',
                'max:100000',
            ],
        ]);

        $validator->after(function ($validator) use ($request, $type) {
            $config = $request->input('config', []);

            if ($type === 'action') {
                $actionType = $config['action_type'] ?? null;
                $allowed = ['send_text', 'send_template', 'assign_agent', 'add_tag', 'set_status', 'set_priority'];
                if (!$actionType || !in_array($actionType, $allowed, true)) {
                    $validator->errors()->add('config.action_type', 'Invalid action type.');
                }
            }

            if ($type === 'condition') {
                $conditionType = $config['type'] ?? null;
                $allowed = ['text_contains', 'text_equals', 'text_starts_with', 'regex_match', 'time_window', 'connection_is', 'conversation_status', 'tags_contains'];
                if (!$conditionType || !in_array($conditionType, $allowed, true)) {
                    $validator->errors()->add('config.type', 'Invalid condition type.');
                }
            }

            if ($type === 'delay') {
                $seconds = $config['seconds'] ?? null;
                if (!is_numeric($seconds) || (int) $seconds < 1) {
                    $validator->errors()->add('config.seconds', 'Delay seconds must be at least 1.');
                }
            }

            if ($type === 'webhook') {
                $url = $config['url'] ?? null;
                if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
                    $validator->errors()->add('config.url', 'Valid webhook URL required.');
                }
            }
        });

        return $validator->validate();
    }
}
