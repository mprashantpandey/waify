<?php

namespace App\Http\Controllers\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\AccountMetaLead;
use App\Models\AccountIntegration;
use App\Models\AppNotification;
use App\Models\PaymentOrder;
use App\Models\QuickReply;
use App\Models\PlatformSetting;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Models\WhatsAppCall;
use App\Models\WhatsAppCallVoiceSession;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Events\Inbox\CallUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class MobileDataController extends Controller
{
    public function __construct(protected WhatsAppClient $whatsappClient) {}

    public function dashboard(Request $request): JsonResponse
    {
        $account = $this->account($request);

        return response()->json([
            'summary' => [
                'unread' => $this->unreadCount($account),
                'open_conversations' => WhatsAppConversation::where('account_id', $account->id)
                    ->whereIn('status', ['open', 'pending'])
                    ->count(),
                'contacts' => WhatsAppContact::where('account_id', $account->id)->count(),
                'leads' => AccountMetaLead::where('account_id', $account->id)->count(),
                'alerts' => AppNotification::where('account_id', $account->id)
                    ->whereNull('read_at')
                    ->count(),
            ],
        ]);
    }

    public function tools(Request $request): JsonResponse
    {
        $account = $this->account($request);

        $campaigns = Schema::hasTable('campaigns')
            ? Campaign::query()->where('account_id', $account->id)
            : null;
        $templates = Schema::hasTable('whatsapp_templates')
            ? WhatsAppTemplate::query()->where('account_id', $account->id)
            : null;
        $bots = Schema::hasTable('bots')
            ? Bot::query()->where('account_id', $account->id)
            : null;
        $integrations = Schema::hasTable('account_integrations')
            ? AccountIntegration::query()->where('account_id', $account->id)
            : null;

        return response()->json([
            'summary' => [
                'unread' => $this->unreadCount($account),
                'open_conversations' => WhatsAppConversation::where('account_id', $account->id)
                    ->whereIn('status', ['open', 'pending'])
                    ->count(),
                'contacts' => WhatsAppContact::where('account_id', $account->id)->count(),
                'leads' => AccountMetaLead::where('account_id', $account->id)->count(),
                'quick_replies' => QuickReply::where('account_id', $account->id)->count(),
                'calls' => Schema::hasTable('ai_voice_calls') ? WhatsAppCall::where('account_id', $account->id)->count() : 0,
                'alerts' => AppNotification::where('account_id', $account->id)->whereNull('read_at')->count(),
            ],
            'modules' => [
                'campaigns' => [
                    'count' => $campaigns ? (clone $campaigns)->count() : 0,
                    'active' => $campaigns ? (clone $campaigns)->whereIn('status', ['scheduled', 'sending', 'running'])->count() : 0,
                    'latest' => $campaigns ? (clone $campaigns)->latest()->limit(3)->get()->map(fn (Campaign $campaign) => [
                        'id' => $campaign->id,
                        'name' => $campaign->name,
                        'status' => $campaign->status,
                        'sent_count' => $campaign->sent_count,
                        'failed_count' => $campaign->failed_count,
                        'updated_at' => $campaign->updated_at?->toIso8601String(),
                    ])->values() : [],
                ],
                'templates' => [
                    'count' => $templates ? (clone $templates)->count() : 0,
                    'approved' => $templates ? (clone $templates)->whereIn('status', ['APPROVED', 'approved'])->count() : 0,
                    'rejected' => $templates ? (clone $templates)->whereIn('status', ['REJECTED', 'rejected'])->count() : 0,
                ],
                'automations' => [
                    'count' => $bots ? (clone $bots)->count() : 0,
                    'active' => $bots ? (clone $bots)->where('status', 'active')->count() : 0,
                    'paused' => $bots ? (clone $bots)->where('status', 'paused')->count() : 0,
                ],
                'integrations' => [
                    'count' => $integrations ? (clone $integrations)->count() : 0,
                    'connected' => $integrations ? (clone $integrations)->where('status', 'connected')->count() : 0,
                    'needs_attention' => $integrations ? (clone $integrations)->whereNotNull('last_error')->count() : 0,
                ],
                'segments' => [
                    'count' => Schema::hasTable('contact_segments') ? ContactSegment::where('account_id', $account->id)->count() : 0,
                ],
                'billing' => [
                    'unpaid_orders' => Schema::hasTable('payment_orders')
                        ? PaymentOrder::where('account_id', $account->id)->whereIn('status', ['pending', 'unpaid', 'awaiting_approval'])->count()
                        : 0,
                ],
            ],
        ]);
    }

    public function inbox(Request $request): JsonResponse
    {
        $account = $this->account($request);
        $conversations = WhatsAppConversation::query()
            ->with(['contact:id,name,phone,wa_id,email'])
            ->where('account_id', $account->id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (WhatsAppConversation $conversation) => [
                'id' => $conversation->id,
                'contact_name' => $conversation->contact?->name ?: $conversation->contact?->phone ?: 'WhatsApp contact',
                'contact_phone' => $conversation->contact?->phone ?: $conversation->contact?->wa_id,
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to') ? $conversation->assigned_to : null,
                'last_message_preview' => $conversation->last_message_preview,
                'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                'unread_count' => $this->conversationUnreadCount($conversation),
                'bot_paused' => (bool) (($conversation->metadata ?? [])['bot_paused'] ?? false),
                'bot_paused_reason' => ($conversation->metadata ?? [])['bot_paused_reason'] ?? null,
            ]);

        return response()->json(['items' => $conversations]);
    }

    public function conversation(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $conversation->load(['contact:id,name,phone,wa_id,email,company,notes,status,source', 'connection:id,name,calling_enabled']);
        $messages = WhatsAppMessage::where('account_id', $account->id)
            ->where('whatsapp_conversation_id', $conversation->id)
            ->orderByDesc('id')
            ->limit(80)
            ->get()
            ->reverse()
            ->values()
            ->map(fn (WhatsAppMessage $message) => [
                'id' => $message->id,
                'direction' => $message->direction,
                'type' => $message->type,
                'text_body' => $message->text_body,
                'payload' => $message->payload ?? [],
                'status' => $message->status,
                'created_at' => $message->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'conversation' => [
                'id' => $conversation->id,
                'contact_name' => $conversation->contact?->name ?: $conversation->contact?->phone ?: 'WhatsApp contact',
                'contact_id' => $conversation->contact?->id,
                'contact_phone' => $conversation->contact?->phone ?: $conversation->contact?->wa_id,
                'contact_email' => $conversation->contact?->email,
                'contact_company' => $conversation->contact?->company,
                'contact_notes' => $conversation->contact?->notes,
                'contact_status' => $conversation->contact?->status,
                'connection_name' => $conversation->connection?->name,
                'calling_enabled' => (bool) ($conversation->connection?->calling_enabled ?? false),
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to') ? $conversation->assigned_to : null,
                'assigned_agent_name' => $this->agentName($account, Schema::hasColumn('whatsapp_conversations', 'assigned_to') ? $conversation->assigned_to : null),
                'bot_paused' => (bool) (($conversation->metadata ?? [])['bot_paused'] ?? false),
                'bot_paused_reason' => ($conversation->metadata ?? [])['bot_paused_reason'] ?? null,
            ],
            'messages' => $messages,
            'quick_replies' => $this->quickReplyPayload($account),
            'agents' => $account->getAssignableAgents()->values()->all(),
        ]);
    }

    public function updateConversation(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'closed'])],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'assigned_to' => ['nullable', 'integer'],
        ]);

        $updates = [];
        if (array_key_exists('status', $validated) && $validated['status']) {
            $updates['status'] = $validated['status'];
        }
        if (array_key_exists('priority', $validated) && $validated['priority'] && Schema::hasColumn('whatsapp_conversations', 'priority')) {
            $updates['priority'] = $validated['priority'];
        }
        if (array_key_exists('assigned_to', $validated) && Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $assigneeId = $validated['assigned_to'];
            if ($assigneeId && ! in_array((int) $assigneeId, $account->getAssignableAgentIds(), true)) {
                abort(422, 'Selected agent is not a workspace agent.');
            }
            $updates['assigned_to'] = $assigneeId ?: null;
        }

        if ($updates !== []) {
            $conversation->forceFill($updates)->save();
        }

        return response()->json([
            'ok' => true,
            'conversation' => [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'priority' => $conversation->priority,
                'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to') ? $conversation->assigned_to : null,
            ],
        ]);
    }

    public function markConversationRead(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        WhatsAppMessage::query()
            ->where('account_id', $account->id)
            ->where('whatsapp_conversation_id', $conversation->id)
            ->where('direction', 'inbound')
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
                'status' => 'read',
                'updated_at' => now(),
            ]);

        $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
        $metadata['unread_count'] = 0;
        $conversation->forceFill(['metadata' => $metadata])->save();

        return response()->json(['ok' => true, 'unread_count' => 0]);
    }

    public function toggleConversationBot(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $validated = $request->validate([
            'paused' => ['required', 'boolean'],
            'reason' => ['nullable', 'string', 'max:160'],
            'assign_to_me' => ['nullable', 'boolean'],
        ]);

        $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
        if ((bool) $validated['paused']) {
            $metadata['bot_paused'] = true;
            $metadata['bot_paused_at'] = now()->toIso8601String();
            $metadata['bot_paused_by'] = $request->user()?->id;
            $metadata['bot_paused_reason'] = $validated['reason'] ?? 'Paused from mobile';
            unset($metadata['automation_session']);
        } else {
            unset($metadata['bot_paused'], $metadata['bot_paused_at'], $metadata['bot_paused_by'], $metadata['bot_paused_reason']);
        }

        $updates = ['metadata' => $metadata];
        if (($validated['assign_to_me'] ?? false) && Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $updates['assigned_to'] = $request->user()?->id;
        }
        $conversation->forceFill($updates)->save();

        return response()->json([
            'ok' => true,
            'conversation' => [
                'id' => $conversation->id,
                'bot_paused' => (bool) ($metadata['bot_paused'] ?? false),
                'bot_paused_reason' => $metadata['bot_paused_reason'] ?? null,
                'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to') ? $conversation->assigned_to : null,
            ],
        ]);
    }

    public function sendQuickReply(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $conversation->load(['contact', 'connection']);
        abort_unless($conversation->contact?->wa_id && $conversation->connection, 422, 'Conversation is missing WhatsApp contact or connection.');

        $response = $this->whatsappClient->sendTextMessage(
            $conversation->connection,
            $conversation->contact->wa_id,
            $validated['message']
        );

        $message = WhatsAppMessage::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'text',
            'text_body' => $validated['message'],
            'status' => 'sent',
            'sent_at' => now(),
            'meta_message_id' => $response['messages'][0]['id'] ?? null,
            'payload' => $response,
        ]);

        $metadata = is_array($conversation->metadata) ? $conversation->metadata : [];
        $metadata['last_human_reply_at'] = now()->toIso8601String();
        $metadata['last_human_reply_by'] = $request->user()?->id;
        $conversation->forceFill([
            'metadata' => $metadata,
            'last_message_at' => now(),
            'last_message_preview' => substr($validated['message'], 0, 100),
        ])->save();

        return response()->json([
            'message' => [
                'id' => $message->id,
                'direction' => $message->direction,
                'type' => $message->type,
                'text_body' => $message->text_body,
                'status' => $message->status,
                'created_at' => $message->created_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function quickReplies(Request $request): JsonResponse
    {
        return response()->json(['items' => $this->quickReplyPayload($this->account($request))]);
    }

    public function campaigns(Request $request): JsonResponse
    {
        $account = $this->account($request);

        if (! Schema::hasTable('campaigns')) {
            return response()->json(['items' => []]);
        }

        $campaigns = Campaign::query()
            ->where('account_id', $account->id)
            ->latest()
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (Campaign $campaign) => [
                'id' => $campaign->id,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'status' => $campaign->status,
                'type' => $campaign->type,
                'total_recipients' => $campaign->total_recipients,
                'sent_count' => $campaign->sent_count,
                'delivered_count' => $campaign->delivered_count,
                'read_count' => $campaign->read_count,
                'failed_count' => $campaign->failed_count,
                'scheduled_at' => $campaign->scheduled_at?->toIso8601String(),
                'started_at' => $campaign->started_at?->toIso8601String(),
                'completed_at' => $campaign->completed_at?->toIso8601String(),
                'updated_at' => $campaign->updated_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $campaigns]);
    }

    public function templates(Request $request): JsonResponse
    {
        $account = $this->account($request);

        if (! Schema::hasTable('whatsapp_templates')) {
            return response()->json(['items' => []]);
        }

        $templates = WhatsAppTemplate::query()
            ->where('account_id', $account->id)
            ->latest()
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (WhatsAppTemplate $template) => [
                'id' => $template->id,
                'name' => $template->name,
                'language' => $template->language,
                'category' => $template->category,
                'status' => $template->status,
                'quality_score' => $template->quality_score,
                'body_text' => $template->body_text,
                'last_meta_error' => $template->last_meta_error,
                'last_synced_at' => $template->last_synced_at?->toIso8601String(),
                'updated_at' => $template->updated_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $templates]);
    }

    public function automations(Request $request): JsonResponse
    {
        $account = $this->account($request);

        if (! Schema::hasTable('bots')) {
            return response()->json(['items' => []]);
        }

        $bots = Bot::query()
            ->where('account_id', $account->id)
            ->withCount(['flows', 'executions'])
            ->latest()
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (Bot $bot) => [
                'id' => $bot->id,
                'name' => $bot->name,
                'description' => $bot->description,
                'status' => $bot->status,
                'is_default' => (bool) $bot->is_default,
                'flows_count' => $bot->flows_count ?? 0,
                'executions_count' => $bot->executions_count ?? 0,
                'stop_on_first_flow' => (bool) $bot->stop_on_first_flow,
                'session_timeout_minutes' => $bot->session_timeout_minutes,
                'updated_at' => $bot->updated_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $bots]);
    }

    public function sendMedia(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $validated = $request->validate([
            'type' => ['required', Rule::in(['image', 'video', 'document', 'audio'])],
            'caption' => ['nullable', 'string', 'max:1024'],
            'is_voice' => ['nullable', 'boolean'],
            'attachment' => ['required', 'file', 'max:102400'],
        ]);

        $conversation->load(['contact', 'connection']);
        abort_unless($conversation->contact?->wa_id && $conversation->connection, 422, 'Conversation is missing WhatsApp contact or connection.');

        $file = $request->file('attachment');
        $type = $validated['type'];
        $this->validateMediaAttachment($file, $type);

        $path = $file->store('whatsapp-media', 'public');
        $url = Storage::disk('public')->url($path);
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = rtrim(config('app.url'), '/').'/'.ltrim($url, '/');
        }

        $caption = $type === 'audio' ? null : ($validated['caption'] ?? null);
        $filename = $file->getClientOriginalName();
        $mimeType = $file->getClientMimeType() ?: $file->getMimeType();
        $isVoice = $type === 'audio' && $request->boolean('is_voice');

        $message = WhatsAppMessage::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => $type,
            'text_body' => $caption,
            'payload' => [
                'type' => $type,
                'link' => $url,
                'caption' => $caption,
                'filename' => $filename,
                'mime_type' => $mimeType,
                'voice' => $isVoice,
            ],
            'status' => 'queued',
        ]);
        event(new MessageCreated($message));

        try {
            $upload = $this->whatsappClient->uploadMedia(
                $conversation->connection,
                Storage::disk('public')->path($path),
                $filename,
                $mimeType
            );

            $response = $this->whatsappClient->sendUploadedMediaMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $type,
                (string) $upload['id'],
                $caption,
                $type === 'document' ? $filename : null,
                $isVoice
            );

            $message->forceFill([
                'meta_message_id' => $response['messages'][0]['id'] ?? null,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], [
                    'media_id' => $upload['id'],
                    'meta_upload' => $upload,
                    'response' => $response,
                ]),
            ])->save();

            $conversation->forceFill([
                'last_message_at' => now(),
                'last_message_preview' => $caption ?: strtoupper($type).' attachment',
            ])->save();

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return response()->json([
                'ok' => true,
                'message' => [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'created_at' => $message->created_at?->toIso8601String(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            $message->forceFill([
                'status' => 'failed',
                'payload' => array_merge($message->payload ?? [], ['error' => $e->getMessage()]),
            ])->save();
            event(new MessageUpdated($message));

            return response()->json([
                'message' => 'Failed to send media. Please try again.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function sendContactCard(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $validated = $request->validate([
            'formatted_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:32'],
            'email' => ['nullable', 'email', 'max:128'],
            'company' => ['nullable', 'string', 'max:120'],
        ]);

        $conversation->load(['contact', 'connection']);
        abort_unless($conversation->contact?->wa_id && $conversation->connection, 422, 'Conversation is missing WhatsApp contact or connection.');

        $contactCard = [
            'name' => [
                'formatted_name' => $validated['formatted_name'],
                'first_name' => Str::of($validated['formatted_name'])->before(' ')->toString() ?: $validated['formatted_name'],
            ],
            'phones' => [[
                'phone' => $validated['phone'],
                'type' => 'WORK',
            ]],
        ];

        if (! empty($validated['email'])) {
            $contactCard['emails'] = [[
                'email' => $validated['email'],
                'type' => 'WORK',
            ]];
        }

        if (! empty($validated['company'])) {
            $contactCard['org'] = ['company' => $validated['company']];
        }

        $message = WhatsAppMessage::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'contacts',
            'text_body' => 'Contact card: '.$validated['formatted_name'],
            'payload' => ['contacts' => [$contactCard]],
            'status' => 'queued',
        ]);
        event(new MessageCreated($message));

        try {
            $response = $this->whatsappClient->sendContactsMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                [$contactCard]
            );

            $message->forceFill([
                'meta_message_id' => $response['messages'][0]['id'] ?? null,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], ['response' => $response]),
            ])->save();

            $conversation->forceFill([
                'last_message_at' => now(),
                'last_message_preview' => 'Contact card: '.substr($validated['formatted_name'], 0, 80),
            ])->save();

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return response()->json([
                'ok' => true,
                'message' => [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'created_at' => $message->created_at?->toIso8601String(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            $message->forceFill([
                'status' => 'failed',
                'payload' => array_merge($message->payload ?? [], ['error' => $e->getMessage()]),
            ])->save();
            event(new MessageUpdated($message));

            return response()->json([
                'message' => 'Failed to send contact card. Please try again.',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    public function agents(Request $request): JsonResponse
    {
        return response()->json(['items' => $this->account($request)->getAssignableAgents()->values()->all()]);
    }

    public function sendLocation(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);

        $validated = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'name' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $conversation->load(['contact', 'connection']);
        abort_unless($conversation->contact?->wa_id && $conversation->connection, 422, 'Conversation is missing WhatsApp contact or connection.');

        $location = [
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'name' => $validated['name'] ?? null,
            'address' => $validated['address'] ?? null,
        ];

        $message = WhatsAppMessage::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'location',
            'text_body' => $validated['name'] ?? 'Location shared',
            'payload' => $location,
            'status' => 'queued',
        ]);
        event(new MessageCreated($message));

        try {
            $response = $this->whatsappClient->sendLocationMessage($conversation->connection, $conversation->contact->wa_id, $location);
            $message->forceFill([
                'meta_message_id' => $response['messages'][0]['id'] ?? null,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($location, ['response' => $response]),
            ])->save();

            $conversation->forceFill([
                'last_message_at' => now(),
                'last_message_preview' => $validated['name'] ?? 'Location shared',
            ])->save();

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return response()->json([
                'ok' => true,
                'message' => [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'created_at' => $message->created_at?->toIso8601String(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            $message->forceFill(['status' => 'failed', 'payload' => array_merge($location, ['error' => $e->getMessage()])])->save();
            throw $e;
        }
    }

    public function startCall(Request $request, int|string $mobileConversation): JsonResponse
    {
        $account = $this->account($request);
        $conversation = $this->conversationForAccount($account, $mobileConversation);
        $conversation->load(['contact', 'connection']);

        abort_unless($conversation->contact?->wa_id && $conversation->connection, 422, 'Conversation is missing WhatsApp contact or connection.');
        abort_unless($conversation->connection->calling_enabled, 422, 'WhatsApp calling is not enabled for this number.');

        $settings = PlatformSetting::get('whatsapp_calling.account_'.$account->id, []);
        if (! is_array($settings)) {
            $settings = [];
        }
        if (! ($settings['enabled'] ?? false)) {
            abort(422, 'WhatsApp Calling module is not enabled for this workspace.');
        }
        if (empty($settings['default_agent_id'])) {
            abort(422, 'Select an AI agent in WhatsApp Calling settings before starting mobile calls.');
        }
        if (! PlatformSetting::get('ai.voice_enabled', false)) {
            abort(422, 'Voice AI is not enabled in Platform Settings.');
        }

        $call = WhatsAppCall::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->connection->id,
            'ai_agent_id' => $settings['default_agent_id'],
            'direction' => 'outbound',
            'phone_number' => preg_replace('/\D+/', '', (string) $conversation->contact->wa_id),
            'provider' => 'whatsapp',
            'status' => 'queued',
            'route_mode' => 'ai_voice_bridge',
            'routed_to' => 'ai_agent',
            'consent_status' => 'not_required',
            'metadata' => [
                'started_by' => $request->user()?->id,
                'source' => 'mobile',
                'conversation_id' => $conversation->id,
                'voice_bridge' => 'node_worker',
            ],
        ]);

        $session = WhatsAppCallVoiceSession::create([
            'account_id' => $account->id,
            'whatsapp_call_id' => $call->id,
            'whatsapp_connection_id' => $conversation->connection->id,
            'ai_agent_id' => $settings['default_agent_id'],
            'direction' => 'outbound',
            'status' => 'queued',
            'metadata' => ['created_by' => $request->user()?->id, 'source' => 'mobile'],
        ]);

        event(new CallUpdated($call->fresh('agent:id,name') ?? $call));

        return response()->json([
            'ok' => true,
            'message' => 'WhatsApp AI call queued.',
            'call' => [
                'id' => $call->id,
                'status' => $call->status,
                'phone_number' => $call->phone_number,
            ],
            'voice_session' => ['id' => $session->id, 'status' => $session->status],
        ], 201);
    }

    public function calls(Request $request): JsonResponse
    {
        $account = $this->account($request);

        if (! Schema::hasTable('ai_voice_calls')) {
            return response()->json(['items' => []]);
        }

        $calls = WhatsAppCall::query()
            ->where('account_id', $account->id)
            ->latest()
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (WhatsAppCall $call) => [
                'id' => $call->id,
                'direction' => $call->direction,
                'phone_number' => $call->phone_number,
                'contact_name' => $call->contact_name,
                'status' => $call->status,
                'duration_seconds' => $call->duration_seconds,
                'summary' => $call->summary,
                'created_at' => $call->created_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $calls]);
    }

    public function contacts(Request $request): JsonResponse
    {
        $account = $this->account($request);
        $search = trim((string) $request->query('search', ''));

        $contacts = WhatsAppContact::query()
            ->where('account_id', $account->id)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', '%'.$search.'%')
                        ->orWhere('phone', 'like', '%'.$search.'%')
                        ->orWhere('email', 'like', '%'.$search.'%');
                });
            })
            ->orderByDesc('last_seen_at')
            ->orderByDesc('id')
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (WhatsAppContact $contact) => [
                'id' => $contact->id,
                'slug' => $contact->slug,
                'name' => $contact->name,
                'phone' => $contact->phone ?: $contact->wa_id,
                'email' => $contact->email,
                'company' => $contact->company,
                'notes' => $contact->notes,
                'source' => $contact->source,
                'status' => $contact->status,
                'last_seen_at' => $contact->last_seen_at?->toIso8601String(),
                'message_count' => $contact->message_count,
            ]);

        return response()->json(['items' => $contacts]);
    }

    public function updateContact(Request $request, int|string $mobileContact): JsonResponse
    {
        $account = $this->account($request);
        $contact = $this->contactForAccount($account, $mobileContact);

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:120'],
            'email' => ['nullable', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'company' => ['nullable', 'string', 'max:160'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', 'string', 'max:40'],
        ]);

        $contact->fill($validated)->save();

        return response()->json([
            'ok' => true,
            'contact' => [
                'id' => $contact->id,
                'name' => $contact->name,
                'phone' => $contact->phone ?: $contact->wa_id,
                'email' => $contact->email,
                'company' => $contact->company,
                'notes' => $contact->notes,
                'status' => $contact->status,
            ],
        ]);
    }

    public function leads(Request $request): JsonResponse
    {
        $account = $this->account($request);

        $leads = AccountMetaLead::query()
            ->where('account_id', $account->id)
            ->orderByDesc('captured_at')
            ->orderByDesc('id')
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (AccountMetaLead $lead) => [
                'id' => $lead->id,
                'name' => $lead->name,
                'phone' => $lead->phone,
                'email' => $lead->email,
                'city' => $lead->city,
                'stage' => $lead->stage,
                'platform' => $lead->platform,
                'source_type' => $lead->source_type,
                'form_name' => $lead->form_name,
                'ad_name' => $lead->ad_name,
                'campaign_name' => $lead->campaign_name,
                'raw_payload' => $lead->raw_payload,
                'captured_at' => $lead->captured_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $leads]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $account = $this->account($request);

        $notifications = AppNotification::query()
            ->where(function ($query) use ($account) {
                $query->where('account_id', $account->id)
                    ->orWhere(function ($platform) {
                        $platform->whereNull('account_id')->where('scope', 'platform');
                    });
            })
            ->orderByDesc('created_at')
            ->limit((int) $request->integer('limit', 50))
            ->get()
            ->map(fn (AppNotification $notification) => [
                'id' => $notification->id,
                'scope' => $notification->scope,
                'type' => $notification->type,
                'severity' => $notification->severity,
                'title' => $notification->title,
                'body' => $notification->body,
                'action_url' => $notification->action_url,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at' => $notification->created_at?->toIso8601String(),
            ]);

        return response()->json(['items' => $notifications]);
    }

    public function markNotificationRead(Request $request, AppNotification $notification): JsonResponse
    {
        $account = $this->account($request);
        $isWorkspaceNotification = (int) $notification->account_id === (int) $account->id
            && $notification->scope === 'workspace';
        $isPlatformNotification = $notification->account_id === null
            && $notification->scope === 'platform'
            && (bool) $request->user()?->is_platform_admin;

        abort_unless($isWorkspaceNotification || $isPlatformNotification, 404);

        $notification->forceFill(['read_at' => now()])->save();

        return response()->json([
            'ok' => true,
            'notification' => [
                'id' => $notification->id,
                'read_at' => $notification->read_at?->toIso8601String(),
            ],
        ]);
    }

    public function markAllNotificationsRead(Request $request): JsonResponse
    {
        $account = $this->account($request);

        $updated = AppNotification::query()
            ->where('account_id', $account->id)
            ->where('scope', 'workspace')
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        return response()->json(['ok' => true, 'updated' => $updated]);
    }

    private function account(Request $request): Account
    {
        $account = $request->attributes->get('account');
        abort_unless($account instanceof Account, 422, 'No workspace is available for this user.');

        return $account;
    }

    private function conversationForAccount(Account $account, int|string $id): WhatsAppConversation
    {
        $conversationId = (int) $id;
        abort_unless($conversationId > 0, 404, 'Conversation not found.');

        return WhatsAppConversation::query()
            ->where('account_id', $account->id)
            ->whereKey($conversationId)
            ->firstOrFail();
    }

    private function contactForAccount(Account $account, int|string $id): WhatsAppContact
    {
        $contactId = (int) $id;
        abort_unless($contactId > 0, 404, 'Contact not found.');

        return WhatsAppContact::query()
            ->where('account_id', $account->id)
            ->whereKey($contactId)
            ->firstOrFail();
    }

    private function unreadCount(Account $account): int
    {
        return WhatsAppConversation::where('account_id', $account->id)
            ->get()
            ->sum(fn (WhatsAppConversation $conversation) => $this->conversationUnreadCount($conversation));
    }

    private function conversationUnreadCount(WhatsAppConversation $conversation): int
    {
        $metadata = $conversation->metadata ?: [];
        if (isset($metadata['unread_count'])) {
            return (int) $metadata['unread_count'];
        }

        return $conversation->messages()
            ->where('direction', 'inbound')
            ->whereNull('read_at')
            ->count();
    }

    private function quickReplyPayload(Account $account): array
    {
        $workspaceReplies = QuickReply::query()
            ->where('account_id', $account->id)
            ->where('type', 'reply')
            ->where('is_active', true)
            ->orderByDesc('usage_count')
            ->orderBy('label')
            ->limit(20)
            ->get()
            ->map(fn (QuickReply $reply) => [
                'id' => $reply->id,
                'label' => $reply->label,
                'shortcut' => $reply->shortcut,
                'text' => $reply->message,
            ])
            ->values()
            ->all();

        return $workspaceReplies ?: [
            ['label' => 'Thanks', 'shortcut' => 'thanks', 'text' => 'Thanks for confirming. Let me know if you need anything else.'],
            ['label' => 'Checking', 'shortcut' => 'checking', 'text' => 'I am checking this and will update you shortly.'],
            ['label' => 'Call back', 'shortcut' => 'call_back', 'text' => 'Can I arrange a quick callback from our team?'],
            ['label' => 'Pricing', 'shortcut' => 'pricing', 'text' => 'Zyptos plans start at Rs 999/month. I can help you choose the right plan based on your team size and WhatsApp usage.'],
        ];
    }

    private function validateMediaAttachment(\Illuminate\Http\UploadedFile $file, string $type): void
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: '');
        $mime = strtolower((string) ($file->getClientMimeType() ?: $file->getMimeType()));

        $allowed = [
            'image' => [
                'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
                'mimes' => ['image/jpeg', 'image/png', 'image/webp'],
                'max_kb' => 5120,
            ],
            'video' => [
                'extensions' => ['mp4', '3gp', '3gpp'],
                'mimes' => ['video/mp4', 'video/3gpp'],
                'max_kb' => 16384,
            ],
            'document' => [
                'extensions' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'],
                'mimes' => ['application/pdf', 'text/plain', 'text/csv', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
                'max_kb' => 102400,
            ],
            'audio' => [
                'extensions' => ['aac', 'm4a', 'mp3', 'amr', 'ogg', 'oga', 'opus', 'wav'],
                'mimes' => ['audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/mpeg', 'audio/mp3', 'audio/amr', 'audio/ogg', 'application/ogg', 'audio/wav', 'audio/x-wav', 'audio/wave'],
                'max_kb' => 16384,
            ],
        ];

        $rules = $allowed[$type] ?? null;
        if (! $rules) {
            return;
        }

        if (! in_array($extension, $rules['extensions'], true) && ! in_array($mime, $rules['mimes'], true)) {
            throw ValidationException::withMessages([
                'attachment' => ['Unsupported '.$type.' attachment type.'],
            ]);
        }

        if ($file->getSize() > ((int) $rules['max_kb']) * 1024) {
            throw ValidationException::withMessages([
                'attachment' => ['The attachment is too large for WhatsApp '.$type.' messages.'],
            ]);
        }
    }

    private function agentName(Account $account, mixed $agentId): ?string
    {
        if (! $agentId) {
            return null;
        }

        return collect($account->getAssignableAgents())->firstWhere('id', (int) $agentId)['name'] ?? null;
    }
}
