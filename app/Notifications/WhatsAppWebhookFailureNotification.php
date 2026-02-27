<?php

namespace App\Notifications;

use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WhatsAppWebhookFailureNotification extends Notification
{
    use Queueable;

    public function __construct(
        protected WhatsAppConnection $connection,
        protected string $errorMessage
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $connectionName = $this->connection->name ?: ('Connection #' . $this->connection->id);
        $safeError = mb_substr($this->errorMessage, 0, 300);
        $healthUrl = route('app.whatsapp.connections.health', ['connection' => $this->connection->slug ?? $this->connection->id]);

        return (new MailMessage())
            ->subject("WhatsApp Webhook Alert: {$connectionName}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your WhatsApp connection '{$connectionName}' reported a webhook processing issue.")
            ->line("Error: {$safeError}")
            ->action('Open Connection Health', $healthUrl)
            ->line('This alert helps you restore message sync quickly.');
    }

    public function fingerprint(): string
    {
        return 'whatsapp_webhook_failure:' . $this->connection->id . ':' . sha1($this->errorMessage);
    }
}

