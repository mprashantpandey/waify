<?php

namespace App\Services;

/**
 * Default system email templates. These keys cannot be deleted; they are always present.
 */
class SystemEmailTemplateDefaults
{
    /** @var array<string, array{key: string, name: string, subject: string, body_html: string, body_text: string, placeholders: array}>|null */
    private static ?array $defaults = null;

    /**
     * @return array<string, array{key: string, name: string, subject: string, body_html: string, body_text: string, placeholders: array}>
     */
    public static function all(): array
    {
        if (self::$defaults !== null) {
            return self::$defaults;
        }
        self::$defaults = [
            'welcome' => [
                'key' => 'welcome',
                'name' => 'Welcome email',
                'subject' => 'Welcome to {{platform_name}}',
                'body_html' => '<p>Hello {{name}},</p><p>Welcome to {{platform_name}}. Your account has been created.</p><p>If you have any questions, contact us at {{support_email}}.</p>',
                'body_text' => "Hello {{name}},\n\nWelcome to {{platform_name}}. Your account has been created.\n\nIf you have any questions, contact us at {{support_email}}.",
                'placeholders' => ['{{name}}', '{{email}}', '{{platform_name}}', '{{support_email}}'],
            ],
            'password_reset' => [
                'key' => 'password_reset',
                'name' => 'Password reset',
                'subject' => 'Reset your {{platform_name}} password',
                'body_html' => '<p>Hello {{name}},</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="{{reset_link}}">Reset password</a></p><p>If you did not request this, ignore this email. The link expires in 60 minutes.</p>',
                'body_text' => "Hello {{name}},\n\nYou requested a password reset. Open this link to set a new password:\n{{reset_link}}\n\nIf you did not request this, ignore this email. The link expires in 60 minutes.",
                'placeholders' => ['{{name}}', '{{email}}', '{{reset_link}}', '{{platform_name}}'],
            ],
            'email_verification' => [
                'key' => 'email_verification',
                'name' => 'Email verification',
                'subject' => 'Verify your email for {{platform_name}}',
                'body_html' => '<p>Hello {{name}},</p><p>Please verify your email address by clicking the link below:</p><p><a href="{{verification_link}}">Verify email</a></p>',
                'body_text' => "Hello {{name}},\n\nPlease verify your email by opening this link:\n{{verification_link}}",
                'placeholders' => ['{{name}}', '{{email}}', '{{verification_link}}', '{{platform_name}}'],
            ],
            'phone_verification' => [
                'key' => 'phone_verification',
                'name' => 'Phone verification code',
                'subject' => 'Your verification code',
                'body_html' => '<p>Hello {{name}},</p><p>Your verification code for {{phone}} is: <strong>{{code}}</strong></p><p>It expires in 10 minutes.</p>',
                'body_text' => "Hello {{name}},\n\nYour verification code for {{phone}} is: {{code}}\n\nIt expires in 10 minutes.",
                'placeholders' => ['{{name}}', '{{phone}}', '{{code}}', '{{platform_name}}'],
            ],
            'support_notification' => [
                'key' => 'support_notification',
                'name' => 'Support ticket notification',
                'subject' => '[{{platform_name}} Support] {{event_label}} · {{ticket_subject}}',
                'body_html' => '<p>Hello {{recipient_name}},</p><p>Support ticket notification for <strong>{{ticket_subject}}</strong> ({{ticket_id}}).</p><p><strong>Tenant:</strong> {{tenant_name}}<br><strong>Status:</strong> {{ticket_status}}<br><strong>Priority:</strong> {{ticket_priority}}</p><p><strong>Recent Message:</strong></p><p>{{recent_ticket_message}}</p><p><a href="{{ticket_link}}">Open ticket</a></p>',
                'body_text' => "Hello {{recipient_name}},\n\nSupport ticket notification for {{ticket_subject}} ({{ticket_id}}).\nTenant: {{tenant_name}}\nStatus: {{ticket_status}}\nPriority: {{ticket_priority}}\n\nRecent Message:\n{{recent_ticket_message}}\n\nOpen ticket: {{ticket_link}}",
                'placeholders' => ['{{recipient_name}}', '{{event_label}}', '{{ticket_subject}}', '{{ticket_id}}', '{{ticket_link}}', '{{tenant_name}}', '{{ticket_status}}', '{{ticket_priority}}', '{{recent_ticket_message}}', '{{message_body}}', '{{platform_name}}'],
            ],
        ];
        return self::$defaults;
    }

    /**
     * @return array<string>
     */
    public static function keys(): array
    {
        return array_keys(self::all());
    }

    /**
     * Merge saved/custom templates with system defaults. System keys always present; overrides from saved; custom templates appended.
     *
     * @param array<int, array> $saved
     * @return array<int, array{key: string, name: string, subject: string, body_html: string, body_text: string, placeholders: array}>
     */
    public static function mergeWithSaved(array $saved): array
    {
        $defaults = self::all();
        $byKey = [];
        foreach ($saved as $t) {
            $key = trim((string) ($t['key'] ?? ''));
            if ($key !== '') {
                $byKey[$key] = [
                    'key' => $key,
                    'name' => trim((string) ($t['name'] ?? '')),
                    'subject' => trim((string) ($t['subject'] ?? '')),
                    'body_html' => trim((string) ($t['body_html'] ?? '')),
                    'body_text' => trim((string) ($t['body_text'] ?? '')),
                    'placeholders' => array_values(array_filter(array_map('trim', (array) ($t['placeholders'] ?? [])))),
                ];
            }
        }
        $merged = [];
        foreach ($defaults as $sysKey => $default) {
            $merged[] = $byKey[$sysKey] ?? $default;
        }
        foreach ($saved as $t) {
            $key = trim((string) ($t['key'] ?? ''));
            if ($key !== '' && !isset($defaults[$key])) {
                $merged[] = [
                    'key' => $key,
                    'name' => trim((string) ($t['name'] ?? '')),
                    'subject' => trim((string) ($t['subject'] ?? '')),
                    'body_html' => trim((string) ($t['body_html'] ?? '')),
                    'body_text' => trim((string) ($t['body_text'] ?? '')),
                    'placeholders' => array_values(array_filter(array_map('trim', (array) ($t['placeholders'] ?? [])))),
                ];
            }
        }
        return $merged;
    }
}
