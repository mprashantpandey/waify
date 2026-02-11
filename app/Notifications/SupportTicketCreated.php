<?php

namespace App\Notifications;

use App\Modules\Support\Models\SupportThread;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SupportTicketCreated extends Notification implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [30, 120, 300];

    public function __construct(protected SupportThread $thread)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function fingerprint(): string
    {
        return "support_ticket_created:thread:{$this->thread->id}";
    }

    public function toMail(object $notifiable): MailMessage
    {
        $subject = 'New support ticket: ' . $this->thread->subject;
        $url = route('platform.support.show', ['thread' => $this->thread->slug ?? $this->thread->id]);

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello!')
            ->line('A new support ticket has been created.')
            ->line('Subject: ' . $this->thread->subject)
            ->line('Account: ' . ($this->thread->account?->name ?? 'Unknown'))
            ->action('View Ticket', $url)
            ->line('Please respond within the SLA window.');
    }
}
