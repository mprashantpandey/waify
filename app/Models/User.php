<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Schema;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    protected static ?string $platformAdminColumnCache = null;

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
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
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
            'phone_verified_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
            'is_platform_admin' => 'boolean',
            'is_super_admin' => 'boolean',
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
        $column = static::platformAdminColumn();

        if (!$column) {
            return false;
        }

        return (bool) $this->getAttribute($column);
    }

    /**
     * Alias for isSuperAdmin (backward compatibility).
     */
    public function isPlatformAdmin(): bool
    {
        return $this->isSuperAdmin();
    }

    public static function platformAdminColumn(): ?string
    {
        if (static::$platformAdminColumnCache !== null) {
            return static::$platformAdminColumnCache;
        }

        if (Schema::hasColumn('users', 'is_platform_admin')) {
            return static::$platformAdminColumnCache = 'is_platform_admin';
        }

        if (Schema::hasColumn('users', 'is_super_admin')) {
            return static::$platformAdminColumnCache = 'is_super_admin';
        }

        return static::$platformAdminColumnCache = '';
    }

    public function scopePlatformAdmins(Builder $query): Builder
    {
        $column = static::platformAdminColumn();

        if (!$column) {
            return $query->whereRaw('1 = 0');
        }

        return $query->where($column, true);
    }

    public function setPlatformAdminFlag(bool $value): void
    {
        $column = static::platformAdminColumn();

        if (!$column) {
            return;
        }

        $this->update([$column => $value]);
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
