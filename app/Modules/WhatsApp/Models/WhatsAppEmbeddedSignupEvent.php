<?php

namespace App\Modules\WhatsApp\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppEmbeddedSignupEvent extends Model
{
    protected $table = 'whatsapp_embedded_signup_events';

    protected $fillable = [
        'account_id',
        'user_id',
        'whatsapp_connection_id',
        'event',
        'status',
        'current_step',
        'message',
        'waba_id',
        'phone_number_id',
        'payload',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function connection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }
}
