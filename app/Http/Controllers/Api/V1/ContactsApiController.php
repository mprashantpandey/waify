<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactsApiController extends Controller
{
    /**
     * GET /api/v1/contacts - List contacts for the account.
     */
    public function index(Request $request): JsonResponse
    {
        $account = $request->attributes->get('account');
        if (!$account) {
            return response()->json(['error' => 'Account not found.'], 404);
        }

        if (!class_exists(\App\Modules\WhatsApp\Models\WhatsAppContact::class)) {
            return response()->json(['data' => []]);
        }

        $query = \App\Modules\WhatsApp\Models\WhatsAppContact::where('account_id', $account->id)
            ->orderBy('name');

        $contacts = $query->get(['id', 'wa_id', 'slug', 'name', 'phone', 'email', 'company', 'status', 'last_contacted_at', 'message_count']);

        $data = $contacts->map(function ($c) {
            return [
                'id' => $c->id,
                'wa_id' => $c->wa_id,
                'slug' => $c->slug,
                'name' => $c->name,
                'phone' => $c->phone,
                'email' => $c->email,
                'company' => $c->company,
                'status' => $c->status,
                'last_contacted_at' => $c->last_contacted_at?->toIso8601String(),
                'message_count' => (int) ($c->message_count ?? 0),
            ];
        });

        return response()->json(['data' => $data]);
    }
}
