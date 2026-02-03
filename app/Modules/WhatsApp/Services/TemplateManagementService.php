<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Exceptions\WhatsAppApiException;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TemplateManagementService
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
    }

    /**
     * Create a new template via Meta API.
     * Follows Meta's latest template creation guidelines.
     */
    public function createTemplate(WhatsAppConnection $connection, array $templateData): array
    {
        $wabaId = $connection->waba_id;
        if (!$wabaId) {
            throw new \Exception('WABA ID is required to create templates');
        }

        $url = sprintf(
            '%s/%s/%s/message_templates',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $wabaId
        );

        // Build payload according to Meta's latest API format
        $payload = $this->buildTemplatePayload($templateData);

        try {
            // Check rate limit
            $this->rateLimitCheck($connection->id);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();
                $errorSubcode = $responseData['error']['error_subcode'] ?? null;

                Log::channel('whatsapp')->error('Template creation API error', [
                    'connection_id' => $connection->id,
                    'waba_id' => $wabaId,
                    'error' => $responseData['error'] ?? [],
                    'payload' => $payload]);

                throw new WhatsAppApiException(
                    "Failed to create template: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            // Store template locally
            $metaTemplateId = $responseData['id'] ?? null;
            if ($metaTemplateId) {
                $this->storeTemplateLocally($connection, $metaTemplateId, $templateData, $responseData);
            }

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error creating template', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to create template: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Update an existing template (create new version).
     * Meta doesn't allow direct edits - you must create a new version.
     */
    public function updateTemplate(WhatsAppConnection $connection, WhatsAppTemplate $template, array $templateData): array
    {
        // For updates, we create a new version with the same name
        $templateData['name'] = $template->name;
        return $this->createTemplate($connection, $templateData);
    }

    /**
     * Delete a template via Meta API.
     */
    public function deleteTemplate(WhatsAppConnection $connection, string $metaTemplateId): bool
    {
        $wabaId = $connection->waba_id;
        if (!$wabaId) {
            throw new \Exception('WABA ID is required to delete templates');
        }

        $url = sprintf(
            '%s/%s/%s/message_templates?hsm_id=%s',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $wabaId,
            $metaTemplateId
        );

        try {
            $this->rateLimitCheck($connection->id);

            $response = Http::withToken($connection->access_token)
                ->delete($url);

            if (!$response->successful()) {
                $responseData = $response->json();
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                
                throw new WhatsAppApiException(
                    "Failed to delete template: {$errorMessage}",
                    $responseData,
                    $response->status()
                );
            }

            return true;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error deleting template', [
                'connection_id' => $connection->id,
                'meta_template_id' => $metaTemplateId,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to delete template: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Get template status from Meta API.
     */
    public function getTemplateStatus(WhatsAppConnection $connection, string $metaTemplateId): array
    {
        $wabaId = $connection->waba_id;
        if (!$wabaId) {
            throw new \Exception('WABA ID is required to check template status');
        }

        $url = sprintf(
            '%s/%s/%s/message_templates?name=%s',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $wabaId,
            urlencode($metaTemplateId)
        );

        try {
            $this->rateLimitCheck($connection->id);

            $response = Http::withToken($connection->access_token)
                ->get($url, ['limit' => 1000]); // Get all templates

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                throw new WhatsAppApiException(
                    "Failed to get template status: {$errorMessage}",
                    $responseData,
                    $response->status()
                );
            }

            // Find the specific template by ID
            $templates = $responseData['data'] ?? [];
            foreach ($templates as $template) {
                if (($template['id'] ?? '') === $metaTemplateId) {
                    return $template;
                }
            }

            throw new \Exception('Template not found in Meta');
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error getting template status', [
                'connection_id' => $connection->id,
                'meta_template_id' => $metaTemplateId,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to get template status: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Build template payload according to Meta's latest API format.
     */
    protected function buildTemplatePayload(array $data): array
    {
        $payload = [
            'name' => $data['name'],
            'language' => $data['language'],
            'category' => strtoupper($data['category']),
            'components' => []];

        // Header component
        if (!empty($data['header_type']) && $data['header_type'] !== 'NONE') {
            $header = [
                'type' => 'HEADER',
                'format' => strtoupper($data['header_type'])];

            if ($data['header_type'] === 'TEXT' && !empty($data['header_text'])) {
                $header['text'] = $data['header_text'];
            } elseif (in_array($data['header_type'], ['IMAGE', 'VIDEO', 'DOCUMENT']) && !empty($data['header_media_url'])) {
                $header['example'] = [
                    'header_handle' => [$data['header_media_url']]];
            }

            $payload['components'][] = $header;
        }

        // Body component (required)
        if (!empty($data['body_text'])) {
            $body = [
                'type' => 'BODY',
                'text' => $data['body_text']];

            // Add example if variables exist
            if (!empty($data['body_examples']) && is_array($data['body_examples'])) {
                $body['example'] = [
                    'body_text' => [$data['body_examples']]];
            }

            $payload['components'][] = $body;
        }

        // Footer component
        if (!empty($data['footer_text'])) {
            $payload['components'][] = [
                'type' => 'FOOTER',
                'text' => $data['footer_text']];
        }

        // Buttons
        if (!empty($data['buttons']) && is_array($data['buttons'])) {
            $buttonComponents = [];
            foreach ($data['buttons'] as $button) {
                $buttonType = strtoupper($button['type'] ?? '');
                $buttonData = [
                    'type' => $buttonType,
                    'text' => $button['text'] ?? ''];

                if ($buttonType === 'URL' && !empty($button['url'])) {
                    $buttonData['url'] = $button['url'];
                    // Add example if dynamic URL
                    if (!empty($button['url_example'])) {
                        $buttonData['example'] = [$button['url_example']];
                    }
                } elseif ($buttonType === 'PHONE_NUMBER' && !empty($button['phone_number'])) {
                    $buttonData['phone_number'] = $button['phone_number'];
                }

                $buttonComponents[] = $buttonData;
            }

            if (!empty($buttonComponents)) {
                $payload['components'][] = [
                    'type' => 'BUTTONS',
                    'buttons' => $buttonComponents];
            }
        }

        return $payload;
    }

    /**
     * Store template locally after creation.
     */
    protected function storeTemplateLocally(
        WhatsAppConnection $connection,
        string $metaTemplateId,
        array $templateData,
        array $metaResponse
    ): WhatsAppTemplate {
        // Extract components from response
        $components = $metaResponse['components'] ?? $templateData;
        
        $bodyText = null;
        $headerType = null;
        $headerText = null;
        $footerText = null;
        $buttons = [];

        foreach ($components as $component) {
            $type = strtoupper($component['type'] ?? '');
            
            if ($type === 'BODY') {
                $bodyText = $component['text'] ?? '';
            } elseif ($type === 'HEADER') {
                $headerType = strtoupper($component['format'] ?? 'TEXT');
                if ($headerType === 'TEXT') {
                    $headerText = $component['text'] ?? '';
                }
            } elseif ($type === 'FOOTER') {
                $footerText = $component['text'] ?? '';
            } elseif ($type === 'BUTTONS') {
                $buttons = $component['buttons'] ?? [];
            }
        }

        return WhatsAppTemplate::create([
            'account_id' => $connection->account_id,
            'whatsapp_connection_id' => $connection->id,
            'meta_template_id' => $metaTemplateId,
            'name' => $templateData['name'],
            'language' => $templateData['language'],
            'category' => strtoupper($templateData['category']),
            'status' => strtolower($metaResponse['status'] ?? 'PENDING'),
            'quality_score' => $metaResponse['quality_score'] ?? null,
            'body_text' => $bodyText,
            'header_type' => $headerType,
            'header_text' => $headerText,
            'footer_text' => $footerText,
            'buttons' => $buttons,
            'components' => $components,
            'last_synced_at' => now(),
            'last_meta_error' => null]);
    }

    /**
     * Check and enforce rate limiting.
     */
    protected function rateLimitCheck(int $connectionId): void
    {
        $rateLimitKey = "template_management_rate_limit:connection:{$connectionId}";
        $requests = Cache::get($rateLimitKey, 0);
        
        // Allow max 20 requests per minute per connection
        if ($requests >= 20) {
            $ttl = Cache::get($rateLimitKey . ':ttl', 60);
            throw new \Exception("Rate limit: Maximum 20 template operations per minute. Please wait {$ttl} seconds.");
        }

        // Increment counter
        Cache::put($rateLimitKey, $requests + 1, 60);
        Cache::put($rateLimitKey . ':ttl', 60 - (now()->second), 60);
    }
}

