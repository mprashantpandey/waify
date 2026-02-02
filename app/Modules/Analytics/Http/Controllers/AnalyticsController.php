<?php

namespace App\Modules\Analytics\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Billing\UsageService;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        protected UsageService $usageService
    ) {}

    /**
     * Display analytics dashboard for workspace.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        
        $dateRange = $request->get('range', '30'); // days
        $startDate = now()->subDays((int) $dateRange);
        $endDate = now();

        // Message Trends
        $messageTrends = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN direction = "inbound" THEN 1 ELSE 0 END) as inbound'),
                DB::raw('SUM(CASE WHEN direction = "outbound" THEN 1 ELSE 0 END) as outbound')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Message Status Distribution
        $messageStatusDistribution = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Template Performance
        $templatePerformance = WhatsAppTemplateSend::where('whatsapp_template_sends.workspace_id', $workspace->id)
            ->join('whatsapp_templates', 'whatsapp_template_sends.whatsapp_template_id', '=', 'whatsapp_templates.id')
            ->leftJoin('whatsapp_messages', 'whatsapp_template_sends.whatsapp_message_id', '=', 'whatsapp_messages.id')
            ->select(
                'whatsapp_templates.id as template_id',
                'whatsapp_templates.name as template_name',
                DB::raw('COUNT(whatsapp_template_sends.id) as total_sends'),
                DB::raw('SUM(CASE WHEN whatsapp_messages.status = "delivered" OR whatsapp_messages.delivered_at IS NOT NULL THEN 1 ELSE 0 END) as delivered'),
                DB::raw('SUM(CASE WHEN whatsapp_messages.status = "read" OR whatsapp_messages.read_at IS NOT NULL THEN 1 ELSE 0 END) as read'),
                DB::raw('SUM(CASE WHEN whatsapp_template_sends.status = "failed" OR whatsapp_messages.status = "failed" THEN 1 ELSE 0 END) as failed')
            )
            ->whereBetween('whatsapp_template_sends.created_at', [$startDate, $endDate])
            ->groupBy('whatsapp_templates.id', 'whatsapp_templates.name')
            ->orderBy('total_sends', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($send) {
                return [
                    'template_id' => $send->template_id,
                    'template_name' => $send->template_name ?? 'Unknown',
                    'total_sends' => (int) $send->total_sends,
                    'delivered' => (int) $send->delivered,
                    'read' => (int) $send->read,
                    'failed' => (int) $send->failed,
                    'delivery_rate' => $send->total_sends > 0 ? round(($send->delivered / $send->total_sends) * 100, 2) : 0,
                    'read_rate' => $send->total_sends > 0 ? round(($send->read / $send->total_sends) * 100, 2) : 0,
                ];
            });

        // Conversation Stats
        $conversationStats = [
            'total' => WhatsAppConversation::where('workspace_id', $workspace->id)->count(),
            'open' => WhatsAppConversation::where('workspace_id', $workspace->id)->where('status', 'open')->count(),
            'closed' => WhatsAppConversation::where('workspace_id', $workspace->id)->where('status', 'closed')->count(),
        ];

        // Peak Hours Analysis (database-agnostic)
        $dbDriver = DB::connection()->getDriverName();
        if ($dbDriver === 'sqlite') {
            $peakHours = WhatsAppMessage::where('workspace_id', $workspace->id)
                ->select(
                    DB::raw("CAST(strftime('%H', created_at) AS INTEGER) as hour"),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy(DB::raw("CAST(strftime('%H', created_at) AS INTEGER)"))
                ->orderBy('hour')
                ->get();
        } else {
            $peakHours = WhatsAppMessage::where('workspace_id', $workspace->id)
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy(DB::raw('HOUR(created_at)'))
                ->orderBy('hour')
                ->get();
        }

        // Usage Stats
        $usage = $this->usageService->getCurrentUsage($workspace);
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $limits = $planResolver->getEffectiveLimits($workspace);

        // Daily Activity
        $dailyActivity = WhatsAppMessage::where('workspace_id', $workspace->id)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('Analytics/Index', [
            'workspace' => $workspace,
            'date_range' => $dateRange,
            'message_trends' => $messageTrends,
            'message_status_distribution' => $messageStatusDistribution,
            'template_performance' => $templatePerformance,
            'conversation_stats' => $conversationStats,
            'peak_hours' => $peakHours,
            'daily_activity' => $dailyActivity,
            'usage' => [
                'messages_sent' => $usage->messages_sent,
                'template_sends' => $usage->template_sends,
                'messages_limit' => $limits['messages_monthly'] ?? 0,
                'template_sends_limit' => $limits['template_sends_monthly'] ?? 0,
            ],
        ]);
    }
}

