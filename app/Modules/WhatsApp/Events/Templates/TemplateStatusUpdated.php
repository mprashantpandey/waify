<?php

namespace App\Modules\WhatsApp\Events\Templates;

use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TemplateStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public WhatsAppTemplate $template
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("account.{$this->template->account_id}.whatsapp.templates"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'whatsapp.template.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'account_id' => $this->template->account_id,
            'template' => [
                'id' => $this->template->id,
                'slug' => $this->template->slug,
                'status' => $this->template->status,
                'last_meta_error' => $this->template->last_meta_error,
                'rejection_reason' => $this->template->rejection_reason,
                'last_synced_at' => $this->template->last_synced_at?->toIso8601String(),
            ],
        ];
    }
}

