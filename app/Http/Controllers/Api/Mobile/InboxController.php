<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Services\SendPolicyService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InboxController extends Controller
{
    protected WhatsAppClient $whatsappClient;
    protected SendPolicyService $sendPolicyService;
    
    public function __construct(WhatsAppClient $whatsappClient, SendPolicyService $sendPolicyService)
    {
        $this->whatsappClient = $whatsappClient;
        $this->sendPolicyService = $sendPolicyService;
    }

    protected function getAccountId(Request $request): int
    {
        $accountId = $request->header('X-Account-ID');
        if (!$accountId) {
             $accountId = $request->user()->accounts()->first()?->id;
        }
        if (!$accountId) {
            abort(403, 'No account selected or available.');
        }
        return $accountId;
    }

    /**
     * List all recent conversations for the account.
     */
    public function index(Request $request)
    {
        $accountId = $this->getAccountId($request);
        
        $conversations = WhatsAppConversation::where('account_id', $accountId)
            ->with(['contact', 'connection'])
            ->orderBy('last_message_at', 'desc')
            ->paginate(20)
            ->through(function ($conv) {
                return [
                    'id' => $conv->id,
                    'contact_name' => $conv->contact?->name,
                    'contact_phone' => $conv->contact?->phone_number,
                    'status' => $conv->status,
                    'is_read' => (bool) $conv->is_read,
                    'last_message_at' => $conv->last_message_at?->toIso8601String(),
                    'last_message_preview' => Str::limit($conv->last_message_body ?? '', 50),
                    'connection_name' => $conv->connection?->name,
                ];
            });

        return response()->json($conversations);
    }

    /**
     * Get a specific conversation and its recent messages.
     */
    public function show(Request $request, $id)
    {
        $accountId = $this->getAccountId($request);
        
        $conversation = WhatsAppConversation::where('account_id', $accountId)
            ->with(['contact', 'connection'])
            ->findOrFail($id);
            
        // Load the 30 most recent messages
        $messages = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'direction' => $msg->direction,
                    'type' => $msg->type,
                    'status' => $msg->status,
                    'content' => [
                        'text' => $msg->text_body,
                        'media_url' => $msg->media_url,
                        'caption' => $msg->media_caption,
                    ],
                    'created_at' => $msg->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'contact_name' => $conversation->contact?->name,
                'contact_phone' => $conversation->contact?->phone_number,
                'status' => $conversation->status,
                'is_read' => (bool) $conversation->is_read,
            ],
            'messages' => $messages
        ]);
    }

    /**
     * Send a text message in an existing conversation.
     */
    public function sendMessage(Request $request, $id)
    {
        $accountId = $this->getAccountId($request);
        
        $validated = $request->validate([
            'text' => 'required|string|max:4096',
        ]);
        
        $conversation = WhatsAppConversation::where('account_id', $accountId)
            ->with(['contact', 'connection'])
            ->findOrFail($id);

        $policy = $this->sendPolicyService->evaluateConversationFreeForm($conversation);
        if (!($policy['allowed'] ?? false)) {
            return response()->json([
                'message' => (string) ($policy['reason_code'] ?? 'outside_24h'),
                'message_detail' => (string) ($policy['reason_message'] ?? '24-hour customer care window is closed. Send an approved template message to reopen the conversation.'),
                'customer_care_window' => [
                    'is_open' => (bool) (($policy['window']['is_open'] ?? false)),
                    'last_inbound_at' => ($policy['window']['last_inbound_at'] ?? null)?->toIso8601String(),
                    'expires_at' => ($policy['window']['expires_at'] ?? null)?->toIso8601String(),
                    'seconds_remaining' => (int) ($policy['window']['seconds_remaining'] ?? 0),
                ],
            ], 422);
        }

        try {
            DB::beginTransaction();
            
            // 1. Send via API
            $response = $this->whatsappClient->sendTextMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $validated['text']
            );
            
            // 2. Save to DB
            $message = $conversation->messages()->create([
                'account_id' => $accountId,
                'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
                'whatsapp_contact_id' => $conversation->whatsapp_contact_id,
                'direction' => 'outbound',
                'type' => 'text',
                'status' => 'sent',
                'meta_message_id' => $response['messages'][0]['id'] ?? Str::random(32),
                'text_body' => $validated['text'],
            ]);
            
            // 3. Update Conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_body' => 'You: ' . Str::limit($validated['text'], 50),
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Message sent successfully',
                'data' => [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'status' => $message->status,
                    'content' => [
                        'text' => $message->text_body,
                        'media_url' => null,
                        'caption' => null,
                    ],
                    'created_at' => $message->created_at->toIso8601String(),
                ]
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to send message: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Mark a conversation as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $accountId = $this->getAccountId($request);
        
        $conversation = WhatsAppConversation::where('account_id', $accountId)
            ->findOrFail($id);
            
        $conversation->update(['is_read' => true]);
        
        return response()->json(['message' => 'Conversation marked as read']);
    }
}
