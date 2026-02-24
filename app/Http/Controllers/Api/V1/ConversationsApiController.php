<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConversationsApiController extends Controller
{
    /**
     * GET /api/v1/conversations - List conversations for the account.
     */
    public function index(Request $request): JsonResponse
    {
        $account = $request->attributes->get('account');
        if (!$account) {
            return response()->json(['error' => 'Account not found.'], 404);
        }

        if (!class_exists(\App\Modules\WhatsApp\Models\WhatsAppConversation::class)) {
            return response()->json(['data' => []]);
        }

        $limit = min(100, max(1, (int) $request->input('limit', 25)));
        $statusFilter = trim((string) $request->input('status', ''));
        $search = trim((string) $request->input('search', ''));

        $query = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('account_id', $account->id)
            ->with(['contact:id,wa_id,slug,name,phone', 'connection:id,name,slug'])
            ->orderByDesc('last_message_at');
        if ($statusFilter !== '') {
            $query->where('status', $statusFilter);
        }
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('last_message_preview', 'like', "%{$search}%");
            });
        }

        $conversations = $query->paginate($limit);

        $data = collect($conversations->items())->map(function ($c) {
            return [
                'id' => $c->id,
                'status' => $c->status ?? 'open',
                'priority' => $c->priority ?? null,
                'last_message_at' => $c->last_message_at?->toIso8601String(),
                'last_message_preview' => $c->last_message_preview,
                'contact' => $c->relationLoaded('contact') && $c->contact
                    ? [
                        'id' => $c->contact->id,
                        'wa_id' => $c->contact->wa_id,
                        'slug' => $c->contact->slug,
                        'name' => $c->contact->name,
                        'phone' => $c->contact->phone,
                    ]
                    : null,
                'connection' => $c->relationLoaded('connection') && $c->connection
                    ? [
                        'id' => $c->connection->id,
                        'name' => $c->connection->name,
                        'slug' => $c->connection->slug,
                    ]
                    : null,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }
}
