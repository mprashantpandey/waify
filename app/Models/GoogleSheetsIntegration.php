<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class GoogleSheetsIntegration extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'name',
        'spreadsheet_id',
        'sheet_name',
        'service_account_email',
        'service_account_private_key',
        'service_account_private_key_encrypted',
        'service_account_client_id',
        'project_id',
        'is_active',
        'event_keys',
        'append_headers',
        'include_payload_json',
        'last_delivery_at',
        'last_delivery_error',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'event_keys' => 'array',
        'append_headers' => 'boolean',
        'include_payload_json' => 'boolean',
        'last_delivery_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(GoogleSheetsDelivery::class)->latest('id');
    }

    public function setServiceAccountPrivateKeyAttribute(?string $value): void
    {
        $this->attributes['service_account_private_key_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getServiceAccountPrivateKeyAttribute(): ?string
    {
        $encrypted = $this->attributes['service_account_private_key_encrypted'] ?? null;
        if (!$encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable) {
            return null;
        }
    }

    public function getSpreadsheetUrlAttribute(): string
    {
        return sprintf('https://docs.google.com/spreadsheets/d/%s/edit', $this->spreadsheet_id);
    }
}
