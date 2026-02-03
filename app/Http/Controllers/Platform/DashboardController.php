<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Account;
use App\Models\Subscription;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Services\PlatformSettingsValidationService;
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
        $totalAccounts = Account::count();
        $activeAccounts = Account::where('status', 'active')->count();
        $suspendedAccounts = Account::where('status', 'suspended')->count();
        $disabledAccounts = Account::where('status', 'disabled')->count();
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
                    'count' => $item->count];
            });

        // Top accounts by message volume
        $topAccountsByMessages = DB::table('accounts')
            ->select('accounts.id', 'accounts.name', 'accounts.slug', DB::raw('COUNT(whatsapp_messages.id) as message_count'))
            ->leftJoin('whatsapp_messages', function ($join) {
                $join->on('whatsapp_messages.account_id', '=', 'accounts.id')
                    ->whereBetween('whatsapp_messages.created_at', [now()->subDays(30), now()]);
            })
            ->groupBy('accounts.id', 'accounts.name', 'accounts.slug')
            ->orderBy('message_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'slug' => $account->slug,
                    'message_count' => (int) $account->message_count];
            })
            ->filter(function ($account) {
                return $account['message_count'] > 0;
            })
            ->values();

        $recentAccounts = Account::with('owner')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'slug' => $account->slug,
                    'status' => $account->status,
                    'owner' => [
                        'name' => $account->owner->name,
                        'email' => $account->owner->email],
                    'created_at' => $account->created_at->toIso8601String()];
            });

        // Check for misconfigured settings
        $validationService = app(PlatformSettingsValidationService::class);
        $misconfiguredSettings = $validationService->getMisconfiguredSettings();

        return Inertia::render('Platform/Dashboard', [
            'stats' => [
                'total_accounts' => $totalAccounts,
                'active_accounts' => $activeAccounts,
                'suspended_accounts' => $suspendedAccounts,
                'disabled_accounts' => $disabledAccounts,
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
                'past_due_subscriptions' => $pastDueSubscriptions],
            'recent_accounts' => $recentAccounts,
            'message_trends' => $messageTrends,
            'top_accounts' => $topAccountsByMessages,
            'misconfigured_settings' => array_values($misconfiguredSettings)]);
    }
}
