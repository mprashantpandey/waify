<?php

namespace App\Modules\WhatsApp\Models;

use App\Models\MetaPricingVersion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppUsageEvent extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_usage_events';

    protected $fillable = [
        'account_id',
        'whatsapp_connection_id',
        'whatsapp_message_id',
        'whatsapp_conversation_id',
        'whatsapp_message_billing_id',
        'meta_pricing_version_id',
        'meta_message_id',
        'pricing_category',
        'pricing_region_code',
        'currency',
        'billable_unit',
        'billable',
        'estimated_cost_minor',
        'final_cost_minor',
        'source_event',
        'source_payload',
        'occurred_at',
    ];

    protected $casts = [
        'billable' => 'boolean',
        'billable_unit' => 'integer',
        'estimated_cost_minor' => 'integer',
        'final_cost_minor' => 'integer',
        'source_payload' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(WhatsAppMessage::class, 'whatsapp_message_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConversation::class, 'whatsapp_conversation_id');
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }

    public function billing(): BelongsTo
    {
        return $this->belongsTo(WhatsAppMessageBilling::class, 'whatsapp_message_billing_id');
    }

    public function pricingVersion(): BelongsTo
    {
        return $this->belongsTo(MetaPricingVersion::class, 'meta_pricing_version_id');
    }
}

