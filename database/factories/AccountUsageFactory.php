<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\AccountUsage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AccountUsage>
 */
class AccountUsageFactory extends Factory
{
    protected $model = AccountUsage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'account_id' => Account::factory(),
            'period' => now()->format('Y-m'),
            'messages_sent' => 0,
            'template_sends' => 0,
            'ai_credits_used' => 0,
            'storage_bytes' => 0,
        ];
    }
}
