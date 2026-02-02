<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Subscription;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the platform dashboard.
     */
    public function index(Request $request): Response
    {
        $totalWorkspaces = Workspace::count();
        $activeWorkspaces = Workspace::where('status', 'active')->count();
        $suspendedWorkspaces = Workspace::where('status', 'suspended')->count();
        $disabledWorkspaces = Workspace::where('status', 'disabled')->count();
        $totalUsers = User::count();
        $superAdmins = User::where('is_platform_admin', true)->count();

        // Message Statistics
        $totalMessages = WhatsAppMessage::count();
        $messagesToday = WhatsAppMessage::whereDate('created_at', today())->count();
        $messagesThisWeek = WhatsAppMessage::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $messagesThisMonth = WhatsAppMessage::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $inboundMessages = WhatsAppMessage::where('direction', 'inbound')->count();
        $outboundMessages = WhatsAppMessage::where('direction', 'outbound')->count();
        
        // Message status breakdown
        $messageStatuses = WhatsAppMessage::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Connection Statistics
        $totalConnections = WhatsAppConnection::count();
        $activeConnections = WhatsAppConnection::where('is_active', true)->count();
        $connectionsWithErrors = WhatsAppConnection::whereNotNull('webhook_last_error')->count();

        // Template Statistics
        $totalTemplates = WhatsAppTemplate::count();
        $approvedTemplates = WhatsAppTemplate::where('status', 'APPROVED')->count();
        $pendingTemplates = WhatsAppTemplate::where('status', 'PENDING')->count();
        $rejectedTemplates = WhatsAppTemplate::where('status', 'REJECTED')->count();

        // Subscription Statistics
        $totalSubscriptions = Subscription::count();
        $activeSubscriptions = Subscription::where('status', 'active')->count();
        $trialingSubscriptions = Subscription::where('status', 'trialing')->count();
        $pastDueSubscriptions = Subscription::where('status', 'past_due')->count();

        // Usage Trends (last 7 days)
        $messageTrends = WhatsAppMessage::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('created_at', [now()->subDays(7), now()])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });

        // Top workspaces by message volume
        $topWorkspacesByMessages = DB::table('workspaces')
            ->select('workspaces.id', 'workspaces.name', 'workspaces.slug', DB::raw('COUNT(whatsapp_messages.id) as message_count'))
            ->leftJoin('whatsapp_messages', function ($join) {
                $join->on('whatsapp_messages.workspace_id', '=', 'workspaces.id')
                    ->whereBetween('whatsapp_messages.created_at', [now()->subDays(30), now()]);
            })
            ->groupBy('workspaces.id', 'workspaces.name', 'workspaces.slug')
            ->orderBy('message_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($workspace) {
                return [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'message_count' => (int) $workspace->message_count,
                ];
            })
            ->filter(function ($workspace) {
                return $workspace['message_count'] > 0;
            })
            ->values();

        $recentWorkspaces = Workspace::with('owner')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($workspace) {
                return [
                    'id' => $workspace->id,
                    'name' => $workspace->name,
                    'slug' => $workspace->slug,
                    'status' => $workspace->status,
                    'owner' => [
                        'name' => $workspace->owner->name,
                        'email' => $workspace->owner->email,
                    ],
                    'created_at' => $workspace->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Platform/Dashboard', [
            'stats' => [
                'total_workspaces' => $totalWorkspaces,
                'active_workspaces' => $activeWorkspaces,
                'suspended_workspaces' => $suspendedWorkspaces,
                'disabled_workspaces' => $disabledWorkspaces,
                'total_users' => $totalUsers,
                'super_admins' => $superAdmins,
                'total_messages' => $totalMessages,
                'messages_today' => $messagesToday,
                'messages_this_week' => $messagesThisWeek,
                'messages_this_month' => $messagesThisMonth,
                'inbound_messages' => $inboundMessages,
                'outbound_messages' => $outboundMessages,
                'message_statuses' => $messageStatuses,
                'total_connections' => $totalConnections,
                'active_connections' => $activeConnections,
                'connections_with_errors' => $connectionsWithErrors,
                'total_templates' => $totalTemplates,
                'approved_templates' => $approvedTemplates,
                'pending_templates' => $pendingTemplates,
                'rejected_templates' => $rejectedTemplates,
                'total_subscriptions' => $totalSubscriptions,
                'active_subscriptions' => $activeSubscriptions,
                'trialing_subscriptions' => $trialingSubscriptions,
                'past_due_subscriptions' => $pastDueSubscriptions,
            ],
            'recent_workspaces' => $recentWorkspaces,
            'message_trends' => $messageTrends,
            'top_workspaces' => $topWorkspacesByMessages,
        ]);
    }
}
