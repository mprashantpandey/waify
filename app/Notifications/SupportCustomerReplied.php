<?php

namespace App\Notifications;

use App\Modules\Support\Models\SupportThread;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class SupportCustomerReplied extends Notification implements ShouldQueue
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
        return "support_customer_replied:thread:{$this->thread->id}";
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
            ->line('Account: ' . ($this->thread->account?->name ?? 'Unknown'))
            ->action('View Ticket', $url)
            ->line('Please respond as soon as possible.');
    }
}
