<?php

namespace App\Modules\AI\Http\Controllers;

use App\Http\Controllers\Controller;
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
    /**
     * Show the AI module page: settings, prompts, and usage.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        $usage = $this->getUsageStats($user, $account);

        return Inertia::render('Ai/Index', [
            'account' => $account,
            'ai_suggestions_enabled' => (bool) ($user->ai_suggestions_enabled ?? false),
            'ai_prompts' => is_array($user->ai_prompts) ? $user->ai_prompts : [],
            'prompt_library' => $this->promptLibrary(),
            'platform_ai_enabled' => $this->toBoolean(PlatformSetting::get('ai.enabled', false)),
            'platform_ai_provider' => PlatformSetting::get('ai.provider', 'openai'),
            'usage' => $usage,
        ]);
    }

    /**
     * Update AI settings (toggle + prompts).
     */
    public function updateSettings(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'ai_suggestions_enabled' => 'required|boolean',
            'ai_prompts' => 'nullable|array',
            'ai_prompts.*.purpose' => 'nullable|string|max:100',
            'ai_prompts.*.label' => 'nullable|string|max:255',
            'ai_prompts.*.prompt' => 'nullable|string|max:10000',
            'ai_prompts.*.scope' => 'nullable|string|in:all,owner,admin,member',
            'ai_prompts.*.enabled' => 'nullable|boolean',
        ]);

        $normalizedPrompts = collect($validated['ai_prompts'] ?? [])
            ->map(function ($prompt) {
                return [
                    'purpose' => trim((string) ($prompt['purpose'] ?? '')),
                    'label' => trim((string) ($prompt['label'] ?? '')),
                    'prompt' => trim((string) ($prompt['prompt'] ?? '')),
                    'scope' => in_array(($prompt['scope'] ?? 'all'), ['all', 'owner', 'admin', 'member'], true)
                        ? $prompt['scope']
                        : 'all',
                    'enabled' => (bool) ($prompt['enabled'] ?? true),
                ];
            })
            ->filter(fn ($prompt) => $prompt['purpose'] !== '' && $prompt['label'] !== '' && $prompt['prompt'] !== '')
            ->values()
            ->all();

        try {
            $user->update([
                'ai_suggestions_enabled' => $validated['ai_suggestions_enabled'],
                'ai_prompts' => $normalizedPrompts,
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
        if (!$account) {
            return $this->emptyUsageStats();
        }

        if (!Schema::hasTable('ai_usage_logs')) {
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

    protected function promptLibrary(): array
    {
        return [
            [
                'purpose' => 'conversation_suggest',
                'label' => 'Sales-friendly reply',
                'scope' => 'member',
                'prompt' => 'Reply in 1-2 short lines. Be warm, clear, and include one concrete next step.',
            ],
            [
                'purpose' => 'conversation_suggest',
                'label' => 'Escalation-safe reply',
                'scope' => 'all',
                'prompt' => 'If policy/approval is needed, acknowledge and ask for required details before promising outcomes.',
            ],
            [
                'purpose' => 'support_reply',
                'label' => 'Structured support response',
                'scope' => 'admin',
                'prompt' => 'Use format: What happened, Why it happened, What to do next. Keep it concise and actionable.',
            ],
        ];
    }
}
