<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'owner_id',
        'status',
        'disabled_reason',
        'disabled_at',
    ];

    /**
     * Get the owner of the workspace.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all users that belong to this workspace.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get all modules for this workspace.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(WorkspaceModule::class);
    }

    /**
     * Get the workspace subscription.
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * Get workspace addons.
     */
    public function addons()
    {
        return $this->hasMany(WorkspaceAddon::class)->where('status', 'active');
    }

    /**
     * Get workspace usage records.
     */
    public function usage()
    {
        return $this->hasMany(WorkspaceUsage::class);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'disabled_at' => 'datetime',
        ];
    }

    /**
     * Check if workspace is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if workspace is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if workspace is disabled.
     */
    public function isDisabled(): bool
    {
        return $this->status === 'disabled';
    }

    /**
     * Disable the workspace.
     */
    public function disable(?string $reason = null): void
    {
        $this->update([
            'status' => 'disabled',
            'disabled_reason' => $reason,
            'disabled_at' => now(),
        ]);
    }

    /**
     * Enable the workspace.
     */
    public function enable(): void
    {
        $this->update([
            'status' => 'active',
            'disabled_reason' => null,
            'disabled_at' => null,
        ]);
    }

    /**
     * Generate a unique slug from the name.
     */
    public static function generateSlug(string $name): string
    {
        $slug = \Illuminate\Support\Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
