<?php

namespace App\Modules\WhatsApp\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppWebhookEvent extends Model
{
    protected $table = 'whatsapp_webhook_events';

    protected $fillable = [
        'account_id',
        'whatsapp_connection_id',
        'correlation_id',
        'status',
        'payload',
        'payload_size',
        'ip',
        'user_agent',
        'error_message',
        'replay_count',
        'processed_at',
        'last_replayed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed_at' => 'datetime',
            'last_replayed_at' => 'datetime',
        ];
    }

    public function connection()
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }
}
