<?php

namespace App\Http\Controllers;

use App\Core\Modules\ModuleRegistry;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Models\WorkspaceUser;
use App\Core\Billing\UsageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ModuleRegistry $moduleRegistry
    ) {
    }

    /**
     * Display the dashboard.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $user = $request->user();

        $navigation = $this->moduleRegistry->getNavigationForWorkspace($workspace);

        // Message Statistics
        $totalMessages = WhatsAppMessage::where('workspace_id', $workspace->id)->count();
        $messagesToday = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->whereDate('created_at', today())
            ->count();
        $messagesThisWeek = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();
        $messagesThisMonth = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $inboundMessages = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->where('direction', 'inbound')
            ->count();
        $outboundMessages = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->where('direction', 'outbound')
            ->count();

        // Connection Statistics
        $totalConnections = WhatsAppConnection::where('workspace_id', $workspace->id)->count();
        $activeConnections = WhatsAppConnection::where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->count();

        // Template Statistics
        $totalTemplates = WhatsAppTemplate::where('workspace_id', $workspace->id)->count();
        $approvedTemplates = WhatsAppTemplate::where('workspace_id', $workspace->id)
            ->where('status', 'APPROVED')
            ->count();

        // Conversation Statistics
        $totalConversations = WhatsAppConversation::where('workspace_id', $workspace->id)->count();
        $openConversations = WhatsAppConversation::where('workspace_id', $workspace->id)
            ->where('status', 'open')
            ->count();
        $assignedConversations = WhatsAppConversation::where('workspace_id', $workspace->id)
            ->whereNotNull('assigned_to')
            ->count();

        // Team Statistics
        $totalMembers = WorkspaceUser::where('workspace_id', $workspace->id)->count() + 1; // +1 for owner
        $admins = WorkspaceUser::where('workspace_id', $workspace->id)
            ->where('role', 'admin')
            ->count();

        // Usage Statistics (from billing)
        $usageService = app(UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($workspace);
        
        // Recent Activity (last 7 days message trends)
        $messageTrends = WhatsAppMessage::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('workspace_id', $workspace->id)
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

        // Recent Conversations
        $recentConversations = WhatsAppConversation::where('workspace_id', $workspace->id)
            ->with(['contact'])
            ->orderBy('last_message_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($conversation) {
                return [
                    'id' => $conversation->id,
                    'contact_name' => $conversation->contact?->name ?? $conversation->contact?->wa_id ?? 'Unknown',
                    'last_message' => $conversation->last_message_preview,
                    'status' => $conversation->status,
                    'last_activity_at' => $conversation->last_message_at?->toIso8601String(),
                ];
            });

        return Inertia::render('App/Dashboard', [
            'workspace' => $workspace,
            'stats' => [
                'messages' => [
                    'total' => $totalMessages,
                    'today' => $messagesToday,
                    'this_week' => $messagesThisWeek,
                    'this_month' => $messagesThisMonth,
                    'inbound' => $inboundMessages,
                    'outbound' => $outboundMessages,
                ],
                'connections' => [
                    'total' => $totalConnections,
                    'active' => $activeConnections,
                ],
                'templates' => [
                    'total' => $totalTemplates,
                    'approved' => $approvedTemplates,
                ],
                'conversations' => [
                    'total' => $totalConversations,
                    'open' => $openConversations,
                    'assigned' => $assignedConversations,
                ],
                'team' => [
                    'total_members' => $totalMembers,
                    'admins' => $admins,
                ],
                'usage' => $currentUsage,
            ],
            'message_trends' => $messageTrends,
            'recent_conversations' => $recentConversations,
        ]);
    }
}
