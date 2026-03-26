<?php

namespace App\Core\Modules;

use App\Core\Billing\PlanResolver;
use App\Models\AccountModule;
use App\Models\Module;
use App\Services\PlatformSettingsService;
use Illuminate\Support\Collection;

class ModuleRegistry
{
    protected array $modules = [];

    public function __construct(iterable $definitions = [])
    {
        foreach ($definitions as $definition) {
            if (is_array($definition)) {
                $this->register($definition);
            }
        }
    }

    /**
     * Register a module.
     */
    public function register(array $definition): void
    {
        $this->modules[$definition['key']] = $definition;
        ksort($this->modules);
    }

    /**
     * Get all registered modules.
     */
    public function all(): Collection
    {
        return collect($this->modules);
    }

    /**
     * Get a specific module by key.
     */
    public function get(string $key): ?array
    {
        return $this->modules[$key] ?? null;
    }

    /**
     * Get enabled modules for an account.
     */
    public function getEnabledForAccount($account): Collection
    {
        $state = $this->resolveAccountState($account);

        return $this->all()
            ->filter(fn (array $module): bool => $this->isEnabledForAccount($module, $state))
            ->values();
    }

    /**
     * Get navigation items for enabled modules.
     */
    public function getNavigationForAccount($account): array
    {
        return $this->getEnabledForAccount($account)
            ->flatMap(function (array $module): array {
                return array_values(array_filter($module['nav'] ?? [], static fn ($navItem) => is_array($navItem)));
            })
            ->values()
            ->all();
    }

    protected function isEnabledForAccount(array $module, array $state): bool
    {
        $moduleKey = $module['key'];

        if (!$state['platform_enabled']->has($moduleKey)) {
            return false;
        }

        if ($moduleKey === 'analytics' && !$state['analytics_enabled']) {
            return false;
        }

        $accountOverride = $state['account_enabled']->get($moduleKey);
        if ($accountOverride === false) {
            return false;
        }

        if ($state['plan_enabled']->has($moduleKey)) {
            return true;
        }

        return (($module['is_core'] ?? false) || ($module['enabled_by_default'] ?? false)) && $accountOverride !== false;
    }

    protected function resolveAccountState($account): array
    {
        /** @var PlatformSettingsService $settingsService */
        $settingsService = app(PlatformSettingsService::class);
        /** @var PlanResolver $planResolver */
        $planResolver = app(PlanResolver::class);

        $platformEnabled = Module::query()
            ->where('is_enabled', true)
            ->pluck('key')
            ->flip();

        $accountEnabled = AccountModule::query()
            ->where('account_id', $account->id)
            ->pluck('enabled', 'module_key')
            ->map(static fn ($enabled): bool => (bool) $enabled);

        $planEnabled = collect($planResolver->getEffectiveModules($account))
            ->flip();

        return [
            'platform_enabled' => $platformEnabled,
            'account_enabled' => $accountEnabled,
            'plan_enabled' => $planEnabled,
            'analytics_enabled' => $settingsService->isFeatureEnabled('analytics'),
        ];
    }
}
