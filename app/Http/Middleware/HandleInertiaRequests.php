<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use App\Models\PlatformSetting;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $account = $request->attributes->get('account') ?? current_account();
        
        $accounts = [];
        $navigation = [];
        
        $accountRole = null;

        if ($user) {
            $accounts = $user->accounts()->get()->merge($user->ownedAccounts()->get())->unique('id')->values();

            if ($account) {
                // Resolve current user's role for this account (owner, admin, or member/chat-agent)
                if ((int) $account->owner_id === (int) $user->id) {
                    $accountRole = 'owner';
                } else {
                    $pivot = $account->users()->where('user_id', $user->id)->first()?->pivot;
                    $accountRole = $pivot ? $pivot->role : null;
                }
                // Platform admins have no pivot but can access; treat as full access (no account_role restriction)

                $moduleRegistry = app(\App\Core\Modules\ModuleRegistry::class);
                $navigation = $moduleRegistry->getNavigationForAccount($account);

                // Chat agents (role === 'member') only see Inbox + AI Assistant
                if ($accountRole === 'member') {
                    $navigation = array_values(array_filter($navigation, function ($item) {
                        $href = $item['href'] ?? '';
                        return in_array($href, [
                            'app.whatsapp.conversations.index',
                            'app.ai.index',
                            'app.ai',
                        ], true);
                    }));
                    if (empty($navigation)) {
                        $navigation = [
                            ['label' => 'Inbox', 'href' => 'app.whatsapp.conversations.index', 'icon' => 'Inbox', 'group' => 'messaging'],
                        ];
                    }
                } else {
                    // Add static navigation items for non-members (owner, admin, platform admin)
                    $staticNav = [
                        [
                            'label' => 'Team',
                            'href' => 'app.team.index',
                            'icon' => 'Users',
                            'group' => 'core'],
                        [
                            'label' => 'Activity Logs',
                            'href' => 'app.activity-logs',
                            'icon' => 'Activity',
                            'group' => 'core'],
                        [
                            'label' => 'Settings',
                            'href' => 'app.settings',
                            'icon' => 'Settings',
                            'group' => 'other']];

                    $navigation = array_merge($navigation, $staticNav);
                }
            }
        }

        $brandingService = app(\App\Services\BrandingService::class);

        $impersonatorId = $request->session()->get('impersonator_id');
        $impersonator = $impersonatorId ? User::find($impersonatorId) : null;

        // Check if profile is complete
        $phoneVerificationRequired = (bool) ($account?->phone_verification_required ?? false);
        $isProfileComplete = $user ? (
            !empty($user->name) &&
            !empty($user->email) &&
            !empty($user->phone) &&
            (!$phoneVerificationRequired || !empty($user->phone_verified_at))
        ) : true;

        return [
            ...parent::share($request),
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
                'status' => $request->session()->get('status'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'phone_verified_at' => $user->phone_verified_at?->toIso8601String(),
                    'is_super_admin' => $user->isSuperAdmin(),
                    'notify_assignment_enabled' => $user->notify_assignment_enabled ?? true,
                    'notify_mention_enabled' => $user->notify_mention_enabled ?? true,
                    'notify_sound_enabled' => $user->notify_sound_enabled ?? true,
                    'ai_suggestions_enabled' => $user->ai_suggestions_enabled ?? false,
                ] : null,
                'profile_complete' => $isProfileComplete],
            'account' => $account,
            'account_role' => $accountRole ?? null,
            'accounts' => $accounts,
            'navigation' => $navigation,
            'branding' => $brandingService->getAll(),
            'impersonation' => [
                'active' => (bool) $impersonatorId,
                'impersonator' => $impersonator ? [
                    'id' => $impersonator->id,
                    'name' => $impersonator->name,
                    'email' => $impersonator->email] : null],
            'ai' => [
                'enabled' => $this->toBoolean(PlatformSetting::get('ai.enabled', false)),
                'provider' => PlatformSetting::get('ai.provider', 'openai')],
            'analyticsSettings' => [
                'google_analytics_enabled' => PlatformSetting::get('analytics.google_analytics_enabled', false),
                'google_analytics_id' => PlatformSetting::get('analytics.google_analytics_id'),
                'mixpanel_enabled' => PlatformSetting::get('analytics.mixpanel_enabled', false),
                'mixpanel_token' => PlatformSetting::get('analytics.mixpanel_token'),
                'sentry_enabled' => PlatformSetting::get('analytics.sentry_enabled', false),
                'sentry_dsn' => PlatformSetting::get('analytics.sentry_dsn'),
                'sentry_environment' => PlatformSetting::get('analytics.sentry_environment', 'production'),
            ],
            'compliance' => [
                'terms_url' => PlatformSetting::get('compliance.terms_url'),
                'privacy_url' => PlatformSetting::get('compliance.privacy_url'),
                'cookie_policy_url' => PlatformSetting::get('compliance.cookie_policy_url'),
                'gdpr_enabled' => PlatformSetting::get('compliance.gdpr_enabled', false),
                'cookie_consent_required' => PlatformSetting::get('compliance.cookie_consent_required', false),
            ],
            'features' => [
                'analytics' => $this->toBoolean(PlatformSetting::get('features.analytics', true)),
                'public_api' => $this->toBoolean(PlatformSetting::get('features.public_api', false)),
                'webhooks' => $this->toBoolean(PlatformSetting::get('features.webhooks', true)),
            ],
            'pusherConfig' => (function () {
                $settingsService = app(\App\Services\PlatformSettingsService::class);
                return [
                    'pusherKey' => $settingsService->get('pusher.key', config('broadcasting.connections.pusher.key')),
                    'pusherCluster' => $settingsService->get('pusher.cluster', config('broadcasting.connections.pusher.options.cluster'))];
            })(),
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url()]];
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
            if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
                return true;
            }
            if (in_array($normalized, ['0', 'false', 'no', 'off', ''], true)) {
                return false;
            }
        }

        return (bool) $value;
    }
}
