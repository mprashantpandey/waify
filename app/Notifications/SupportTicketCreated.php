<?php

namespace App\Notifications;

use App\Modules\Support\Models\SupportThread;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SupportTicketCreated extends Notification
{
    use Queueable;

    public function __construct(protected SupportThread $thread)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
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
