<?php

namespace App\Modules\WhatsApp\Models;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppConnectionHealthSnapshot extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_connection_health_snapshots';

    protected $fillable = [
        'account_id',
        'whatsapp_connection_id',
        'source',
        'quality_rating',
        'messaging_limit_tier',
        'account_review_status',
        'business_verification_status',
        'code_verification_status',
        'display_name_status',
        'restriction_state',
        'warning_state',
        'health_state',
        'health_notes',
        'captured_at',
    ];

    protected $casts = [
        'health_notes' => 'array',
        'captured_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }
}
