<?php

namespace Tests\Feature\Developer;

use App\Models\GoogleSheetsDelivery;
use App\Models\GoogleSheetsIntegration;
use App\Models\Account;
use App\Models\User;
use App\Modules\Developer\Jobs\AppendGoogleSheetsDeliveryJob;
use App\Modules\Developer\Services\GoogleSheetsIntegrationService;
use App\Modules\Developer\Services\TenantWebhookService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class GoogleSheetsIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function generatePrivateKeyPem(): string
    {
        $resource = openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        if ($resource === false) {
            throw new \RuntimeException('Could not generate test private key.');
        }

        openssl_pkey_export($resource, $pem);

        return $pem;
    }

    protected function createOwnedAccount(): Account
    {
        $owner = User::factory()->create();
        $account = Account::factory()->create([
            'owner_id' => $owner->id,
        ]);

        $account->users()->attach($owner->id, ['role' => 'owner']);

        return $account->fresh();
    }

    protected function validServiceAccountJson(): string
    {
        return json_encode([
            'type' => 'service_account',
            'project_id' => 'zyptos-test',
            'private_key_id' => 'abc123',
            'private_key' => $this->generatePrivateKeyPem(),
            'client_email' => 'zyptos-test@zyptos-test.iam.gserviceaccount.com',
            'client_id' => '1234567890',
            'token_uri' => 'https://oauth2.googleapis.com/token',
        ], JSON_THROW_ON_ERROR);
    }

    public function test_owner_can_create_google_sheets_integration(): void
    {
        $this->withoutMiddleware();

        $account = $this->createOwnedAccount();
        $owner = $account->owner;

        $this->actingAs($owner)
            ->withSession(['current_account_id' => $account->id])
            ->post(route('app.developer.google-sheets.store'), [
                'name' => 'Leads Sheet',
                'spreadsheet_id' => 'sheet123',
                'sheet_name' => 'Leads',
                'service_account_json' => $this->validServiceAccountJson(),
                'event_keys' => ['contact.created', 'conversation.created'],
                'append_headers' => true,
                'include_payload_json' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('google_sheets_integrations', [
            'account_id' => $account->id,
            'name' => 'Leads Sheet',
            'spreadsheet_id' => 'sheet123',
            'sheet_name' => 'Leads',
            'service_account_email' => 'zyptos-test@zyptos-test.iam.gserviceaccount.com',
        ]);
    }

    public function test_tenant_webhook_service_dispatches_google_sheets_delivery_for_matching_event(): void
    {
        Queue::fake();
        $account = $this->createOwnedAccount();
        GoogleSheetsIntegration::create([
            'account_id' => $account->id,
            'name' => 'Leads Sheet',
            'spreadsheet_id' => 'sheet123',
            'sheet_name' => 'Leads',
            'service_account_email' => 'zyptos-test@zyptos-test.iam.gserviceaccount.com',
            'service_account_private_key' => json_decode($this->validServiceAccountJson(), true)['private_key'],
            'event_keys' => ['contact.created'],
            'append_headers' => true,
            'include_payload_json' => true,
            'is_active' => true,
        ]);

        app(TenantWebhookService::class)->dispatchEvent($account, 'contact.created', [
            'name' => 'Prashant',
            'phone' => '+919410650131',
            'wa_id' => '919410650131',
        ], 'contact_created_test');

        $this->assertDatabaseCount('google_sheets_deliveries', 1);
        Queue::assertPushed(AppendGoogleSheetsDeliveryJob::class);
    }

    public function test_google_sheets_delivery_appends_row(): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'test-token', 'expires_in' => 3600], 200),
            'https://sheets.googleapis.com/*' => Http::response(['updates' => ['updatedRange' => 'Leads!A2:I2']], 200),
        ]);

        $account = $this->createOwnedAccount();
        $integration = GoogleSheetsIntegration::create([
            'account_id' => $account->id,
            'name' => 'Leads Sheet',
            'spreadsheet_id' => 'sheet123',
            'sheet_name' => 'Leads',
            'service_account_email' => 'zyptos-test@zyptos-test.iam.gserviceaccount.com',
            'service_account_private_key' => $this->generatePrivateKeyPem(),
            'event_keys' => ['contact.created'],
            'append_headers' => true,
            'include_payload_json' => true,
            'is_active' => true,
        ]);

        $delivery = GoogleSheetsDelivery::create([
            'account_id' => $account->id,
            'google_sheets_integration_id' => $integration->id,
            'event_key' => 'contact.created',
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'payload' => [
                'name' => 'Prashant',
                'phone' => '+919410650131',
                'wa_id' => '919410650131',
            ],
            'status' => 'pending',
            'attempts' => 0,
        ]);

        app(GoogleSheetsIntegrationService::class)->deliver($delivery->fresh('integration'));

        $delivery->refresh();
        $this->assertSame('delivered', $delivery->status);
        $this->assertNotNull($delivery->delivered_at);
        Http::assertSentCount(2);
    }
}
