<?php

namespace App\Http\Controllers;

use App\Core\Modules\ModuleRegistry;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Models\AccountUser;
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
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        $navigation = $this->moduleRegistry->getNavigationForAccount($account);

        // Message Statistics
        $totalMessages = WhatsAppMessage::where('account_id', $account->id)->count();
        $messagesToday = WhatsAppMessage::where('account_id', $account->id)
            ->whereDate('created_at', today())
            ->count();
        $messagesThisWeek = WhatsAppMessage::where('account_id', $account->id)
            ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
            ->count();
        $messagesThisMonth = WhatsAppMessage::where('account_id', $account->id)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        
        $inboundMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'inbound')
            ->count();
        $outboundMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->count();

        // Connection Statistics
        $totalConnections = WhatsAppConnection::where('account_id', $account->id)->count();
        $activeConnections = WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->count();

        // Template Statistics
        $totalTemplates = WhatsAppTemplate::where('account_id', $account->id)->count();
        $approvedTemplates = WhatsAppTemplate::where('account_id', $account->id)
            ->where('status', 'APPROVED')
            ->count();

        // Conversation Statistics
        $totalConversations = WhatsAppConversation::where('account_id', $account->id)->count();
        $openConversations = WhatsAppConversation::where('account_id', $account->id)
            ->where('status', 'open')
            ->count();
        $assignedConversations = WhatsAppConversation::where('account_id', $account->id)
            ->whereNotNull('assigned_to')
            ->count();

        // Team Statistics
        // Count AccountUser records (excluding owner) + 1 for owner
        $accountUsersCount = AccountUser::where('account_id', $account->id)
            ->when($account->owner_id, function ($query) use ($account) {
                $query->where('user_id', '!=', $account->owner_id);
            })
            ->count();
        $totalMembers = $accountUsersCount + 1; // +1 for owner
        
        $admins = AccountUser::where('account_id', $account->id)
            ->when($account->owner_id, function ($query) use ($account) {
                $query->where('user_id', '!=', $account->owner_id);
            })
            ->where('role', 'admin')
            ->count();

        // Usage Statistics (from billing)
        $usageService = app(UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($account);
        
        // Recent Activity (last 7 days message trends)
        $messageTrends = WhatsAppMessage::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('account_id', $account->id)
            ->whereBetween('created_at', [now()->subDays(7), now()])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count];
            });

        // Recent Conversations
        $recentConversations = WhatsAppConversation::where('account_id', $account->id)
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
                    'last_activity_at' => $conversation->last_message_at?->toIso8601String()];
            });

        return Inertia::render('App/Dashboard', [
            'account' => $account,
            'stats' => [
                'messages' => [
                    'total' => $totalMessages,
                    'today' => $messagesToday,
                    'this_week' => $messagesThisWeek,
                    'this_month' => $messagesThisMonth,
                    'inbound' => $inboundMessages,
                    'outbound' => $outboundMessages],
                'connections' => [
                    'total' => $totalConnections,
                    'active' => $activeConnections],
                'templates' => [
                    'total' => $totalTemplates,
                    'approved' => $approvedTemplates],
                'conversations' => [
                    'total' => $totalConversations,
                    'open' => $openConversations,
                    'assigned' => $assignedConversations],
                'team' => [
                    'total_members' => $totalMembers,
                    'admins' => $admins],
                'usage' => $currentUsage],
            'message_trends' => $messageTrends,
            'recent_conversations' => $recentConversations]);
    }
}
