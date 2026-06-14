<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Plan;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    /**
     * Display the landing page.
     */
    public function index(SeoService $seo): Response
    {
        $stats = $this->getStats();

        return Inertia::render('Landing', [
            'seo' => $seo->page('landing'),
            'stats' => $stats,
            'plans' => $this->getPlans(),
            'canLogin' => \Route::has('login'),
            'canRegister' => \Route::has('register')]);
    }

    /**
     * Get real-time stats (API endpoint for polling).
     */
    public function stats(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'stats' => $this->getStats(),
            'timestamp' => now()->toIso8601String()]);
    }

    /**
     * Get current statistics.
     */
    protected function getStats(): array
    {
        try {
            return [
                'accounts' => $this->safeCount(Account::class),
                'active_connections' => $this->safeCount(WhatsAppConnection::class, ['is_active' => true]),
                'templates' => $this->safeCount(WhatsAppTemplate::class, ['status' => 'approved']),
                'messages_sent' => $this->safeCount(WhatsAppMessage::class, [
                    'direction' => 'outbound',
                    'status' => 'sent']),
                'messages_received' => $this->safeCount(WhatsAppMessage::class, ['direction' => 'inbound']),
                'conversations' => $this->safeCount(\App\Modules\WhatsApp\Models\WhatsAppConversation::class, ['status' => 'open'])];
        } catch (\Exception $e) {
            // Return zeros if tables don't exist yet
            return [
                'accounts' => 0,
                'active_connections' => 0,
                'templates' => 0,
                'messages_sent' => 0,
                'messages_received' => 0,
                'conversations' => 0];
        }
    }

    protected function getPlans(): array
    {
        try {
            return Plan::where('is_active', true)
                ->orderBy('price_monthly', 'asc')
                ->get()
                ->map(function (Plan $plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'key' => $plan->key,
                        'description' => $plan->description,
                        'price_monthly' => $plan->price_monthly,
                        'price_yearly' => $plan->price_yearly,
                        'currency' => strtoupper((string) ($plan->currency ?: app(\App\Services\PlatformSettingsService::class)->get('payment.default_currency', 'INR'))),
                        'trial_days' => $plan->trial_days ?? 0,
                        'features' => $plan->publicFeatures(),
                    ];
                })
                ->values()
                ->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Safely count records, returning 0 if table doesn't exist.
     */
    protected function safeCount(string $modelClass, array $conditions = []): int
    {
        try {
            $query = $modelClass::query();
            foreach ($conditions as $column => $value) {
                $query->where($column, $value);
            }

            return $query->count();
        } catch (\Exception $e) {
            // Table doesn't exist or query failed
            return 0;
        }
    }
}
