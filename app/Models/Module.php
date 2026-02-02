<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    protected $fillable = [
        'key',
        'name',
        'description',
        'is_core',
        'is_enabled',
    ];

    protected $casts = [
        'is_core' => 'boolean',
        'is_enabled' => 'boolean',
    ];

    /**
     * Get all workspace module states for this module.
     */
    public function workspaceModules(): HasMany
    {
        return $this->hasMany(WorkspaceModule::class, 'module_key', 'key');
    }
}
