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

        $limit = min(100, max(1, (int) $request->input('limit', 25)));
        $status = trim((string) $request->input('status', ''));
        $search = trim((string) $request->input('search', ''));

        $query = \App\Modules\WhatsApp\Models\WhatsAppContact::where('account_id', $account->id)
            ->orderBy('name');
        if ($status !== '') {
            $query->where('status', $status);
        }
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('wa_id', 'like', "%{$search}%");
            });
        }

        $contacts = $query->paginate($limit, ['id', 'wa_id', 'slug', 'name', 'phone', 'email', 'company', 'status', 'last_contacted_at', 'message_count']);

        $data = collect($contacts->items())->map(function ($c) {
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

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total(),
            ],
        ]);
    }
}
