<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\MobileAccessToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MobileAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:120'],
            'device_platform' => ['nullable', 'string', 'max:40'],
            'device_id' => ['nullable', 'string', 'max:160'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        if ($user->two_factor_enabled_at) {
            return response()->json([
                'message' => 'Two-factor authentication is enabled. Mobile 2FA challenge support is not enabled yet.',
                'requires_2fa' => true,
            ], 423);
        }

        $account = $this->defaultAccount($user);
        [$token, $plainTextToken] = MobileAccessToken::issue(
            $user,
            $account,
            $validated['device_name'] ?? 'Zyptos mobile'
        );
        $token->forceFill([
            'device_platform' => $validated['device_platform'] ?? null,
            'device_id' => $validated['device_id'] ?? null,
        ])->save();

        return response()->json([
            'token' => $plainTextToken,
            'token_type' => 'Bearer',
            'expires_at' => $token->expires_at?->toIso8601String(),
            'user' => $this->userPayload($user),
            'accounts' => $this->accountsPayload($user),
            'current_account' => $account ? $this->accountPayload($account, $user) : null,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->attributes->get('mobile_access_token')?->forceFill([
            'revoked_at' => now(),
        ])->save();

        return response()->json(['message' => 'Signed out.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $account = $request->attributes->get('account');

        return response()->json([
            'user' => $this->userPayload($user),
            'accounts' => $this->accountsPayload($user),
            'current_account' => $account ? $this->accountPayload($account, $user) : null,
        ]);
    }

    public function registerDevice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'push_token' => ['nullable', 'string', 'max:4096'],
            'push_provider' => ['nullable', 'string', 'max:40'],
            'device_platform' => ['nullable', 'string', 'max:40'],
            'device_id' => ['nullable', 'string', 'max:160'],
        ]);

        $token = $request->attributes->get('mobile_access_token');
        $token?->forceFill([
            'push_token' => $validated['push_token'] ?? null,
            'push_provider' => $validated['push_provider'] ?? null,
            'device_platform' => $validated['device_platform'] ?? $token->device_platform,
            'device_id' => $validated['device_id'] ?? $token->device_id,
            'push_token_updated_at' => now(),
        ])->save();

        return response()->json(['ok' => true]);
    }

    private function defaultAccount(User $user): ?Account
    {
        return $user->ownedAccounts()->first() ?: $user->accounts()->first();
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_url,
            'is_platform_admin' => (bool) $user->is_platform_admin,
        ];
    }

    private function accountsPayload(User $user): array
    {
        return $user->ownedAccounts()
            ->get()
            ->merge($user->accounts()->get())
            ->unique('id')
            ->values()
            ->map(fn (Account $account) => $this->accountPayload($account, $user))
            ->all();
    }

    private function accountPayload(Account $account, User $user): array
    {
        return [
            'id' => $account->id,
            'name' => $account->name,
            'slug' => $account->slug,
            'role' => (int) $account->owner_id === (int) $user->id ? 'owner' : ($account->pivot->role ?? 'member'),
            'status' => $account->status ?? null,
        ];
    }
}
