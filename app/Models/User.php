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
        'phone',
        'phone_verified_at',
        'password',
        'is_platform_admin',
        'notify_assignment_enabled',
        'notify_mention_enabled',
        'notify_sound_enabled',
        'ai_suggestions_enabled',
        'ai_prompts'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_platform_admin' => 'boolean',
            'notify_assignment_enabled' => 'boolean',
            'notify_mention_enabled' => 'boolean',
            'notify_sound_enabled' => 'boolean',
            'ai_suggestions_enabled' => 'boolean',
            'ai_prompts' => 'array'];
    }

    /**
     * Get the accounts that the user belongs to.
     */
    public function accounts()
    {
        return $this->belongsToMany(Account::class, 'account_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get the accounts that the user owns.
     */
    public function ownedAccounts()
    {
        return $this->hasMany(Account::class, 'owner_id');
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
     * Check if user can access a account (platform admin or account member/owner).
     */
    public function canAccessAccount(Account $account): bool
    {
        // Platform admins can access all accounts
        if ($this->isPlatformAdmin()) {
            return true;
        }

        // Check if user is owner
        if ((int) $account->owner_id === (int) $this->id) {
            return true;
        }

        // Check if user is a member
        return $account->users()->where('user_id', $this->id)->exists();
    }
}
