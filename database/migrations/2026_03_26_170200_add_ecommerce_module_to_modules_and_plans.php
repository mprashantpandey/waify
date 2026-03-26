<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        \App\Models\Module::updateOrCreate(
            ['key' => 'ecommerce'],
            [
                'name' => 'WhatsApp Commerce',
                'description' => 'Product catalog and order capture workflows for WhatsApp',
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

            if (!in_array('ecommerce', $modules, true)) {
                $modules[] = 'ecommerce';
                $plan->modules = array_values(array_unique($modules));
                $plan->save();
            }
        }
    }

    public function down(): void
    {
        $plans = \App\Models\Plan::whereIn('key', ['pro', 'enterprise'])->get();

        foreach ($plans as $plan) {
            $modules = $plan->modules ?? [];
            if (!is_array($modules)) {
                $modules = json_decode($modules, true) ?? [];
            }

            $plan->modules = array_values(array_filter($modules, fn ($m) => $m !== 'ecommerce'));
            $plan->save();
        }

        \App\Models\Module::where('key', 'ecommerce')->delete();
    }
};

