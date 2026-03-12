<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantWebhookSubscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_webhook_endpoint_id',
        'event_key',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    public function endpoint(): BelongsTo
    {
        return $this->belongsTo(TenantWebhookEndpoint::class, 'tenant_webhook_endpoint_id');
    }
}

