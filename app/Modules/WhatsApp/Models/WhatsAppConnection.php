<?php

namespace App\Modules\WhatsApp\Models;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class WhatsAppConnection extends Model
{
    use HasFactory;
    protected $table = 'whatsapp_connections';

    protected $fillable = [
        'account_id',
        'name',
        'slug',
        'waba_id',
        'phone_number_id',
        'business_phone',
        'access_token_encrypted',
        'api_version',
        'webhook_verify_token',
        'webhook_subscribed',
        'webhook_last_received_at',
        'webhook_last_processed_at',
        'webhook_last_error',
        'webhook_consecutive_failures',
        'webhook_last_lag_seconds',
        'quality_rating',
        'messaging_limit_tier',
        'account_review_status',
        'business_verification_status',
        'code_verification_status',
        'display_name_status',
        'restriction_state',
        'warning_state',
        'health_state',
        'health_last_synced_at',
        'templates_last_synced_at',
        'templates_last_sync_error',
        'is_active',
        'activation_state',
        'activation_last_error',
        'activation_updated_at',
        'provisioning_step',
        'provisioning_status',
        'provisioning_last_error',
        'provisioning_context',
        'provisioning_completed_at',
        'throughput_cap_per_minute',
        'quiet_hours_start',
        'quiet_hours_end',
        'quiet_hours_timezone',
        'metadata_sync_status',
        'metadata_last_sync_error'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($connection) {
            if (!$connection->slug) {
                $connection->slug = static::generateSlug($connection);
            }
        });

        static::updating(function ($connection) {
            // Regenerate slug if name changes
            if ($connection->isDirty('name') && !$connection->isDirty('slug')) {
                $connection->slug = static::generateSlug($connection);
            }
        });
    }

    /**
     * Generate a unique slug for the connection.
     */
    public static function generateSlug($connection): string
    {
        $baseSlug = \Illuminate\Support\Str::slug($connection->name ?? 'connection');
        $slug = $baseSlug;
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)
            ->where('account_id', $connection->account_id ?? 0)
            ->where('id', '!=', $connection->id ?? 0)
            ->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected $casts = [
        'webhook_subscribed' => 'boolean',
        'is_active' => 'boolean',
        'webhook_last_received_at' => 'datetime',
        'webhook_last_processed_at' => 'datetime',
        'webhook_consecutive_failures' => 'integer',
        'webhook_last_lag_seconds' => 'integer',
        'health_last_synced_at' => 'datetime',
        'activation_updated_at' => 'datetime',
        'provisioning_context' => 'array',
        'provisioning_completed_at' => 'datetime',
        'templates_last_synced_at' => 'datetime',
        'throughput_cap_per_minute' => 'integer'];

    /**
     * Get the decrypted access token.
     */
    public function getAccessTokenAttribute(): ?string
    {
        if (!$this->access_token_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->access_token_encrypted);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Set the encrypted access token.
     */
    public function setAccessTokenAttribute(?string $value): void
    {
        if ($value) {
            $this->attributes['access_token_encrypted'] = Crypt::encryptString($value);
        } else {
            $this->attributes['access_token_encrypted'] = null;
        }
    }

    /**
     * Get the account.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get conversations for this connection.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(WhatsAppConversation::class);
    }

    /**
     * Historical health snapshots for this connection.
     */
    public function healthSnapshots(): HasMany
    {
        return $this->hasMany(WhatsAppConnectionHealthSnapshot::class, 'whatsapp_connection_id');
    }

    /**
     * Latest captured health snapshot.
     */
    public function latestHealthSnapshot(): HasOne
    {
        return $this->hasOne(WhatsAppConnectionHealthSnapshot::class, 'whatsapp_connection_id')->latestOfMany('captured_at');
    }
}
