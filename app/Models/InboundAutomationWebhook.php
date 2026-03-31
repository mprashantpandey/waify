<?php

namespace App\Models;

use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class InboundAutomationWebhook extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'name',
        'public_key',
        'signing_secret',
        'is_active',
        'action_type',
        'campaign_sequence_id',
        'whatsapp_connection_id',
        'whatsapp_template_id',
        'payload_mappings',
        'template_variable_paths',
        'template_static_params',
        'last_received_at',
        'last_triggered_at',
        'last_error',
        'metadata',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'payload_mappings' => 'array',
        'template_variable_paths' => 'array',
        'template_static_params' => 'array',
        'metadata' => 'array',
        'last_received_at' => 'datetime',
        'last_triggered_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $webhook): void {
            if (!$webhook->public_key) {
                $webhook->public_key = (string) Str::uuid();
            }

            if (!$webhook->signing_secret) {
                $webhook->signing_secret = Str::random(48);
            }
        });
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function sequence(): BelongsTo
    {
        return $this->belongsTo(CampaignSequence::class, 'campaign_sequence_id');
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(WhatsAppTemplate::class, 'whatsapp_template_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(InboundAutomationWebhookLog::class, 'inbound_automation_webhook_id');
    }
}
