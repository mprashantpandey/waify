<?php

namespace App\Notifications;

use App\Modules\Support\Models\SupportThread;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SupportAgentReplied extends Notification
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
        $subject = 'Support replied: ' . $this->thread->subject;
        $url = route('app.support.show', [
            'thread' => $this->thread->slug ?? $this->thread->id]);

        return (new MailMessage)
            ->subject($subject)
            ->greeting('Hello!')
            ->line('Support has replied to your request.')
            ->line('Subject: ' . $this->thread->subject)
            ->action('View Reply', $url)
            ->line('If you need more help, reply to the thread.');
    }
}
