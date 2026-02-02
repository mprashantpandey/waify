<?php

namespace App\Modules\Chatbots\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chatbots\Models\BotExecution;
use App\Modules\Chatbots\Policies\ChatbotPolicy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BotExecutionController extends Controller
{
    /**
     * Display a listing of executions.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('viewAny', [ChatbotPolicy::class, $workspace]);

        $executions = BotExecution::where('workspace_id', $workspace->id)
            ->with(['bot', 'flow', 'conversation.contact'])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($execution) {
                return [
                    'id' => $execution->id,
                    'bot' => [
                        'id' => $execution->bot->id,
                        'name' => $execution->bot->name,
                    ],
                    'flow' => [
                        'id' => $execution->flow->id,
                        'name' => $execution->flow->name,
                    ],
                    'conversation' => $execution->conversation ? [
                        'id' => $execution->conversation->id,
                        'contact' => [
                            'wa_id' => $execution->conversation->contact->wa_id,
                            'name' => $execution->conversation->contact->name,
                        ],
                    ] : null,
                    'status' => $execution->status,
                    'trigger_event_id' => $execution->trigger_event_id,
                    'started_at' => $execution->started_at->toIso8601String(),
                    'finished_at' => $execution->finished_at?->toIso8601String(),
                    'error_message' => $execution->error_message,
                    'duration' => $execution->finished_at 
                        ? $execution->started_at->diffInSeconds($execution->finished_at)
                        : null,
                ];
            });

        return Inertia::render('Chatbots/Executions/Index', [
            'workspace' => $workspace,
            'executions' => $executions,
        ]);
    }

    /**
     * Display the specified execution.
     */
    public function show(Request $request, BotExecution $execution): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        Gate::authorize('viewAny', [ChatbotPolicy::class, $workspace]);

        if ($execution->workspace_id !== $workspace->id) {
            abort(404);
        }

        $execution->load(['bot', 'flow', 'conversation.contact']);

        return Inertia::render('Chatbots/Executions/Show', [
            'workspace' => $workspace,
            'execution' => [
                'id' => $execution->id,
                'bot' => [
                    'id' => $execution->bot->id,
                    'name' => $execution->bot->name,
                ],
                'flow' => [
                    'id' => $execution->flow->id,
                    'name' => $execution->flow->name,
                ],
                'conversation' => $execution->conversation ? [
                    'id' => $execution->conversation->id,
                    'contact' => [
                        'wa_id' => $execution->conversation->contact->wa_id,
                        'name' => $execution->conversation->contact->name,
                    ],
                ] : null,
                'status' => $execution->status,
                'trigger_event_id' => $execution->trigger_event_id,
                'started_at' => $execution->started_at->toIso8601String(),
                'finished_at' => $execution->finished_at?->toIso8601String(),
                'error_message' => $execution->error_message,
                'logs' => $execution->logs ?? [],
            ],
        ]);
    }
}
