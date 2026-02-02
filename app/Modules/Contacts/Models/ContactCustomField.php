<?php

namespace App\Modules\Contacts\Models;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContactCustomField extends Model
{
    use HasFactory;

    protected $table = 'contact_custom_fields';

    protected $fillable = [
        'workspace_id',
        'name',
        'type',
        'options',
        'required',
        'order',
    ];

    protected $casts = [
        'options' => 'array',
        'required' => 'boolean',
    ];

    /**
     * Get the workspace.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}

