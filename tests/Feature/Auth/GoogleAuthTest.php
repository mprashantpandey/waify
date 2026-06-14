<?php

namespace Tests\Feature\Auth;

use App\Models\PlatformSetting;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Socialite\Facades\Socialite;
use Mockery;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_callback_creates_user_and_redirects_to_onboarding(): void
    {
        $this->enableGoogleOAuth();

        $provider = Mockery::mock();
        $provider->shouldReceive('user')->once()->andReturn(new class
        {
            public function getId(): string
            {
                return 'google-user-123';
            }

            public function getEmail(): string
            {
                return 'google.user@example.com';
            }

            public function getName(): string
            {
                return 'Google User';
            }

            public function getAvatar(): string
            {
                return 'https://example.com/avatar.png';
            }
        });

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.callback'));

        $response->assertRedirect(route('onboarding', absolute: false));
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'google.user@example.com',
            'google_id' => 'google-user-123',
            'avatar_url' => 'https://example.com/avatar.png',
        ]);
    }

    public function test_google_callback_links_existing_email_user(): void
    {
        $this->enableGoogleOAuth();
        $user = User::factory()->create([
            'email' => 'existing@example.com',
            'google_id' => null,
        ]);

        $provider = Mockery::mock();
        $provider->shouldReceive('user')->once()->andReturn(new class
        {
            public function getId(): string
            {
                return 'google-existing-123';
            }

            public function getEmail(): string
            {
                return 'existing@example.com';
            }

            public function getName(): string
            {
                return 'Existing User';
            }

            public function getAvatar(): ?string
            {
                return null;
            }
        });

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $response = $this->get(route('auth.google.callback'));

        $response->assertRedirect(route('onboarding', absolute: false));
        $this->assertAuthenticatedAs($user->fresh());
        $this->assertSame('google-existing-123', $user->fresh()->google_id);
    }

    public function test_google_login_stays_disabled_until_configured(): void
    {
        $response = $this->get(route('auth.google.redirect'));

        $response
            ->assertRedirect(route('login', absolute: false))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_register_page_enables_google_signup_when_configured(): void
    {
        $this->enableGoogleOAuth();

        $this->get(route('register'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Auth/Register')
                ->where('googleOAuthEnabled', true)
            );
    }

    public function test_google_signup_context_preserves_selected_plan(): void
    {
        $this->enableGoogleOAuth();

        Plan::query()->updateOrCreate(
            ['key' => 'pro'],
            [
                'name' => 'Pro',
                'description' => 'Pro plan',
                'price_monthly' => 199900,
                'price_yearly' => 1999000,
                'currency' => 'INR',
                'is_active' => true,
                'is_public' => true,
                'trial_days' => 7,
                'sort_order' => 1,
            ]
        );

        $provider = Mockery::mock();
        $provider->shouldReceive('user')->once()->andReturn(new class
        {
            public function getId(): string
            {
                return 'google-plan-123';
            }

            public function getEmail(): string
            {
                return 'google.plan@example.com';
            }

            public function getName(): string
            {
                return 'Google Plan';
            }

            public function getAvatar(): ?string
            {
                return null;
            }
        });

        Socialite::shouldReceive('driver')->once()->with('google')->andReturn($provider);

        $this->withSession(['google_signup_context' => ['plan_key' => 'pro']])
            ->get(route('auth.google.callback'))
            ->assertRedirect(route('onboarding', absolute: false))
            ->assertSessionHas('selected_plan_key', 'pro');
    }

    private function enableGoogleOAuth(): void
    {
        PlatformSetting::set('integrations.google_oauth_enabled', true, 'boolean', 'integrations');
        PlatformSetting::set('integrations.google_client_id', 'test-client-id', 'string', 'integrations');
        PlatformSetting::set('integrations.google_client_secret', 'test-client-secret', 'string', 'integrations');

        config([
            'services.google.client_id' => 'test-client-id',
            'services.google.client_secret' => 'test-client-secret',
            'services.google.redirect' => url('/auth/google/callback'),
        ]);
    }
}
