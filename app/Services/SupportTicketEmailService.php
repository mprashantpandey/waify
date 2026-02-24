<?php

namespace App\Services;

use App\Models\PlatformSetting;
use App\Models\SupportMessage;
use App\Models\SupportThread;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class SupportTicketEmailService
{
    public function __construct(
        protected PlatformSettingsService $platformSettingsService
    ) {
    }

    public function notifyPlatformTicketCreated(SupportThread $thread, SupportMessage $message): void
    {
        $this->notifyPlatform('support_ticket_created', $thread, $message, 'New support ticket');
    }

    public function notifyPlatformTenantReply(SupportThread $thread, SupportMessage $message): void
    {
        $this->notifyPlatform('support_ticket_tenant_reply', $thread, $message, 'New tenant reply on support ticket');
    }

    public function notifyTenantAdminReply(SupportThread $thread, SupportMessage $message): void
    {
        $thread->loadMissing('creator');
        $recipient = $thread->creator;
        if (! $recipient?->email) {
            return;
        }

        $this->sendTemplatedEmail(
            recipient: (string) $recipient->email,
            dedupeKey: 'support:tenant:admin_reply:'.$thread->id.':'.$recipient->id,
            dedupeMinutes: $this->cooldownMinutes(),
            subjectFallback: 'Support reply '.$this->ticketRef($thread).': '.$thread->subject,
            context: $this->context($thread, $message, [
                'recipient_name' => $recipient->name ?? 'User',
                'event_label' => 'reply',
                'ticket_link' => route('app.support.show', ['thread' => $thread->slug]),
            ]),
            bodyTextFallback: "Your support ticket has a new reply.\n\nTicket: {$thread->subject}\nTicket ID: #{$thread->slug}\nOpen ticket: ".$this->tenantTicketLink($thread)."\n\nReply:\n{$message->body}",
            bodyHtmlFallback: '<p>Your support ticket has a new reply.</p><p><strong>Ticket:</strong> '.e($thread->subject).' <br><strong>Ticket ID:</strong> #'.e($thread->slug).'<br><strong>Open ticket:</strong> <a href="'.e($this->tenantTicketLink($thread)).'">'.e($this->tenantTicketLink($thread)).'</a></p><p><strong>Reply:</strong></p><p>'.nl2br(e($message->body)).'</p>'
        );
    }

    public function notifyTenantTicketUpdated(SupportThread $thread, array $changes, ?User $actor = null): void
    {
        $thread->loadMissing('creator', 'assignee', 'account');
        $recipient = $thread->creator;
        if (! $recipient?->email) {
            return;
        }

        if (empty($changes)) {
            return;
        }

        $lines = [];
        foreach ($changes as $key => [$from, $to]) {
            $label = str_replace('_', ' ', $key);
            $lines[] = ucfirst($label).': '.($from === null || $from === '' ? '-' : (string) $from).' -> '.($to === null || $to === '' ? '-' : (string) $to);
        }

        $body = "Your support ticket was updated by platform support.\n\nTicket: {$thread->subject}\nTicket ID: #{$thread->slug}\n\n".implode("\n", $lines);

        $this->sendTemplatedEmail(
            recipient: (string) $recipient->email,
            dedupeKey: 'support:tenant:update:'.$thread->id.':'.$recipient->id,
            dedupeMinutes: 15,
            subjectFallback: 'Support ticket updated '.$this->ticketRef($thread).': '.$thread->subject,
            context: $this->context($thread, null, [
                'recipient_name' => $recipient->name ?? 'User',
                'event_label' => 'status update',
                'message_body' => implode("\n", $lines),
                'recent_ticket_message' => implode("\n", $lines),
                'ticket_link' => route('app.support.show', ['thread' => $thread->slug]),
            ]),
            bodyTextFallback: $body,
            bodyHtmlFallback: '<p>Your support ticket was updated by platform support.</p><p><strong>Ticket:</strong> '.e($thread->subject).' <br><strong>Ticket ID:</strong> #'.e($thread->slug).'</p><pre style="white-space:pre-wrap;font-family:inherit;">'.e(implode("\n", $lines)).'</pre>'
        );
    }

    public function notifyPlatformTicketUpdated(SupportThread $thread, array $changes, ?User $actor = null): void
    {
        if (empty($changes)) {
            return;
        }

        $lines = [];
        foreach ($changes as $key => [$from, $to]) {
            $label = str_replace('_', ' ', $key);
            $lines[] = ucfirst($label).': '.($from === null || $from === '' ? '-' : (string) $from).' -> '.($to === null || $to === '' ? '-' : (string) $to);
        }

        $thread->loadMissing('creator', 'account');
        foreach ($this->platformRecipients() as $recipient) {
            $this->sendTemplatedEmail(
                recipient: $recipient,
                dedupeKey: 'support:platform:update:'.$thread->id.':'.sha1($recipient),
                dedupeMinutes: 10,
            subjectFallback: 'Support ticket updated '.$this->ticketRef($thread).': '.$thread->subject,
                context: $this->context($thread, null, [
                    'recipient_name' => 'Support',
                    'event_label' => 'ticket update',
                    'message_body' => implode("\n", $lines),
                    'recent_ticket_message' => implode("\n", $lines),
                    'ticket_link' => route('platform.support.show', ['thread' => $thread->slug]),
                ]),
                bodyTextFallback: "Ticket updated: {$thread->subject} ({$thread->slug})\n".implode("\n", $lines),
                bodyHtmlFallback: '<p>Support ticket updated: <strong>'.e($thread->subject).'</strong> (#'.e($thread->slug).')</p><pre style="white-space:pre-wrap;font-family:inherit;">'.e(implode("\n", $lines)).'</pre>'
            );
        }
    }

    protected function notifyPlatform(string $eventKey, SupportThread $thread, SupportMessage $message, string $subjectPrefix): void
    {
        foreach ($this->platformRecipients() as $recipient) {
            $this->sendTemplatedEmail(
                recipient: $recipient,
                dedupeKey: 'support:platform:'.$eventKey.':'.$thread->id.':'.sha1($recipient),
                dedupeMinutes: $this->cooldownMinutes(),
                subjectFallback: $subjectPrefix.' '.$this->ticketRef($thread).': '.$thread->subject,
                context: $this->context($thread, $message, [
                    'recipient_name' => 'Support',
                    'event_label' => $eventKey,
                    'ticket_link' => route('platform.support.show', ['thread' => $thread->slug]),
                ]),
                bodyTextFallback: "Ticket: {$thread->subject}\nTicket ID: #{$thread->slug}\nOpen ticket: ".$this->platformTicketLink($thread)."\nTenant: {$thread->account?->name}\nFrom: {$thread->creator?->email}\n\nMessage:\n{$message->body}",
                bodyHtmlFallback: '<p><strong>Ticket:</strong> '.e($thread->subject).' <br><strong>Ticket ID:</strong> #'.e($thread->slug).'<br><strong>Open ticket:</strong> <a href="'.e($this->platformTicketLink($thread)).'">'.e($this->platformTicketLink($thread)).'</a><br><strong>Tenant:</strong> '.e((string) ($thread->account?->name ?? '-')).'<br><strong>From:</strong> '.e((string) ($thread->creator?->email ?? '-')).'</p><p><strong>Message:</strong></p><p>'.nl2br(e($message->body)).'</p>'
            );
        }
    }

    /** @return array<int,string> */
    protected function platformRecipients(): array
    {
        $emails = [];

        $supportEmail = PlatformSetting::get('branding.support_email') ?: PlatformSetting::get('general.support_email');
        if (is_string($supportEmail) && filter_var($supportEmail, FILTER_VALIDATE_EMAIL)) {
            $emails[] = strtolower($supportEmail);
        }

        $adminEmails = $this->platformAdminQuery()
            ->whereNotNull('email')
            ->pluck('email')
            ->map(fn ($email) => strtolower(trim((string) $email)))
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->all();

        return array_values(array_unique(array_merge($emails, $adminEmails)));
    }

    protected function cooldownMinutes(): int
    {
        $minutes = PlatformSetting::get('mail.support_ticket_email_cooldown_minutes', null);
        if ($minutes === null) {
            $minutes = PlatformSetting::get('support.ticket_email_cooldown_minutes', 60);
        }
        return max(1, (int) $minutes);
    }

    protected function platformAdminQuery()
    {
        $query = User::query();

        if (Schema::hasColumn('users', 'is_platform_admin')) {
            return $query->where('is_platform_admin', true);
        }

        if (Schema::hasColumn('users', 'is_super_admin')) {
            return $query->where('is_super_admin', true);
        }

        return $query->whereRaw('1 = 0');
    }

    protected function sendTemplatedEmail(string $recipient, string $dedupeKey, int $dedupeMinutes, string $subjectFallback, array $context, string $bodyTextFallback, string $bodyHtmlFallback): void
    {
        if (! Cache::add($dedupeKey, now()->timestamp, now()->addMinutes($dedupeMinutes))) {
            return;
        }

        try {
            [$subject, $bodyText, $bodyHtml] = $this->renderTemplate('support_notification', $context, $subjectFallback, $bodyTextFallback, $bodyHtmlFallback);

            Mail::html($bodyHtml, function ($message) use ($recipient, $subject) {
                $message->to($recipient)->subject($subject);
            });
        } catch (\Throwable $e) {
            Log::warning('Support ticket email send failed', [
                'recipient' => $recipient,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** @return array{0:string,1:string,2:string} */
    protected function renderTemplate(string $templateKey, array $context, string $subjectFallback, string $bodyTextFallback, string $bodyHtmlFallback): array
    {
        $template = $this->platformSettingsService->getEmailTemplate($templateKey);
        if (! $template) {
            return [$subjectFallback, $bodyTextFallback, $bodyHtmlFallback];
        }

        $replace = [];
        foreach ($context as $key => $value) {
            $replace['{{'.$key.'}}'] = (string) ($value ?? '');
        }

        // Backward-compatible aliases for older/customized template placeholders.
        $aliases = [
            'message_body' => ['message', 'body', 'reply_message', 'ticket_message'],
            'recent_ticket_message' => ['recent_message', 'last_message', 'latest_message'],
            'ticket_subject' => ['subject', 'ticket', 'thread_subject'],
            'ticket_id' => ['thread_id', 'ticket_slug'],
            'ticket_link' => ['link', 'ticket_url', 'thread_link'],
            'recipient_name' => ['user_name', 'customer_name'],
            'tenant_name' => ['account_name', 'workspace_name'],
            'ticket_status' => ['status'],
            'ticket_priority' => ['priority'],
        ];
        foreach ($aliases as $source => $targets) {
            if (!array_key_exists($source, $context)) {
                continue;
            }
            $value = (string) ($context[$source] ?? '');
            foreach ($targets as $target) {
                $replace['{{'.$target.'}}'] ??= $value;
            }
        }

        $subject = strtr((string) ($template['subject'] ?? $subjectFallback), $replace);
        $bodyText = strtr((string) ($template['body_text'] ?? $bodyTextFallback), $replace);
        $bodyHtml = strtr((string) ($template['body_html'] ?? $bodyHtmlFallback), $replace);

        return [$subject, $bodyText, $bodyHtml];
    }

    protected function context(SupportThread $thread, ?SupportMessage $message = null, array $extra = []): array
    {
        $thread->loadMissing('account', 'creator');

        return array_merge([
            'name' => $thread->creator?->name ?? 'User',
            'email' => $thread->creator?->email ?? '',
            'recipient_name' => $thread->creator?->name ?? 'User',
            'platform_name' => (string) (PlatformSetting::get('branding.platform_name') ?: PlatformSetting::get('general.platform_name') ?: config('app.name', 'Waify')),
            'support_email' => (string) (PlatformSetting::get('branding.support_email') ?: PlatformSetting::get('general.support_email') ?: config('mail.from.address', '')),
            'ticket_subject' => $thread->subject,
            'ticket_id' => '#'.$thread->slug,
            'ticket_link' => route('app.support.show', ['thread' => $thread->slug]),
            'tenant_ticket_link' => route('app.support.show', ['thread' => $thread->slug]),
            'platform_ticket_link' => route('platform.support.show', ['thread' => $thread->slug]),
            'ticket_status' => (string) $thread->status,
            'ticket_priority' => (string) ($thread->priority ?? 'normal'),
            'tenant_name' => (string) ($thread->account?->name ?? ''),
            'message_body' => (string) ($message?->body ?? ''),
            'recent_ticket_message' => (string) ($message?->body ?? ''),
            // Backward-compatible aliases for existing customized templates
            'message' => (string) ($message?->body ?? ''),
            'subject' => (string) $thread->subject,
            'event_label' => 'notification',
        ], $extra);
    }

    protected function ticketRef(SupportThread $thread): string
    {
        return '#'.$thread->slug;
    }

    protected function tenantTicketLink(SupportThread $thread): string
    {
        return route('app.support.show', ['thread' => $thread->slug]);
    }

    protected function platformTicketLink(SupportThread $thread): string
    {
        return route('platform.support.show', ['thread' => $thread->slug]);
    }
}
