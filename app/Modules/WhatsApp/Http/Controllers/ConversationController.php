<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Billing\EntitlementService;
use App\Core\Billing\UsageService;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use App\Modules\WhatsApp\Services\TemplateComposer;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(
        protected WhatsAppClient $whatsappClient,
        protected TemplateComposer $templateComposer,
        protected EntitlementService $entitlementService,
        protected UsageService $usageService
    ) {
    }

    /**
     * Display a listing of conversations.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        // Optimize query: select only needed columns, use eager loading efficiently
        $conversations = WhatsAppConversation::where('workspace_id', $workspace->id)
            ->select(['id', 'workspace_id', 'whatsapp_connection_id', 'whatsapp_contact_id', 'status', 'last_message_at', 'last_message_preview'])
            ->with([
                'contact:id,workspace_id,wa_id,name',
                'connection:id,workspace_id,name',
            ])
            ->orderBy('last_message_at', 'desc')
            ->orderBy('id', 'desc') // Secondary sort for consistent ordering
            ->paginate(20)
            ->through(function ($conversation) {
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
                        'id' => $conversation->connection->id,
                        'name' => $conversation->connection->name,
                    ],
                ];
            });

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        return Inertia::render('WhatsApp/Conversations/Index', [
            'workspace' => $workspace,
            'conversations' => $conversations,
            'connections' => $connections,
        ]);
    }

    /**
     * Display the conversation thread.
     */
    public function show(Request $request, WhatsAppConversation $conversation): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        // Ensure conversation belongs to workspace
        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $conversation->load(['contact', 'connection']);

        // Load last 50 messages for initial render (optimized query)
        $messages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->select(['id', 'direction', 'type', 'text_body', 'payload', 'status', 'created_at', 'sent_at', 'delivered_at', 'read_at'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse() // Reverse to show oldest first
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

        $totalMessages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)->count();

        $templates = WhatsAppTemplate::where('workspace_id', $workspace->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->where('status', 'approved')
            ->where('is_archived', false)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'language',
                'body_text',
                'header_text',
                'footer_text',
                'buttons',
            ])
            ->map(function ($template) {
                $requiredVariables = $this->templateComposer->extractRequiredVariables($template);
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'language' => $template->language,
                    'body_text' => $template->body_text,
                    'header_text' => $template->header_text,
                    'footer_text' => $template->footer_text,
                    'buttons' => $template->buttons ?? [],
                    'variable_count' => $requiredVariables['total'],
                    'header_count' => $requiredVariables['header_count'],
                    'body_count' => $requiredVariables['body_count'],
                    'button_count' => $requiredVariables['button_count'],
                    'has_buttons' => $template->has_buttons,
                ];
            });

        return Inertia::render('WhatsApp/Conversations/Show', [
            'workspace' => $workspace,
            'conversation' => [
                'id' => $conversation->id,
                'contact' => [
                    'id' => $conversation->contact->id,
                    'wa_id' => $conversation->contact->wa_id,
                    'name' => $conversation->contact->name ?? $conversation->contact->wa_id,
                ],
                'connection' => [
                    'id' => $conversation->connection->id,
                    'name' => $conversation->connection->name,
                ],
                'status' => $conversation->status,
            ],
            'messages' => $messages,
            'total_messages' => $totalMessages,
            'has_more_messages' => $totalMessages > 50,
            'templates' => $templates,
        ]);
    }

    /**
     * Load more messages (for infinite scroll).
     */
    public function loadMoreMessages(Request $request, WhatsAppConversation $conversation)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        // Ensure conversation belongs to workspace
        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'before_message_id' => 'required|integer|exists:whatsapp_messages,id',
        ]);

        $messages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->where('id', '<', $validated['before_message_id'])
            ->select(['id', 'direction', 'type', 'text_body', 'payload', 'status', 'created_at', 'sent_at', 'delivered_at', 'read_at'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse()
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

        return response()->json([
            'messages' => $messages,
            'has_more' => $messages->count() === 50,
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, WhatsAppConversation $conversation)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        // Ensure conversation belongs to workspace
        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:4096',
        ]);

        // Check message limit before sending
        $this->entitlementService->assertWithinLimit($workspace, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

        // Use transaction with lock to prevent duplicate message creation
        $message = DB::transaction(function () use ($workspace, $conversation, $validated) {
            return WhatsAppMessage::lockForUpdate()
                ->create([
                    'workspace_id' => $workspace->id,
                    'whatsapp_conversation_id' => $conversation->id,
                    'direction' => 'outbound',
                    'type' => 'text',
                    'text_body' => $validated['message'],
                    'status' => 'queued',
                ]);
        });

        // Load relationships for broadcast
        $message->load('conversation.contact');
        
        // Broadcast optimistic message created
        event(new MessageCreated($message));

        try {
            // Send via WhatsApp API
            $response = $this->whatsappClient->sendTextMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $validated['message']
            );

            // Update message with Meta message ID and status
            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => $response,
            ]);

            // Increment usage counter
            $this->usageService->incrementMessages($workspace, 1);

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($validated['message'], 0, 100),
            ]);

            // Broadcast message update and conversation update
            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Message sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            // Broadcast failed status
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'message' => 'Failed to send message: ' . $e->getMessage(),
            ]);
        }
    }

    public function sendTemplateMessage(Request $request, WhatsAppConversation $conversation)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'template_id' => 'required|integer|exists:whatsapp_templates,id',
            'variables' => 'array',
            'variables.*' => 'nullable|string|max:1024',
        ]);

        $template = WhatsAppTemplate::where('workspace_id', $workspace->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->where('status', 'approved')
            ->where('is_archived', false)
            ->findOrFail($validated['template_id']);

        $this->entitlementService->assertWithinLimit($workspace, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

        try {
            DB::beginTransaction();

            $payload = $this->templateComposer->preparePayload(
                $template,
                $conversation->contact->wa_id,
                $validated['variables'] ?? []
            );

            $preview = $this->templateComposer->renderPreview($template, $validated['variables'] ?? []);

            $message = WhatsAppMessage::lockForUpdate()->create([
                'workspace_id' => $workspace->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'template',
                'text_body' => $preview['body'],
                'payload' => $payload,
                'status' => 'queued',
            ]);

            $templateSend = WhatsAppTemplateSend::create([
                'workspace_id' => $workspace->id,
                'whatsapp_template_id' => $template->id,
                'whatsapp_message_id' => $message->id,
                'to_wa_id' => $conversation->contact->wa_id,
                'variables' => $validated['variables'] ?? [],
                'status' => 'queued',
            ]);

            $message->load('conversation.contact');
            event(new MessageCreated($message));

            $response = $this->whatsappClient->sendTemplateMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $template->name,
                $template->language,
                $payload['template']['components'] ?? []
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $templateSend->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $this->usageService->incrementMessages($workspace, 1);
            $this->usageService->incrementTemplateSends($workspace, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($message->text_body ?? '', 0, 100),
            ]);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            DB::commit();

            return redirect()->back()->with('success', 'Template sent successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($message)) {
                $message->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
                event(new MessageUpdated($message));
            }

            if (isset($templateSend)) {
                $templateSend->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }

            return redirect()->back()->withErrors([
                'template' => 'Failed to send template. Please try again.',
            ]);
        }
    }

    public function sendMediaMessage(Request $request, WhatsAppConversation $conversation)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'type' => 'required|in:image,video,document',
            'caption' => 'nullable|string|max:1024',
            'attachment' => 'required|file|max:10240',
        ]);

        $mimeRules = [
            'image' => 'mimes:jpg,jpeg,png,gif,webp',
            'video' => 'mimetypes:video/mp4,video/quicktime,video/3gpp',
            'document' => 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip',
        ];
        $request->validate([
            'attachment' => $mimeRules[$validated['type']] ?? 'file',
        ]);

        $this->entitlementService->assertWithinLimit($workspace, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

        $file = $request->file('attachment');
        $path = $file->store('whatsapp-media', 'public');
        $url = rtrim(config('app.url'), '/') . Storage::url($path);

        $caption = $validated['caption'] ?? null;
        $filename = $file->getClientOriginalName();
        $type = $validated['type'];

        $message = WhatsAppMessage::lockForUpdate()->create([
            'workspace_id' => $workspace->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => $type,
            'text_body' => $caption,
            'payload' => [
                'type' => $type,
                'link' => $url,
                'caption' => $caption,
                'filename' => $filename,
            ],
            'status' => 'queued',
        ]);

        $message->load('conversation.contact');
        event(new MessageCreated($message));

        try {
            $response = $this->whatsappClient->sendMediaMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $type,
                $url,
                $caption,
                $type === 'document' ? $filename : null
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], ['response' => $response]),
            ]);

            $this->usageService->incrementMessages($workspace, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $caption ? substr($caption, 0, 100) : strtoupper($type) . ' attachment',
            ]);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Media sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'media' => 'Failed to send media. Please try again.',
            ]);
        }
    }

    public function sendLocationMessage(Request $request, WhatsAppConversation $conversation)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($conversation->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'name' => 'nullable|string|max:120',
            'address' => 'nullable|string|max:255',
        ]);

        $this->entitlementService->assertWithinLimit($workspace, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

        $message = WhatsAppMessage::lockForUpdate()->create([
            'workspace_id' => $workspace->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'location',
            'text_body' => $validated['name'] ?? null,
            'payload' => [
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'name' => $validated['name'] ?? null,
                'address' => $validated['address'] ?? null,
            ],
            'status' => 'queued',
        ]);

        $message->load('conversation.contact');
        event(new MessageCreated($message));

        try {
            $response = $this->whatsappClient->sendLocationMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                [
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'name' => $validated['name'] ?? null,
                    'address' => $validated['address'] ?? null,
                ]
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], ['response' => $response]),
            ]);

            $this->usageService->incrementMessages($workspace, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => 'Location shared',
            ]);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Location sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'location' => 'Failed to send location. Please try again.',
            ]);
        }
    }
}
