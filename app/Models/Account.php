<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'slug',
        'owner_id',
        'status',
        'disabled_reason',
        'disabled_at',
        'auto_assign_enabled',
        'auto_assign_strategy'];

    /**
     * Get the owner of the account.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all users that belong to this account.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'account_users')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Get all modules for this account.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(AccountModule::class);
    }

    /**
     * Get the account subscription.
     */
    public function subscription()
    {
        return $this->hasOne(Subscription::class);
    }

    /**
     * Get account addons.
     */
    public function addons()
    {
        return $this->hasMany(AccountAddon::class)->where('status', 'active');
    }

    /**
     * Get account usage records.
     */
    public function usage()
    {
        return $this->hasMany(AccountUsage::class);
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'disabled_at' => 'datetime',
            'auto_assign_enabled' => 'boolean'];
    }

    /**
     * Check if account is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if a user is the owner of this account.
     */
    public function isOwnedBy(User $user): bool
    {
        // Primary check: owner_id
        if ($this->owner_id && (int) $this->owner_id === (int) $user->id) {
            return true;
        }

        // Fallback: Check account_users for legacy accounts (owner might be in pivot table)
        $accountUser = \App\Models\AccountUser::where('account_id', $this->id)
            ->where('user_id', $user->id)
            ->where('role', 'owner')
            ->first();

        if ($accountUser) {
            // Fix: Set owner_id if it's missing
            if (!$this->owner_id) {
                $this->update(['owner_id' => $user->id]);
            }
            return true;
        }

        return false;
    }

    /**
     * Check if account is suspended.
     */
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }

    /**
     * Check if account is disabled.
     */
    public function isDisabled(): bool
    {
        return $this->status === 'disabled';
    }

    /**
     * Disable the account.
     */
    public function disable(?string $reason = null): void
    {
        $this->update([
            'status' => 'disabled',
            'disabled_reason' => $reason,
            'disabled_at' => now()]);
    }

    /**
     * Enable the account.
     */
    public function enable(): void
    {
        $this->update([
            'status' => 'active',
            'disabled_reason' => null,
            'disabled_at' => null]);
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
