<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $email = env('SUPER_ADMIN_EMAIL', 'admin@wacp.local');
        $password = env('SUPER_ADMIN_PASSWORD', 'password');
        $name = env('SUPER_ADMIN_NAME', 'Platform Admin');

        $user = User::firstOrNew(['email' => $email]);

        $user->fill([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'is_platform_admin' => true,
            'email_verified_at' => now(),
        ]);

        $user->save();

        $this->command->info("Super admin created/updated: {$email}");
    }
}
