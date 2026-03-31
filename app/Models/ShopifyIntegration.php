<?php

namespace App\Models;

use App\Modules\Broadcasts\Models\CampaignSequence;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class ShopifyIntegration extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'name',
        'shop_domain',
        'shop_name',
        'access_token',
        'access_token_encrypted',
        'webhook_secret',
        'webhook_secret_encrypted',
        'webhook_topics',
        'abandoned_checkout_sequence_id',
        'is_active',
        'auto_register_webhooks',
        'last_sync_at',
        'last_error',
    ];

    protected $casts = [
        'webhook_topics' => 'array',
        'is_active' => 'boolean',
        'auto_register_webhooks' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function abandonedCheckoutSequence(): BelongsTo
    {
        return $this->belongsTo(CampaignSequence::class, 'abandoned_checkout_sequence_id');
    }

    public function webhookLogs(): HasMany
    {
        return $this->hasMany(ShopifyWebhookLog::class)->latest('id');
    }

    public function setAccessTokenAttribute(?string $value): void
    {
        $this->attributes['access_token_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getAccessTokenAttribute(): ?string
    {
        $encrypted = $this->attributes['access_token_encrypted'] ?? null;
        if (!$encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable) {
            return null;
        }
    }

    public function setWebhookSecretAttribute(?string $value): void
    {
        $this->attributes['webhook_secret_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getWebhookSecretAttribute(): ?string
    {
        $encrypted = $this->attributes['webhook_secret_encrypted'] ?? null;
        if (!$encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable) {
            return null;
        }
    }

    public function getAdminUrlAttribute(): string
    {
        return 'https://' . $this->shop_domain . '/admin';
    }
}
