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
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        
        $workspaces = [];
        $navigation = [];
        
        if ($user) {
            $workspaces = $user->workspaces()->get()->merge($user->ownedWorkspaces()->get())->unique('id')->values();
            
            if ($workspace) {
                $moduleRegistry = app(\App\Core\Modules\ModuleRegistry::class);
                $navigation = $moduleRegistry->getNavigationForWorkspace($workspace);
                
                // Add static navigation items
                $staticNav = [
                    [
                        'label' => 'Team',
                        'href' => 'app.team.index',
                        'icon' => 'Users',
                        'group' => 'core',
                    ],
                    [
                        'label' => 'Activity Logs',
                        'href' => 'app.activity-logs',
                        'icon' => 'Activity',
                        'group' => 'core',
                    ],
                    [
                        'label' => 'Settings',
                        'href' => 'app.settings',
                        'icon' => 'Settings',
                        'group' => 'other',
                    ],
                ];
                
                $navigation = array_merge($navigation, $staticNav);
            }
        }

        $brandingService = app(\App\Services\BrandingService::class);

        $impersonatorId = $request->session()->get('impersonator_id');
        $impersonator = $impersonatorId ? User::find($impersonatorId) : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_super_admin' => $user->isSuperAdmin(),
                ] : null,
            ],
            'workspace' => $workspace,
            'workspaces' => $workspaces,
            'navigation' => $navigation,
            'branding' => $brandingService->getAll(),
            'impersonation' => [
                'active' => (bool) $impersonatorId,
                'impersonator' => $impersonator ? [
                    'id' => $impersonator->id,
                    'name' => $impersonator->name,
                    'email' => $impersonator->email,
                ] : null,
            ],
            'ai' => [
                'enabled' => PlatformSetting::get('ai.enabled', false),
                'provider' => PlatformSetting::get('ai.provider', 'openai'),
            ],
            'pusherConfig' => (function () {
                $settingsService = app(\App\Services\PlatformSettingsService::class);
                return [
                    'pusherKey' => $settingsService->get('pusher.key', config('broadcasting.connections.pusher.key')),
                    'pusherCluster' => $settingsService->get('pusher.cluster', config('broadcasting.connections.pusher.options.cluster')),
                ];
            })(),
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
