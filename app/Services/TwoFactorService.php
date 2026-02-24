<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;

class TwoFactorService
{
    public function generateSecret(int $bytes = 20): string
    {
        return $this->base32Encode(random_bytes($bytes));
    }

    public function getIssuer(): string
    {
        return (string) (config('app.name') ?: 'App');
    }

    public function getAccountLabel(User $user): string
    {
        return (string) ($user->email ?: ('user-'.$user->id));
    }

    public function makeOtpAuthUri(User $user, string $secret): string
    {
        $issuer = $this->getIssuer();
        $label = rawurlencode($issuer.':'.$this->getAccountLabel($user));

        return sprintf(
            'otpauth://totp/%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30',
            $label,
            rawurlencode($secret),
            rawurlencode($issuer)
        );
    }

    public function verifyCode(string $secret, string $code, int $window = 1): bool
    {
        $normalized = preg_replace('/\D+/', '', $code ?? '') ?? '';
        if (strlen($normalized) !== 6) {
            return false;
        }

        $timestamp = (int) floor(time() / 30);
        for ($i = -$window; $i <= $window; $i++) {
            if (hash_equals($this->totp($secret, $timestamp + $i), $normalized)) {
                return true;
            }
        }

        return false;
    }

    public function enableForUser(User $user, string $secret): array
    {
        $recoveryCodes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_secret' => Crypt::encryptString($secret),
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
        ])->save();

        return $recoveryCodes;
    }

    public function disableForUser(User $user): void
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_confirmed_at' => null,
            'two_factor_recovery_codes' => null,
        ])->save();
    }

    public function decryptUserSecret(User $user): ?string
    {
        if (empty($user->two_factor_secret)) {
            return null;
        }

        try {
            return Crypt::decryptString((string) $user->two_factor_secret);
        } catch (\Throwable) {
            return null;
        }
    }

    public function getRecoveryCodes(User $user): array
    {
        if (empty($user->two_factor_recovery_codes)) {
            return [];
        }

        try {
            $decoded = json_decode(Crypt::decryptString((string) $user->two_factor_recovery_codes), true);
        } catch (\Throwable) {
            return [];
        }

        return is_array($decoded) ? array_values(array_filter($decoded, fn ($v) => is_string($v) && $v !== '')) : [];
    }

    public function regenerateRecoveryCodes(User $user): array
    {
        $codes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($codes)),
        ])->save();

        return $codes;
    }

    public function formatSecret(string $secret): string
    {
        return trim(chunk_split($secret, 4, ' '));
    }

    protected function generateRecoveryCodes(int $count = 8): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = strtoupper(substr(bin2hex(random_bytes(5)), 0, 10));
        }

        return $codes;
    }

    protected function totp(string $base32Secret, int $counter): string
    {
        $secret = $this->base32Decode($base32Secret);
        if ($secret === '') {
            return '000000';
        }

        $binaryCounter = pack('N*', 0).pack('N*', $counter);
        $hash = hash_hmac('sha1', $binaryCounter, $secret, true);
        $offset = ord(substr($hash, -1)) & 0x0F;
        $chunk = substr($hash, $offset, 4);
        $value = unpack('N', $chunk)[1] & 0x7FFFFFFF;

        return str_pad((string) ($value % 1000000), 6, '0', STR_PAD_LEFT);
    }

    protected function base32Encode(string $data): string
    {
        $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $binary = '';
        foreach (str_split($data) as $char) {
            $binary .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
        }

        $encoded = '';
        foreach (str_split($binary, 5) as $chunk) {
            if (strlen($chunk) < 5) {
                $chunk = str_pad($chunk, 5, '0', STR_PAD_RIGHT);
            }
            $encoded .= $alphabet[bindec($chunk)];
        }

        return $encoded;
    }

    protected function base32Decode(string $base32): string
    {
        $alphabet = array_flip(str_split('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'));
        $clean = strtoupper(preg_replace('/[^A-Z2-7]/', '', $base32) ?? '');
        if ($clean === '') {
            return '';
        }

        $binary = '';
        foreach (str_split($clean) as $char) {
            if (!array_key_exists($char, $alphabet)) {
                return '';
            }
            $binary .= str_pad(decbin($alphabet[$char]), 5, '0', STR_PAD_LEFT);
        }

        $decoded = '';
        foreach (str_split($binary, 8) as $chunk) {
            if (strlen($chunk) < 8) {
                continue;
            }
            $decoded .= chr(bindec($chunk));
        }

        return $decoded;
    }
}

