<?php

namespace App\Modules\Broadcasts\Models;

use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignSequenceStep extends Model
{
    use HasFactory;

    protected $table = 'campaign_sequence_steps';

    protected $fillable = [
        'campaign_sequence_id',
        'step_order',
        'delay_minutes',
        'type',
        'whatsapp_template_id',
        'message_text',
        'template_params',
        'metadata',
    ];

    protected $casts = [
        'template_params' => 'array',
        'metadata' => 'array',
    ];

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(CampaignSequence::class, 'campaign_sequence_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(WhatsAppTemplate::class, 'whatsapp_template_id');
    }
}
