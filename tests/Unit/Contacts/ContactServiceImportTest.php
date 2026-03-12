<?php

namespace Tests\Unit\Contacts;

use App\Models\Account;
use App\Modules\Contacts\Services\ContactService;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactServiceImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_csv_import_normalizes_phone_and_applies_consent_status_mapping(): void
    {
        $account = Account::factory()->create();
        $service = app(ContactService::class);

        $csvPath = storage_path('app/test-contacts-import.csv');
        file_put_contents($csvPath, implode("\n", [
            'phone,name,consent_status',
            '+91 90000-00001,First,opted_out',
            '919000000002,Second,opted_in',
            '91 90000 00002,Second Updated,opted_out',
        ]));

        $result = $service->importFromCsv($csvPath, $account->id);

        $this->assertSame(2, $result['imported']);
        $this->assertSame(1, $result['updated']);
        $this->assertCount(0, $result['errors']);

        $first = WhatsAppContact::where('account_id', $account->id)->where('wa_id', '919000000001')->first();
        $second = WhatsAppContact::where('account_id', $account->id)->where('wa_id', '919000000002')->first();

        $this->assertNotNull($first);
        $this->assertSame('opt_out', $first->status);
        $this->assertTrue((bool) $first->do_not_contact);

        $this->assertNotNull($second);
        $this->assertSame('Second Updated', $second->name);
        $this->assertSame('opt_out', $second->status);
        $this->assertTrue((bool) $second->do_not_contact);
    }
}
