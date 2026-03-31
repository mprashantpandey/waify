<?php

namespace App\Modules\Broadcasts\Models;

use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignSequenceEnrollment extends Model
{
    use HasFactory;

    protected $table = 'campaign_sequence_enrollments';

    protected $fillable = [
        'campaign_sequence_id',
        'whatsapp_contact_id',
        'wa_id',
        'name',
        'status',
        'sent_steps_count',
        'enrolled_at',
        'last_step_sent_at',
        'completed_at',
        'failed_at',
        'failure_reason',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'enrolled_at' => 'datetime',
        'last_step_sent_at' => 'datetime',
        'completed_at' => 'datetime',
        'failed_at' => 'datetime',
    ];

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(CampaignSequence::class, 'campaign_sequence_id');
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsAppContact::class, 'whatsapp_contact_id');
    }

    public function hasSentStep(int $stepId): bool
    {
        $sentStepIds = collect(data_get($this->metadata, 'sent_step_ids', []))
            ->map(fn ($value) => (int) $value)
            ->all();

        return in_array($stepId, $sentStepIds, true);
    }
}
