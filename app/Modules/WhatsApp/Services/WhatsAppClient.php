<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Exceptions\WhatsAppApiException;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppClient
{
    protected string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
    }

    /**
     * Check and enforce rate limiting per connection.
     * WhatsApp allows ~1000 messages per second per phone number.
     * We'll be conservative and allow 100 messages per minute per connection.
     */
    protected function checkRateLimit(WhatsAppConnection $connection): void
    {
        $rateLimitKey = "whatsapp_api_rate_limit:connection:{$connection->id}";
        $requests = Cache::get($rateLimitKey, 0);
        
        // Allow max 100 requests per minute per connection
        if ($requests >= 100) {
            $ttl = Cache::get($rateLimitKey . ':ttl', 60);
            throw new WhatsAppApiException(
                "Rate limit exceeded: Maximum 100 API requests per minute for this connection. Please wait {$ttl} seconds.",
                [],
                429
            );
        }

        // Increment counter
        Cache::put($rateLimitKey, $requests + 1, 60);
        Cache::put($rateLimitKey . ':ttl', 60 - (now()->second), 60);
    }

    protected function assertConnectionReady(WhatsAppConnection $connection): void
    {
        if (!$connection->is_active) {
            throw new WhatsAppApiException('WhatsApp connection is inactive.', [], 400);
        }

        if (empty($connection->phone_number_id)) {
            throw new WhatsAppApiException('WhatsApp connection is missing phone_number_id.', [], 400);
        }

        if (empty($connection->access_token)) {
            throw new WhatsAppApiException('WhatsApp connection is missing access token.', [], 400);
        }
    }

    /**
     * Send a text message via WhatsApp Cloud API.
     */
    public function sendTextMessage(
        WhatsAppConnection $connection,
        string $toWaId,
        string $messageText
    ): array {
        $url = sprintf(
            '%s/%s/%s/messages',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $connection->phone_number_id
        );

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => 'text',
            'text' => [
                'preview_url' => false,
                'body' => $messageText]];

        try {
            $this->assertConnectionReady($connection);
            // Check rate limit before making API call
            $this->checkRateLimit($connection);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();

                // Handle rate limiting
                if ($errorCode === 4 || $errorCode === 429 || str_contains($errorMessage, 'rate limit')) {
                    Log::channel('whatsapp')->warning('WhatsApp API rate limit hit', [
                        'connection_id' => $connection->id,
                        'phone_number_id' => $connection->phone_number_id]);
                    throw new WhatsAppApiException(
                        "Rate limit exceeded. Please wait before sending more messages.",
                        $responseData,
                        $errorCode
                    );
                }

                Log::channel('whatsapp')->error('WhatsApp API error', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'error' => $responseData['error'] ?? [],
                    'status' => $response->status()]);

                throw new WhatsAppApiException(
                    "WhatsApp API error: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            Log::channel('whatsapp')->info('Message sent successfully', [
                'connection_id' => $connection->id,
                'message_id' => $responseData['messages'][0]['id'] ?? null]);

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error sending message', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to send message: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Send a template message via WhatsApp Cloud API.
     */
    public function sendTemplateMessage(
        WhatsAppConnection $connection,
        string $toWaId,
        string $templateName,
        string $language,
        array $components = []
    ): array {
        $url = sprintf(
            '%s/%s/%s/messages',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $connection->phone_number_id
        );

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => 'template',
            'template' => [
                'name' => $templateName,
                'language' => [
                    'code' => $language],
                'components' => $components]];

        try {
            $this->assertConnectionReady($connection);
            // Check rate limit before making API call
            $this->checkRateLimit($connection);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();

                // Handle rate limiting
                if ($errorCode === 4 || $errorCode === 429 || str_contains($errorMessage, 'rate limit')) {
                    Log::channel('whatsapp')->warning('WhatsApp API rate limit hit', [
                        'connection_id' => $connection->id,
                        'phone_number_id' => $connection->phone_number_id,
                        'template_name' => $templateName]);
                    throw new WhatsAppApiException(
                        "Rate limit exceeded. Please wait before sending more messages.",
                        $responseData,
                        $errorCode
                    );
                }

                Log::channel('whatsapp')->error('WhatsApp template API error', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'template_name' => $templateName,
                    'error' => $responseData['error'] ?? [],
                    'status' => $response->status()]);

                throw new WhatsAppApiException(
                    "WhatsApp API error: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            Log::channel('whatsapp')->info('Template message sent successfully', [
                'connection_id' => $connection->id,
                'template_name' => $templateName,
                'message_id' => $responseData['messages'][0]['id'] ?? null]);

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error sending template message', [
                'connection_id' => $connection->id,
                'template_name' => $templateName,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to send template message: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Send a media message (image/video/document) via WhatsApp Cloud API.
     */
    public function sendMediaMessage(
        WhatsAppConnection $connection,
        string $toWaId,
        string $type,
        string $link,
        ?string $caption = null,
        ?string $filename = null
    ): array {
        $url = sprintf(
            '%s/%s/%s/messages',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $connection->phone_number_id
        );

        $mediaPayload = ['link' => $link];
        if ($caption) {
            $mediaPayload['caption'] = $caption;
        }
        if ($type === 'document' && $filename) {
            $mediaPayload['filename'] = $filename;
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => $type,
            $type => $mediaPayload];

        try {
            $this->assertConnectionReady($connection);
            $this->checkRateLimit($connection);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();

                Log::channel('whatsapp')->error('WhatsApp media API error', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'media_type' => $type,
                    'error' => $responseData['error'] ?? [],
                    'status' => $response->status()]);

                throw new WhatsAppApiException(
                    "WhatsApp API error: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            Log::channel('whatsapp')->info('Media message sent successfully', [
                'connection_id' => $connection->id,
                'media_type' => $type,
                'message_id' => $responseData['messages'][0]['id'] ?? null]);

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error sending media message', [
                'connection_id' => $connection->id,
                'media_type' => $type,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to send media message: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Send a location message via WhatsApp Cloud API.
     */
    public function sendLocationMessage(
        WhatsAppConnection $connection,
        string $toWaId,
        array $location
    ): array {
        $url = sprintf(
            '%s/%s/%s/messages',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $connection->phone_number_id
        );

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => 'location',
            'location' => [
                'latitude' => $location['latitude'],
                'longitude' => $location['longitude'],
                'name' => $location['name'] ?? null,
                'address' => $location['address'] ?? null]];

        try {
            $this->assertConnectionReady($connection);
            $this->checkRateLimit($connection);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();

                Log::channel('whatsapp')->error('WhatsApp location API error', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'error' => $responseData['error'] ?? [],
                    'status' => $response->status()]);

                throw new WhatsAppApiException(
                    "WhatsApp API error: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            Log::channel('whatsapp')->info('Location message sent successfully', [
                'connection_id' => $connection->id,
                'message_id' => $responseData['messages'][0]['id'] ?? null]);

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error sending location message', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to send location message: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Send an interactive list message via WhatsApp Cloud API.
     */
    public function sendListMessage(
        WhatsAppConnection $connection,
        string $toWaId,
        string $buttonText,
        array $sections,
        ?string $headerText = null,
        ?string $bodyText = null,
        ?string $footerText = null
    ): array {
        $url = sprintf(
            '%s/%s/%s/messages',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $connection->phone_number_id
        );

        $interactive = [
            'type' => 'list',
            'action' => [
                'button' => $buttonText,
                'sections' => $sections,
            ],
        ];

        if ($bodyText) {
            $interactive['body'] = ['text' => $bodyText];
        }

        if ($headerText) {
            $interactive['header'] = ['type' => 'text', 'text' => $headerText];
        }

        if ($footerText) {
            $interactive['footer'] = ['text' => $footerText];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => 'interactive',
            'interactive' => $interactive,
        ];

        try {
            $this->assertConnectionReady($connection);
            $this->checkRateLimit($connection);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();

                Log::channel('whatsapp')->error('WhatsApp list message API error', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'error' => $responseData['error'] ?? [],
                    'status' => $response->status()]);

                throw new WhatsAppApiException(
                    "WhatsApp API error: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            Log::channel('whatsapp')->info('List message sent successfully', [
                'connection_id' => $connection->id,
                'message_id' => $responseData['messages'][0]['id'] ?? null]);

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error sending list message', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to send list message: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Send an interactive button message (reply buttons) via WhatsApp Cloud API.
     */
    public function sendInteractiveButtons(
        WhatsAppConnection $connection,
        string $toWaId,
        string $bodyText,
        array $buttons,
        ?string $headerText = null,
        ?string $footerText = null
    ): array {
        $url = sprintf(
            '%s/%s/%s/messages',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $connection->phone_number_id
        );

        // Validate buttons (max 3 buttons, each button text max 20 chars)
        if (count($buttons) > 3) {
            throw new WhatsAppApiException('Maximum 3 buttons allowed', [], 400);
        }

        $buttonComponents = [];
        foreach ($buttons as $button) {
            if (mb_strlen($button['text']) > 20) {
                throw new WhatsAppApiException('Button text must be 20 characters or less', [], 400);
            }
            $buttonComponents[] = [
                'type' => 'reply',
                'reply' => [
                    'id' => $button['id'] ?? uniqid('btn_'),
                    'title' => $button['text'],
                ],
            ];
        }

        $interactive = [
            'type' => 'button',
            'body' => ['text' => $bodyText],
            'action' => [
                'buttons' => $buttonComponents,
            ],
        ];

        if ($headerText) {
            $interactive['header'] = ['type' => 'text', 'text' => $headerText];
        }

        if ($footerText) {
            $interactive['footer'] = ['text' => $footerText];
        }

        $payload = [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => 'interactive',
            'interactive' => $interactive,
        ];

        try {
            $this->checkRateLimit($connection);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $responseData['error']['code'] ?? $response->status();

                Log::channel('whatsapp')->error('WhatsApp interactive button API error', [
                    'connection_id' => $connection->id,
                    'phone_number_id' => $connection->phone_number_id,
                    'error' => $responseData['error'] ?? [],
                    'status' => $response->status()]);

                throw new WhatsAppApiException(
                    "WhatsApp API error: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            Log::channel('whatsapp')->info('Interactive button message sent successfully', [
                'connection_id' => $connection->id,
                'message_id' => $responseData['messages'][0]['id'] ?? null]);

            return $responseData;
        } catch (WhatsAppApiException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Unexpected error sending interactive button message', [
                'connection_id' => $connection->id,
                'error' => $e->getMessage()]);

            throw new WhatsAppApiException(
                "Failed to send interactive button message: {$e->getMessage()}",
                [],
                0,
                $e
            );
        }
    }

    /**
     * Get the base URL for API calls.
     */
    public function getBaseUrl(): string
    {
        return $this->baseUrl;
    }
}
