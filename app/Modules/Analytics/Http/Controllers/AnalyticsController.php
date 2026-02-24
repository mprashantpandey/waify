<?php

namespace App\Modules\Analytics\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use App\Modules\WhatsApp\Models\WhatsAppConversationAuditEvent;
use Illuminate\Support\Facades\Schema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Carbon\CarbonPeriod;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display analytics dashboard for account.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!$account) {
            abort(404);
        }
        $accountId = (int) $account->id;
        
        $dateRange = (int) $request->get('range', 30); // days
        if ($dateRange <= 0) {
            $dateRange = 30;
        }
        if ($dateRange > 365) {
            $dateRange = 365;
        }
        // "Last N days" should include today and full day boundaries.
        $startDate = now()->subDays($dateRange - 1)->startOfDay();
        $endDate = now()->endOfDay();

        $messagesQuery = WhatsAppMessage::query()
            ->where('account_id', $accountId);

        // Message Trends
        $messageTrends = (clone $messagesQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN direction = "inbound" THEN 1 ELSE 0 END) as inbound'),
                DB::raw('SUM(CASE WHEN direction = "outbound" THEN 1 ELSE 0 END) as outbound')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($row) {
                return [
                    'date' => $row->date,
                    'total' => (int) ($row->total ?? 0),
                    'inbound' => (int) ($row->inbound ?? 0),
                    'outbound' => (int) ($row->outbound ?? 0),
                ];
            })
            ->values();

        // Message Status Distribution
        $messageStatusDistribution = (clone $messagesQuery)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->pluck('count', 'status')
            ->map(fn($count) => (int) $count)
            ->toArray();

        // Template Performance
        $templatePerformance = WhatsAppTemplateSend::where('whatsapp_template_sends.account_id', $accountId)
            ->join('whatsapp_templates', 'whatsapp_template_sends.whatsapp_template_id', '=', 'whatsapp_templates.id')
            ->leftJoin('whatsapp_messages', 'whatsapp_template_sends.whatsapp_message_id', '=', 'whatsapp_messages.id')
            ->select(
                'whatsapp_templates.id as template_id',
                'whatsapp_templates.name as template_name',
                DB::raw('COUNT(whatsapp_template_sends.id) as total_sends'),
                DB::raw('SUM(CASE WHEN whatsapp_messages.status = "delivered" OR whatsapp_messages.delivered_at IS NOT NULL THEN 1 ELSE 0 END) as delivered_count'),
                DB::raw('SUM(CASE WHEN whatsapp_messages.status = "read" OR whatsapp_messages.read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count'),
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
                    'delivered' => (int) $send->delivered_count,
                    'read' => (int) $send->read_count,
                    'failed' => (int) $send->failed,
                    'delivery_rate' => $send->total_sends > 0 ? round(($send->delivered_count / $send->total_sends) * 100, 2) : 0,
                    'read_rate' => $send->total_sends > 0 ? round(($send->read_count / $send->total_sends) * 100, 2) : 0];
            });

        // Conversation Stats
        $conversationStats = [
            'total' => WhatsAppConversation::where('account_id', $accountId)->count(),
            'open' => WhatsAppConversation::where('account_id', $accountId)->where('status', 'open')->count(),
            'closed' => WhatsAppConversation::where('account_id', $accountId)->where('status', 'closed')->count()];

        // Peak Hours Analysis (database-agnostic)
        $dbDriver = DB::connection()->getDriverName();
        if ($dbDriver === 'sqlite') {
            $peakHours = (clone $messagesQuery)
                ->select(
                    DB::raw("CAST(strftime('%H', created_at) AS INTEGER) as hour"),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy(DB::raw("CAST(strftime('%H', created_at) AS INTEGER)"))
                ->orderBy('hour')
                ->get()
                ->map(fn($row) => [
                    'hour' => (int) ($row->hour ?? 0),
                    'count' => (int) ($row->count ?? 0),
                ])
                ->values();
        } else {
            $peakHours = (clone $messagesQuery)
                ->select(
                    DB::raw('HOUR(created_at) as hour'),
                    DB::raw('COUNT(*) as count')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy(DB::raw('HOUR(created_at)'))
                ->orderBy('hour')
                ->get()
                ->map(fn($row) => [
                    'hour' => (int) ($row->hour ?? 0),
                    'count' => (int) ($row->count ?? 0),
                ])
                ->values();
        }

        // Usage Stats
        $messagesSentThisPeriod = (clone $messagesQuery)
            ->where('direction', 'outbound')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();
        $templateSendsThisPeriod = WhatsAppTemplateSend::where('account_id', $accountId)
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();
        $planResolver = app(\App\Core\Billing\PlanResolver::class);
        $limits = $planResolver->getEffectiveLimits($account);
        $usageService = app(\App\Core\Billing\UsageService::class);
        $currentUsage = $usageService->getCurrentUsage($account);
        $aiCreditsThisMonth = (int) ($currentUsage->ai_credits_used ?? 0);
        $aiCreditsLimit = (int) ($limits['ai_credits_monthly'] ?? 0);

        // Daily Activity
        $dailyActivity = (clone $messagesQuery)
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($row) => [
                'date' => $row->date,
                'count' => (int) ($row->count ?? 0),
            ])
            ->values();

        // Agent response time (first inbound -> first outbound after inbound)
        $firstInboundSub = DB::table('whatsapp_messages')
            ->select('whatsapp_conversation_id', DB::raw('MIN(created_at) as first_inbound_at'))
            ->where('account_id', $accountId)
            ->where('direction', 'inbound')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('whatsapp_conversation_id');

        $firstResponseRows = DB::table('whatsapp_messages as m')
            ->joinSub($firstInboundSub, 'inbound', function ($join) {
                $join->on('m.whatsapp_conversation_id', '=', 'inbound.whatsapp_conversation_id');
            })
            ->where('m.account_id', $accountId)
            ->where('m.direction', 'outbound')
            ->whereColumn('m.created_at', '>=', 'inbound.first_inbound_at')
            ->select(
                'm.whatsapp_conversation_id',
                'inbound.first_inbound_at',
                DB::raw('MIN(m.created_at) as first_outbound_at')
            )
            ->groupBy('m.whatsapp_conversation_id', 'inbound.first_inbound_at')
            ->get();

        $conversationIdsForResponse = $firstResponseRows->pluck('whatsapp_conversation_id')->all();
        $conversationMap = WhatsAppConversation::where('account_id', $accountId)
            ->whereIn('id', $conversationIdsForResponse)
            ->get(['id', 'assigned_to', 'created_at', 'status', 'updated_at'])
            ->keyBy('id');

        $agentMap = collect();
        if ($account->owner) {
            $agentMap->put($account->owner->id, $account->owner->name ?? 'Owner');
        }
        $accountUsers = $account->users()
            ->get(['users.id', 'users.name', 'account_users.role']);
        foreach ($accountUsers as $user) {
            $agentMap->put($user->id, $user->name ?? 'Agent');
        }

        $responseTotals = [];
        $responseCounts = [];
        $overallResponseTotal = 0;
        $overallResponseCount = 0;

        foreach ($firstResponseRows as $row) {
            if (!$row->first_inbound_at || !$row->first_outbound_at) {
                continue;
            }
            $inboundAt = Carbon::parse($row->first_inbound_at);
            $outboundAt = Carbon::parse($row->first_outbound_at);
            if ($outboundAt->lessThan($inboundAt)) {
                continue;
            }
            $minutes = $inboundAt->diffInSeconds($outboundAt) / 60;
            $conv = $conversationMap->get($row->whatsapp_conversation_id);
            $assigneeId = $conv?->assigned_to;
            $bucket = $assigneeId ?: 0;
            $responseTotals[$bucket] = ($responseTotals[$bucket] ?? 0) + $minutes;
            $responseCounts[$bucket] = ($responseCounts[$bucket] ?? 0) + 1;
            $overallResponseTotal += $minutes;
            $overallResponseCount++;
        }

        $overallFirstResponse = $overallResponseCount > 0
            ? round($overallResponseTotal / $overallResponseCount, 2)
            : null;

        // Resolution time (created_at -> closed)
        $resolutionTotals = [];
        $resolutionCounts = [];
        $overallResolutionTotal = 0;
        $overallResolutionCount = 0;

        $closedEvents = collect();
        if (Schema::hasTable('whatsapp_conversation_audit_events')) {
            $closedEvents = WhatsAppConversationAuditEvent::where('account_id', $accountId)
                ->where('event_type', 'status_changed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->get(['whatsapp_conversation_id', 'created_at', 'meta']);
        }

        $closedMap = collect();
        foreach ($closedEvents as $event) {
            $status = $event->meta['status'] ?? null;
            if ($status !== 'closed') {
                continue;
            }
            $closedMap->push([
                'conversation_id' => $event->whatsapp_conversation_id,
                'closed_at' => $event->created_at,
            ]);
        }

        if ($closedMap->isEmpty()) {
            $closedConversations = WhatsAppConversation::where('account_id', $accountId)
                ->where('status', 'closed')
                ->whereBetween('updated_at', [$startDate, $endDate])
                ->get(['id', 'updated_at', 'created_at', 'assigned_to']);

            foreach ($closedConversations as $conv) {
                $closedMap->push([
                    'conversation_id' => $conv->id,
                    'closed_at' => $conv->updated_at,
                ]);
                $conversationMap->put($conv->id, $conv);
            }
        }

        foreach ($closedMap as $closed) {
            $conv = $conversationMap->get($closed['conversation_id']);
            if (!$conv) {
                $conv = WhatsAppConversation::where('account_id', $accountId)
                    ->find($closed['conversation_id']);
            }
            if (!$conv) {
                continue;
            }
            $createdAt = Carbon::parse($conv->created_at);
            $closedAt = Carbon::parse($closed['closed_at']);
            if ($closedAt->lessThan($createdAt)) {
                continue;
            }
            $minutes = $createdAt->diffInSeconds($closedAt) / 60;
            $assigneeId = $conv->assigned_to;
            $bucket = $assigneeId ?: 0;
            $resolutionTotals[$bucket] = ($resolutionTotals[$bucket] ?? 0) + $minutes;
            $resolutionCounts[$bucket] = ($resolutionCounts[$bucket] ?? 0) + 1;
            $overallResolutionTotal += $minutes;
            $overallResolutionCount++;
        }

        $overallResolution = $overallResolutionCount > 0
            ? round($overallResolutionTotal / $overallResolutionCount, 2)
            : null;

        $agentPerformance = [];
        $agentIds = collect(array_keys($responseCounts + $resolutionCounts))->unique()->values();
        foreach ($agentIds as $agentId) {
            $agentPerformance[] = [
                'agent_id' => $agentId,
                'name' => $agentId === 0 ? 'Unassigned' : ($agentMap->get($agentId) ?? 'Agent'),
                'response_time_avg_minutes' => isset($responseCounts[$agentId])
                    ? round($responseTotals[$agentId] / max($responseCounts[$agentId], 1), 2)
                    : null,
                'response_count' => $responseCounts[$agentId] ?? 0,
                'resolution_time_avg_minutes' => isset($resolutionCounts[$agentId])
                    ? round($resolutionTotals[$agentId] / max($resolutionCounts[$agentId], 1), 2)
                    : null,
                'resolution_count' => $resolutionCounts[$agentId] ?? 0,
            ];
        }

        // Backlog trend (open conversations over time)
        $createdCounts = WhatsAppConversation::where('account_id', $accountId)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->pluck('count', 'date')
            ->toArray();

        $closedCounts = [];
        if ($closedMap->isNotEmpty()) {
            foreach ($closedMap as $closed) {
                $dateKey = Carbon::parse($closed['closed_at'])->format('Y-m-d');
                $closedCounts[$dateKey] = ($closedCounts[$dateKey] ?? 0) + 1;
            }
        } else {
            $fallbackClosed = WhatsAppConversation::where('account_id', $accountId)
                ->where('status', 'closed')
                ->whereBetween('updated_at', [$startDate, $endDate])
                ->select(DB::raw('DATE(updated_at) as date'), DB::raw('COUNT(*) as count'))
                ->groupBy('date')
                ->pluck('count', 'date')
                ->toArray();
            $closedCounts = $fallbackClosed;
        }

        $createdBefore = WhatsAppConversation::where('account_id', $accountId)
            ->where('created_at', '<', $startDate)
            ->count();

        $closedBefore = 0;
        if (Schema::hasTable('whatsapp_conversation_audit_events')) {
            $dbDriver = DB::connection()->getDriverName();
            if ($dbDriver === 'sqlite') {
                $closedBefore = WhatsAppConversationAuditEvent::where('account_id', $accountId)
                    ->where('event_type', 'status_changed')
                    ->where('created_at', '<', $startDate)
                    ->get(['meta'])
                    ->filter(function ($event) {
                        return ($event->meta['status'] ?? null) === 'closed';
                    })
                    ->count();
            } else {
                $closedBefore = WhatsAppConversationAuditEvent::where('account_id', $accountId)
                    ->where('event_type', 'status_changed')
                    ->where('created_at', '<', $startDate)
                    ->whereRaw("JSON_EXTRACT(meta, '$.status') = 'closed'")
                    ->count();
            }
        } else {
            $closedBefore = WhatsAppConversation::where('account_id', $accountId)
                ->where('status', 'closed')
                ->where('updated_at', '<', $startDate)
                ->count();
        }

        $openCount = max($createdBefore - $closedBefore, 0);
        $backlogTrend = [];
        $period = CarbonPeriod::create($startDate->copy()->startOfDay(), $endDate->copy()->startOfDay());

        foreach ($period as $day) {
            $dateKey = $day->format('Y-m-d');
            $openCount += $createdCounts[$dateKey] ?? 0;
            $openCount -= $closedCounts[$dateKey] ?? 0;
            if ($openCount < 0) {
                $openCount = 0;
            }
            $backlogTrend[] = [
                'date' => $dateKey,
                'open_count' => $openCount,
            ];
        }

        return Inertia::render('Analytics/Index', [
            'account' => $account,
            'date_range' => $dateRange,
            'message_trends' => $messageTrends,
            'message_status_distribution' => $messageStatusDistribution,
            'template_performance' => $templatePerformance,
            'conversation_stats' => $conversationStats,
            'peak_hours' => $peakHours,
            'daily_activity' => $dailyActivity,
            'agent_performance' => $agentPerformance,
            'first_response_avg_minutes' => $overallFirstResponse,
            'resolution_avg_minutes' => $overallResolution,
            'backlog_trend' => $backlogTrend,
            'usage' => [
                'messages_sent' => $messagesSentThisPeriod,
                'template_sends' => $templateSendsThisPeriod,
                'ai_credits_used' => $aiCreditsThisMonth,
                'ai_credits_limit' => $aiCreditsLimit,
                'messages_limit' => $limits['messages_monthly'] ?? 0,
                'template_sends_limit' => $limits['template_sends_monthly'] ?? 0]]);
    }
}
