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
        // Ensure thread relationship is loaded
        if (!$this->message->relationLoaded('thread')) {
            $this->message->load('thread');
        }
        
        $thread = $this->message->thread;
        $accountId = $thread?->account_id;
        $threadId = $thread?->id;

        \Log::debug('SupportMessageCreated broadcasting', [
            'message_id' => $this->message->id,
            'thread_id' => $threadId,
            'account_id' => $accountId,
            'has_thread' => $thread !== null,
        ]);

        $channels = [];
        if ($accountId && $threadId) {
            $channels[] = new PrivateChannel("account.{$accountId}.support.thread.{$threadId}");
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
        // Ensure thread relationship is loaded
        if (!$this->message->relationLoaded('thread')) {
            $this->message->load('thread');
        }
        
        $thread = $this->message->thread;
        $this->message->loadMissing('attachments');
        $attachments = $this->message->attachments->map(function ($attachment) {
            return [
                'id' => $attachment->id,
                'file_name' => $attachment->file_name,
                'file_path' => $attachment->file_path,
                'mime_type' => $attachment->mime_type,
                'file_size' => $attachment->file_size,
                'url' => route('support.attachments.show', ['attachment' => $attachment->id])];
        })->values();

        $data = [
            'id' => $this->message->id,
            'thread_id' => $this->message->support_thread_id,
            'account_id' => $thread?->account_id,
            'sender_type' => $this->message->sender_type,
            'sender_id' => $this->message->sender_id,
            'body' => $this->message->body,
            'created_at' => $this->message->created_at?->toIso8601String(),
            'attachments' => $attachments];
        
        \Log::debug('SupportMessageCreated broadcastWith', [
            'message_id' => $this->message->id,
            'data' => $data,
        ]);

        return $data;
    }
}
