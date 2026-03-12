<?php

namespace Tests\Feature\Platform;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemHealthMetaReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_system_health_includes_meta_readiness_payload(): void
    {
        $superAdmin = User::factory()->create([
            'is_platform_admin' => true,
        ]);

        $response = $this->actingAs($superAdmin)
            ->get(route('platform.system-health'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Platform/SystemHealth')
            ->has('meta_readiness.summary')
            ->has('meta_readiness.checks')
            ->has('meta_readiness_generated_at')
        );
    }
}
