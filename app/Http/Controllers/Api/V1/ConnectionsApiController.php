<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConnectionsApiController extends Controller
{
    /**
     * GET /api/v1/connections - List WhatsApp connections for the account.
     */
    public function index(Request $request): JsonResponse
    {
        $account = $request->attributes->get('account');
        if (!$account) {
            return response()->json(['error' => 'Account not found.'], 404);
        }

        if (!class_exists(\App\Modules\WhatsApp\Models\WhatsAppConnection::class)) {
            return response()->json(['data' => []]);
        }

        $limit = min(100, max(1, (int) $request->input('limit', 50)));
        $statusFilter = trim((string) $request->input('status', ''));

        $query = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->orderBy('name');

        $columns = ['id', 'name', 'slug', 'is_active', 'account_id'];
        if (\Illuminate\Support\Facades\Schema::hasColumn('whatsapp_connections', 'status')) {
            $columns[] = 'status';
        }
        if ($statusFilter !== '') {
            if (\Illuminate\Support\Facades\Schema::hasColumn('whatsapp_connections', 'status')) {
                $query->where('status', $statusFilter);
            } elseif (in_array($statusFilter, ['active', 'inactive'], true)) {
                $query->where('is_active', $statusFilter === 'active');
            }
        }
        $connections = $query->paginate($limit, $columns);

        $data = collect($connections->items())->map(function ($c) {
            $status = isset($c->status) ? $c->status : ($c->is_active ? 'active' : 'inactive');
            return [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'status' => $status,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'current_page' => $connections->currentPage(),
                'last_page' => $connections->lastPage(),
                'per_page' => $connections->perPage(),
                'total' => $connections->total(),
            ],
        ]);
    }
}
