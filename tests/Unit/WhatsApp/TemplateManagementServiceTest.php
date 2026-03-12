<?php

namespace Tests\Unit\WhatsApp;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Services\TemplateManagementService;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}

