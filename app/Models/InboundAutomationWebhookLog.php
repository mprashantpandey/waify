<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InboundAutomationWebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'inbound_automation_webhook_id',
        'request_id',
        'idempotency_key',
        'status',
        'payload',
        'headers',
        'response_summary',
        'result',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'headers' => 'array',
        'result' => 'array',
        'processed_at' => 'datetime',
    ];

    public function webhook(): BelongsTo
    {
        return $this->belongsTo(InboundAutomationWebhook::class, 'inbound_automation_webhook_id');
    }
}
