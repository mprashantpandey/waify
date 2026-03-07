<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppMessageBilling;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics for the mobile app.
     */
    public function index(Request $request)
    {
        $accountId = $request->header('X-Account-ID');
        if (!$accountId) {
             $accountId = $request->user()->accounts()->first()?->id;
        }
        if (!$accountId) {
            abort(403, 'No account selected.');
        }

        // Active WA Connections
        $connections = WhatsAppConnection::where('account_id', $accountId)
            ->where('is_active', true)
            ->get(['id', 'name', 'business_phone']);

        // This Month's Message Usage
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $usage = WhatsAppMessageBilling::where('account_id', $accountId)
            ->whereBetween('messaged_at', [$startOfMonth, $endOfMonth])
            ->count();

        return response()->json([
            'connections' => $connections,
            'stats' => [
                'messages_this_month' => $usage,
                'active_connections' => $connections->count(),
            ]
        ]);
    }
}