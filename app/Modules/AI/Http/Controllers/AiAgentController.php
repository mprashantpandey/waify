<?php

namespace App\Modules\AI\Http\Controllers;

use App\Core\Billing\UsageService;
use App\Http\Controllers\Controller;
use App\Models\AiAgent;
use App\Services\AI\AiProviderFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AiAgentController extends Controller
{
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeAgentManagement($request, $account);

        $validated = $this->validatedAgentData($request);

        AiAgent::create($validated + [
            'account_id' => $account->id,
            'created_by' => $request->user()?->id,
        ]);

        return back()->with('success', 'AI agent created.');
    }

    public function update(Request $request, AiAgent $agent)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeAgentManagement($request, $account);
        abort_unless((int) $agent->account_id === (int) $account->id, 404);

        $agent->update($this->validatedAgentData($request));

        return back()->with('success', 'AI agent updated.');
    }

    public function destroy(Request $request, AiAgent $agent)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->authorizeAgentManagement($request, $account);
        abort_unless((int) $agent->account_id === (int) $account->id, 404);

        $agent->delete();

        return back()->with('success', 'AI agent deleted.');
    }

    public function simulate(Request $request, AiAgent $agent)
    {
        $account = $request->attributes->get('account') ?? current_account();
        abort_unless((int) $agent->account_id === (int) $account?->id, 404);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'context' => ['nullable', 'string', 'max:4000'],
        ]);

        $safety = $this->safetyReport($agent, $validated['message']);
        $blocked = collect($safety)->contains(fn ($item) => ($item['severity'] ?? null) === 'block');
        if ($blocked) {
            return response()->json([
                'status' => 'blocked',
                'reply' => null,
                'safety' => $safety,
                'mode' => $agent->mode,
            ]);
        }

        $reply = $this->fallbackSimulationReply($agent, $validated['message']);

        try {
            $settings = AiProviderFactory::generationSettingsForAccount($account);
            $systemPrompt = $this->simulationSystemPrompt($agent);
            $userPrompt = $this->simulationUserPrompt($validated['message'], (string) ($validated['context'] ?? ''));
            $temperature = (float) ($settings['temperature'] ?? 0.2);
            $agentMaxTokens = $agent->max_reply_chars ? (int) ceil(((int) $agent->max_reply_chars) / 3) : 1200;
            $settingsMaxTokens = (int) ($settings['max_tokens'] ?? 1200);
            $maxTokens = max(500, min(3000, max($agentMaxTokens, $settingsMaxTokens)));
            $platformBacked = AiProviderFactory::willUsePlatformProvider($account);
            try {
                $provider = AiProviderFactory::forAccount($account);
                $reply = trim($provider->generate($systemPrompt, $userPrompt, $temperature, $maxTokens));
            } catch (\Throwable $e) {
                if (! AiProviderFactory::hasWorkspaceProvider($account)
                    || ! AiProviderFactory::shouldFallbackToPlatform($account)) {
                    throw $e;
                }

                $platformBacked = true;
                $reply = trim(AiProviderFactory::fromPlatformSettings()
                    ->generate($systemPrompt, $userPrompt, $temperature, $maxTokens));
            }
            $estimatedTokens = max(1, (int) ceil(strlen($systemPrompt.$userPrompt.$reply) / 4));
            app(UsageService::class)->recordAiRequest(
                $account,
                $estimatedTokens,
                0,
                $platformBacked
            );
        } catch (\Throwable $e) {
            $safety[] = [
                'label' => 'Provider fallback',
                'severity' => 'warn',
                'message' => $e->getMessage(),
            ];
        }

        return response()->json([
            'status' => 'ok',
            'reply' => Str::limit($reply, (int) ($agent->max_reply_chars ?: 3900), ''),
            'safety' => $safety,
            'mode' => $agent->mode,
        ]);
    }

    protected function validatedAgentData(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'avatar' => ['nullable', 'string', 'max:12'],
            'role' => ['required', 'string', Rule::in(AiAgent::ROLES)],
            'language' => ['nullable', 'string', 'max:24'],
            'tone' => ['required', 'string', Rule::in(AiAgent::TONES)],
            'mode' => ['required', 'string', Rule::in(AiAgent::MODES)],
            'is_active' => ['required', 'boolean'],
            'instructions' => ['nullable', 'string', 'max:12000'],
            'goal' => ['nullable', 'string', 'max:2000'],
            'knowledge_sources' => ['nullable', 'array'],
            'knowledge_sources.*' => ['string', 'max:80'],
            'allowed_actions' => ['nullable', 'array'],
            'allowed_actions.*' => ['string', 'max:80'],
            'qualification_fields' => ['nullable', 'array'],
            'qualification_fields.*' => ['string', 'max:80'],
            'guardrails' => ['nullable', 'array'],
            'guardrails.*' => ['string', 'max:80'],
            'escalation_rules' => ['nullable', 'array'],
            'escalation_rules.keywords' => ['nullable', 'array'],
            'escalation_rules.keywords.*' => ['string', 'max:80'],
            'handoff_rules' => ['nullable', 'array'],
            'handoff_rules.keywords' => ['nullable', 'array'],
            'handoff_rules.keywords.*' => ['string', 'max:80'],
            'handoff_rules.after_invalid_replies' => ['nullable', 'integer', 'min:1', 'max:10'],
            'fallback_reply' => ['nullable', 'string', 'max:2000'],
            'working_hours' => ['nullable', 'array'],
            'max_auto_replies_per_conversation' => ['nullable', 'integer', 'min:0', 'max:20'],
            'max_reply_chars' => ['nullable', 'integer', 'min:120', 'max:4000'],
            'confidence_threshold' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $validated['language'] = $validated['language'] ?: 'en';
        $validated['instructions'] = trim((string) ($validated['instructions'] ?? ''));
        $validated['goal'] = trim((string) ($validated['goal'] ?? ''));
        $validated['knowledge_sources'] = array_values(array_unique($validated['knowledge_sources'] ?? []));
        $validated['allowed_actions'] = array_values(array_unique($validated['allowed_actions'] ?? []));
        $validated['qualification_fields'] = array_values(array_unique($validated['qualification_fields'] ?? []));
        $validated['guardrails'] = array_values(array_unique($validated['guardrails'] ?? []));
        $validated['escalation_rules'] = [
            'keywords' => array_values(array_unique($validated['escalation_rules']['keywords'] ?? [])),
        ];
        $validated['handoff_rules'] = [
            'keywords' => array_values(array_unique($validated['handoff_rules']['keywords'] ?? [])),
            'after_invalid_replies' => (int) ($validated['handoff_rules']['after_invalid_replies'] ?? 2),
        ];
        $validated['fallback_reply'] = trim((string) ($validated['fallback_reply'] ?? ''));
        $validated['max_auto_replies_per_conversation'] = $validated['max_auto_replies_per_conversation'] ?? 3;
        $validated['max_reply_chars'] = $validated['max_reply_chars'] ?? 3500;
        $validated['confidence_threshold'] = $validated['confidence_threshold'] ?? 0.7;

        return $validated;
    }

    protected function authorizeAgentManagement(Request $request, $account): void
    {
        abort_unless($account, 404);

        $user = $request->user();
        abort_unless($user, 403);

        if ($user->isPlatformAdmin() || (int) $account->owner_id === (int) $user->id) {
            return;
        }

        $membership = $account->users()
            ->where('users.id', $user->id)
            ->first();

        abort_unless(in_array($membership?->pivot?->role, ['owner', 'admin'], true), 403);
    }

    protected function safetyReport(AiAgent $agent, string $message): array
    {
        $checks = [];
        $keywords = array_values(array_filter($agent->escalation_rules['keywords'] ?? []));
        $lower = Str::lower($message);
        $matched = array_values(array_filter($keywords, fn ($keyword) => $keyword !== '' && Str::contains($lower, Str::lower($keyword))));

        $checks[] = [
            'label' => 'Escalation keywords',
            'severity' => $matched ? 'block' : 'pass',
            'message' => $matched ? 'Matched: '.implode(', ', $matched) : 'No escalation keyword matched.',
        ];
        $checks[] = [
            'label' => 'Reply mode',
            'severity' => $agent->mode === 'autopilot' ? 'warn' : 'pass',
            'message' => $agent->mode === 'autopilot'
                ? 'Autopilot can send automatically only after runtime caps and recent-human-reply checks pass.'
                : 'This mode does not send without a human action.',
        ];
        $checks[] = [
            'label' => 'Auto reply cap',
            'severity' => ((int) $agent->max_auto_replies_per_conversation) <= 0 ? 'block' : 'pass',
            'message' => 'Conversation cap: '.((int) $agent->max_auto_replies_per_conversation).' auto replies.',
        ];
        $checks[] = [
            'label' => 'Confidence threshold',
            'severity' => ((float) $agent->confidence_threshold) >= 0.7 ? 'pass' : 'warn',
            'message' => 'Configured threshold: '.number_format((float) $agent->confidence_threshold, 2).'.',
        ];

        return $checks;
    }

    protected function simulationSystemPrompt(AiAgent $agent): string
    {
        return trim(implode("\n", array_filter([
            'You are simulating a Zyptos AI agent for WhatsApp customer conversations.',
            'Output only the customer-facing reply. Be concise but complete, and do not promise policy exceptions.',
            'For pricing questions, include available plan names, prices, key differences, and a clear next step. Do not cut off mid-sentence.',
            'Role: '.$agent->role.'. Tone: '.$agent->tone.'. Language: '.$agent->language.'.',
            $agent->goal ? 'Goal: '.$agent->goal : null,
            $agent->instructions,
            'Allowed actions: '.implode(', ', $agent->allowed_actions ?? []),
            'Qualification fields: '.implode(', ', $agent->qualification_fields ?? []),
            'Handoff keywords: '.implode(', ', $agent->handoff_rules['keywords'] ?? []),
            'Guardrails: '.implode(', ', $agent->guardrails ?? []),
            $agent->fallback_reply ? 'Fallback when unsure: '.$agent->fallback_reply : null,
            $agent->max_reply_chars ? 'Maximum reply length: '.$agent->max_reply_chars.' characters.' : null,
        ])));
    }

    protected function simulationUserPrompt(string $message, string $context): string
    {
        return trim("Customer message:\n{$message}\n\nContext:\n{$context}");
    }

    protected function fallbackSimulationReply(AiAgent $agent, string $message): string
    {
        return match ($agent->role) {
            'sales', 'sales_support' => $agent->fallback_reply ?: 'Thanks for reaching out. I can help with that. Could you share your requirement and preferred timeline so we can suggest the right option?',
            'operations' => 'Thanks. I will check the details and share the next update shortly.',
            default => $agent->fallback_reply ?: 'Thanks for the message. I understand your request and will help you with the next step.',
        };
    }

}
