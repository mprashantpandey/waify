<?php

namespace App\Modules\Support\Events;

use App\Modules\Support\Models\SupportMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public SupportMessage $message)
    {
    }

    public function broadcastOn(): array
    {
        $thread = $this->message->thread;
        $workspaceId = $thread?->workspace_id;
        $threadId = $thread?->id;

        $channels = [];
        if ($workspaceId && $threadId) {
            $channels[] = new PrivateChannel("workspace.{$workspaceId}.support.thread.{$threadId}");
        }
        $channels[] = new PrivateChannel('platform.support');

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'support.message.created';
    }

    public function broadcastWith(): array
    {
        $thread = $this->message->thread;
        $this->message->loadMissing('attachments');
        $attachments = $this->message->attachments->map(function ($attachment) {
            return [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_path' => $attachment->file_path,
                'mime_type' => $attachment->mime_type,
                'file_size' => $attachment->file_size,
                'url' => route('support.attachments.show', ['attachment' => $attachment->id]),
            ];
        })->values();

        return [
            'id' => $this->message->id,
            'thread_id' => $this->message->support_thread_id,
            'workspace_id' => $thread?->workspace_id,
            'sender_type' => $this->message->sender_type,
            'sender_id' => $this->message->sender_id,
            'body' => $this->message->body,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'attachments' => $attachments,
        ];
    }
}
