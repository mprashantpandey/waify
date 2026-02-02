<?php

namespace App\Notifications;

use App\Modules\Support\Models\SupportThread;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SupportCustomerReplied extends Notification
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
        $subject = 'Customer replied: ' . $this->thread->subject;
        $url = route('platform.support.show', ['thread' => $this->thread->slug ?? $this->thread->id]);

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello!')
            ->line('A customer replied to a support ticket.')
            ->line('Subject: ' . $this->thread->subject)
            ->line('Workspace: ' . ($this->thread->workspace?->name ?? 'Unknown'))
            ->action('View Ticket', $url)
            ->line('Please respond as soon as possible.');
    }
}
