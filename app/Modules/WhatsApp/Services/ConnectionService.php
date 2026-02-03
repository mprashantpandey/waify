<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Models\Account;
use Illuminate\Support\Str;

class ConnectionService
{
    /**
     * Create a new WhatsApp connection.
     */
    public function create(Account $account, array $data): WhatsAppConnection
    {
        $data['account_id'] = $account->id;
        $data['webhook_verify_token'] = WhatsAppConnection::generateVerifyToken();
        $data['api_version'] = $data['api_version'] ?? config('whatsapp.meta.api_version', 'v21.0');

        // Encrypt access token if provided
        if (isset($data['access_token'])) {
            $connection = new WhatsAppConnection();
            $connection->access_token = $data['access_token'];
            unset($data['access_token']);
            $data['access_token_encrypted'] = $connection->access_token_encrypted;
        }

        return WhatsAppConnection::create($data);
    }

    /**
     * Update a WhatsApp connection.
     */
    public function update(WhatsAppConnection $connection, array $data): WhatsAppConnection
    {
        // Handle access token update
        if (isset($data['access_token'])) {
            $connection->access_token = $data['access_token'];
            unset($data['access_token']);
        }

        if (array_key_exists('api_version', $data) && $data['api_version'] === null) {
            unset($data['api_version']);
        }

        $connection->update($data);

        return $connection->fresh();
    }

    /**
     * Rotate the webhook verify token.
     */
    public function rotateVerifyToken(WhatsAppConnection $connection): WhatsAppConnection
    {
        $connection->update([
            'webhook_verify_token' => WhatsAppConnection::generateVerifyToken(),
            'webhook_subscribed' => false, // Reset subscription status
        ]);

        return $connection->fresh();
    }

    /**
     * Get webhook URL for a connection.
     */
    public function getWebhookUrl(WhatsAppConnection $connection): string
    {
        // Ensure connection has a slug
        if (empty($connection->slug)) {
            $connection->slug = WhatsAppConnection::generateSlug($connection);
            $connection->save();
        }
        
        // Use slug for webhook URL (more secure and user-friendly)
        // Fallback to ID if slug is still empty (shouldn't happen)
        $identifier = $connection->slug ?? (string) $connection->id;
        
        // Generate full URL
        $url = route('webhooks.whatsapp.receive', [
            'connection' => $identifier]);
        
        // Log the generated URL for debugging
        \Log::channel('whatsapp')->debug('Webhook URL generated', [
            'connection_id' => $connection->id,
            'connection_slug' => $connection->slug,
            'identifier_used' => $identifier,
            'url' => $url,
        ]);
        
        return $url;
    }
}
