<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantWebhookDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'tenant_webhook_endpoint_id',
        'event_key',
        'event_id',
        'idempotency_key',
        'payload',
        'status',
        'attempts',
        'http_status',
        'response_body',
        'response_headers',
        'error_message',
        'next_retry_at',
        'delivered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'response_headers' => 'array',
        'attempts' => 'integer',
        'http_status' => 'integer',
        'next_retry_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(TenantWebhookEndpoint::class, 'tenant_webhook_endpoint_id');
    }
}

