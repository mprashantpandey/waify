<?php

namespace Database\Factories;

use App\Models\Workspace;
use App\Models\WorkspaceUsage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WorkspaceUsage>
 */
class WorkspaceUsageFactory extends Factory
{
    protected $model = WorkspaceUsage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'workspace_id' => Workspace::factory(),
            'period' => now()->format('Y-m'),
            'messages_sent' => 0,
            'template_sends' => 0,
            'ai_credits_used' => 0,
            'storage_bytes' => 0,
        ];
    }
}
