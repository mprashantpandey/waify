<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShopifyWebhookLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'shopify_integration_id',
        'topic',
        'shop_domain',
        'event_id',
        'status',
        'payload',
        'error_message',
        'processed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public function integration(): BelongsTo
    {
        return $this->belongsTo(ShopifyIntegration::class, 'shopify_integration_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
