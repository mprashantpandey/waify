<?php

namespace App\Http\Controllers;

use App\Core\Billing\UsageService;
use App\Core\Modules\ModuleRegistry;
use App\Models\AccountUser;
use App\Models\AccountIntegration;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Contacts\Models\ContactImportBatch;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected ModuleRegistry $moduleRegistry
    ) {}

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
        $outboundMessagesThisMonth = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $deliveredMessagesThisMonth = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->whereIn('status', ['delivered', 'read'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $readMessagesThisMonth = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->where('status', 'read')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();
        $failedMessagesThisMonth = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->where('status', 'failed')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $inboundMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'inbound')
            ->count();
        $outboundMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->count();
        $deliveredMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->whereIn('status', ['delivered', 'read'])
            ->count();
        $readMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->where('status', 'read')
            ->count();
        $failedMessages = WhatsAppMessage::where('account_id', $account->id)
            ->where('direction', 'outbound')
            ->where('status', 'failed')
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
            ->whereHas('user', fn ($query) => $query->where('is_platform_admin', false))
            ->when($account->owner_id, function ($query) use ($account) {
                $query->where('user_id', '!=', $account->owner_id);
            })
            ->count();
        $totalMembers = $accountUsersCount + ($account->owner && ! $account->owner->isSuperAdmin() ? 1 : 0);

        $admins = AccountUser::where('account_id', $account->id)
            ->whereHas('user', fn ($query) => $query->where('is_platform_admin', false))
            ->when($account->owner_id, function ($query) use ($account) {
                $query->where('user_id', '!=', $account->owner_id);
            })
            ->where('role', 'admin')
            ->count();

        // Usage Statistics (from billing)
        $usageService = app(UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($account);

        // Message trends use real message/status rows. Empty days remain zero.
        $trendStart = now()->subDays(29)->startOfDay();
        $trendRows = WhatsAppMessage::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count'),
            DB::raw("SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END) as outbound"),
            DB::raw("SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END) as inbound"),
            DB::raw("SUM(CASE WHEN direction = 'outbound' AND status IN ('delivered', 'read') THEN 1 ELSE 0 END) as delivered"),
            DB::raw("SUM(CASE WHEN direction = 'outbound' AND status = 'read' THEN 1 ELSE 0 END) as read_count"),
            DB::raw("SUM(CASE WHEN direction = 'outbound' AND status = 'failed' THEN 1 ELSE 0 END) as failed")
        )
            ->where('account_id', $account->id)
            ->whereBetween('created_at', [$trendStart, now()])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $messageTrends = collect(range(0, 29))
            ->map(function ($item) use ($trendRows) {
                $date = now()->subDays(29 - $item)->toDateString();
                $row = $trendRows->get($date);

                return [
                    'date' => $date,
                    'count' => (int) ($row->count ?? 0),
                    'outbound' => (int) ($row->outbound ?? 0),
                    'inbound' => (int) ($row->inbound ?? 0),
                    'delivered' => (int) ($row->delivered ?? 0),
                    'read' => (int) ($row->read_count ?? 0),
                    'failed' => (int) ($row->failed ?? 0),
                ];
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

        $rejectedTemplates = WhatsAppTemplate::where('account_id', $account->id)
            ->whereRaw('LOWER(TRIM(status)) in (?, ?)', ['rejected', 'disabled'])
            ->count();
        $activeCampaignIssues = Campaign::where('account_id', $account->id)
            ->whereIn('status', ['sending', 'paused', 'completed'])
            ->where('failed_count', '>', 0)
            ->count();
        $unhealthyIntegrations = AccountIntegration::where('account_id', $account->id)
            ->where('status', 'connected')
            ->where(function ($query) {
                $query->whereNotIn('health', ['healthy', 'configured', 'ok'])
                    ->orWhereNotNull('last_error');
            })
            ->count();
        $runningImports = ContactImportBatch::where('account_id', $account->id)
            ->whereIn('status', ['queued', 'processing'])
            ->count();

        $actionItems = collect([
            [
                'key' => 'open_inbox',
                'severity' => $openConversations > 0 ? 'warning' : 'success',
                'title' => $openConversations > 0 ? "{$openConversations} open conversations" : 'Inbox is clear',
                'body' => $openConversations > 0 ? 'Review unhandled customer chats and assign ownership.' : 'No open conversation needs attention right now.',
                'count' => $openConversations,
                'href' => route('app.whatsapp.conversations.index'),
                'cta' => 'Open inbox',
            ],
            [
                'key' => 'campaign_failures',
                'severity' => $activeCampaignIssues > 0 ? 'danger' : 'success',
                'title' => $activeCampaignIssues > 0 ? "{$activeCampaignIssues} campaigns need retry" : 'Campaign delivery healthy',
                'body' => $activeCampaignIssues > 0 ? 'Retry failed recipients or inspect provider errors.' : 'No campaign has failed recipients requiring action.',
                'count' => $activeCampaignIssues,
                'href' => route('app.broadcasts.index', ['status' => 'completed']),
                'cta' => 'Review campaigns',
            ],
            [
                'key' => 'template_rejections',
                'severity' => $rejectedTemplates > 0 ? 'warning' : 'success',
                'title' => $rejectedTemplates > 0 ? "{$rejectedTemplates} templates need review" : 'Templates ready',
                'body' => $rejectedTemplates > 0 ? 'Fix rejected or disabled templates before campaign sends.' : "{$approvedTemplates} approved templates are available.",
                'count' => $rejectedTemplates,
                'href' => route('app.whatsapp.templates.index'),
                'cta' => 'Open templates',
            ],
            [
                'key' => 'integration_health',
                'severity' => $unhealthyIntegrations > 0 ? 'danger' : 'success',
                'title' => $unhealthyIntegrations > 0 ? "{$unhealthyIntegrations} integrations unhealthy" : 'Integrations healthy',
                'body' => $unhealthyIntegrations > 0 ? 'Check credentials, sync logs, and provider permissions.' : 'Connected integrations are reporting healthy status.',
                'count' => $unhealthyIntegrations,
                'href' => route('app.integrations.index'),
                'cta' => 'Open integrations',
            ],
            [
                'key' => 'contact_imports',
                'severity' => $runningImports > 0 ? 'info' : 'success',
                'title' => $runningImports > 0 ? "{$runningImports} contact imports running" : 'No imports running',
                'body' => $runningImports > 0 ? 'Track CSV progress and skipped row errors.' : 'Contact import queue is idle.',
                'count' => $runningImports,
                'href' => route('app.contacts.index'),
                'cta' => 'Open contacts',
            ],
        ])->values();

        return Inertia::render('App/Dashboard', [
            'account' => $account,
            'stats' => [
                'messages' => [
                    'total' => $totalMessages,
                    'today' => $messagesToday,
                    'this_week' => $messagesThisWeek,
                    'this_month' => $messagesThisMonth,
                    'outbound_this_month' => $outboundMessagesThisMonth,
                    'delivered_this_month' => $deliveredMessagesThisMonth,
                    'read_this_month' => $readMessagesThisMonth,
                    'failed_this_month' => $failedMessagesThisMonth,
                    'inbound' => $inboundMessages,
                    'outbound' => $outboundMessages,
                    'delivered' => $deliveredMessages,
                    'read' => $readMessages,
                    'failed' => $failedMessages],
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
            'recent_conversations' => $recentConversations,
            'action_items' => $actionItems]);
    }
}
