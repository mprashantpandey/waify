<?php

namespace Database\Seeders;

use App\Models\Module;
use Illuminate\Database\Seeder;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $modules = [
            [
                'key' => 'core.dashboard',
                'name' => 'Dashboard',
                'description' => 'Core dashboard module',
                'is_core' => true,
            ],
            [
                'key' => 'whatsapp.cloud',
                'name' => 'WhatsApp Cloud',
                'description' => 'Connect and manage Meta WhatsApp Cloud API',
                'is_core' => false,
            ],
            [
                'key' => 'templates',
                'name' => 'Templates',
                'description' => 'Manage WhatsApp message templates',
                'is_core' => false,
            ],
            [
                'key' => 'automation.chatbots',
                'name' => 'Chatbots',
                'description' => 'Create and manage automated chatbots',
                'is_core' => false,
            ],
            [
                'key' => 'ai',
                'name' => 'AI Assistant',
                'description' => 'AI-powered messaging and automation',
                'is_core' => false,
            ],
            [
                'key' => 'floaters',
                'name' => 'Floaters & Widgets',
                'description' => 'Floating widgets and chat widgets',
                'is_core' => false,
            ],
            [
                'key' => 'analytics',
                'name' => 'Analytics',
                'description' => 'Analytics and reporting',
                'is_core' => false,
            ],
            [
                'key' => 'billing',
                'name' => 'Billing',
                'description' => 'Billing and subscription management',
                'is_core' => true,
            ],
            [
                'key' => 'support',
                'name' => 'Support',
                'description' => 'Support requests and live chat',
                'is_core' => true,
            ],
        ];

        foreach ($modules as $module) {
            Module::updateOrCreate(
                ['key' => $module['key']],
                $module
            );
        }
    }
}
