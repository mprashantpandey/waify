<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class InboxStreamController extends Controller
{
    /**
     * Stream inbox updates (for polling fallback).
     */
    public function stream(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $since = $request->query('since');
        $sinceDate = $since ? Carbon::parse($since) : Carbon::now()->subMinutes(5);

        // Get conversations updated since timestamp
        $updatedConversations = WhatsAppConversation::where('workspace_id', $workspace->id)
            ->where(function ($query) use ($sinceDate) {
                $query->where('updated_at', '>', $sinceDate)
                    ->orWhere('last_message_at', '>', $sinceDate);
            })
            ->with(['contact', 'connection'])
            ->orderBy('last_message_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($conversation) {
                return [
                    'id' => $conversation->id,
                    'contact' => [
                        'id' => $conversation->contact->id,
                        'wa_id' => $conversation->contact->wa_id,
                        'name' => $conversation->contact->name ?? $conversation->contact->wa_id,
                    ],
                    'status' => $conversation->status,
                    'last_message_preview' => $conversation->last_message_preview,
                    'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                    'connection' => [
                        'name' => $conversation->connection->name,
                    ],
                ];
            });

        // Get new message notifications (conversations with new messages)
        $newMessageNotifications = WhatsAppConversation::where('workspace_id', $workspace->id)
            ->whereHas('messages', function ($query) use ($sinceDate) {
                $query->where('created_at', '>', $sinceDate)
                    ->where('direction', 'inbound');
            })
            ->with(['contact'])
            ->get()
            ->map(function ($conversation) {
                return [
                    'conversation_id' => $conversation->id,
                    'last_message_preview' => $conversation->last_message_preview,
                    'last_activity_at' => $conversation->last_message_at?->toIso8601String(),
                ];
            });

        return response()->json([
            'server_time' => now()->toIso8601String(),
            'updated_conversations' => $updatedConversations,
            'new_message_notifications' => $newMessageNotifications,
        ]);
    }

    /**
     * Stream conversation updates (for polling fallback).
     */
    public function conversationStream(Request $request, WhatsAppConversation $conversation)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        // Ensure conversation belongs to workspace
        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $afterMessageId = $request->query('after_message_id', 0);
        $afterNoteId = $request->query('after_note_id', 0);
        $afterAuditId = $request->query('after_audit_id', 0);

        // Get new messages
        $newMessages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->where('id', '>', $afterMessageId)
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'created_at' => $message->created_at->toIso8601String(),
                    'sent_at' => $message->sent_at?->toIso8601String(),
                    'delivered_at' => $message->delivered_at?->toIso8601String(),
                    'read_at' => $message->read_at?->toIso8601String(),
                ];
            });

        // Get updated messages (status changes) - simplified, just return recent status changes
        $updatedMessages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->where('id', '>', $afterMessageId)
            ->where(function ($query) {
                $query->whereNotNull('sent_at')
                    ->orWhereNotNull('delivered_at')
                    ->orWhereNotNull('read_at');
            })
            ->orderBy('updated_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'status' => $message->status,
                    'sent_at' => $message->sent_at?->toIso8601String(),
                    'delivered_at' => $message->delivered_at?->toIso8601String(),
                    'read_at' => $message->read_at?->toIso8601String(),
                ];
            });

        // Notes and audit events - placeholder for future implementation
        $newNotes = [];
        $newAuditEvents = [];

        // Conversation meta if changed
        $conversationChanged = $conversation->updated_at > now()->subMinutes(5);
        $conversationMeta = $conversationChanged
            ? [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'priority' => $conversation->priority ?? null,
                'assignee_id' => $conversation->assignee_id ?? null,
            ]
            : null;

        return response()->json([
            'new_messages' => $newMessages,
            'updated_messages' => $updatedMessages,
            'new_notes' => $newNotes,
            'new_audit_events' => $newAuditEvents,
            'conversation' => $conversationMeta,
        ]);
    }
}
