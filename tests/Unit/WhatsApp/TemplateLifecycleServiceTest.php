<?php

namespace Tests\Unit\WhatsApp;

use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Services\TemplateLifecycleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateLifecycleServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_payload_fails_for_missing_media_header_url(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'header_type' => 'IMAGE',
            'header_media_url' => null,
            'language' => 'en_US',
            'body_text' => 'Hello {{1}}',
            'buttons' => [],
        ]);

        $result = app(TemplateLifecycleService::class)->evaluateSendPayload($template, ['John']);

        $this->assertFalse($result['ok']);
        $this->assertSame('missing_header_media', $result['code']);
    }

    public function test_send_payload_fails_for_invalid_language_format(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'language' => 'english-us',
            'header_type' => 'NONE',
            'body_text' => 'Hello {{1}}',
            'buttons' => [],
        ]);

        $result = app(TemplateLifecycleService::class)->evaluateSendPayload($template, ['John']);

        $this->assertFalse($result['ok']);
        $this->assertSame('invalid_language', $result['code']);
    }

    public function test_send_payload_requires_non_empty_variables_for_max_placeholder_index(): void
    {
        $template = WhatsAppTemplate::factory()->create([
            'language' => 'en_US',
            'header_type' => 'NONE',
            'body_text' => 'Hi {{2}}',
            'buttons' => [],
        ]);

        $result = app(TemplateLifecycleService::class)->evaluateSendPayload($template, ['']);

        $this->assertFalse($result['ok']);
        $this->assertSame('missing_variables', $result['code']);
    }
}

