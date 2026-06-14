<?php

namespace Tests\Feature\Platform;

use App\Models\ContactRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_contact_form_stores_contact_request(): void
    {
        $response = $this->post(route('contact.submit'), [
            'name' => 'Demo Lead',
            'email' => 'lead@example.com',
            'subject' => 'Need WhatsApp automation',
            'message' => 'Please contact me about Zyptos pricing.',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('contact_requests', [
            'name' => 'Demo Lead',
            'email' => 'lead@example.com',
            'subject' => 'Need WhatsApp automation',
            'status' => ContactRequest::STATUS_NEW,
            'source' => 'public_contact',
        ]);
    }

    public function test_platform_admin_can_view_and_update_contact_requests(): void
    {
        $admin = User::factory()->create(['is_platform_admin' => true]);
        $contactRequest = ContactRequest::create([
            'name' => 'Demo Lead',
            'email' => 'lead@example.com',
            'subject' => 'Sales request',
            'message' => 'I want to book a demo.',
        ]);

        $this->actingAs($admin)
            ->get(route('platform.contact-requests.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Platform/ContactRequests/Index')
                ->has('requests.data', 1)
            );

        $this->actingAs($admin)
            ->patch(route('platform.contact-requests.update', $contactRequest), [
                'status' => ContactRequest::STATUS_REVIEWED,
            ])
            ->assertRedirect();

        $contactRequest->refresh();
        $this->assertSame(ContactRequest::STATUS_REVIEWED, $contactRequest->status);
        $this->assertSame($admin->id, $contactRequest->handled_by);
        $this->assertNotNull($contactRequest->handled_at);
    }

    public function test_non_admin_cannot_access_contact_requests(): void
    {
        $user = User::factory()->create(['is_platform_admin' => false]);

        $this->actingAs($user)
            ->get(route('platform.contact-requests.index'))
            ->assertForbidden();
    }
}
