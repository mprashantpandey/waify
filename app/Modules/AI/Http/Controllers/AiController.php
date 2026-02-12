<?php

namespace App\Modules\AI\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\User;
use Illuminate\Http\Request;
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
            'ai_prompts.*.purpose' => 'required|string|max:100',
            'ai_prompts.*.label' => 'required|string|max:255',
            'ai_prompts.*.prompt' => 'required|string|max:10000',
        ]);

        $user->update([
            'ai_suggestions_enabled' => $validated['ai_suggestions_enabled'],
            'ai_prompts' => $validated['ai_prompts'] ?? [],
        ]);

        return back()->with('success', 'AI settings saved.');
    }

    protected function getUsageStats(User $user, $account): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();

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

        return [
            'this_month' => $thisMonth,
            'by_feature' => $byFeature,
            'period_start' => $startOfMonth->toIso8601String(),
        ];
    }
}
