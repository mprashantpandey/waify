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
        'last_used_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
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
        return strlen($plaintext) > 11 ? substr($plaintext, 0, 11) . '...' : $plaintext;
    }

    /**
     * Find key by plaintext (for auth). Updates last_used_at.
     */
    public static function findByPlaintext(string $plaintext): ?self
    {
        $hash = self::hashKey($plaintext);
        $key = self::where('key_hash', $hash)->first();
        if ($key) {
            $key->touch('last_used_at');
        }
        return $key;
    }
}
