<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Exceptions\WhatsAppApiException;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TemplateManagementService
{
    protected string $baseUrl;

    public function __construct(
        protected TemplateLifecycleService $templateLifecycle
    )
    {
        $this->baseUrl = rtrim(config('whatsapp.meta.base_url', 'https://graph.facebook.com'), '/');
    }

    public function prepareHeaderMediaForSave(WhatsAppConnection $connection, array $templateData): array
    {
        $headerType = strtoupper((string) ($templateData['header_type'] ?? 'NONE'));
        if (!in_array($headerType, ['IMAGE', 'VIDEO', 'DOCUMENT'], true)) {
            return $templateData;
        }

        $mediaUrl = trim((string) ($templateData['header_media_url'] ?? ''));
        $mediaHandle = trim((string) ($templateData['header_media_handle'] ?? ''));

        if ($mediaUrl === '' && $mediaHandle === '') {
            throw new \InvalidArgumentException('Media header templates require an uploaded sample (URL or Meta handle).');
        }

        if ($mediaUrl === '') {
            return $templateData;
        }

        if ($this->isTemporaryMetaHostedUrl($mediaUrl)) {
            throw new \InvalidArgumentException('This media link is temporary and cannot be reused. Re-upload the header media.');
        }

        $this->assertHeaderMediaReachable($mediaUrl, $headerType);

        if (config('whatsapp.meta.app_id')) {
            $templateData['header_media_handle'] = $this->uploadHeaderMediaToMeta($connection, $mediaUrl, $headerType, true);
        }

        return $templateData;
    }

    /**
     * Create a new template via Meta API.
     * Follows Meta's latest template creation guidelines.
     */
    public function createTemplate(WhatsAppConnection $connection, array $templateData, ?int $ignoreTemplateId = null): array
    {
        $wabaId = $connection->waba_id;
        if (!$wabaId) {
            throw new \Exception('WABA ID is required to create templates');
        }

        $url = $this->resolveTemplateCreateUrl($connection, $wabaId);
        $this->ensureLocalTemplateNameAvailable(
            $connection,
            (string) ($templateData['name'] ?? ''),
            (string) ($templateData['language'] ?? ''),
            $ignoreTemplateId
        );

        // If header is media (IMAGE/VIDEO/DOCUMENT), we must provide an example. Prefer Meta upload handle over URL.
        if (!empty($templateData['header_type']) && in_array($templateData['header_type'], ['IMAGE', 'VIDEO', 'DOCUMENT'])) {
            $mediaUrl = trim((string) ($templateData['header_media_url'] ?? ''));
            if ($mediaUrl !== '') {
                try {
                    $handle = $this->uploadHeaderMediaToMeta($connection, $mediaUrl, $templateData['header_type']);
                    if ($handle) {
                        $templateData['header_media_handle'] = $handle;
                    }
                } catch (\Throwable $e) {
                    Log::channel('whatsapp')->warning('Template header media upload to Meta failed, using URL', [
                        'connection_id' => $connection->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
            // Meta requires a valid example for IMAGE/VIDEO/DOCUMENT headers
            $hasExample = !empty($templateData['header_media_handle']) || !empty(trim((string) ($templateData['header_media_url'] ?? '')));
            if (!$hasExample) {
                throw new \InvalidArgumentException(
                    'Templates with ' . $templateData['header_type'] . ' header require a sample. Please upload a header image (or provide a public image URL) and try again.'
                );
            }
        }

        // Build payload according to Meta's latest API format
        $payload = $this->buildTemplatePayload($templateData);
        if ($this->isOboTemplateMode()) {
            $payload['waba_id'] = $wabaId;
        }

        try {
            // Check rate limit
            $this->rateLimitCheck($connection->id);

            $response = Http::withToken($connection->access_token)
                ->post($url, $payload);

            $responseData = $response->json();

            if (!$response->successful()) {
                $err = $responseData['error'] ?? [];
                $errorMessage = $err['message'] ?? 'Unknown error from WhatsApp API';
                $errorCode = $err['code'] ?? $response->status();
                $userMsg = $err['error_user_msg'] ?? $err['error_user_title'] ?? null;
                if ($userMsg && $userMsg !== $errorMessage) {
                    $errorMessage = $errorMessage . ' (' . $userMsg . ')';
                }
                // When Meta says IMAGE header needs example/valid example: URL may be unreachable by Meta; suggest upload
                if (stripos($errorMessage, 'IMAGE header') !== false && (stripos($errorMessage, 'example') !== false || stripos($errorMessage, 'sample') !== false)) {
                    $errorMessage .= ' Make sure the header image URL is publicly accessible (no login required), or set META_APP_ID in .env so we can upload the image to Meta.';
                }

                Log::channel('whatsapp')->error('Template creation API error', [
                    'connection_id' => $connection->id,
                    'waba_id' => $wabaId,
                    'error' => $err,
                    'payload' => $payload,
                ]);

                throw new WhatsAppApiException(
                    "Failed to create template: {$errorMessage}",
                    $responseData,
                    $errorCode
                );
            }

            // Store template locally
            $metaTemplateId = $responseData['id'] ?? null;
            if ($metaTemplateId) {
                $this->storeTemplateLocally($connection, $metaTemplateId, $templateData, $responseData, $ignoreTemplateId);
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

    protected function resolveTemplateCreateUrl(WhatsAppConnection $connection, string $wabaId): string
    {
        $version = $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0');

        if ($this->isOboTemplateMode()) {
            $partnerBusinessId = (string) PlatformSetting::get(
                'whatsapp.partner_business_id',
                config('whatsapp.meta.partner_business_id')
            );
            if ($partnerBusinessId !== '') {
                return sprintf('%s/%s/%s/message_templates', $this->baseUrl, $version, $partnerBusinessId);
            }

            Log::channel('whatsapp')->warning('OBO template mode enabled but partner_business_id missing; falling back to direct mode');
        }

        return sprintf('%s/%s/%s/message_templates', $this->baseUrl, $version, $wabaId);
    }

    protected function isOboTemplateMode(): bool
    {
        $mode = (string) PlatformSetting::get('whatsapp.template_api_mode', config('whatsapp.meta.template_api_mode', 'direct'));
        return strtolower(trim($mode)) === 'obo';
    }

    /**
     * Update an existing template (create new version).
     * Meta doesn't allow direct edits - you must create a new version.
     */
    public function updateTemplate(WhatsAppConnection $connection, WhatsAppTemplate $template, array $templateData): array
    {
        // Meta does not allow same name+language recreation in many cases.
        // Prefer user-provided name, otherwise fallback to current name.
        $requestedName = trim((string) ($templateData['name'] ?? ''));
        $templateData['name'] = $requestedName !== '' ? $requestedName : $template->name;
        $this->ensureLocalTemplateNameAvailable(
            $connection,
            (string) $templateData['name'],
            (string) ($templateData['language'] ?? $template->language),
            (int) $template->id
        );

        // Keep existing media sample for media-header templates when edit form does not re-send it.
        if (
            !empty($templateData['header_type'])
            && in_array($templateData['header_type'], ['IMAGE', 'VIDEO', 'DOCUMENT'], true)
        ) {
            $headerMediaUrl = trim((string) ($templateData['header_media_url'] ?? ''));
            if ($headerMediaUrl === '') {
                $existingUrl = trim((string) ($template->header_media_url ?? ''));
                if ($existingUrl !== '') {
                    $templateData['header_media_url'] = $existingUrl;
                } else {
                    $existingHandle = $this->extractHeaderExampleHandle($template->components ?? []);
                    if ($existingHandle !== '') {
                        $templateData['header_media_handle'] = $existingHandle;
                    }
                }
            }
        }

        if ($this->isLocalOnlyTemplateUpdate($template, $templateData)) {
            $template->update([
                'header_media_url' => trim((string) ($templateData['header_media_url'] ?? '')) ?: $template->header_media_url,
                'last_meta_error' => null,
            ]);

            return [
                'id' => $template->meta_template_id,
                '_local_only_update' => true,
            ];
        }

        try {
            $result = $this->createTemplate($connection, $templateData, (int) $template->id);
            $this->adoptCreatedTemplateAsUpdate($connection, $template, (string) ($result['id'] ?? ''));

            return $result;
        } catch (WhatsAppApiException $e) {
            $message = strtolower($e->getMessage());
            $isDuplicateLocale = str_contains($message, 'already english')
                || str_contains($message, 'already content for this template')
                || str_contains($message, 'already exists');

            if (!$isDuplicateLocale) {
                throw $e;
            }

            // Auto-version template name so update can continue without manual rename.
            $baseName = preg_replace('/[^a-zA-Z0-9_]/', '_', (string) $templateData['name']);
            $baseName = trim((string) $baseName, '_');
            if ($baseName === '') {
                $baseName = 'template';
            }
            $versionedName = strtolower(substr($baseName, 0, 480).'_v'.now()->format('YmdHis'));
            $templateData['name'] = $versionedName;

            $result = $this->createTemplate($connection, $templateData, (int) $template->id);
            $this->adoptCreatedTemplateAsUpdate($connection, $template, (string) ($result['id'] ?? ''));
            $result['_auto_versioned_name'] = true;
            $result['_effective_template_name'] = $versionedName;

            return $result;
        }
    }

    protected function extractHeaderExampleHandle(array $components): string
    {
        foreach ($components as $component) {
            if (strtoupper((string) ($component['type'] ?? '')) !== 'HEADER') {
                continue;
            }

            $handle = trim((string) ($component['example']['header_handle'][0] ?? ''));
            if ($handle !== '') {
                return $handle;
            }
        }

        return '';
    }

    protected function ensureLocalTemplateNameAvailable(
        WhatsAppConnection $connection,
        string $name,
        string $language,
        ?int $ignoreTemplateId = null
    ): void {
        $name = trim($name);
        $language = trim($language);
        if ($name === '' || $language === '') {
            return;
        }

        $query = WhatsAppTemplate::query()
            ->where('account_id', $connection->account_id)
            ->where('whatsapp_connection_id', $connection->id)
            ->where('name', $name)
            ->where('language', $language)
            ->where(function ($subQuery) {
                $subQuery->whereNull('is_archived')
                    ->orWhere('is_archived', false);
            });

        if ($ignoreTemplateId) {
            $query->where('id', '!=', $ignoreTemplateId);
        }

        if ($query->exists()) {
            throw new \InvalidArgumentException("Template '{$name}' with language '{$language}' already exists for this connection.");
        }
    }

    protected function adoptCreatedTemplateAsUpdate(
        WhatsAppConnection $connection,
        WhatsAppTemplate $currentTemplate,
        string $createdMetaTemplateId
    ): void {
        if ($createdMetaTemplateId === '') {
            return;
        }

        $created = WhatsAppTemplate::where('account_id', $currentTemplate->account_id)
            ->where('whatsapp_connection_id', $connection->id)
            ->where('meta_template_id', $createdMetaTemplateId)
            ->latest('id')
            ->first();

        if (!$created || $created->id === $currentTemplate->id) {
            return;
        }

        DB::transaction(function () use ($currentTemplate, $created) {
            $targetName = $created->name;
            $targetMetaTemplateId = $created->meta_template_id;
            $targetLanguage = $created->language;
            $targetCategory = $created->category;
            $targetStatus = $created->status;
            $targetQualityScore = $created->quality_score;
            $targetBodyText = $created->body_text;
            $targetHeaderType = $created->header_type;
            $targetHeaderText = $created->header_text;
            $targetHeaderMediaUrl = $created->header_media_url;
            $targetFooterText = $created->footer_text;
            $targetButtons = $created->buttons;
            $targetComponents = $created->components;

            // Free unique (account_id, connection_id, name, language) before assigning created identity to current row.
            // We cannot keep both rows with the same template name+language at once.
            $created->update([
                'name' => $created->name.'_tmp_'.$created->id,
            ]);

            $currentTemplate->update([
                'meta_template_id' => $targetMetaTemplateId,
                'name' => $targetName,
                'language' => $targetLanguage,
                'category' => $targetCategory,
                'status' => $targetStatus,
                'quality_score' => $targetQualityScore,
                'body_text' => $targetBodyText,
                'header_type' => $targetHeaderType,
                'header_text' => $targetHeaderText,
                'header_media_url' => $targetHeaderMediaUrl,
                'footer_text' => $targetFooterText,
                'buttons' => $targetButtons,
                'components' => $targetComponents,
                'last_synced_at' => now(),
                'last_meta_error' => null,
                'is_archived' => false,
            ]);

            DB::table('whatsapp_template_versions')
                ->where('whatsapp_template_id', $created->id)
                ->update(['whatsapp_template_id' => $currentTemplate->id]);

            DB::table('whatsapp_template_sends')
                ->where('whatsapp_template_id', $created->id)
                ->update(['whatsapp_template_id' => $currentTemplate->id]);

            $created->update(['is_archived' => true]);
        });
    }

    protected function isLocalOnlyTemplateUpdate(WhatsAppTemplate $template, array $templateData): bool
    {
        $normalize = static fn (?string $value): string => trim((string) $value);
        $normalizeButtons = static fn ($buttons): array => array_values($buttons ?? []);

        return $normalize($templateData['name'] ?? '') === $normalize($template->name)
            && $normalize($templateData['language'] ?? '') === $normalize($template->language)
            && strtoupper($normalize($templateData['category'] ?? '')) === strtoupper($normalize($template->category))
            && strtoupper($normalize($templateData['header_type'] ?? 'NONE')) === strtoupper($normalize($template->header_type ?? 'NONE'))
            && $normalize($templateData['header_text'] ?? '') === $normalize($template->header_text)
            && $normalize($templateData['body_text'] ?? '') === $normalize($template->body_text)
            && $normalize($templateData['footer_text'] ?? '') === $normalize($template->footer_text)
            && $normalizeButtons($templateData['buttons'] ?? []) === $normalizeButtons($template->buttons ?? []);
    }

    /**
     * Delete a template via Meta API.
     */
    public function deleteTemplate(
        WhatsAppConnection $connection,
        ?string $metaTemplateId = null,
        ?string $templateName = null,
        ?string $language = null
    ): bool
    {
        $wabaId = $connection->waba_id;
        if (!$wabaId) {
            throw new \Exception('WABA ID is required to delete templates');
        }

        $version = $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0');
        $baseUrl = sprintf('%s/%s/%s/message_templates', $this->baseUrl, $version, $wabaId);

        try {
            $this->rateLimitCheck($connection->id);

            $attempts = [];
            $metaTemplateId = trim((string) $metaTemplateId);
            $templateName = trim((string) $templateName);
            $language = trim((string) $language);

            if ($metaTemplateId !== '') {
                $attempts[] = ['hsm_id' => $metaTemplateId];
            }
            if ($templateName !== '' && $language !== '') {
                $attempts[] = ['name' => $templateName, 'language' => $language];
            }
            if (empty($attempts)) {
                throw new \InvalidArgumentException('Meta template identifier is required to delete template.');
            }

            $lastError = null;
            foreach ($attempts as $params) {
                $response = Http::withToken($connection->access_token)
                    ->delete($baseUrl . '?' . http_build_query($params));

                if ($response->successful()) {
                    return true;
                }

                $responseData = $response->json();
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                $lastError = new WhatsAppApiException(
                    "Failed to delete template: {$errorMessage}",
                    $responseData,
                    $response->status()
                );

                Log::channel('whatsapp')->warning('Template delete attempt failed', [
                    'connection_id' => $connection->id,
                    'params' => $params,
                    'status' => $response->status(),
                    'error' => $responseData['error'] ?? $errorMessage,
                ]);
            }

            if ($lastError) {
                throw $lastError;
            }

            return false;
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
            '%s/%s/%s/message_templates',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $wabaId
        );

        try {
            $this->rateLimitCheck($connection->id);

            $after = null;
            for ($page = 0; $page < 20; $page++) {
                $params = ['limit' => 100];
                if ($after) {
                    $params['after'] = $after;
                }

                $response = Http::withToken($connection->access_token)->get($url, $params);
                $responseData = $response->json();

                if (!$response->successful()) {
                    $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                    throw new WhatsAppApiException(
                        "Failed to get template status: {$errorMessage}",
                        $responseData,
                        $response->status()
                    );
                }

                $templates = $responseData['data'] ?? [];
                foreach ($templates as $template) {
                    if ((string) ($template['id'] ?? '') === (string) $metaTemplateId) {
                        return $template;
                    }
                }

                $after = $responseData['paging']['cursors']['after'] ?? null;
                if (!$after) {
                    break;
                }
            }

            throw new \Exception('Template not found in Meta by ID');
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
     * Find currently deliverable (approved/active) template version for a given name + language.
     * Meta send API resolves by name/language, not template ID, so we use this to detect version drift.
     */
    public function getDeliverableTemplateByNameLanguage(
        WhatsAppConnection $connection,
        string $name,
        string $language
    ): ?array {
        $wabaId = $connection->waba_id;
        if (!$wabaId) {
            throw new \Exception('WABA ID is required to resolve deliverable template');
        }

        $url = sprintf(
            '%s/%s/%s/message_templates',
            $this->baseUrl,
            $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0'),
            $wabaId
        );

        $targetName = strtolower(trim($name));
        $targetLang = strtolower(str_replace('-', '_', trim($language)));
        $candidate = null;

        $this->rateLimitCheck($connection->id);
        $after = null;

        for ($page = 0; $page < 20; $page++) {
            $params = ['limit' => 100];
            if ($after) {
                $params['after'] = $after;
            }

            $response = Http::withToken($connection->access_token)->get($url, $params);
            $responseData = $response->json();

            if (!$response->successful()) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown error from WhatsApp API';
                throw new WhatsAppApiException(
                    "Failed to resolve deliverable template: {$errorMessage}",
                    $responseData,
                    $response->status()
                );
            }

            $templates = $responseData['data'] ?? [];
            foreach ($templates as $template) {
                $tplName = strtolower(trim((string) ($template['name'] ?? '')));
                $tplLang = strtolower(str_replace('-', '_', trim((string) ($template['language'] ?? ''))));
                $tplStatus = strtolower(trim((string) ($template['status'] ?? '')));

                if ($tplName !== $targetName || $tplLang !== $targetLang) {
                    continue;
                }

                if (in_array($tplStatus, ['approved', 'active'], true)) {
                    // Prefer most recently updated approved/active version if available.
                    if ($candidate === null) {
                        $candidate = $template;
                    } else {
                        $existingUpdated = strtotime((string) ($candidate['updated_time'] ?? $candidate['created_time'] ?? '1970-01-01'));
                        $incomingUpdated = strtotime((string) ($template['updated_time'] ?? $template['created_time'] ?? '1970-01-01'));
                        if ($incomingUpdated >= $existingUpdated) {
                            $candidate = $template;
                        }
                    }
                }
            }

            $after = $responseData['paging']['cursors']['after'] ?? null;
            if (!$after) {
                break;
            }
        }

        return $candidate;
    }

    /**
     * Build template payload according to Meta's latest API format.
     * See: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/components
     */
    protected function buildTemplatePayload(array $data): array
    {
        $payload = [
            'name' => $data['name'],
            'language' => $data['language'],
            'category' => strtoupper($data['category']),
            'components' => [],
        ];

        // Header component
        if (!empty($data['header_type']) && $data['header_type'] !== 'NONE') {
            $header = [
                'type' => 'HEADER',
                'format' => strtoupper($data['header_type']),
            ];

            if ($data['header_type'] === 'TEXT' && !empty($data['header_text'])) {
                $header['text'] = $data['header_text'];
            } elseif (in_array($data['header_type'], ['IMAGE', 'VIDEO', 'DOCUMENT'])) {
                // Meta requires example for media headers. Use handle from Resumable Upload when available, else public URL.
                $mediaRef = $data['header_media_handle'] ?? $data['header_media_url'] ?? null;
                $mediaRef = is_string($mediaRef) ? trim($mediaRef) : $mediaRef;
                if (empty($mediaRef)) {
                    throw new \InvalidArgumentException(
                        'Templates with ' . $data['header_type'] . ' header need a sample image. Please upload a file or provide a public image URL.'
                    );
                }
                $header['example'] = [
                    'header_handle' => [$mediaRef],
                ];
            }

            $payload['components'][] = $header;
        }

        // Body component (required)
        if (!empty($data['body_text'])) {
            $body = [
                'type' => 'BODY',
                'text' => $data['body_text'],
            ];

            // Only add example when body contains variables ({{1}}, {{2}}, etc.); otherwise Meta returns "Invalid parameter"
            $hasBodyVariables = (bool) preg_match('/\{\{\d+\}\}/', $data['body_text']);
            if ($hasBodyVariables && !empty($data['body_examples']) && is_array($data['body_examples'])) {
                $body['example'] = [
                    'body_text' => [array_values($data['body_examples'])],
                ];
            }

            $payload['components'][] = $body;
        }

        // Buttons (Meta expects BUTTONS before FOOTER)
        if (!empty($data['buttons']) && is_array($data['buttons'])) {
            $buttonComponents = [];
            foreach ($data['buttons'] as $button) {
                $buttonType = strtoupper($button['type'] ?? '');
                $buttonData = [
                    'type' => $buttonType,
                    'text' => $button['text'] ?? '',
                ];

                if ($buttonType === 'URL' && !empty($button['url'])) {
                    $buttonData['url'] = $button['url'];
                    // Only add example for dynamic URL (Meta requires URL to contain {{1}} when using example)
                    if (!empty($button['url_example']) && preg_match('/\{\{\d+\}\}/', $button['url'])) {
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
                    'buttons' => $buttonComponents,
                ];
            }
        }

        // Footer component
        if (!empty($data['footer_text'])) {
            $payload['components'][] = [
                'type' => 'FOOTER',
                'text' => $data['footer_text'],
            ];
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
        array $metaResponse,
        ?int $ignoreTemplateId = null
    ): WhatsAppTemplate {
        // Meta create response often omits components; use our request payload components as fallback.
        $components = $metaResponse['components'] ?? $this->buildTemplatePayload($templateData)['components'] ?? [];
        
        $bodyText = null;
        $headerType = null;
        $headerText = null;
        $headerMediaUrl = trim((string) ($templateData['header_media_url'] ?? ''));
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

        $normalizedStatus = $this->templateLifecycle->normalizeStatus((string) ($metaResponse['status'] ?? 'PENDING'));
        $attributes = [
            'account_id' => $connection->account_id,
            'whatsapp_connection_id' => $connection->id,
            'meta_template_id' => $metaTemplateId,
            'name' => $templateData['name'],
            'language' => $templateData['language'],
            'category' => strtoupper($templateData['category']),
            'status' => $normalizedStatus,
            'remote_status' => $normalizedStatus,
            'quality_score' => $metaResponse['quality_score'] ?? null,
            'body_text' => $bodyText,
            'header_type' => $headerType,
            'header_text' => $headerText,
            'header_media_url' => $headerMediaUrl !== '' ? $headerMediaUrl : null,
            'footer_text' => $footerText,
            'buttons' => $buttons,
            'components' => $components,
            'remote_components' => $components,
            'draft_components' => $components,
            'last_synced_at' => now(),
            'last_meta_sync_at' => now(),
            'sync_state' => $this->templateLifecycle->computeSyncState($normalizedStatus, now(), false, null),
            'is_remote_deleted' => false,
            'remote_deleted_at' => null,
            'last_meta_error' => null,
            'meta_rejection_reason' => $metaResponse['rejection_reason'] ?? $metaResponse['rejected_reason'] ?? null,
        ];

        if ($ignoreTemplateId) {
            $existingTemplate = WhatsAppTemplate::query()
                ->whereKey($ignoreTemplateId)
                ->where('account_id', $connection->account_id)
                ->where('whatsapp_connection_id', $connection->id)
                ->first();

            if ($existingTemplate) {
                $existingTemplate->fill($attributes);
                $existingTemplate->save();

                return $existingTemplate->fresh();
            }
        }

        return WhatsAppTemplate::create($attributes);
    }

    /**
     * Upload header media to Meta via Resumable Upload API and return the file handle.
     * Meta template creation often rejects app-hosted URLs; using a handle avoids "Invalid parameter".
     */
    protected function uploadHeaderMediaToMeta(WhatsAppConnection $connection, string $mediaUrl, string $headerType, bool $strict = false): ?string
    {
        $appId = config('whatsapp.meta.app_id');
        if (!$appId) {
            return null;
        }

        $response = Http::timeout(30)->get($mediaUrl);
        if (!$response->successful()) {
            throw new \RuntimeException("Could not fetch media: HTTP {$response->status()}");
        }

        $content = $response->body();
        $fileLength = strlen($content);
        if ($fileLength === 0) {
            throw new \RuntimeException('Media file is empty');
        }

        $mimeMap = [
            'IMAGE' => $response->header('Content-Type') ?: 'image/png',
            'VIDEO' => 'video/mp4',
            'DOCUMENT' => $response->header('Content-Type') ?: 'application/pdf',
        ];
        $fileType = $mimeMap[$headerType] ?? 'image/png';
        // Meta only accepts: image/jpeg, image/jpg, image/png, video/mp4, application/pdf
        $allowed = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'application/pdf'];
        if (!in_array(strtolower(explode(';', $fileType)[0]), $allowed)) {
            $fileType = $headerType === 'VIDEO' ? 'video/mp4' : 'image/png';
        }

        $fileName = 'template_header_' . substr(md5($mediaUrl), 0, 8);
        if (str_starts_with($fileType, 'image/')) {
            $fileName .= '.png';
        } elseif (str_starts_with($fileType, 'video/')) {
            $fileName .= '.mp4';
        } else {
            $fileName .= '.pdf';
        }

        $version = $connection->api_version ?: config('whatsapp.meta.api_version', 'v21.0');
        $createUrl = sprintf('%s/%s/%s/uploads', $this->baseUrl, $version, $appId);

        // Meta Resumable Upload: create session (API accepts query or form params)
        $sessionResponse = Http::withToken($connection->access_token)
            ->post($createUrl . '?' . http_build_query([
                'file_name' => $fileName,
                'file_length' => $fileLength,
                'file_type' => $fileType,
            ]));

        $sessionData = $sessionResponse->json();
        $sessionId = $sessionData['id'] ?? null;
        if (!$sessionId || !str_starts_with((string) $sessionId, 'upload:')) {
            Log::channel('whatsapp')->warning('Meta upload session failed', [
                'response' => $sessionData,
                'status' => $sessionResponse->status(),
            ]);
            if ($strict) {
                throw new \RuntimeException('Meta upload session could not be created for this media file.');
            }
            return null;
        }

        $uploadUrl = sprintf('%s/%s/%s', $this->baseUrl, $version, $sessionId);
        $uploadResponse = Http::withHeaders([
            'Authorization' => 'OAuth ' . $connection->access_token,
            'file_offset' => '0',
        ])->withBody($content, 'application/octet-stream')
            ->timeout(60)
            ->post($uploadUrl);

        $uploadData = $uploadResponse->json();
        $handle = $uploadData['h'] ?? null;
        if (!$handle) {
            Log::channel('whatsapp')->warning('Meta file upload failed', [
                'response' => $uploadData,
                'status' => $uploadResponse->status(),
            ]);
            if ($strict) {
                throw new \RuntimeException('Meta could not accept this media file for template delivery.');
            }
            return null;
        }

        return $handle;
    }

    protected function assertHeaderMediaReachable(string $mediaUrl, string $headerType): void
    {
        $response = Http::timeout(20)->get($mediaUrl);
        if (!$response->successful()) {
            throw new \RuntimeException("Media URL is not reachable (HTTP {$response->status()}).");
        }

        $content = $response->body();
        if ($content === '') {
            throw new \RuntimeException('Media URL returned empty content.');
        }

        $contentType = strtolower(trim((string) explode(';', (string) $response->header('Content-Type'))[0]));
        $allowedTypes = match ($headerType) {
            'IMAGE' => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            'VIDEO' => ['video/mp4', 'video/quicktime', 'video/3gpp'],
            'DOCUMENT' => ['application/pdf'],
            default => [],
        };

        if ($contentType !== '' && !in_array($contentType, $allowedTypes, true)) {
            throw new \RuntimeException("Media file type '{$contentType}' is not allowed for {$headerType} headers.");
        }
    }

    protected function isTemporaryMetaHostedUrl(string $url): bool
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));

        return str_contains($host, 'lookaside.fbsbx.com')
            || str_contains($host, 'scontent.')
            || str_contains($host, 'fbcdn.net');
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
