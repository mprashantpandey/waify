<?php

namespace App\Modules\WhatsApp\Models;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsAppMessage extends Model
{
    use HasFactory;
    protected $table = 'whatsapp_messages';

    protected $fillable = [
        'workspace_id',
        'whatsapp_conversation_id',
        'direction',
        'meta_message_id',
        'type',
        'text_body',
        'payload',
        'status',
        'error_message',
        'sent_at',
        'delivered_at',
        'read_at',
        'received_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    /**
     * Get the workspace.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the conversation.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConversation::class, 'whatsapp_conversation_id');
    }
}
