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
        
        if ($user) {
            $accounts = $user->accounts()->get()->merge($user->ownedAccounts()->get())->unique('id')->values();
            
            if ($account) {
                $moduleRegistry = app(\App\Core\Modules\ModuleRegistry::class);
                $navigation = $moduleRegistry->getNavigationForAccount($account);
                
                // Add static navigation items
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

        $brandingService = app(\App\Services\BrandingService::class);

        $impersonatorId = $request->session()->get('impersonator_id');
        $impersonator = $impersonatorId ? User::find($impersonatorId) : null;

        // Check if profile is complete
        $isProfileComplete = $user ? (
            !empty($user->name) && 
            !empty($user->email) && 
            !empty($user->phone)
        ) : true;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'is_super_admin' => $user->isSuperAdmin(),
                    'notify_assignment_enabled' => $user->notify_assignment_enabled ?? true,
                    'notify_mention_enabled' => $user->notify_mention_enabled ?? true,
                    'notify_sound_enabled' => $user->notify_sound_enabled ?? true,
                ] : null,
                'profile_complete' => $isProfileComplete],
            'account' => $account,
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
                'enabled' => PlatformSetting::get('ai.enabled', false),
                'provider' => PlatformSetting::get('ai.provider', 'openai')],
            'supportSettings' => [
                'live_chat_enabled' => PlatformSetting::get('support.live_chat_enabled', true),
                'ticket_support_enabled' => PlatformSetting::get('support.ticket_support_enabled', true),
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
}
