<?php

namespace App\Modules\Contacts\Models;

use App\Models\User;
use App\Models\Workspace;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactActivity extends Model
{
    use HasFactory;

    protected $table = 'contact_activities';

    protected $fillable = [
        'workspace_id',
        'contact_id',
        'user_id',
        'type',
        'title',
        'description',
        'metadata',
    ];

    protected $casts = [
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
     * Get the contact.
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(WhatsAppContact::class, 'contact_id');
    }

    /**
     * Get the user who performed the activity.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

