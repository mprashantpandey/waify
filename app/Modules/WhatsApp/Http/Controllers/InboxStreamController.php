<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppConversationNote;
use App\Modules\WhatsApp\Models\WhatsAppConversationAuditEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Carbon;

class InboxStreamController extends Controller
{
    /**
     * Stream inbox updates (for polling fallback).
     */
    public function stream(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $since = $request->query('since');
        $sinceDate = $since ? Carbon::parse($since) : Carbon::now()->subMinutes(5);

        // Get conversations updated since timestamp
        $updatedConversations = WhatsAppConversation::where('account_id', $account->id)
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
                    'account_id' => $conversation->account_id,
                    'contact' => [
                        'id' => $conversation->contact->id,
                        'wa_id' => $conversation->contact->wa_id,
                        'name' => $conversation->contact->name ?? $conversation->contact->wa_id],
                    'status' => $conversation->status,
                    'last_message_preview' => $conversation->last_message_preview,
                    'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                    'connection' => [
                        'id' => $conversation->connection->id,
                        'name' => $conversation->connection->name,
                    ],
                    'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to')
                        ? $conversation->assigned_to
                        : null,
                    'priority' => Schema::hasColumn('whatsapp_conversations', 'priority')
                        ? $conversation->priority
                        : null,
                ];
            });

        // Get new message notifications (conversations with new messages)
        $newMessageNotifications = WhatsAppConversation::where('account_id', $account->id)
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
                    'last_activity_at' => $conversation->last_message_at?->toIso8601String()];
            });

        return response()->json([
            'server_time' => now()->toIso8601String(),
            'updated_conversations' => $updatedConversations,
            'new_message_notifications' => $newMessageNotifications]);
    }

    /**
     * Stream conversation updates (for polling fallback).
     */
    public function conversationStream(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure conversation belongs to account
        if ((int) $conversation->account_id !== (int) $account->id) {
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
                    'read_at' => $message->read_at?->toIso8601String()];
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
                    'read_at' => $message->read_at?->toIso8601String()];
            });

        $newNotes = WhatsAppConversationNote::where('whatsapp_conversation_id', $conversation->id)
            ->where('id', '>', $afterNoteId)
            ->with('creator:id,name,email')
            ->orderBy('id')
            ->limit(50)
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'note' => $note->note,
                    'created_at' => $note->created_at->toIso8601String(),
                    'created_by' => $note->creator ? [
                        'id' => $note->creator->id,
                        'name' => $note->creator->name,
                        'email' => $note->creator->email,
                    ] : null,
                ];
            });

        $newAuditEvents = WhatsAppConversationAuditEvent::where('whatsapp_conversation_id', $conversation->id)
            ->where('id', '>', $afterAuditId)
            ->with('actor:id,name,email')
            ->orderBy('id')
            ->limit(50)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'event_type' => $event->event_type,
                    'description' => $event->description,
                    'meta' => $event->meta,
                    'created_at' => $event->created_at->toIso8601String(),
                    'actor' => $event->actor ? [
                        'id' => $event->actor->id,
                        'name' => $event->actor->name,
                        'email' => $event->actor->email,
                    ] : null,
                ];
            });

        // Conversation meta if changed
        $conversationChanged = $conversation->updated_at > now()->subMinutes(5);
        $conversationMeta = null;
        if ($conversationChanged) {
            $conversationMeta = [
                'id' => $conversation->id,
                'status' => $conversation->status,
            ];

            if (Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
                $conversationMeta['assigned_to'] = $conversation->assigned_to;
            }

            if (Schema::hasColumn('whatsapp_conversations', 'priority')) {
                $conversationMeta['priority'] = $conversation->priority;
            }
        }

        return response()->json([
            'new_messages' => $newMessages,
            'updated_messages' => $updatedMessages,
            'new_notes' => $newNotes,
            'new_audit_events' => $newAuditEvents,
            'conversation' => $conversationMeta]);
    }
}
