<?php

namespace App\Modules\WhatsApp\Models;

use App\Modules\Broadcasts\Models\CampaignMessage;
use App\Models\MetaPricingVersion;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppMessageBilling extends Model
{
    use HasFactory;

    protected $table = 'whatsapp_message_billings';

    protected $fillable = [
        'account_id',
        'meta_message_id',
        'whatsapp_message_id',
        'campaign_message_id',
        'billable',
        'category',
        'pricing_model',
        'meta_pricing_version_id',
        'pricing_country_code',
        'pricing_currency',
        'rate_minor',
        'estimated_cost_minor',
        'meta',
        'counted_at',
    ];

    protected $casts = [
        'billable' => 'boolean',
        'meta_pricing_version_id' => 'integer',
        'rate_minor' => 'integer',
        'estimated_cost_minor' => 'integer',
        'meta' => 'array',
        'counted_at' => 'datetime',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(WhatsAppMessage::class, 'whatsapp_message_id');
    }

    public function campaignMessage(): BelongsTo
    {
        return $this->belongsTo(CampaignMessage::class, 'campaign_message_id');
    }

    public function pricingVersion(): BelongsTo
    {
        return $this->belongsTo(MetaPricingVersion::class, 'meta_pricing_version_id');
    }
}
