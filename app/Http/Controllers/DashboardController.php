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
        $onboardingChecklist = $this->buildOnboardingChecklist($account, $user);
        
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
            'onboarding_checklist' => $onboardingChecklist,
            'message_trends' => $messageTrends,
            'recent_conversations' => $recentConversations]);
    }

    protected function buildOnboardingChecklist($account, $user): array
    {
        $isPhoneVerifiedRequired = (bool) ($account->phone_verification_required ?? false);
        $isProfileComplete = !empty($user?->name) && !empty($user?->email) && !empty($user?->phone)
            && (!$isPhoneVerifiedRequired || !empty($user?->phone_verified_at));

        $hasConnection = WhatsAppConnection::where('account_id', $account->id)->exists();
        $hasTeamMember = AccountUser::where('account_id', $account->id)
            ->when($account->owner_id, fn ($q) => $q->where('user_id', '!=', $account->owner_id))
            ->exists();
        $hasTemplate = WhatsAppTemplate::where('account_id', $account->id)->exists();
        $hasConversation = WhatsAppConversation::where('account_id', $account->id)->exists();

        $items = [
            [
                'key' => 'profile',
                'label' => 'Complete your profile',
                'description' => 'Add required contact details so your workspace is fully operational.',
                'done' => $isProfileComplete,
                'href' => route('profile.edit'),
                'cta' => 'Complete profile',
                'priority' => 1,
            ],
            [
                'key' => 'connection',
                'label' => 'Connect WhatsApp',
                'description' => 'Add your WhatsApp Cloud connection using Meta Embedded Signup.',
                'done' => $hasConnection,
                'href' => route('app.whatsapp.connections.create'),
                'cta' => 'Add connection',
                'priority' => 2,
            ],
            [
                'key' => 'team',
                'label' => 'Invite a teammate',
                'description' => 'Bring in an agent/admin to collaborate on inbox and operations.',
                'done' => $hasTeamMember,
                'href' => route('app.team.index'),
                'cta' => 'Invite teammate',
                'priority' => 3,
            ],
            [
                'key' => 'template',
                'label' => 'Create your first template',
                'description' => 'Set up an approved template for campaigns and outbound messaging.',
                'done' => $hasTemplate,
                'href' => route('app.whatsapp.templates.create'),
                'cta' => 'Create template',
                'priority' => 4,
            ],
            [
                'key' => 'test_message',
                'label' => 'Send a test message',
                'description' => 'Verify your end-to-end setup by sending/receiving a real message.',
                'done' => $hasConversation,
                'href' => route('app.whatsapp.conversations.index'),
                'cta' => 'Open inbox',
                'priority' => 5,
            ],
        ];

        $completed = collect($items)->where('done', true)->count();

        return [
            'show' => $completed < count($items),
            'completed' => $completed,
            'total' => count($items),
            'progress_percent' => (int) floor(($completed / max(1, count($items))) * 100),
            'next_item' => collect($items)->sortBy('priority')->firstWhere('done', false),
            'items' => $items,
        ];
    }
}
