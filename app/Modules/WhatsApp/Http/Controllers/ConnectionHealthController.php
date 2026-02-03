<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\MetaGraphService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ConnectionHealthController extends Controller
{
    public function __construct(
        protected MetaGraphService $metaGraphService,
        protected WhatsAppClient $whatsappClient
    ) {
    }

    /**
     * Resolve connection from route parameter (handles both string ID and model instance).
     */
    protected function resolveConnection($connection, $account): WhatsAppConnection
    {
        if ($connection instanceof WhatsAppConnection) {
            return $connection;
        }

        // Try to resolve by slug first, then by ID (for backward compatibility)
        $query = WhatsAppConnection::where('account_id', $account->id);
        
        if (is_numeric($connection)) {
            $query->where('id', $connection);
        } else {
            $query->where('slug', $connection)->orWhere('id', $connection);
        }

        return $query->firstOrFail();
    }

    /**
     * Health check endpoint for a WhatsApp connection.
     * 
     * Returns comprehensive status including:
     * - Connection status (active/inactive)
     * - Webhook subscription status
     * - Last webhook received timestamp
     * - Access token validity (if testable)
     * - API connectivity
     * - Phone number status
     */
    public function check(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('view', $connection);

        $health = [
            'connection_id' => $connection->id,
            'connection_name' => $connection->name,
            'overall_status' => 'unknown',
            'checks' => [],
            'timestamp' => now()->toIso8601String()];

        // Check 1: Connection Active Status
        $health['checks']['connection_active'] = [
            'status' => $connection->is_active ? 'healthy' : 'unhealthy',
            'message' => $connection->is_active 
                ? 'Connection is marked as active' 
                : 'Connection is marked as inactive',
            'details' => [
                'is_active' => $connection->is_active]];

        // Check 2: Webhook Subscription
        $health['checks']['webhook_subscription'] = [
            'status' => $connection->webhook_subscribed ? 'healthy' : 'warning',
            'message' => $connection->webhook_subscribed 
                ? 'Webhook is subscribed' 
                : 'Webhook subscription not confirmed',
            'details' => [
                'subscribed' => $connection->webhook_subscribed,
                'webhook_url' => app(\App\Modules\WhatsApp\Services\ConnectionService::class)->getWebhookUrl($connection),
                'last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
                'last_error' => $connection->webhook_last_error]];

        // Check 3: Webhook Recent Activity
        if ($connection->webhook_last_received_at) {
            $minutesSinceLastWebhook = $connection->webhook_last_received_at->diffInMinutes(now());
            $health['checks']['webhook_activity'] = [
                'status' => $minutesSinceLastWebhook < 60 ? 'healthy' : ($minutesSinceLastWebhook < 1440 ? 'warning' : 'unhealthy'),
                'message' => $minutesSinceLastWebhook < 60 
                    ? "Webhook received {$minutesSinceLastWebhook} minutes ago" 
                    : ($minutesSinceLastWebhook < 1440 
                        ? "No webhook activity in {$minutesSinceLastWebhook} minutes" 
                        : "No webhook activity in " . round($minutesSinceLastWebhook / 60) . " hours"),
                'details' => [
                    'minutes_since_last' => $minutesSinceLastWebhook,
                    'last_received_at' => $connection->webhook_last_received_at->toIso8601String()]];
        } else {
            $health['checks']['webhook_activity'] = [
                'status' => 'warning',
                'message' => 'No webhook activity recorded yet',
                'details' => []];
        }

        // Check 4: Access Token Validity (cached to avoid rate limits)
        $tokenCacheKey = "whatsapp_connection_{$connection->id}_token_check";
        $tokenCheck = Cache::remember($tokenCacheKey, 300, function () use ($connection) {
            try {
                if (!$connection->access_token) {
                    return [
                        'status' => 'unhealthy',
                        'message' => 'Access token not available',
                        'error' => 'No access token stored'];
                }

                $debugData = $this->metaGraphService->debugToken($connection->access_token);
                $isValid = ($debugData['is_valid'] ?? false) === true;
                $expiresAt = isset($debugData['expires_at']) ? $debugData['expires_at'] : null;

                return [
                    'status' => $isValid ? 'healthy' : 'unhealthy',
                    'message' => $isValid 
                        ? 'Access token is valid' 
                        : 'Access token is invalid or expired',
                    'details' => [
                        'is_valid' => $isValid,
                        'expires_at' => $expiresAt,
                        'app_id' => $debugData['app_id'] ?? null,
                        'user_id' => $debugData['user_id'] ?? null]];
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('Token health check failed', [
                    'connection_id' => $connection->id,
                    'error' => $e->getMessage()]);

                return [
                    'status' => 'unknown',
                    'message' => 'Unable to verify token (API error)',
                    'error' => $e->getMessage()];
            }
        });

        $health['checks']['access_token'] = $tokenCheck;

        // Check 5: API Connectivity (test with a lightweight call)
        $apiCacheKey = "whatsapp_connection_{$connection->id}_api_check";
        $apiCheck = Cache::remember($apiCacheKey, 300, function () use ($connection) {
            try {
                if (!$connection->phone_number_id || !$connection->access_token) {
                    return [
                        'status' => 'unhealthy',
                        'message' => 'Missing required connection data',
                        'error' => 'Phone number ID or access token missing'];
                }

                // Try to get phone number details (lightweight call)
                $details = $this->metaGraphService->getPhoneNumberDetails(
                    $connection->phone_number_id,
                    $connection->access_token
                );

                return [
                    'status' => 'healthy',
                    'message' => 'API connectivity verified',
                    'details' => [
                        'phone_number' => $details['display_phone_number'] ?? null,
                        'verified_name' => $details['verified_name'] ?? null]];
            } catch (\Throwable $e) {
                Log::channel('whatsapp')->warning('API connectivity check failed', [
                    'connection_id' => $connection->id,
                    'error' => $e->getMessage()]);

                return [
                    'status' => 'unhealthy',
                    'message' => 'API connectivity test failed',
                    'error' => $e->getMessage()];
            }
        });

        $health['checks']['api_connectivity'] = $apiCheck;

        // Check 6: Phone Number Status
        if ($connection->phone_number_id) {
            $health['checks']['phone_number'] = [
                'status' => 'healthy',
                'message' => 'Phone number ID configured',
                'details' => [
                    'phone_number_id' => $connection->phone_number_id,
                    'business_phone' => $connection->business_phone,
                    'waba_id' => $connection->waba_id]];
        } else {
            $health['checks']['phone_number'] = [
                'status' => 'unhealthy',
                'message' => 'Phone number ID not configured',
                'details' => []];
        }

        // Calculate overall status
        $statuses = array_column($health['checks'], 'status');
        $hasUnhealthy = in_array('unhealthy', $statuses);
        $hasWarning = in_array('warning', $statuses);
        $hasUnknown = in_array('unknown', $statuses);

        if ($hasUnhealthy) {
            $health['overall_status'] = 'unhealthy';
        } elseif ($hasWarning) {
            $health['overall_status'] = 'warning';
        } elseif ($hasUnknown) {
            $health['overall_status'] = 'unknown';
        } else {
            $health['overall_status'] = 'healthy';
        }

        // Add summary
        $health['summary'] = [
            'total_checks' => count($health['checks']),
            'healthy' => count(array_filter($statuses, fn($s) => $s === 'healthy')),
            'warnings' => count(array_filter($statuses, fn($s) => $s === 'warning')),
            'unhealthy' => count(array_filter($statuses, fn($s) => $s === 'unhealthy')),
            'unknown' => count(array_filter($statuses, fn($s) => $s === 'unknown'))];

        return response()->json($health);
    }

    /**
     * Quick health check (lightweight, no API calls).
     */
    public function quickCheck(Request $request, $connection)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $connection = $this->resolveConnection($connection, $account);

        Gate::authorize('view', $connection);

        $minutesSinceLastWebhook = $connection->webhook_last_received_at 
            ? $connection->webhook_last_received_at->diffInMinutes(now()) 
            : null;

        return response()->json([
            'connection_id' => $connection->id,
            'is_active' => $connection->is_active,
            'webhook_subscribed' => $connection->webhook_subscribed,
            'webhook_last_received_at' => $connection->webhook_last_received_at?->toIso8601String(),
            'minutes_since_last_webhook' => $minutesSinceLastWebhook,
            'has_access_token' => !empty($connection->access_token),
            'has_phone_number_id' => !empty($connection->phone_number_id),
            'status' => $connection->is_active && $connection->webhook_subscribed ? 'healthy' : 'warning',
            'timestamp' => now()->toIso8601String()]);
    }
}
