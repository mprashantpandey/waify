<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'key' => 'free',
                'name' => 'Free',
                'description' => 'Perfect for getting started',
                'price_monthly' => 0,
                'price_yearly' => 0,
                'currency' => 'INR',
                'is_active' => true,
                'is_public' => true,
                'trial_days' => 0,
                'sort_order' => 1,
                'limits' => [
                    'agents' => 1,
                    'whatsapp_connections' => 1,
                    'messages_monthly' => 500,
                    'template_sends_monthly' => 0,
                    'ai_credits_monthly' => 0,
                    'retention_days' => 30,
                ],
                'modules' => ['whatsapp'],
                'metadata' => [],
            ],
            [
                'key' => 'starter',
                'name' => 'Starter',
                'description' => 'For small teams',
                'price_monthly' => 99900, // ₹999
                'price_yearly' => 999000, // ₹9990 (2 months free)
                'currency' => 'INR',
                'is_active' => true,
                'is_public' => true,
                'trial_days' => 7,
                'sort_order' => 2,
                'limits' => [
                    'agents' => 3,
                    'whatsapp_connections' => 2,
                    'messages_monthly' => 5000,
                    'template_sends_monthly' => 1000,
                    'ai_credits_monthly' => 0,
                    'retention_days' => 90,
                ],
                'modules' => ['whatsapp', 'templates', 'inbox', 'contacts'],
                'metadata' => [],
            ],
            [
                'key' => 'pro',
                'name' => 'Pro',
                'description' => 'For growing businesses',
                'price_monthly' => 499900, // ₹4999
                'price_yearly' => 4999000, // ₹49990 (2 months free)
                'currency' => 'INR',
                'is_active' => true,
                'is_public' => true,
                'trial_days' => 14,
                'sort_order' => 3,
                'limits' => [
                    'agents' => 10,
                    'whatsapp_connections' => 5,
                    'messages_monthly' => 50000,
                    'template_sends_monthly' => 10000,
                    'ai_credits_monthly' => 1000,
                    'retention_days' => 365,
                ],
                'modules' => ['whatsapp', 'templates', 'inbox', 'chatbots', 'analytics', 'floaters', 'contacts'],
                'metadata' => [],
            ],
            [
                'key' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'Custom solutions for large organizations',
                'price_monthly' => null, // Custom pricing
                'price_yearly' => null,
                'currency' => 'INR',
                'is_active' => true,
                'is_public' => true,
                'trial_days' => 30,
                'sort_order' => 4,
                'limits' => [
                    'agents' => -1, // Unlimited
                    'whatsapp_connections' => -1,
                    'messages_monthly' => -1,
                    'template_sends_monthly' => -1,
                    'ai_credits_monthly' => -1,
                    'retention_days' => -1,
                ],
                'modules' => ['whatsapp', 'templates', 'inbox', 'chatbots', 'ai', 'analytics', 'floaters', 'billing', 'contacts'],
                'metadata' => ['custom' => true],
            ],
        ];

        foreach ($plans as $planData) {
            Plan::updateOrCreate(
                ['key' => $planData['key']],
                $planData
            );
        }

        $this->command->info('Plans seeded successfully.');
    }
}
