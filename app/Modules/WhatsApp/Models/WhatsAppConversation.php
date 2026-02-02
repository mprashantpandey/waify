<?php

namespace App\Modules\WhatsApp\Models;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsAppConversation extends Model
{
    use HasFactory;
    protected $table = 'whatsapp_conversations';

    protected $fillable = [
        'workspace_id',
        'whatsapp_connection_id',
        'whatsapp_contact_id',
        'status',
        'last_message_at',
        'last_message_preview',
        'metadata',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the workspace.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the WhatsApp connection.
     */
    public function connection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }

    /**
     * Get the contact.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsAppContact::class, 'whatsapp_contact_id');
    }

    /**
     * Get messages for this conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class)->orderBy('created_at');
    }
}
