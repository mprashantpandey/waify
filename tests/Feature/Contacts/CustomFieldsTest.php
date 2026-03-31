<?php

namespace Tests\Feature\Contacts;

use App\Http\Middleware\EnsureAccountSubscribed;
use App\Http\Middleware\EnsurePhoneVerifiedForTenant;
use App\Http\Middleware\RestrictChatAgentAccess;
use App\Modules\Contacts\Models\ContactCustomField;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CustomFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'ModuleSeeder']);
        $this->artisan('db:seed', ['--class' => 'PlanSeeder']);
    }

    private function withoutTenantGuards(): void
    {
        $this->withoutMiddleware([
            EnsureAccountSubscribed::class,
            EnsurePhoneVerifiedForTenant::class,
            RestrictChatAgentAccess::class,
        ]);
    }

    public function test_owner_can_manage_contact_custom_fields(): void
    {
        $this->withoutTenantGuards();

        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);

        $response = $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->get(route('app.contacts.fields.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('Contacts/Fields/Index'));

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.contacts.fields.store'), [
                'name' => 'Lead Source',
                'type' => 'select',
                'required' => true,
                'options' => ['Website', 'Referral'],
            ])->assertRedirect();

        $this->assertDatabaseHas('contact_custom_fields', [
            'account_id' => $account->id,
            'name' => 'Lead Source',
            'key' => 'lead_source',
            'type' => 'select',
            'required' => 1,
        ]);
    }

    public function test_contact_create_persists_custom_field_values(): void
    {
        $this->withoutTenantGuards();

        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);

        ContactCustomField::create([
            'account_id' => $account->id,
            'key' => 'lead_source',
            'name' => 'Lead Source',
            'type' => 'select',
            'options' => ['Website', 'Referral'],
            'required' => true,
            'order' => 1,
        ]);

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.contacts.store'), [
                'wa_id' => '919999999999',
                'name' => 'Test Contact',
                'custom_fields' => [
                    'lead_source' => 'Referral',
                ],
            ])->assertRedirect();

        $contact = WhatsAppContact::query()->where('account_id', $account->id)->where('wa_id', '919999999999')->firstOrFail();

        $this->assertSame('Referral', $contact->custom_fields['lead_source'] ?? null);
    }

    public function test_segment_can_filter_using_custom_field_key(): void
    {
        $this->withoutTenantGuards();

        $account = $this->createAccountWithPlan('starter');
        $owner = $this->actingAsAccountOwner($account);

        ContactCustomField::create([
            'account_id' => $account->id,
            'key' => 'lead_source',
            'name' => 'Lead Source',
            'type' => 'select',
            'options' => ['Website', 'Referral'],
            'required' => false,
            'order' => 1,
        ]);

        WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919999999991',
            'custom_fields' => ['lead_source' => 'Referral'],
        ]);

        WhatsAppContact::factory()->create([
            'account_id' => $account->id,
            'wa_id' => '919999999992',
            'custom_fields' => ['lead_source' => 'Website'],
        ]);

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.contacts.segments.store'), [
                'name' => 'Referral Leads',
                'filters' => [
                    [
                        'field' => 'custom_fields.lead_source',
                        'operator' => 'equals',
                        'value' => 'Referral',
                    ],
                ],
            ])->assertRedirect();

        $segment = ContactSegment::query()->where('account_id', $account->id)->where('name', 'Referral Leads')->firstOrFail();

        $this->assertSame(1, $segment->contact_count);
    }
}
