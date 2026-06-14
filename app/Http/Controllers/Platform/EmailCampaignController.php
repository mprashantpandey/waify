<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Jobs\SendPlatformEmailCampaign;
use App\Models\Account;
use App\Models\PlatformEmailCampaign;
use App\Models\PlatformEmailCampaignRecipient;
use App\Models\User;
use App\Services\AppNotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EmailCampaignController extends Controller
{
    public function index(): Response
    {
        $campaigns = PlatformEmailCampaign::query()
            ->with('creator:id,name,email')
            ->withCount([
                'recipients',
                'recipients as pending_count' => fn ($query) => $query->where('status', 'pending'),
            ])
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (PlatformEmailCampaign $campaign) => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'subject' => $campaign->subject,
                'audience' => $campaign->audience,
                'status' => $campaign->status,
                'recipient_count' => $campaign->recipient_count,
                'sent_count' => $campaign->sent_count,
                'failed_count' => $campaign->failed_count,
                'pending_count' => $campaign->pending_count,
                'offer_code' => $campaign->offer_code,
                'cta_label' => $campaign->cta_label,
                'cta_url' => $campaign->cta_url,
                'failure_reason' => $campaign->failure_reason,
                'creator' => $campaign->creator ? [
                    'name' => $campaign->creator->name,
                    'email' => $campaign->creator->email,
                ] : null,
                'created_at' => $campaign->created_at?->toIso8601String(),
                'queued_at' => $campaign->queued_at?->toIso8601String(),
                'sent_at' => $campaign->sent_at?->toIso8601String(),
            ]);

        return Inertia::render('Platform/EmailCampaigns/Index', [
            'campaigns' => $campaigns,
            'stats' => [
                'total' => PlatformEmailCampaign::count(),
                'sending' => PlatformEmailCampaign::whereIn('status', ['queued', 'sending'])->count(),
                'sent' => PlatformEmailCampaign::where('status', 'sent')->count(),
                'failed' => PlatformEmailCampaign::where('status', 'failed')->count(),
            ],
            'audiences' => [
                ['key' => 'workspace_owners', 'label' => 'Workspace owners', 'count' => Account::whereHas('owner', fn ($query) => $query->whereNotNull('email'))->count()],
                ['key' => 'active_workspace_owners', 'label' => 'Active workspace owners', 'count' => Account::where('status', 'active')->whereHas('owner', fn ($query) => $query->whereNotNull('email'))->count()],
                ['key' => 'all_users', 'label' => 'All users', 'count' => User::whereNotNull('email')->count()],
                ['key' => 'platform_admins', 'label' => 'Platform admins', 'count' => User::where('is_platform_admin', true)->whereNotNull('email')->count()],
                ['key' => 'custom', 'label' => 'Custom recipients', 'count' => 0],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'subject' => ['required', 'string', 'max:180'],
            'audience' => ['required', 'string', 'in:workspace_owners,active_workspace_owners,all_users,platform_admins,custom'],
            'body' => ['required', 'string', 'max:10000'],
            'cta_label' => ['nullable', 'string', 'max:60'],
            'cta_url' => ['nullable', 'url', 'max:500'],
            'offer_code' => ['nullable', 'string', 'max:80'],
            'custom_recipients' => ['nullable', 'string', 'max:10000'],
        ]);

        $recipients = $this->resolveRecipients($validated['audience'], $validated['custom_recipients'] ?? null);
        if ($recipients->isEmpty()) {
            return back()->with('error', 'No valid email recipients found for this campaign.');
        }

        $campaign = DB::transaction(function () use ($validated, $recipients, $request) {
            $campaign = PlatformEmailCampaign::create([
                'created_by' => $request->user()?->id,
                'name' => $validated['name'],
                'subject' => $validated['subject'],
                'audience' => $validated['audience'],
                'body' => $validated['body'],
                'cta_label' => $validated['cta_label'] ?? null,
                'cta_url' => $validated['cta_url'] ?? null,
                'offer_code' => $validated['offer_code'] ?? null,
                'status' => 'queued',
                'recipient_count' => $recipients->count(),
                'queued_at' => now(),
            ]);

            foreach ($recipients as $recipient) {
                PlatformEmailCampaignRecipient::create([
                    'platform_email_campaign_id' => $campaign->id,
                    'account_id' => $recipient['account_id'] ?? null,
                    'user_id' => $recipient['user_id'] ?? null,
                    'email' => $recipient['email'],
                    'name' => $recipient['name'] ?? null,
                    'status' => 'pending',
                ]);
            }

            return $campaign;
        });

        SendPlatformEmailCampaign::dispatch($campaign->id)->onQueue('default');

        app(AppNotificationService::class)->auditDestructive(
            'platform_email_campaign_queued',
            "Email campaign queued: {$campaign->name}",
            $request->user(),
            null,
            $campaign,
            ['recipient_count' => $campaign->recipient_count, 'audience' => $campaign->audience],
            $request
        );

        return redirect()
            ->route('platform.email-campaigns.index')
            ->with('success', "Campaign queued for {$campaign->recipient_count} recipient(s).");
    }

    private function resolveRecipients(string $audience, ?string $customRecipients): Collection
    {
        if ($audience === 'custom') {
            return collect(preg_split('/[\r\n,;]+/', (string) $customRecipients))
                ->map(fn ($email) => strtolower(trim((string) $email)))
                ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
                ->unique()
                ->values()
                ->map(fn ($email) => ['email' => $email, 'name' => null]);
        }

        if ($audience === 'all_users') {
            return User::query()
                ->whereNotNull('email')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'user_id' => $user->id,
                    'email' => strtolower($user->email),
                    'name' => $user->name,
                ])
                ->unique('email')
                ->values();
        }

        if ($audience === 'platform_admins') {
            return User::query()
                ->where('is_platform_admin', true)
                ->whereNotNull('email')
                ->get(['id', 'name', 'email'])
                ->map(fn (User $user) => [
                    'user_id' => $user->id,
                    'email' => strtolower($user->email),
                    'name' => $user->name,
                ])
                ->unique('email')
                ->values();
        }

        $accountQuery = Account::query()->with('owner:id,name,email');
        if ($audience === 'active_workspace_owners') {
            $accountQuery->where('status', 'active');
        }

        return $accountQuery
            ->whereHas('owner', fn ($query) => $query->whereNotNull('email'))
            ->get(['id', 'owner_id', 'name', 'status'])
            ->map(fn (Account $account) => [
                'account_id' => $account->id,
                'user_id' => $account->owner_id,
                'email' => strtolower((string) $account->owner?->email),
                'name' => $account->owner?->name ?: $account->name,
            ])
            ->filter(fn ($recipient) => filter_var($recipient['email'], FILTER_VALIDATE_EMAIL))
            ->unique('email')
            ->values();
    }
}
