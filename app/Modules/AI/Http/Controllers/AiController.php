<?php

namespace App\Modules\AI\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AiKnowledgeItem;
use App\Models\AiUsageLog;
use App\Models\PlatformSetting;
use App\Models\User;
use App\Services\AI\AiKnowledgeBaseService;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AiController extends Controller
{
    public function __construct(protected AiKnowledgeBaseService $knowledgeBase)
    {
    }

    /**
     * Show the AI module page: settings, prompts, and usage.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();
        $usage = $this->getUsageStats($user, $account);
        $canManageAutoReply = $account && $this->canManageAccountAi($account, $user);

        return Inertia::render('Ai/Index', [
            'account' => $account,
            'ai_suggestions_enabled' => (bool) ($user->ai_suggestions_enabled ?? false),
            'ai_prompts' => is_array($user->ai_prompts) ? $user->ai_prompts : [],
            'prompt_library' => $this->promptLibrary(),
            'purpose_options' => $this->purposeOptions(),
            'platform_ai_enabled' => $this->toBoolean(PlatformSetting::get('ai.enabled', false)),
            'platform_ai_provider' => PlatformSetting::get('ai.provider', 'openai'),
            'usage' => $usage,
            'can_manage_auto_reply' => $canManageAutoReply,
            'account_ai' => [
                'enabled' => (bool) ($account?->ai_auto_reply_enabled ?? false),
                'mode' => (string) ($account?->ai_auto_reply_mode ?? 'suggest_only'),
                'prompt' => (string) ($account?->ai_auto_reply_prompt ?? ''),
                'handoff_message' => (string) ($account?->ai_auto_reply_handoff_message ?? ''),
                'handoff_keywords' => array_values(array_filter(is_array($account?->ai_auto_reply_handoff_keywords) ? $account->ai_auto_reply_handoff_keywords : [])),
                'stop_when_assigned' => (bool) ($account?->ai_auto_reply_stop_when_assigned ?? true),
            ],
            'knowledge_items' => $account
                ? AiKnowledgeItem::query()
                    ->where('account_id', $account->id)
                    ->orderBy('sort_order')
                    ->orderBy('id')
                    ->get(['id', 'title', 'content', 'is_enabled', 'sort_order'])
                    ->map(fn (AiKnowledgeItem $item) => [
                        'id' => $item->id,
                        'title' => $item->title,
                        'content' => $item->content,
                        'is_enabled' => (bool) $item->is_enabled,
                        'sort_order' => (int) $item->sort_order,
                    ])
                    ->values()
                    ->all()
                : [],
            'auto_reply_modes' => [
                ['value' => 'suggest_only', 'label' => 'Suggest only'],
                ['value' => 'auto_reply_window', 'label' => 'Auto reply in the 24-hour chat window'],
            ],
        ]);
    }

    /**
     * Update AI settings.
     */
    public function updateSettings(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();
        $canManageAutoReply = $account && $this->canManageAccountAi($account, $user);

        $validated = $request->validate([
            'ai_suggestions_enabled' => 'required|boolean',
            'ai_prompts' => 'nullable|array',
            'ai_prompts.*.purpose' => 'nullable|string|max:100',
            'ai_prompts.*.label' => 'nullable|string|max:255',
            'ai_prompts.*.prompt' => 'nullable|string|max:10000',
            'ai_prompts.*.scope' => 'nullable|string|in:all,owner,admin,member',
            'ai_prompts.*.enabled' => 'nullable|boolean',
            'account_ai.enabled' => 'nullable|boolean',
            'account_ai.mode' => 'nullable|string|in:suggest_only,auto_reply_window',
            'account_ai.prompt' => 'nullable|string|max:20000',
            'account_ai.handoff_message' => 'nullable|string|max:5000',
            'account_ai.handoff_keywords' => 'nullable|string|max:5000',
            'account_ai.stop_when_assigned' => 'nullable|boolean',
            'knowledge_items' => 'nullable|array',
            'knowledge_items.*.id' => 'nullable|integer',
            'knowledge_items.*.title' => 'nullable|string|max:255',
            'knowledge_items.*.content' => 'nullable|string|max:10000',
            'knowledge_items.*.is_enabled' => 'nullable|boolean',
            'knowledge_items.*.sort_order' => 'nullable|integer|min:0',
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
            DB::transaction(function () use ($user, $account, $canManageAutoReply, $validated, $normalizedPrompts) {
                $user->update([
                    'ai_suggestions_enabled' => $validated['ai_suggestions_enabled'],
                    'ai_prompts' => $normalizedPrompts,
                ]);

                if ($canManageAutoReply && $account) {
                    $handoffKeywords = collect(explode(',', (string) data_get($validated, 'account_ai.handoff_keywords', '')))
                        ->map(fn ($keyword) => trim((string) $keyword))
                        ->filter()
                        ->values()
                        ->all();

                    $account->update([
                        'ai_auto_reply_enabled' => (bool) data_get($validated, 'account_ai.enabled', false),
                        'ai_auto_reply_mode' => (string) data_get($validated, 'account_ai.mode', 'suggest_only'),
                        'ai_auto_reply_prompt' => $this->nullableTrimmed(data_get($validated, 'account_ai.prompt')),
                        'ai_auto_reply_handoff_message' => $this->nullableTrimmed(data_get($validated, 'account_ai.handoff_message')),
                        'ai_auto_reply_handoff_keywords' => $handoffKeywords,
                        'ai_auto_reply_stop_when_assigned' => (bool) data_get($validated, 'account_ai.stop_when_assigned', true),
                    ]);

                    $this->knowledgeBase->sync($account, $validated['knowledge_items'] ?? []);
                }
            });
        } catch (QueryException $e) {
            Log::warning('AI settings update failed due to schema mismatch', [
                'user_id' => $user->id,
                'account_id' => $account?->id,
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

    protected function canManageAccountAi(Account $account, User $user): bool
    {
        if ((int) $account->owner_id === (int) $user->id) {
            return true;
        }

        $membership = $account->users()
            ->where('users.id', $user->id)
            ->first();

        return in_array($membership?->pivot?->role, ['owner', 'admin'], true);
    }

    protected function nullableTrimmed(mixed $value): ?string
    {
        $trimmed = trim((string) $value);
        return $trimmed === '' ? null : $trimmed;
    }

    protected function purposeOptions(): array
    {
        return [
            [
                'value' => 'conversation_suggest',
                'label' => 'Conversation reply (WhatsApp)',
                'description' => 'Used when suggesting reply text in WhatsApp conversations (Suggest button in chat).',
            ],
        ];
    }

    protected function promptLibrary(): array
    {
        return [
            [
                'purpose' => 'conversation_suggest',
                'purpose_description' => 'WhatsApp conversation reply suggestions',
                'label' => 'Sales-friendly reply',
                'scope' => 'member',
                'prompt' => 'Reply in 1-2 short lines. Be warm, clear, and include one concrete next step.',
            ],
            [
                'purpose' => 'conversation_suggest',
                'purpose_description' => 'WhatsApp conversation reply suggestions',
                'label' => 'Escalation-safe reply',
                'scope' => 'all',
                'prompt' => 'If policy/approval is needed, acknowledge and ask for required details before promising outcomes.',
            ],
        ];
    }
}
