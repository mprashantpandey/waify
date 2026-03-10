<?php

namespace App\Modules\WhatsApp\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppWebhookEvent extends Model
{
    protected $table = 'whatsapp_webhook_events';

    protected $fillable = [
        'account_id',
        'tenant_id',
        'whatsapp_connection_id',
        'provider',
        'event_type',
        'object_type',
        'idempotency_key',
        'correlation_id',
        'status',
        'payload',
        'delivery_headers',
        'signature_valid',
        'payload_size',
        'ip',
        'user_agent',
        'error_message',
        'retry_count',
        'replay_count',
        'processed_at',
        'failed_at',
        'last_replayed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'delivery_headers' => 'array',
            'signature_valid' => 'boolean',
            'processed_at' => 'datetime',
            'failed_at' => 'datetime',
            'last_replayed_at' => 'datetime',
        ];
    }

    public function connection()
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }
}
