<?php

namespace App\Modules\WhatsApp\Services;

use App\Modules\WhatsApp\Models\WhatsAppTemplate;

class TemplateComposer
{
    /**
     * Prepare template message payload for Meta API.
     */
    public function preparePayload(
        WhatsAppTemplate $template,
        string $toWaId,
        array $variables = []
    ): array {
        // Validate variable count
        $requiredVariables = $this->extractRequiredVariables($template);
        $providedCount = count($variables);

        if ($providedCount < $requiredVariables['total']) {
            throw new \Exception(
                "Template requires {$requiredVariables['total']} variables, but {$providedCount} provided"
            );
        }

        // Build components array for Meta API
        $components = [];

        // Header variables (if TEXT header with variables)
        if ($template->header_type === 'TEXT' && $template->header_text) {
            $headerVars = $this->extractVariables($template->header_text);
            if (count($headerVars) > 0) {
                $headerParams = [];
                foreach ($headerVars as $varIndex) {
                    $varValue = $variables[$varIndex - 1] ?? '';
                    $headerParams[] = ['type' => 'text', 'text' => $varValue];
                }
                $components[] = [
                    'type' => 'header',
                    'parameters' => $headerParams];
            }
        }

        // Header media (IMAGE/VIDEO/DOCUMENT templates need a media parameter on send)
        if (in_array($template->header_type, ['IMAGE', 'VIDEO', 'DOCUMENT'], true)) {
            $mediaUrl = $this->resolveHeaderMediaUrl($template);
            if ($mediaUrl === '') {
                throw new \Exception("Template '{$template->name}' requires header media URL before sending");
            }

            $mediaKey = strtolower($template->header_type);
            $components[] = [
                'type' => 'header',
                'parameters' => [[
                    'type' => $mediaKey,
                    $mediaKey => [
                        'link' => $mediaUrl,
                    ],
                ]],
            ];
        }

        // Body variables
        if ($template->body_text) {
            $bodyVars = $this->extractVariables($template->body_text);
            if (count($bodyVars) > 0) {
                $bodyParams = [];
                foreach ($bodyVars as $varIndex) {
                    $varValue = $variables[$varIndex - 1] ?? '';
                    $bodyParams[] = ['type' => 'text', 'text' => $varValue];
                }
                $components[] = [
                    'type' => 'body',
                    'parameters' => $bodyParams];
            }
        }

        // Button variables (for URL buttons with dynamic suffix)
        if ($template->has_buttons) {
            $buttonIndex = 0;

            foreach ($template->buttons as $button) {
                if ($button['type'] === 'URL' && isset($button['url'])) {
                    // Check if URL has variable placeholder
                    if (strpos($button['url'], '{{1}}') !== false) {
                        $varOffset = $requiredVariables['header_count'] + $requiredVariables['body_count'] + $buttonIndex;
                        $varValue = $variables[$varOffset] ?? '';
                        $components[] = [
                            'type' => 'button',
                            'sub_type' => 'url',
                            'index' => (string) $buttonIndex,
                            'parameters' => [[
                                'type' => 'text',
                                'text' => $varValue,
                            ]],
                        ];
                        $buttonIndex++;
                    }
                }
            }
        }

        return [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $toWaId,
            'type' => 'template',
            'template' => [
                'name' => $template->name,
                'language' => [
                    'code' => $template->language],
                'components' => $components]];
    }

    /**
     * Extract required variables from template.
     */
    public function extractRequiredVariables(WhatsAppTemplate $template): array
    {
        $headerVars = [];
        $bodyVars = [];
        $buttonVars = 0;

        if ($template->header_type === 'TEXT' && $template->header_text) {
            $headerVars = $this->extractVariables($template->header_text);
        }

        if ($template->body_text) {
            $bodyVars = $this->extractVariables($template->body_text);
        }

        // Count URL button variables
        if ($template->has_buttons) {
            foreach ($template->buttons as $button) {
                if ($button['type'] === 'URL' && isset($button['url'])) {
                    if (strpos($button['url'], '{{1}}') !== false) {
                        $buttonVars++;
                    }
                }
            }
        }

        return [
            'header' => $headerVars,
            'body' => $bodyVars,
            'button' => $buttonVars,
            'header_count' => count($headerVars),
            'body_count' => count($bodyVars),
            'button_count' => $buttonVars,
            'total' => count($headerVars) + count($bodyVars) + $buttonVars];
    }

    /**
     * Extract variable indices from text (e.g., {{1}}, {{2}}).
     */
    protected function extractVariables(string $text): array
    {
        preg_match_all('/\{\{(\d+)\}\}/', $text, $matches);
        $indices = array_map('intval', $matches[1] ?? []);
        return array_unique($indices);
    }

    /**
     * Render template preview with variables filled.
     */
    public function renderPreview(WhatsAppTemplate $template, array $variables = []): array
    {
        $preview = [
            'header' => null,
            'body' => null,
            'footer' => null,
            'buttons' => []];

        // Header
        if ($template->header_type === 'TEXT' && $template->header_text) {
            $preview['header'] = $this->replaceVariables($template->header_text, $variables);
        }

        // Body
        if ($template->body_text) {
            $preview['body'] = $this->replaceVariables($template->body_text, $variables);
        }

        // Footer
        if ($template->footer_text) {
            $preview['footer'] = $template->footer_text;
        }

        // Buttons
        if ($template->has_buttons) {
            foreach ($template->buttons as $button) {
                $buttonPreview = [
                    'type' => $button['type'],
                    'text' => $button['text'] ?? ''];

                if ($button['type'] === 'URL' && isset($button['url'])) {
                    $buttonPreview['url'] = $this->replaceVariables($button['url'], $variables);
                } elseif ($button['type'] === 'PHONE_NUMBER' && isset($button['phone_number'])) {
                    $buttonPreview['phone_number'] = $button['phone_number'];
                }

                $preview['buttons'][] = $buttonPreview;
            }
        }

        return $preview;
    }

    /**
     * Replace variables in text with values.
     */
    protected function replaceVariables(string $text, array $variables): string
    {
        return preg_replace_callback('/\{\{(\d+)\}\}/', function ($matches) use ($variables) {
            $index = (int) $matches[1] - 1;
            return $variables[$index] ?? $matches[0];
        }, $text);
    }

    protected function resolveHeaderMediaUrl(WhatsAppTemplate $template): string
    {
        $mediaUrl = trim((string) ($template->header_media_url ?? ''));
        if ($mediaUrl !== '') {
            return $mediaUrl;
        }

        $components = is_array($template->components) ? $template->components : [];
        foreach ($components as $component) {
            if (strtoupper((string) ($component['type'] ?? '')) !== 'HEADER') {
                continue;
            }

            $candidate = $component['example']['header_handle'][0] ?? null;
            $candidate = is_string($candidate) ? trim($candidate) : '';
            if (str_starts_with($candidate, 'http://') || str_starts_with($candidate, 'https://')) {
                return $candidate;
            }
        }

        return '';
    }
}
