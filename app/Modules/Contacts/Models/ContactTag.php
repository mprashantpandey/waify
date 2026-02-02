<?php

namespace App\Modules\Contacts\Models;

use App\Models\Workspace;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ContactTag extends Model
{
    use HasFactory;

    protected $table = 'contact_tags';

    protected $fillable = [
        'workspace_id',
        'name',
        'color',
        'description',
    ];

    /**
     * Get the workspace.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get contacts with this tag.
     */
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(WhatsAppContact::class, 'contact_tag_contact', 'contact_tag_id', 'contact_id')
            ->withTimestamps();
    }

    /**
     * Get contact count.
     */
    public function getContactCountAttribute(): int
    {
        return $this->contacts()->count();
    }
}

