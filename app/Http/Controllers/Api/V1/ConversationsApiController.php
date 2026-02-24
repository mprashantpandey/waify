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

        $query = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('account_id', $account->id)
            ->with(['contact:id,wa_id,slug,name,phone', 'connection:id,name,slug'])
            ->orderByDesc('last_message_at');

        $conversations = $query->get();

        $data = $conversations->map(function ($c) {
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

        return response()->json(['data' => $data]);
    }
}
