<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoogleSheetsDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'google_sheets_integration_id',
        'event_key',
        'event_id',
        'idempotency_key',
        'payload',
        'status',
        'attempts',
        'response_summary',
        'error_message',
        'delivered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'attempts' => 'integer',
        'delivered_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(GoogleSheetsIntegration::class, 'google_sheets_integration_id');
    }
}
