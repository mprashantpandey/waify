<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class TenantWebhookEndpoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'name',
        'url',
        'signing_secret',
        'signing_secret_encrypted',
        'is_active',
        'timeout_seconds',
        'max_retries',
        'last_delivery_at',
        'last_delivery_status_code',
        'last_delivery_error',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_delivery_at' => 'datetime',
        'timeout_seconds' => 'integer',
        'max_retries' => 'integer',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(TenantWebhookSubscription::class, 'tenant_webhook_endpoint_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(TenantWebhookDelivery::class, 'tenant_webhook_endpoint_id');
    }

    public function setSigningSecretAttribute(?string $value): void
    {
        $this->attributes['signing_secret_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getSigningSecretAttribute(): ?string
    {
        $encrypted = $this->attributes['signing_secret_encrypted'] ?? null;
        if (!$encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable $e) {
            return null;
        }
    }
}
