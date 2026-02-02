<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed core modules
        $this->call(ModuleSeeder::class);

        // User::factory(10)->create();

        // Create platform admin
        User::factory()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@wacp.local',
            'is_platform_admin' => true,
        ]);

        // Create test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'is_platform_admin' => false,
        ]);
    }
}
