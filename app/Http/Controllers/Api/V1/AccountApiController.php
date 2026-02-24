<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AccountApiController extends Controller
{
    /**
     * GET /api/v1/account - Current account profile (authenticated by API key).
     */
    public function show(Request $request): JsonResponse
    {
        $account = $request->attributes->get('account');
        if (!$account) {
            return response()->json(['error' => 'Account not found.'], 404);
        }

        return response()->json([
            'id' => $account->id,
            'name' => $account->name,
            'slug' => $account->slug,
        ]);
    }
}
