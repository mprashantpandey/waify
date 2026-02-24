<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Safely adds the Developer / API module and attaches it to pro and enterprise plans
     * without overwriting existing plan data.
     */
    public function up(): void
    {
        \App\Models\Module::updateOrCreate(
            ['key' => 'developer'],
            [
                'name' => 'Developer / API',
                'description' => 'API keys and external API documentation for integrating with Waify',
                'is_core' => false,
                'is_enabled' => true,
            ]
        );

        $planKeys = ['pro', 'enterprise'];
        $plans = \App\Models\Plan::whereIn('key', $planKeys)->get();

        foreach ($plans as $plan) {
            $modules = $plan->modules ?? [];
            if (!is_array($modules)) {
                $modules = json_decode($modules, true) ?? [];
            }

            if (!in_array('developer', $modules, true)) {
                $modules[] = 'developer';
                $plan->modules = array_values(array_unique($modules));
                $plan->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $planKeys = ['pro', 'enterprise'];
        $plans = \App\Models\Plan::whereIn('key', $planKeys)->get();

        foreach ($plans as $plan) {
            $modules = $plan->modules ?? [];
            if (!is_array($modules)) {
                $modules = json_decode($modules, true) ?? [];
            }

            $modules = array_values(array_filter($modules, fn ($m) => $m !== 'developer'));
            $plan->modules = $modules;
            $plan->save();
        }

        $module = \App\Models\Module::where('key', 'developer')->first();
        if ($module) {
            $module->delete();
        }
    }
};
