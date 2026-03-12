<?php

namespace Tests\Unit\WhatsApp;

use App\Models\Account;
use App\Modules\WhatsApp\Exceptions\WhatsAppApiException;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppOutboundMessageJob;
use App\Modules\WhatsApp\Services\OutboundMessagePipelineService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutboundMessagePipelineServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_assert_send_prerequisites_rejects_invalid_recipient_format(): void
    {
        $service = app(OutboundMessagePipelineService::class);
        $connection = WhatsAppConnection::factory()->create([
            'is_active' => true,
            'phone_number_id' => '12345',
            'access_token' => 'token-abc',
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Invalid recipient format');

        $service->assertSendPrerequisites($connection, 'invalid-number', 'text');
    }

    public function test_classify_failure_marks_rate_limit_as_retryable(): void
    {
        $service = app(OutboundMessagePipelineService::class);
        $exception = new WhatsAppApiException('Rate limit exceeded', [
            'error' => [
                'code' => 4,
                'message' => 'Application request limit reached',
            ],
        ], 4);

        $classification = $service->classifyFailure($exception);

        $this->assertTrue($classification['retryable']);
        $this->assertSame(120, $classification['retry_after_seconds']);
    }

    public function test_mark_failed_sets_retry_fields_for_retryable_failures(): void
    {
        $service = app(OutboundMessagePipelineService::class);
        $account = Account::factory()->create();
        $connection = WhatsAppConnection::factory()->create([
            'account_id' => $account->id,
        ]);

        $job = WhatsAppOutboundMessageJob::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $connection->id,
            'channel' => 'whatsapp_meta',
            'message_type' => 'text',
            'status' => 'sending',
            'to_wa_id' => '919999999999',
            'idempotency_key' => sha1('test'),
            'attempt_count' => 1,
            'queued_at' => now(),
            'sending_at' => now(),
        ]);

        $service->markFailed($job, 'Temporary failure', ['code' => 429], true, 60);

        $job->refresh();
        $this->assertSame('failed', $job->status);
        $this->assertTrue($job->is_retryable);
        $this->assertNotNull($job->next_retry_at);
    }
}

