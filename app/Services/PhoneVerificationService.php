<?php

namespace App\Services;

use App\Models\PhoneVerificationOtp;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class PhoneVerificationService
{
    public function sendCode(User $user): array
    {
        $phone = trim((string) ($user->phone ?? ''));
        if ($phone === '') {
            return ['ok' => false, 'message' => 'Please add your phone number first.'];
        }

        $rateKey = "phone-verification:send:user:{$user->id}";
        if (Cache::has($rateKey)) {
            $seconds = max(1, (int) Cache::get($rateKey));
            return ['ok' => false, 'message' => "Please wait {$seconds} seconds before requesting another code."];
        }

        PhoneVerificationOtp::where('user_id', $user->id)
            ->whereNull('consumed_at')
            ->update(['consumed_at' => now()]);

        $code = (string) random_int(100000, 999999);
        $expiresAt = now()->addMinutes(10);

        $otp = PhoneVerificationOtp::create([
            'user_id' => $user->id,
            'phone' => $phone,
            'code_hash' => Hash::make($code),
            'attempts' => 0,
            'max_attempts' => 5,
            'expires_at' => $expiresAt,
            'delivery_channel' => 'email_fallback',
            'delivery_target' => $user->email,
            'meta' => [
                'reason' => 'phone_verification',
                'fallback' => true,
            ],
        ]);

        $this->deliverCode($user, $phone, $code, $expiresAt);

        Cache::put($rateKey, 60, now()->addSeconds(60));

        return [
            'ok' => true,
            'message' => 'Verification code sent.',
            'delivery_channel' => $otp->delivery_channel,
        ];
    }

    public function verifyCode(User $user, string $code): array
    {
        $phone = trim((string) ($user->phone ?? ''));
        if ($phone === '') {
            return ['ok' => false, 'message' => 'Please add your phone number first.'];
        }

        /** @var PhoneVerificationOtp|null $otp */
        $otp = PhoneVerificationOtp::where('user_id', $user->id)
            ->where('phone', $phone)
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (!$otp) {
            return ['ok' => false, 'message' => 'No active verification code found. Request a new code.'];
        }

        if ($otp->isExpired()) {
            $otp->update(['consumed_at' => now()]);
            return ['ok' => false, 'message' => 'Verification code expired. Request a new code.'];
        }

        if ((int) $otp->attempts >= (int) $otp->max_attempts) {
            $otp->update(['consumed_at' => now()]);
            return ['ok' => false, 'message' => 'Too many attempts. Request a new code.'];
        }

        $otp->increment('attempts');

        if (!Hash::check(trim($code), $otp->code_hash)) {
            return ['ok' => false, 'message' => 'Invalid verification code.'];
        }

        $otp->update(['consumed_at' => now()]);

        $user->forceFill([
            'phone_verified_at' => now(),
        ])->save();

        return ['ok' => true, 'message' => 'Phone number verified successfully.'];
    }

    protected function deliverCode(User $user, string $phone, string $code, \Carbon\CarbonInterface $expiresAt): void
    {
        $subject = 'Phone Verification Code';
        $body = "Your verification code for {$phone} is {$code}. It expires in 10 minutes.";

        try {
            if (!empty($user->email)) {
                Mail::raw($body, function ($message) use ($user, $subject) {
                    $message->to($user->email)->subject($subject);
                });
            }
        } catch (\Throwable $e) {
            Log::warning('Phone OTP email fallback delivery failed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

        Log::channel('stack')->info('Phone verification OTP generated', [
            'user_id' => $user->id,
            'phone' => $phone,
            'code' => $code,
            'expires_at' => $expiresAt->toIso8601String(),
            'delivery_channel' => 'email_fallback',
        ]);
    }
}

