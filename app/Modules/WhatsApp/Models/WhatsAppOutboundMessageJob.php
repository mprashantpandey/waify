<?php

namespace App\Modules\WhatsApp\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppOutboundMessageJob extends Model
{
    protected $table = 'whatsapp_outbound_message_jobs';

    protected $fillable = [
        'account_id',
        'whatsapp_connection_id',
        'whatsapp_conversation_id',
        'whatsapp_message_id',
        'campaign_id',
        'campaign_recipient_id',
        'channel',
        'message_type',
        'status',
        'to_wa_id',
        'meta_message_id',
        'client_request_id',
        'idempotency_key',
        'attempt_count',
        'retry_count',
        'queued_at',
        'validated_at',
        'sending_at',
        'sent_to_provider_at',
        'delivered_at',
        'read_at',
        'failed_at',
        'request_payload',
        'provider_response',
        'provider_error_payload',
        'error_message',
        'is_retryable',
        'next_retry_at',
    ];

    protected function casts(): array
    {
        return [
            'request_payload' => 'array',
            'provider_response' => 'array',
            'provider_error_payload' => 'array',
            'is_retryable' => 'boolean',
            'queued_at' => 'datetime',
            'validated_at' => 'datetime',
            'sending_at' => 'datetime',
            'sent_to_provider_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'failed_at' => 'datetime',
            'next_retry_at' => 'datetime',
        ];
    }

    public function connection()
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }

    public function conversation()
    {
        return $this->belongsTo(WhatsAppConversation::class, 'whatsapp_conversation_id');
    }

    public function message()
    {
        return $this->belongsTo(WhatsAppMessage::class, 'whatsapp_message_id');
    }
}
