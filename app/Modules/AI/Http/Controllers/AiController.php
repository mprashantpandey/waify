<?php

namespace App\Modules\AI\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AiAgent;
use App\Models\AiAgentRun;
use App\Models\AiUsageLog;
use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AiController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        $usage = $this->getUsageStats($user, $account);

        return Inertia::render('Ai/Index', [
            'account' => $account,
            'ai_suggestions_enabled' => (bool) ($user->ai_suggestions_enabled ?? false),
            'ai_agents' => $this->agentsForAccount($account),
            'ai_agent_runs' => $this->recentAgentRuns($account),
            'platform_ai_enabled' => $this->toBoolean(PlatformSetting::get('ai.enabled', false)),
            'platform_ai_provider' => PlatformSetting::get('ai.provider', 'openai'),
            'usage' => $usage,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'ai_suggestions_enabled' => 'required|boolean',
        ]);

        try {
            $user->update([
                'ai_suggestions_enabled' => $validated['ai_suggestions_enabled'],
            ]);
        } catch (QueryException $e) {
            Log::warning('AI settings update failed due to schema mismatch', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'AI settings are unavailable until database migrations are up to date.');
        }

        return back()->with('success', 'AI settings saved.');
    }

    protected function getUsageStats(User $user, $account): array
    {
        if (! $account) {
            return $this->emptyUsageStats();
        }

        if (! Schema::hasTable('ai_usage_logs')) {
            return $this->emptyUsageStats();
        }

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

        try {
            $thisMonth = AiUsageLog::where('user_id', $user->id)
                ->where('account_id', $account->id)
                ->where('created_at', '>=', $startOfMonth)
                ->count();

            $byFeature = AiUsageLog::where('user_id', $user->id)
                ->where('account_id', $account->id)
                ->where('created_at', '>=', $startOfMonth)
                ->selectRaw('feature, count(*) as count')
                ->groupBy('feature')
                ->pluck('count', 'feature')
                ->toArray();
        } catch (QueryException $e) {
            Log::warning('AI usage stats unavailable due to schema mismatch', [
                'user_id' => $user->id,
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);

            return $this->emptyUsageStats($startOfMonth);
        }

        return [
            'this_month' => $thisMonth,
            'by_feature' => $byFeature,
            'period_start' => $startOfMonth->toIso8601String(),
        ];
    }

    protected function agentsForAccount($account): array
    {
        if (! $account || ! Schema::hasTable('ai_agents')) {
            return [];
        }

        return AiAgent::where('account_id', $account->id)
            ->latest()
            ->get()
            ->map(fn (AiAgent $agent) => [
                'id' => $agent->id,
                'name' => $agent->name,
                'slug' => $agent->slug,
                'avatar' => $agent->avatar,
                'role' => $agent->role,
                'language' => $agent->language,
                'tone' => $agent->tone,
                'mode' => $agent->mode,
                'is_active' => $agent->is_active,
                'instructions' => $agent->instructions,
                'goal' => $agent->goal,
                'knowledge_sources' => $agent->knowledge_sources ?? [],
                'allowed_actions' => $agent->allowed_actions ?? [],
                'qualification_fields' => $agent->qualification_fields ?? [],
                'guardrails' => $agent->guardrails ?? [],
                'escalation_rules' => $agent->escalation_rules ?? ['keywords' => []],
                'handoff_rules' => $agent->handoff_rules ?? ['keywords' => [], 'after_invalid_replies' => 2],
                'fallback_reply' => $agent->fallback_reply,
                'working_hours' => $agent->working_hours ?? [],
                'max_auto_replies_per_conversation' => $agent->max_auto_replies_per_conversation,
                'max_reply_chars' => $agent->max_reply_chars,
                'confidence_threshold' => $agent->confidence_threshold,
                'last_used_at' => $agent->last_used_at?->toIso8601String(),
                'created_at' => $agent->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    protected function recentAgentRuns($account): array
    {
        if (! $account || ! Schema::hasTable('ai_agent_runs')) {
            return [];
        }

        return AiAgentRun::with(['agent:id,name,avatar'])
            ->where('account_id', $account->id)
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (AiAgentRun $run) => [
                'id' => $run->id,
                'status' => $run->status,
                'reason' => $run->reason,
                'agent' => $run->agent ? [
                    'id' => $run->agent->id,
                    'name' => $run->agent->name,
                    'avatar' => $run->agent->avatar,
                ] : null,
                'conversation_id' => $run->whatsapp_conversation_id,
                'inbound_message_id' => $run->inbound_message_id,
                'outbound_message_id' => $run->outbound_message_id,
                'created_at' => $run->created_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    protected function emptyUsageStats($startOfMonth = null): array
    {
        $period = $startOfMonth ?: now()->startOfMonth();

        return [
            'this_month' => 0,
            'by_feature' => [],
            'period_start' => $period->toIso8601String(),
        ];
    }

    protected function toBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        if (is_string($value)) {
            $normalized = strtolower(trim($value));

            return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
        }

        return (bool) $value;
    }
}
