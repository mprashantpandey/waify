<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Models\Account;
use App\Models\AccountUsage;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display analytics dashboard.
     */
    public function index(Request $request): Response
    {
        $dateRange = $request->get('range', '30'); // days
        $startDate = now()->subDays((int) $dateRange);
        $endDate = now();

        // Message Trends
        $messageTrends = WhatsAppMessage::select(
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
        $messageStatusDistribution = WhatsAppMessage::select('status', DB::raw('COUNT(*) as count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Template Performance
        $templatePerformance = DB::table('whatsapp_template_sends')
            ->select(
                'whatsapp_templates.name',
                'whatsapp_templates.status',
                DB::raw('COUNT(whatsapp_template_sends.id) as send_count'),
                DB::raw('SUM(CASE WHEN whatsapp_messages.status = "delivered" OR whatsapp_messages.delivered_at IS NOT NULL THEN 1 ELSE 0 END) as delivered'),
                DB::raw('SUM(CASE WHEN whatsapp_messages.status = "read" OR whatsapp_messages.read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count')
            )
            ->join('whatsapp_templates', 'whatsapp_template_sends.whatsapp_template_id', '=', 'whatsapp_templates.id')
            ->leftJoin('whatsapp_messages', 'whatsapp_template_sends.whatsapp_message_id', '=', 'whatsapp_messages.id')
            ->whereBetween('whatsapp_template_sends.created_at', [$startDate, $endDate])
            ->groupBy('whatsapp_templates.id', 'whatsapp_templates.name', 'whatsapp_templates.status')
            ->orderBy('send_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->name,
                    'status' => $item->status,
                    'send_count' => (int) $item->send_count,
                    'delivered' => (int) $item->delivered,
                    'read_count' => (int) $item->read_count];
            });

        // Account Growth
        $accountGrowth = Account::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Subscription Distribution
        $subscriptionDistribution = Subscription::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Peak Hours Analysis
        $driver = DB::connection()->getDriverName();
        $hourExpression = $driver === 'sqlite'
            ? "CAST(strftime('%H', created_at) AS INTEGER)"
            : 'HOUR(created_at)';

        $peakHours = WhatsAppMessage::select(
            DB::raw($hourExpression . ' as hour'),
            DB::raw('COUNT(*) as count')
        )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('hour')
            ->orderBy('hour')
            ->get();

        // AI credits (platform total for current billing period)
        $currentPeriod = now()->format('Y-m');
        $aiCreditsPlatform = (int) AccountUsage::where('period', $currentPeriod)->sum('ai_credits_used');

        // Top Accounts by Activity
        $topAccounts = Account::select(
            'accounts.id',
            'accounts.name',
            'accounts.slug',
            DB::raw('COUNT(whatsapp_messages.id) as message_count')
        )
            ->leftJoin('whatsapp_messages', function ($join) use ($startDate, $endDate) {
                $join->on('whatsapp_messages.account_id', '=', 'accounts.id')
                    ->whereBetween('whatsapp_messages.created_at', [$startDate, $endDate]);
            })
            ->groupBy('accounts.id', 'accounts.name', 'accounts.slug')
            ->orderBy('message_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'slug' => $account->slug,
                    'message_count' => (int) $account->message_count];
            })
            ->filter(fn($w) => $w['message_count'] > 0)
            ->values();

        return Inertia::render('Platform/Analytics', [
            'date_range' => $dateRange,
            'message_trends' => $messageTrends,
            'message_status_distribution' => $messageStatusDistribution,
            'template_performance' => $templatePerformance,
            'account_growth' => $accountGrowth,
            'subscription_distribution' => $subscriptionDistribution,
            'peak_hours' => $peakHours,
            'top_accounts' => $topAccounts,
            'ai_credits_platform' => $aiCreditsPlatform,
            'ai_credits_period' => $currentPeriod]);
    }
}
