<?php

namespace App\Core\Modules;

use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    protected ModuleRegistry $registry;

    public function __construct($app)
    {
        parent::__construct($app);
        $this->registry = new ModuleRegistry($this->discoverModuleDefinitions());
    }

    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(ModuleRegistry::class, function () {
            return $this->registry;
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->loadModuleRoutes();
    }

    /**
     * Discover all module definitions deterministically.
     */
    protected function discoverModuleDefinitions(): array
    {
        $modulesPath = app_path('Modules');

        if (!File::exists($modulesPath)) {
            return [];
        }

        $definitions = [];
        $moduleDirs = File::directories($modulesPath);
        sort($moduleDirs, SORT_NATURAL | SORT_FLAG_CASE);

        foreach ($moduleDirs as $moduleDir) {
            $moduleFile = $moduleDir.'/module.php';

            if (!File::exists($moduleFile)) {
                continue;
            }

            $definition = require $moduleFile;
            if (!is_array($definition) || !isset($definition['key'])) {
                continue;
            }

            $definitions[$definition['key']] = $definition;
        }

        ksort($definitions);

        return array_values($definitions);
    }

    /**
     * Load routes from enabled modules.
     * Note: Routes that need to be inside app routes group should be loaded manually in routes/web.php
     * This method is kept for any global module routes that don't need account context.
     */
    protected function loadModuleRoutes(): void
    {
        // Module routes that need account context are loaded manually in routes/web.php
        // This method can be used for global module routes if needed in the future
    }
}
