<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AccountApiKey extends Model
{
    protected $table = 'account_api_keys';

    protected $fillable = [
        'account_id',
        'name',
        'key_hash',
        'key_prefix',
        'is_active',
        'scopes',
        'last_used_at',
        'last_used_ip',
        'expires_at',
        'revoked_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'scopes' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public const KEY_PREFIX = 'wfy_';
    public const KEY_LENGTH = 40;

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Generate a new API key and return the plaintext (only shown once).
     */
    public static function generateKey(): string
    {
        return self::KEY_PREFIX . Str::random(self::KEY_LENGTH - strlen(self::KEY_PREFIX));
    }

    /**
     * Hash a plaintext key for storage/lookup.
     */
    public static function hashKey(string $plaintext): string
    {
        return hash('sha256', $plaintext);
    }

    /**
     * Get display prefix (e.g. wfy_abc1...).
     */
    public static function prefixForDisplay(string $plaintext): string
    {
        return strlen($plaintext) > 12 ? substr($plaintext, 0, 9) . '...' : $plaintext;
    }

    /**
     * Find key by plaintext (for auth). Updates last_used_at.
     */
    public static function findByPlaintext(string $plaintext): ?self
    {
        $hash = self::hashKey($plaintext);
        $key = self::where('key_hash', $hash)->first();
        if ($key) {
            if (!$key->isUsable()) {
                return null;
            }
        }
        return $key;
    }

    public function isUsable(): bool
    {
        // Use getAttribute so we respect DB columns when present (e.g. after lifecycle migration)
        if (($this->getAttribute('is_active') ?? true) === false) {
            return false;
        }

        if (!empty($this->revoked_at)) {
            return false;
        }

        if (!empty($this->expires_at) && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function touchUsage(?string $ip = null): void
    {
        $shouldUpdate = !$this->last_used_at || $this->last_used_at->lt(now()->subMinutes(5));

        if (!$shouldUpdate && $ip === ($this->last_used_ip ?? null)) {
            return;
        }

        $payload = ['last_used_at' => now()];
        if (\Illuminate\Support\Facades\Schema::hasColumn($this->getTable(), 'last_used_ip')) {
            $payload['last_used_ip'] = $ip ?: $this->last_used_ip;
        }
        $this->forceFill($payload)->save();
    }

    public function hasScope(string $scope): bool
    {
        $scopes = is_array($this->scopes) ? $this->scopes : [];
        if ($scopes === [] || in_array('*', $scopes, true)) {
            return true;
        }

        if (in_array($scope, $scopes, true)) {
            return true;
        }

        // wildcard namespace support: contacts.* grants contacts.read
        foreach ($scopes as $granted) {
            if (str_ends_with((string) $granted, '.*')) {
                $prefix = substr((string) $granted, 0, -1);
                if (str_starts_with($scope, $prefix)) {
                    return true;
                }
            }
        }

        return false;
    }
}
