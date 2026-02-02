<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_platform_admin',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_platform_admin' => 'boolean',
        ];
    }

    /**
     * Get the workspaces that the user belongs to.
     */
    public function workspaces()
    {
        return $this->belongsToMany(Workspace::class, 'workspace_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the workspaces that the user owns.
     */
    public function ownedWorkspaces()
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    /**
     * Check if user is a super admin (platform owner).
     */
    public function isSuperAdmin(): bool
    {
        return $this->is_platform_admin === true;
    }

    /**
     * Alias for isSuperAdmin (backward compatibility).
     */
    public function isPlatformAdmin(): bool
    {
        return $this->isSuperAdmin();
    }

    /**
     * Check if user can access a workspace (platform admin or workspace member/owner).
     */
    public function canAccessWorkspace(Workspace $workspace): bool
    {
        // Platform admins can access all workspaces
        if ($this->isPlatformAdmin()) {
            return true;
        }

        // Check if user is owner
        if ($workspace->owner_id === $this->id) {
            return true;
        }

        // Check if user is a member
        return $workspace->users()->where('user_id', $this->id)->exists();
    }
}
