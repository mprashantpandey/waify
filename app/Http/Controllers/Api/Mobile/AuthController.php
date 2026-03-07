<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate a mobile user and return a token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string|max:255',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Optional: Force them to select an account if they have multiple, 
        // or just load their default account. For MVP, we load the first active membership.
        $account = $user->accounts()->first();

        if (!$account) {
            return response()->json([
                'message' => 'Your user does not belong to any active workspaces.'
            ], 403);
        }

        // Issue a token specifically for this device
        $token = $user->createToken($request->device_name, ['mobile-app'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url ?? null,
            ],
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
            ]
        ]);
    }

    /**
     * Revoke the current token.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request)
    {
        $user = $request->user();
        // Since we are stateless, we require the client to pass account_id in headers,
        // or we default to their primary account.
        $accountId = $request->header('X-Account-ID');
        $account = null;

        if ($accountId) {
            $account = $user->accounts()->find($accountId);
        }

        if (!$account) {
            $account = $user->accounts()->first();
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar_url ?? null,
            ],
            'account' => $account ? [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
            ] : null
        ]);
    }
}