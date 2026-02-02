<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkspaceModule extends Model
{
    protected $fillable = [
        'workspace_id',
        'module_key',
        'enabled',
        'config',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'config' => 'array',
    ];

    /**
     * Get the workspace.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the module.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class, 'module_key', 'key');
    }
}
