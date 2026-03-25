<?php

namespace Tests\Unit\WhatsApp;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Services\TemplateManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TemplateManagementServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_update_template_blocks_local_duplicate_name_language_in_same_connection(): void
    {
        $connection = WhatsAppConnection::factory()->create();

        $existing = WhatsAppTemplate::factory()->create([
            'account_id' => $connection->account_id,
            'whatsapp_connection_id' => $connection->id,
            'name' => 'promo_offer',
            'language' => 'en_US',
            'is_archived' => false,
        ]);

        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $connection->account_id,
            'whatsapp_connection_id' => $connection->id,
            'name' => 'welcome_offer',
            'language' => 'en_US',
            'is_archived' => false,
        ]);

        $service = app(TemplateManagementService::class);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage("Template 'promo_offer' with language 'en_US' already exists for this connection.");

        $service->updateTemplate($connection, $template, [
            'name' => $existing->name,
            'language' => $existing->language,
            'category' => 'UTILITY',
            'header_type' => 'NONE',
            'body_text' => 'Hello {{1}}',
            'footer_text' => null,
            'buttons' => [],
        ]);
    }

    public function test_update_template_allows_reusing_current_name_language_when_versioning(): void
    {
        Http::fake([
            '*' => Http::response(['id' => 'meta-new-template-id'], 200),
        ]);

        $connection = WhatsAppConnection::factory()->create([
            'access_token' => 'token',
            'waba_id' => 'waba_123',
            'phone_number_id' => 'pn_123',
            'api_version' => 'v21.0',
        ]);

        $template = WhatsAppTemplate::factory()->create([
            'account_id' => $connection->account_id,
            'whatsapp_connection_id' => $connection->id,
            'name' => 'welcome_offer',
            'language' => 'en_US',
            'is_archived' => false,
            'meta_template_id' => 'meta-old-template-id',
        ]);

        $service = app(TemplateManagementService::class);

        $result = $service->updateTemplate($connection, $template, [
            'name' => $template->name,
            'language' => $template->language,
            'category' => 'UTILITY',
            'header_type' => 'NONE',
            'body_text' => 'Updated body text',
            'footer_text' => null,
            'buttons' => [],
        ]);

        $template->refresh();

        $this->assertSame('meta-new-template-id', $result['id']);
        $this->assertSame('meta-new-template-id', $template->meta_template_id);
        $this->assertSame('welcome_offer', $template->name);
    }
}
