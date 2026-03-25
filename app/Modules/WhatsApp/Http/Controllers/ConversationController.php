<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Core\Billing\EntitlementService;
use App\Core\Billing\UsageService;
use App\Modules\WhatsApp\Events\Inbox\ConversationUpdated;
use App\Modules\WhatsApp\Events\Inbox\InternalNoteAdded;
use App\Modules\WhatsApp\Events\Inbox\AuditEventAdded;
use App\Modules\WhatsApp\Events\Inbox\MessageCreated;
use App\Modules\WhatsApp\Events\Inbox\MessageUpdated;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppConversationNote;
use App\Modules\WhatsApp\Models\WhatsAppConversationAuditEvent;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppMessage;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Models\WhatsAppTemplateSend;
use App\Modules\WhatsApp\Services\TemplateComposer;
use App\Modules\WhatsApp\Services\ContactComplianceService;
use App\Modules\WhatsApp\Services\CustomerCareWindowService;
use App\Modules\WhatsApp\Services\InboxMetricsService;
use App\Modules\WhatsApp\Services\OutboundMessagePipelineService;
use App\Modules\WhatsApp\Services\SendPolicyService;
use App\Modules\WhatsApp\Services\TemplateLifecycleService;
use App\Modules\WhatsApp\Services\TemplateManagementService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\AI\ConversationAssistantService;
use App\Core\Billing\PlanResolver;
use App\Models\AiUsageLog;
use App\Models\AiSuggestionFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(
        protected WhatsAppClient $whatsappClient,
        protected TemplateComposer $templateComposer,
        protected CustomerCareWindowService $customerCareWindowService,
        protected InboxMetricsService $inboxMetricsService,
        protected TemplateManagementService $templateManagementService,
        protected TemplateLifecycleService $templateLifecycleService,
        protected ContactComplianceService $contactComplianceService,
        protected OutboundMessagePipelineService $outboundPipeline,
        protected SendPolicyService $sendPolicyService,
        protected EntitlementService $entitlementService,
        protected UsageService $usageService,
        protected ConversationAssistantService $conversationAssistant,
        protected PlanResolver $planResolver
    ) {
    }

    /**
     * Display a listing of conversations.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Optimize query: select only needed columns, use eager loading efficiently
        $conversationSelect = ['id', 'account_id', 'whatsapp_connection_id', 'whatsapp_contact_id', 'status', 'last_message_at', 'last_message_preview'];
        if (Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $conversationSelect[] = 'assigned_to';
        }
        if (Schema::hasColumn('whatsapp_conversations', 'priority')) {
            $conversationSelect[] = 'priority';
        }

        $query = WhatsAppConversation::where('account_id', $account->id)
            ->select($conversationSelect)
            ->whereHas('contact')
            ->whereHas('connection')
            ->with([
                'contact:id,account_id,wa_id,name',
                'connection:id,account_id,name',
                'latestAuditEvent' => function ($query) {
                    $query->select([
                        'whatsapp_conversation_audit_events.id',
                        'whatsapp_conversation_audit_events.whatsapp_conversation_id',
                        'whatsapp_conversation_audit_events.event_type',
                        'whatsapp_conversation_audit_events.description',
                        'whatsapp_conversation_audit_events.created_at',
                    ]);
                },
            ]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('contact', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('wa_id', 'like', '%' . $search . '%');
            });
        }

        if (Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $assigneeFilter = $request->input('assignee', 'all');
            if ($assigneeFilter === 'me') {
                $currentUserId = $request->user()?->id;
                if ($currentUserId) {
                    $query->where('assigned_to', $currentUserId);
                }
            } elseif ($assigneeFilter === 'unassigned') {
                $query->whereNull('assigned_to');
            }
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('connection_id') && $request->input('connection_id') !== 'all') {
            $query->where('whatsapp_connection_id', $request->input('connection_id'));
        }

        $conversations = $query
            ->orderBy('last_message_at', 'desc')
            ->orderBy('id', 'desc') // Secondary sort for consistent ordering
            ->paginate(20);

        $conversationIds = $conversations->getCollection()->pluck('id')->all();
        $unreadMap = $this->inboxMetricsService->unreadCountMap($conversationIds);

        $conversations->setCollection(
            $conversations->getCollection()->map(function ($conversation) use ($unreadMap) {
                $unreadCount = (int) ($unreadMap[(int) $conversation->id] ?? 0);
                $latestAudit = $conversation->latestAuditEvent;
                return [
                    'id' => $conversation->id,
                    'account_id' => $conversation->account_id,
                    'contact' => [
                        'id' => $conversation->contact->id,
                        'wa_id' => $conversation->contact->wa_id,
                        'name' => $conversation->contact->name ?? $conversation->contact->wa_id],
                    'status' => $conversation->status,
                    'customer_care_window' => $this->formatCustomerCareWindowState(
                        $this->customerCareWindowService->forConversation($conversation)
                    ),
                    'last_message_preview' => $conversation->last_message_preview,
                    'last_message_at' => $conversation->last_message_at?->toIso8601String(),
                    'connection' => [
                        'id' => $conversation->connection->id,
                        'name' => $conversation->connection->name],
                    'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to')
                        ? $conversation->assigned_to
                        : null,
                    'priority' => Schema::hasColumn('whatsapp_conversations', 'priority')
                        ? $conversation->priority
                        : null,
                    'unread_count' => $unreadCount,
                    'has_unread' => $unreadCount > 0,
                    'activity' => $latestAudit ? [
                        'event_type' => $latestAudit->event_type,
                        'description' => $latestAudit->description,
                        'created_at' => $latestAudit->created_at?->toIso8601String(),
                    ] : null,
                ];
            })
        );

        $connections = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->get(['id', 'name']);

        $agents = $account->getAssignableAgents()->all();

        return Inertia::render('WhatsApp/Conversations/Index', [
            'account' => $account,
            'conversations' => $conversations,
            'connections' => $connections,
            'agents' => $agents,
            'filters' => [
                'search' => $request->input('search', ''),
                'assignee' => $request->input('assignee', 'all'),
                'status' => $request->input('status', 'all'),
                'connection_id' => $request->input('connection_id', 'all'),
            ],
        ]);
    }

    /**
     * Open or start a conversation with a contact (from Contacts). Gets or creates the conversation and redirects to it.
     * Optional query: connection_id to use a specific connection when account has multiple.
     */
    public function showByContact(Request $request, WhatsAppContact $contact)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($contact->account_id, $account->id)) {
            abort(404);
        }

        $connectionId = $request->query('connection_id');
        $connection = null;

        if ($connectionId) {
            $connection = WhatsAppConnection::where('account_id', $account->id)
                ->where('id', (int) $connectionId)
                ->where('is_active', true)
                ->first();
        }

        if (!$connection) {
            $connection = WhatsAppConnection::where('account_id', $account->id)
                ->where('is_active', true)
                ->orderBy('id')
                ->first();
        }

        if (!$connection) {
            return redirect()->back()->withErrors([
                'connection' => 'No active WhatsApp connection. Please add and connect a WhatsApp connection first.',
            ]);
        }

        $conversation = WhatsAppConversation::firstOrCreate(
            [
                'account_id' => $account->id,
                'whatsapp_connection_id' => $connection->id,
                'whatsapp_contact_id' => $contact->id,
            ],
            ['status' => 'open']
        );

        return redirect()->route('app.whatsapp.conversations.show', ['conversation' => $conversation->id]);
    }

    /**
     * New conversation: show contact (and optional connection) picker, then redirect to conversation.
     */
    public function newConversation(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $contacts = WhatsAppContact::where('account_id', $account->id)
            ->orderBy('name')
            ->orderBy('wa_id')
            ->get(['id', 'slug', 'wa_id', 'name'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'slug' => $c->slug ?? $c->wa_id ?? (string) $c->id,
                'wa_id' => $c->wa_id,
                'name' => $c->name ?? $c->wa_id,
            ]);

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('WhatsApp/Conversations/New', [
            'account' => $account,
            'contacts' => $contacts,
            'connections' => $connections,
        ]);
    }

    /**
     * Display the conversation thread.
     */
    public function show(Request $request, WhatsAppConversation $conversation): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure conversation belongs to account
        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $conversation->load(['contact', 'connection']);
        $customerCareWindow = $this->customerCareWindowService->forConversation($conversation);

        // Load last 50 messages for initial render (optimized query)
        $messages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->select([
                'id',
                'direction',
                'meta_message_id',
                'type',
                'text_body',
                'payload',
                'status',
                'error_message',
                'created_at',
                'updated_at',
                'sent_at',
                'delivered_at',
                'read_at',
            ])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse() // Reverse to show oldest first
            ->values()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'meta_message_id' => $message->meta_message_id,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'error_message' => $message->error_message,
                    'created_at' => $message->created_at->toIso8601String(),
                    'updated_at' => $message->updated_at?->toIso8601String(),
                    'sent_at' => $message->sent_at?->toIso8601String(),
                    'delivered_at' => $message->delivered_at?->toIso8601String(),
                    'read_at' => $message->read_at?->toIso8601String()];
            });

        $totalMessages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)->count();

        $templates = WhatsAppTemplate::where('account_id', $account->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->whereIn(DB::raw('LOWER(TRIM(status))'), ['approved', 'active'])
            ->where(function ($query) {
                // Keep compatibility with legacy rows where is_archived may be NULL.
                $query->where('is_archived', false)
                    ->orWhereNull('is_archived');
            })
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'language',
                'body_text',
                'header_type',
                'header_text',
                'header_media_url',
                'footer_text',
                'buttons'])
            ->map(function ($template) {
                $requiredVariables = $this->templateComposer->extractRequiredVariables($template);
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'language' => $template->language,
                    'body_text' => $template->body_text,
                    'header_type' => $template->header_type,
                    'header_text' => $template->header_text,
                    'header_media_url' => $template->header_media_url,
                    'footer_text' => $template->footer_text,
                    'buttons' => $template->buttons ?? [],
                    'variable_count' => $requiredVariables['total'],
                    'header_count' => $requiredVariables['header_count'],
                    'body_count' => $requiredVariables['body_count'],
                    'button_count' => $requiredVariables['button_count'],
                    'has_buttons' => $template->has_buttons];
            });

        $lists = \App\Modules\WhatsApp\Models\WhatsAppList::where('account_id', $account->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'button_text', 'description'])
            ->map(function ($list) {
                return [
                    'id' => $list->id,
                    'name' => $list->name,
                    'button_text' => $list->button_text,
                    'description' => $list->description,
                ];
            });

        $notes = WhatsAppConversationNote::where('whatsapp_conversation_id', $conversation->id)
            ->with('creator:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(20)
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

        $auditEvents = WhatsAppConversationAuditEvent::where('whatsapp_conversation_id', $conversation->id)
            ->with('actor:id,name,email')
            ->orderBy('created_at', 'desc')
            ->limit(20)
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

        $agents = $account->getAssignableAgents()->all();

        $effectiveModules = $this->planResolver->getEffectiveModules($account);
        $aiAvailable = in_array('ai', $effectiveModules, true);

        $assignedTo = Schema::hasColumn('whatsapp_conversations', 'assigned_to')
            ? $conversation->assigned_to
            : null;

        $priority = Schema::hasColumn('whatsapp_conversations', 'priority')
            ? $conversation->priority
            : null;

        return Inertia::render('WhatsApp/Conversations/Show', [
            'account' => $account,
            'conversation' => [
                'id' => $conversation->id,
                'contact' => [
                    'id' => $conversation->contact->id,
                    'wa_id' => $conversation->contact->wa_id,
                    'name' => $conversation->contact->name ?? $conversation->contact->wa_id],
                'connection' => [
                    'id' => $conversation->connection->id,
                    'name' => $conversation->connection->name],
                'status' => $conversation->status,
                'customer_care_window' => $this->formatCustomerCareWindowState($customerCareWindow),
                'assigned_to' => $assignedTo,
                'priority' => $priority,
            ],
            'messages' => $messages,
            'total_messages' => $totalMessages,
            'has_more_messages' => $totalMessages > 50,
            'templates' => $templates,
            'lists' => $lists,
            'notes' => $notes,
            'audit_events' => $auditEvents,
            'agents' => $agents,
            'inbox_settings' => [
                'auto_assign_enabled' => (bool) $account->auto_assign_enabled,
                'auto_assign_strategy' => $account->auto_assign_strategy ?? 'round_robin',
            ],
            'ai_available' => $aiAvailable,
        ]);
    }

    /**
     * Load more messages (for infinite scroll).
     */
    public function loadMoreMessages(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure conversation belongs to account
        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'before_message_id' => 'required|integer|exists:whatsapp_messages,id']);

        $messages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->where('id', '<', $validated['before_message_id'])
            ->select([
                'id',
                'direction',
                'meta_message_id',
                'type',
                'text_body',
                'payload',
                'status',
                'error_message',
                'created_at',
                'updated_at',
                'sent_at',
                'delivered_at',
                'read_at',
            ])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'meta_message_id' => $message->meta_message_id,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'error_message' => $message->error_message,
                    'created_at' => $message->created_at->toIso8601String(),
                    'updated_at' => $message->updated_at?->toIso8601String(),
                    'sent_at' => $message->sent_at?->toIso8601String(),
                    'delivered_at' => $message->delivered_at?->toIso8601String(),
                    'read_at' => $message->read_at?->toIso8601String()];
            });

        return response()->json([
            'messages' => $messages,
            'has_more' => $messages->count() === 50]);
    }

    /**
     * Add an internal note to the conversation.
     */
    public function addInternalNote(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'note' => 'required|string|max:5000',
        ]);

        $note = WhatsAppConversationNote::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'created_by' => $request->user()?->id,
            'note' => $validated['note'],
        ]);

        $notePayload = [
            'id' => $note->id,
            'note' => $note->note,
            'created_at' => $note->created_at->toIso8601String(),
            'created_by' => $request->user()?->only(['id', 'name', 'email']),
        ];

        event(new InternalNoteAdded($conversation, $notePayload));

        $audit = WhatsAppConversationAuditEvent::create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'actor_id' => $request->user()?->id,
            'event_type' => 'note_added',
            'description' => 'Internal note added',
            'meta' => [
                'note_id' => $note->id,
            ],
        ]);

        event(new AuditEventAdded($conversation, [
            'id' => $audit->id,
            'event_type' => $audit->event_type,
            'description' => $audit->description,
            'meta' => $audit->meta,
            'created_at' => $audit->created_at->toIso8601String(),
            'actor' => $request->user()?->only(['id', 'name', 'email']),
        ]));

        return response()->json(['note' => $notePayload]);
    }

    /**
     * Update conversation meta (status/assignment/priority).
     */
    public function updateMeta(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'closed'])],
            'assigned_to' => 'nullable|integer|exists:users,id',
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
        ]);

        $updates = [];
        $auditPayloads = [];

        if (array_key_exists('status', $validated) && $validated['status']) {
            $updates['status'] = $validated['status'];
            $auditPayloads[] = [
                'event_type' => 'status_changed',
                'description' => "Status changed to {$validated['status']}",
                'meta' => ['status' => $validated['status']],
            ];
        }

        if (array_key_exists('assigned_to', $validated) && Schema::hasColumn('whatsapp_conversations', 'assigned_to')) {
            $assigneeId = $validated['assigned_to'];
            $previousAssigneeId = $conversation->assigned_to;
            if ($assigneeId) {
                $assignableIds = $account->getAssignableAgentIds();
                if (!in_array((int) $assigneeId, $assignableIds, true)) {
                    return back()->withErrors(['assigned_to' => 'Selected agent is not a team member for this account.']);
                }
            }
            $updates['assigned_to'] = $assigneeId ?: null;

            $actorName = $request->user()?->name ?? 'Someone';
            $assigneeName = $assigneeId ? (User::find($assigneeId)?->name ?? 'Unknown') : null;
            if ($assigneeId && $previousAssigneeId && (int) $previousAssigneeId !== (int) $assigneeId) {
                $description = "Transferred to {$assigneeName} by {$actorName}";
                $eventType = 'transferred';
            } elseif ($assigneeId) {
                $description = "Assigned to {$assigneeName} by {$actorName}";
                $eventType = 'assigned';
            } else {
                $description = "Unassigned by {$actorName}";
                $eventType = 'unassigned';
            }
            $auditPayloads[] = [
                'event_type' => $eventType,
                'description' => $description,
                'meta' => ['assigned_to' => $assigneeId],
            ];
        }

        if (array_key_exists('priority', $validated) && Schema::hasColumn('whatsapp_conversations', 'priority')) {
            $updates['priority'] = $validated['priority'];
            $auditPayloads[] = [
                'event_type' => 'priority_changed',
                'description' => "Priority changed to {$validated['priority']}",
                'meta' => ['priority' => $validated['priority']],
            ];
        }

        if (empty($updates)) {
            return back()->with('success', 'No changes made.');
        }

        $conversation->update($updates);

        foreach ($auditPayloads as $payload) {
            $audit = WhatsAppConversationAuditEvent::create([
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'actor_id' => $request->user()?->id,
                'event_type' => $payload['event_type'],
                'description' => $payload['description'],
                'meta' => $payload['meta'],
            ]);

            event(new AuditEventAdded($conversation, [
                'id' => $audit->id,
                'event_type' => $audit->event_type,
                'description' => $audit->description,
                'meta' => $audit->meta,
                'created_at' => $audit->created_at->toIso8601String(),
                'actor' => $request->user()?->only(['id', 'name', 'email']),
            ]));
        }

        event(new ConversationUpdated($conversation));

        return back()->with('success', 'Conversation updated.');
    }

    /**
     * Get an AI-suggested reply for the conversation (requires user preference and AI module).
     */
    public function aiSuggest(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            return response()->json(['error' => 'Conversation not found.'], 404);
        }

        if (!$request->user()?->ai_suggestions_enabled) {
            return response()->json(['error' => 'AI suggestions are disabled in your settings.'], 403);
        }

        $effectiveModules = $this->planResolver->getEffectiveModules($account);
        if (!in_array('ai', $effectiveModules, true)) {
            return response()->json(['error' => 'AI module is not available on your plan.'], 403);
        }

        if (!\App\Models\PlatformSetting::get('ai.enabled', false)) {
            return response()->json(['error' => 'AI is disabled in platform settings.'], 403);
        }

        $this->entitlementService->assertWithinLimit($account, 'ai_credits_monthly', 1);

        try {
            $customInstruction = $this->resolveScopedPromptInstruction($request);
            $suggestion = $this->conversationAssistant->suggestReply($conversation, 25, $customInstruction);
            $suggestion = trim($suggestion);
            $suggestion = $this->applySuggestionGuardrails($suggestion);

            if ($suggestion === '') {
                return response()->json(['error' => 'AI returned an empty suggestion. Please try again.'], 422);
            }

            $this->usageService->incrementAiCredits($account, 1);

            $user = $request->user();
            if ($user && $account && Schema::hasTable('ai_usage_logs')) {
                try {
                    AiUsageLog::create([
                        'user_id' => $user->id,
                        'account_id' => $account->id,
                        'feature' => 'conversation_suggest',
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    // Usage logging should never block AI suggestions.
                    \Illuminate\Support\Facades\Log::warning('AI usage log write failed', [
                        'conversation_id' => $conversation->id,
                        'user_id' => $user->id,
                        'account_id' => $account->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return response()->json(['suggestion' => $suggestion]);
        } catch (\Throwable $e) {
            [$error, $status] = $this->mapAiSuggestionError($e);
            \Illuminate\Support\Facades\Log::warning('AI suggestion failed', [
                'conversation_id' => $conversation->id,
                'account_id' => $account?->id,
                'user_id' => $request->user()?->id,
                'exception' => $e::class,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => $error,
            ], $status);
        }
    }

    public function aiFeedback(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            return response()->json(['error' => 'Conversation not found.'], 404);
        }

        $validated = $request->validate([
            'suggestion' => 'required|string|max:8000',
            'verdict' => 'required|string|in:up,down',
            'reason' => 'nullable|string|max:1000',
        ]);

        if (Schema::hasTable('ai_suggestion_feedback')) {
            AiSuggestionFeedback::create([
                'account_id' => $account->id,
                'user_id' => $request->user()?->id,
                'whatsapp_conversation_id' => $conversation->id,
                'suggestion' => $validated['suggestion'],
                'verdict' => $validated['verdict'],
                'reason' => $validated['reason'] ?? null,
                'metadata' => [
                    'contact_id' => $conversation->whatsapp_contact_id,
                    'connection_id' => $conversation->whatsapp_connection_id,
                ],
            ]);
        }

        return response()->json(['ok' => true]);
    }

    protected function mapAiSuggestionError(\Throwable $e): array
    {
        $message = trim((string) $e->getMessage());
        $lower = Str::lower($message);

        if (Str::contains($lower, ['api key not configured', 'unknown ai provider', 'not configured'])) {
            return ['AI provider is not configured. Please check Platform Settings -> AI.', 422];
        }

        if (Str::contains($lower, ['invalid api key', 'unauthorized', 'authentication'])) {
            return ['AI provider authentication failed. Please verify API credentials in Platform Settings.', 422];
        }

        if (Str::contains($lower, ['timeout', 'timed out', 'curl error 28', 'connection', 'network'])) {
            return ['AI provider timed out. Please retry in a few seconds.', 503];
        }

        if (Str::contains($lower, ['gemini', 'model']) && Str::contains($lower, ['not found', 'not supported', 'listmodels'])) {
            return ['Selected Gemini model is unavailable for your API key/version. Set AI model to gemini-2.0-flash in Platform Settings -> AI and try again.', 422];
        }

        if ($message !== '') {
            return ['AI suggestion failed: ' . $message, 503];
        }

        return ['AI suggestion failed. Please try again.', 503];
    }

    protected function resolveScopedPromptInstruction(Request $request): ?string
    {
        $user = $request->user();
        $account = $request->attributes->get('account') ?? current_account();
        if (!$user || !$account) {
            return null;
        }

        $prompts = collect(is_array($user->ai_prompts) ? $user->ai_prompts : []);
        if ($prompts->isEmpty()) {
            return null;
        }

        $role = $this->resolveAccountRole($account, $user);
        $instruction = $prompts
            ->filter(fn ($prompt) => ($prompt['enabled'] ?? true) !== false)
            ->filter(fn ($prompt) => in_array(($prompt['purpose'] ?? ''), ['conversation_suggest', 'reply_suggestion'], true))
            ->filter(function ($prompt) use ($role) {
                $scope = $prompt['scope'] ?? 'all';
                return $scope === 'all' || $scope === $role;
            })
            ->pluck('prompt')
            ->map(fn ($prompt) => trim((string) $prompt))
            ->filter()
            ->implode("\n\n");

        return $instruction !== '' ? $instruction : null;
    }

    protected function resolveAccountRole($account, User $user): string
    {
        if ((int) $account->owner_id === (int) $user->id) {
            return 'owner';
        }

        $membership = $account->users()
            ->where('users.id', $user->id)
            ->first();

        return $membership?->pivot?->role ?? 'member';
    }

    protected function applySuggestionGuardrails(string $suggestion): string
    {
        $normalized = preg_replace('/\s+/', ' ', trim($suggestion)) ?? '';
        if ($normalized === '') {
            return '';
        }

        // Basic PII guardrails: redact long numeric strings and card-like patterns.
        $normalized = preg_replace('/\b\d{10,19}\b/', '[REDACTED-NUMBER]', $normalized) ?? $normalized;
        $normalized = preg_replace('/\b(?:\d[ -]*?){13,16}\b/', '[REDACTED-CARD]', $normalized) ?? $normalized;

        return trim($normalized);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wantsJson = $request->expectsJson() || $request->ajax();
        $respondError = function (string $message, ?string $detail = null, int $status = 422) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json([
                    'message' => $message,
                    'message_detail' => $detail,
                ], $status);
            }

            return redirect()->back()->withErrors([
                'message' => $message,
                'message_detail' => $detail,
            ]);
        };
        $respondSuccess = function (string $message) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['success' => true, 'message' => $message], 200);
            }

            return redirect()->back()->with('success', $message);
        };

        // Ensure conversation belongs to account
        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:4096',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        $messageBody = trim((string) ($validated['message'] ?? ''));
        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);
        $conversation->load(['connection', 'contact']);
        $this->outboundPipeline->assertSendPrerequisites($conversation->connection, (string) $conversation->contact->wa_id, 'text');
        $windowGuard = $this->ensureCustomerCareWindowOpen($conversation, $respondError);
        if ($windowGuard !== null) {
            return $windowGuard;
        }

        $messageFingerprint = hash('sha256', implode('|', [
            'text',
            (string) $conversation->id,
            $messageBody,
        ]));
        if (!$this->reserveOutboundSendGuard(
            (int) $account->id,
            (int) $conversation->id,
            'text',
            $clientRequestId,
            $messageFingerprint
        )) {
            return $respondSuccess('Duplicate send request ignored. Message is already being processed.');
        }

        $this->outboundPipeline->assertRateLimits($account, $conversation->connection);
        $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
            (int) $account->id,
            (int) $conversation->id,
            'text',
            $clientRequestId,
            $messageFingerprint
        );
        $outboundJob = $this->outboundPipeline->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
            'whatsapp_conversation_id' => $conversation->id,
            'message_type' => 'text',
            'to_wa_id' => $conversation->contact->wa_id,
            'client_request_id' => $clientRequestId,
            'idempotency_key' => $pipelineIdempotencyKey,
            'request_payload' => [
                'message' => $messageBody,
            ],
        ]);
        if ($outboundJob) {
            $this->outboundPipeline->markValidating($outboundJob);
        }

        // Check message limit before sending
        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        // Use transaction with lock to prevent duplicate message creation
        $message = DB::transaction(function () use ($account, $conversation, $messageBody) {
            return WhatsAppMessage::lockForUpdate()
                ->create([
                    'account_id' => $account->id,
                    'whatsapp_conversation_id' => $conversation->id,
                    'direction' => 'outbound',
                    'type' => 'text',
                    'text_body' => $messageBody,
                    'status' => 'queued']);
        });

        // Load relationships for broadcast
        $message->load('conversation.contact');
        
        // Broadcast optimistic message created
        event(new MessageCreated($message));

        try {
            if ($outboundJob) {
                $this->outboundPipeline->markSending($outboundJob);
            }
            // Send via WhatsApp API
            $response = $this->whatsappClient->sendTextMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $messageBody
            );

            // Update message with Meta message ID and status
            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => $response]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            // Increment usage counter
            $this->usageService->incrementMessages($account, 1);

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($messageBody, 0, 100)]);

            $this->touchContactAfterOutbound($conversation);

            // Broadcast message update and conversation update
            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return $respondSuccess('Message sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            if ($outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            // Broadcast failed status
            event(new MessageUpdated($message));

            if ($this->sendPolicyService->isProvider24HourPolicyError($e)) {
                return $respondError(
                    'outside_24h',
                    'You can only send a template message to reopen this conversation. Use the template button above.'
                );
            }

            return $respondError('Failed to send message.', $e->getMessage());
        }
    }

    public function sendTemplateMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wantsJson = $request->expectsJson() || $request->ajax();
        $respondError = function (string $message, int $status = 422) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['message' => $message], $status);
            }

            return redirect()->back()->withErrors(['template' => $message]);
        };
        $respondSuccess = function (string $message) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['success' => true, 'message' => $message], 200);
            }

            return redirect()->back()->with('success', $message);
        };

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        if (!$request->has('variables') || $request->input('variables') === null || $request->input('variables') === '') {
            $request->merge(['variables' => []]);
        }

        $validated = $request->validate([
            'template_id' => 'required|integer|exists:whatsapp_templates,id',
            'variables' => 'sometimes|array',
            'variables.*' => 'nullable|string|max:1024',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        $template = WhatsAppTemplate::where('account_id', $account->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->where(function ($query) {
                $query->where('is_archived', false)
                    ->orWhereNull('is_archived');
            })
            ->findOrFail($validated['template_id']);

        $conversationContact = $conversation->contact ?: WhatsAppContact::find($conversation->whatsapp_contact_id);
        if ($this->contactComplianceService->isSuppressed($conversationContact)) {
            return $respondError('This contact is suppressed (opted out/blocked/do-not-contact).');
        }

        $sendability = $this->templateLifecycleService->evaluateSendability($template);
        if (!$sendability['ok']) {
            return $respondError($sendability['reason'] ?? 'Template is not sendable.');
        }

        // Re-validate live status from Meta to avoid stale local status sending outdated versions.
        try {
            $statusData = $this->templateManagementService->getTemplateStatus($conversation->connection, (string) $template->meta_template_id);
            $liveStatus = $this->templateLifecycleService->normalizeStatus((string) ($statusData['status'] ?? $template->status ?? ''));
            $liveName = strtolower(trim((string) ($statusData['name'] ?? '')));
            $localName = strtolower(trim((string) $template->name));
            $liveLanguage = strtolower(trim((string) ($statusData['language'] ?? '')));
            $localLanguage = strtolower(trim((string) $template->language));
            $rejectionReason = $statusData['rejected_reason'] ?? $statusData['rejection_reason'] ?? null;
            $template->update([
                'status' => $liveStatus ?: $template->status,
                'remote_status' => $liveStatus ?: $template->remote_status,
                'last_synced_at' => now(),
                'last_meta_sync_at' => now(),
                'last_meta_error' => $rejectionReason,
                'meta_rejection_reason' => $rejectionReason,
                'sync_state' => $this->templateLifecycleService->computeSyncState(
                    $liveStatus ?: (string) $template->status,
                    now(),
                    (bool) ($template->is_remote_deleted ?? false),
                    $rejectionReason
                ),
            ]);

            if ($liveName !== '' && $liveName !== $localName) {
                return $respondError('Template mismatch detected on Meta. Please re-sync templates and try again.');
            }

            if ($liveLanguage !== '' && $liveLanguage !== $localLanguage) {
                return $respondError('Template language mismatch detected on Meta. Please re-sync templates and try again.');
            }

            if (!$this->templateLifecycleService->isSendableStatus($liveStatus)) {
                return $respondError('Template is not approved on Meta yet (current status: '.$liveStatus.').');
            }

            // Meta delivery resolves template by name + language.
            // Ensure currently deliverable version is exactly this local template version.
            $deliverable = $this->templateManagementService->getDeliverableTemplateByNameLanguage(
                $conversation->connection,
                (string) $template->name,
                (string) $template->language
            );

            if ($deliverable && (string) ($deliverable['id'] ?? '') !== (string) $template->meta_template_id) {
                return $respondError('A different approved version of this template is currently deliverable on Meta. Wait for this new version approval, then sync templates.');
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::channel('whatsapp')->warning('Template live status verification failed before conversation send', [
                'template_id' => $template->id,
                'meta_template_id' => $template->meta_template_id,
                'error' => $e->getMessage(),
            ]);

            return $respondError('Could not verify latest template status from Meta. Please try again after template sync.');
        }

        $variables = $this->normalizeTemplateVariables($validated['variables'] ?? []);
        $payloadValidation = $this->templateLifecycleService->evaluateSendPayload($template, $variables);
        if (!$payloadValidation['ok']) {
            return $respondError($payloadValidation['reason'] ?? 'Template payload validation failed.');
        }

        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);
        $templateFingerprint = hash('sha256', implode('|', [
            'template',
            (string) $template->id,
            (string) $conversation->id,
            json_encode($variables, JSON_UNESCAPED_UNICODE) ?: '',
        ]));
        if (!$this->reserveOutboundSendGuard(
            (int) $account->id,
            (int) $conversation->id,
            'template',
            $clientRequestId,
            $templateFingerprint
        )) {
            return $respondSuccess('Duplicate send request ignored. Message is already being processed.');
        }

        $this->outboundPipeline->assertRateLimits($account, $conversation->connection);
        $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
            (int) $account->id,
            (int) $conversation->id,
            'template',
            $clientRequestId,
            $templateFingerprint
        );
        $outboundJob = $this->outboundPipeline->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
            'whatsapp_conversation_id' => $conversation->id,
            'message_type' => 'template',
            'to_wa_id' => $conversation->contact->wa_id,
            'client_request_id' => $clientRequestId,
            'idempotency_key' => $pipelineIdempotencyKey,
            'request_payload' => [
                'template_id' => $template->id,
                'template_name' => $template->name,
                'language' => $template->language,
                'variables' => $variables,
            ],
        ]);
        if ($outboundJob) {
            $this->outboundPipeline->markValidating($outboundJob);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);
        $this->outboundPipeline->assertSendPrerequisites($conversation->connection, (string) $conversation->contact->wa_id, 'template');

        try {
            DB::beginTransaction();

            $payload = $this->templateComposer->preparePayload(
                $template,
                $conversation->contact->wa_id,
                $variables
            );

            $preview = $this->templateComposer->renderPreview($template, $variables);

            $message = WhatsAppMessage::lockForUpdate()->create([
                'account_id' => $account->id,
                'whatsapp_conversation_id' => $conversation->id,
                'direction' => 'outbound',
                'type' => 'template',
                'text_body' => $preview['body'],
                'payload' => $payload,
                'status' => 'queued']);

            $templateSend = WhatsAppTemplateSend::create([
                'account_id' => $account->id,
                'whatsapp_template_id' => $template->id,
                'whatsapp_message_id' => $message->id,
                'to_wa_id' => $conversation->contact->wa_id,
                'variables' => $variables,
                'status' => 'queued']);

            $message->load('conversation.contact');
            event(new MessageCreated($message));

            if ($outboundJob) {
                $this->outboundPipeline->markSending($outboundJob);
            }
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
                'sent_at' => now()]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            $templateSend->update([
                'status' => 'sent',
                'sent_at' => now()]);

            $this->usageService->incrementMessages($account, 1);
            $this->usageService->incrementTemplateSends($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($message->text_body ?? '', 0, 100)]);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            DB::commit();

            return $respondSuccess('Template sent successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($message)) {
                $message->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()]);
                event(new MessageUpdated($message));
                if ($outboundJob) {
                    $outboundJob->update(['whatsapp_message_id' => $message->id]);
                }
            }

            if (isset($templateSend)) {
                $templateSend->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()]);
            }

            if (isset($outboundJob) && $outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
            }

            return $respondError('Failed to send template: '.$e->getMessage());
        }
    }

    public function sendMediaMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wantsJson = $request->expectsJson() || $request->ajax();
        $respondError = function (string $message, ?string $detail = null, int $status = 422) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json([
                    'message' => $message,
                    'message_detail' => $detail,
                ], $status);
            }

            return redirect()->back()->withErrors([
                'media' => $message,
                'message_detail' => $detail,
            ]);
        };
        $respondSuccess = function (string $message) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['success' => true, 'message' => $message], 200);
            }

            return redirect()->back()->with('success', $message);
        };

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'type' => 'required|in:image,video,document',
            'caption' => 'nullable|string|max:1024',
            'attachment' => 'required|file|max:10240',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);

        $mimeRules = [
            'image' => 'mimes:jpg,jpeg,png,gif,webp',
            'video' => 'mimetypes:video/mp4,video/quicktime,video/3gpp',
            'document' => 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip'];
        $request->validate([
            'attachment' => $mimeRules[$validated['type']] ?? 'file']);

        $conversation->load(['connection', 'contact']);
        $this->outboundPipeline->assertSendPrerequisites($conversation->connection, (string) $conversation->contact->wa_id, 'media');
        $windowGuard = $this->ensureCustomerCareWindowOpen($conversation, $respondError);
        if ($windowGuard !== null) {
            return $windowGuard;
        }

        $file = $request->file('attachment');
        $caption = $validated['caption'] ?? null;
        $filename = $file->getClientOriginalName();
        $type = $validated['type'];
        $mediaFingerprint = hash('sha256', implode('|', [
            'media',
            (string) $conversation->id,
            $type,
            (string) $caption,
            (string) $filename,
            (string) $file->getSize(),
        ]));
        if (!$this->reserveOutboundSendGuard(
            (int) $account->id,
            (int) $conversation->id,
            'media',
            $clientRequestId,
            $mediaFingerprint
        )) {
            return $respondSuccess('Duplicate send request ignored. Message is already being processed.');
        }

        $this->outboundPipeline->assertRateLimits($account, $conversation->connection);
        $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
            (int) $account->id,
            (int) $conversation->id,
            'media',
            $clientRequestId,
            $mediaFingerprint
        );
        $outboundJob = $this->outboundPipeline->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
            'whatsapp_conversation_id' => $conversation->id,
            'message_type' => 'media',
            'to_wa_id' => $conversation->contact->wa_id,
            'client_request_id' => $clientRequestId,
            'idempotency_key' => $pipelineIdempotencyKey,
            'request_payload' => [
                'type' => $type,
                'caption' => $caption,
                'filename' => $filename,
            ],
        ]);
        if ($outboundJob) {
            $this->outboundPipeline->markValidating($outboundJob);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $path = $file->store('whatsapp-media', 'public');
        $url = rtrim(config('app.url'), '/') . Storage::url($path);

        $message = WhatsAppMessage::lockForUpdate()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => $type,
            'text_body' => $caption,
            'payload' => [
                'type' => $type,
                'link' => $url,
                'caption' => $caption,
                'filename' => $filename],
            'status' => 'queued']);

        $message->load('conversation.contact');
        event(new MessageCreated($message));

        try {
            if ($outboundJob) {
                $this->outboundPipeline->markSending($outboundJob);
            }
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
                'payload' => array_merge($message->payload ?? [], ['response' => $response])]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $caption ? substr($caption, 0, 100) : strtoupper($type) . ' attachment']);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return $respondSuccess('Media sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));
            if (isset($outboundJob) && $outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            return $respondError('Failed to send media.', $e->getMessage());
        }
    }

    public function sendLocationMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wantsJson = $request->expectsJson() || $request->ajax();
        $respondError = function (string $message, ?string $detail = null, int $status = 422) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json([
                    'message' => $message,
                    'message_detail' => $detail,
                ], $status);
            }

            return redirect()->back()->withErrors([
                'location' => $message,
                'message_detail' => $detail,
            ]);
        };
        $respondSuccess = function (string $message) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['success' => true, 'message' => $message], 200);
            }

            return redirect()->back()->with('success', $message);
        };

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'name' => 'nullable|string|max:120',
            'address' => 'nullable|string|max:255',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        $conversation->load(['connection', 'contact']);
        $this->outboundPipeline->assertSendPrerequisites($conversation->connection, (string) $conversation->contact->wa_id, 'location');
        $windowGuard = $this->ensureCustomerCareWindowOpen($conversation, $respondError);
        if ($windowGuard !== null) {
            return $windowGuard;
        }

        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);
        $locationFingerprint = hash('sha256', implode('|', [
            'location',
            (string) $conversation->id,
            (string) $validated['latitude'],
            (string) $validated['longitude'],
            (string) ($validated['name'] ?? ''),
            (string) ($validated['address'] ?? ''),
        ]));
        if (!$this->reserveOutboundSendGuard(
            (int) $account->id,
            (int) $conversation->id,
            'location',
            $clientRequestId,
            $locationFingerprint
        )) {
            return $respondSuccess('Duplicate send request ignored. Message is already being processed.');
        }

        $this->outboundPipeline->assertRateLimits($account, $conversation->connection);
        $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
            (int) $account->id,
            (int) $conversation->id,
            'location',
            $clientRequestId,
            $locationFingerprint
        );
        $outboundJob = $this->outboundPipeline->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
            'whatsapp_conversation_id' => $conversation->id,
            'message_type' => 'location',
            'to_wa_id' => $conversation->contact->wa_id,
            'client_request_id' => $clientRequestId,
            'idempotency_key' => $pipelineIdempotencyKey,
            'request_payload' => [
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'name' => $validated['name'] ?? null,
                'address' => $validated['address'] ?? null,
            ],
        ]);
        if ($outboundJob) {
            $this->outboundPipeline->markValidating($outboundJob);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $message = WhatsAppMessage::lockForUpdate()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'location',
            'text_body' => $validated['name'] ?? null,
            'payload' => [
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'name' => $validated['name'] ?? null,
                'address' => $validated['address'] ?? null],
            'status' => 'queued']);

        $message->load('conversation.contact');
        event(new MessageCreated($message));

        try {
            if ($outboundJob) {
                $this->outboundPipeline->markSending($outboundJob);
            }
            $response = $this->whatsappClient->sendLocationMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                [
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'name' => $validated['name'] ?? null,
                    'address' => $validated['address'] ?? null]
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], ['response' => $response])]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => 'Location shared']);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return $respondSuccess('Location sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));
            if (isset($outboundJob) && $outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            return $respondError('Failed to send location.', $e->getMessage());
        }
    }

    /**
     * Send a list message.
     */
    public function sendList(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wantsJson = $request->expectsJson() || $request->ajax();
        $respondError = function (string $message, ?string $detail = null, int $status = 422) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json([
                    'message' => $message,
                    'message_detail' => $detail,
                ], $status);
            }

            return redirect()->back()->withErrors([
                'list' => $message,
                'message_detail' => $detail,
            ]);
        };
        $respondSuccess = function (string $message) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['success' => true, 'message' => $message], 200);
            }

            return redirect()->back()->with('success', $message);
        };

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'list_id' => 'required|exists:whatsapp_lists,id',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        $list = \App\Modules\WhatsApp\Models\WhatsAppList::where('id', $validated['list_id'])
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->firstOrFail();

        if ($list->whatsapp_connection_id !== $conversation->whatsapp_connection_id) {
            return $respondError('This list belongs to a different connection.');
        }

        $conversation->load(['connection', 'contact']);
        $this->outboundPipeline->assertSendPrerequisites($conversation->connection, (string) $conversation->contact->wa_id, 'list');
        $windowGuard = $this->ensureCustomerCareWindowOpen($conversation, $respondError);
        if ($windowGuard !== null) {
            return $windowGuard;
        }

        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);
        $listFingerprint = hash('sha256', implode('|', [
            'list',
            (string) $conversation->id,
            (string) $list->id,
        ]));
        if (!$this->reserveOutboundSendGuard(
            (int) $account->id,
            (int) $conversation->id,
            'list',
            $clientRequestId,
            $listFingerprint
        )) {
            return $respondSuccess('Duplicate send request ignored. Message is already being processed.');
        }

        $this->outboundPipeline->assertRateLimits($account, $conversation->connection);
        $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
            (int) $account->id,
            (int) $conversation->id,
            'list',
            $clientRequestId,
            $listFingerprint
        );
        $outboundJob = $this->outboundPipeline->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
            'whatsapp_conversation_id' => $conversation->id,
            'message_type' => 'list',
            'to_wa_id' => $conversation->contact->wa_id,
            'client_request_id' => $clientRequestId,
            'idempotency_key' => $pipelineIdempotencyKey,
            'request_payload' => [
                'list_id' => $list->id,
                'list_name' => $list->name,
            ],
        ]);
        if ($outboundJob) {
            $this->outboundPipeline->markValidating($outboundJob);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $listFormat = $list->toMetaFormat();

        $message = WhatsAppMessage::lockForUpdate()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'interactive',
            'text_body' => $list->description ?? $list->name,
            'payload' => [
                'list_id' => $list->id,
                'list_name' => $list->name,
                'interactive' => $listFormat,
            ],
            'status' => 'queued']);

        $message->load('conversation.contact');
        event(new MessageCreated($message));

        try {
            if ($outboundJob) {
                $this->outboundPipeline->markSending($outboundJob);
            }
            $response = $this->whatsappClient->sendListMessage(
                $conversation->connection,
                $conversation->contact->wa_id,
                $list->button_text,
                $listFormat['action']['sections'],
                $listFormat['header']['text'] ?? null,
                $listFormat['body']['text'] ?? null,
                $listFormat['footer']['text'] ?? null
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], ['response' => $response])]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $list->name]);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return $respondSuccess('List message sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));
            if (isset($outboundJob) && $outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            return $respondError('Failed to send list: ' . $e->getMessage());
        }
    }

    /**
     * Send interactive buttons message.
     */
    public function sendInteractiveButtons(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $wantsJson = $request->expectsJson() || $request->ajax();
        $respondError = function (string $message, ?string $detail = null, int $status = 422) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json([
                    'message' => $message,
                    'message_detail' => $detail,
                ], $status);
            }

            return redirect()->back()->withErrors([
                'buttons' => $message,
                'message_detail' => $detail,
            ]);
        };
        $respondSuccess = function (string $message) use ($wantsJson) {
            if ($wantsJson) {
                return response()->json(['success' => true, 'message' => $message], 200);
            }

            return redirect()->back()->with('success', $message);
        };

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'body_text' => 'required|string|max:1024',
            'buttons' => 'required|array|min:1|max:3',
            'buttons.*.id' => 'required|string|max:256',
            'buttons.*.text' => 'required|string|max:20',
            'header_text' => 'nullable|string|max:60',
            'footer_text' => 'nullable|string|max:60',
            'client_request_id' => 'nullable|string|max:120',
        ]);

        $conversation->load(['connection', 'contact']);
        $this->outboundPipeline->assertSendPrerequisites($conversation->connection, (string) $conversation->contact->wa_id, 'buttons');
        $windowGuard = $this->ensureCustomerCareWindowOpen($conversation, $respondError);
        if ($windowGuard !== null) {
            return $windowGuard;
        }

        $clientRequestId = $this->normalizeClientRequestId($validated['client_request_id'] ?? null);
        $buttonsFingerprint = hash('sha256', implode('|', [
            'buttons',
            (string) $conversation->id,
            (string) ($validated['body_text'] ?? ''),
            json_encode($validated['buttons'] ?? [], JSON_UNESCAPED_UNICODE) ?: '',
            (string) ($validated['header_text'] ?? ''),
            (string) ($validated['footer_text'] ?? ''),
        ]));
        if (!$this->reserveOutboundSendGuard(
            (int) $account->id,
            (int) $conversation->id,
            'buttons',
            $clientRequestId,
            $buttonsFingerprint
        )) {
            return $respondSuccess('Duplicate send request ignored. Message is already being processed.');
        }

        $this->outboundPipeline->assertRateLimits($account, $conversation->connection);
        $pipelineIdempotencyKey = $this->outboundPipeline->buildIdempotencyKey(
            (int) $account->id,
            (int) $conversation->id,
            'buttons',
            $clientRequestId,
            $buttonsFingerprint
        );
        $outboundJob = $this->outboundPipeline->begin([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $conversation->whatsapp_connection_id,
            'whatsapp_conversation_id' => $conversation->id,
            'message_type' => 'buttons',
            'to_wa_id' => $conversation->contact->wa_id,
            'client_request_id' => $clientRequestId,
            'idempotency_key' => $pipelineIdempotencyKey,
            'request_payload' => [
                'body_text' => $validated['body_text'],
                'buttons' => $validated['buttons'],
                'header_text' => $validated['header_text'] ?? null,
                'footer_text' => $validated['footer_text'] ?? null,
            ],
        ]);
        if ($outboundJob) {
            $this->outboundPipeline->markValidating($outboundJob);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $message = WhatsAppMessage::lockForUpdate()->create([
            'account_id' => $account->id,
            'whatsapp_conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'type' => 'interactive',
            'text_body' => $validated['body_text'],
            'payload' => [
                'interactive_type' => 'button',
                'buttons' => $validated['buttons'],
                'header_text' => $validated['header_text'] ?? null,
                'footer_text' => $validated['footer_text'] ?? null,
            ],
            'status' => 'queued']);

        $message->load('conversation.contact');
        event(new MessageCreated($message));

        try {
            if ($outboundJob) {
                $this->outboundPipeline->markSending($outboundJob);
            }
            $response = $this->whatsappClient->sendInteractiveButtons(
                $conversation->connection,
                $conversation->contact->wa_id,
                $validated['body_text'],
                $validated['buttons'],
                $validated['header_text'] ?? null,
                $validated['footer_text'] ?? null
            );

            $metaMessageId = $response['messages'][0]['id'] ?? null;
            $message->update([
                'meta_message_id' => $metaMessageId,
                'status' => 'sent',
                'sent_at' => now(),
                'payload' => array_merge($message->payload ?? [], ['response' => $response])]);
            if ($outboundJob) {
                $this->outboundPipeline->markSentToProvider($outboundJob, $metaMessageId, $response);
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($validated['body_text'], 0, 100)]);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return $respondSuccess('Interactive buttons sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));
            if (isset($outboundJob) && $outboundJob) {
                $failure = $this->outboundPipeline->classifyFailure($e);
                $this->outboundPipeline->markFailed(
                    $outboundJob,
                    $e->getMessage(),
                    $this->outboundPipeline->safeSerializeProviderError($e),
                    $failure['retryable'],
                    $failure['retry_after_seconds']
                );
                $outboundJob->update(['whatsapp_message_id' => $message->id]);
            }

            return $respondError('Failed to send interactive buttons: ' . $e->getMessage());
        }
    }

    private function normalizeTemplateVariables(mixed $variables): array
    {
        if (!is_array($variables)) {
            return [];
        }

        return array_values(array_map(
            static fn ($value) => is_scalar($value) ? trim((string) $value) : '',
            $variables
        ));
    }

    private function normalizeClientRequestId(mixed $raw): ?string
    {
        if (!is_scalar($raw)) {
            return null;
        }

        $value = trim((string) $raw);
        if ($value === '') {
            return null;
        }

        if (!preg_match('/^[A-Za-z0-9:_\-]{8,120}$/', $value)) {
            return null;
        }

        return $value;
    }

    private function reserveOutboundSendGuard(
        int $accountId,
        int $conversationId,
        string $action,
        ?string $clientRequestId,
        string $payloadFingerprint
    ): bool {
        $base = "wa:outbound:guard:{$accountId}:{$conversationId}:{$action}";

        if ($clientRequestId) {
            $requestKey = "{$base}:req:{$clientRequestId}";
            if (!Cache::add($requestKey, true, now()->addMinutes(10))) {
                return false;
            }
        }

        $fingerprint = substr($payloadFingerprint, 0, 48);
        $rapidKey = "{$base}:fp:{$fingerprint}";

        return Cache::add($rapidKey, true, now()->addSeconds(8));
    }

    protected function touchContactAfterOutbound(WhatsAppConversation $conversation): void
    {
        if (!$conversation->relationLoaded('contact')) {
            $conversation->load('contact');
        }

        $contact = $conversation->contact;
        if (!$contact) {
            return;
        }

        $contact->increment('message_count');
        $contact->forceFill([
            'last_contacted_at' => now(),
        ])->save();
    }

    private function ensureCustomerCareWindowOpen(WhatsAppConversation $conversation, callable $respondError): mixed
    {
        $evaluation = $this->sendPolicyService->evaluateConversationFreeForm($conversation);
        if (($evaluation['allowed'] ?? false) === true) {
            return null;
        }

        return $respondError(
            (string) ($evaluation['reason_code'] ?? 'outside_24h'),
            (string) ($evaluation['reason_message'] ?? '24-hour customer care window is closed. Send an approved template message to reopen the conversation.'),
            422
        );
    }

    private function formatCustomerCareWindowState(array $windowState): array
    {
        return [
            'is_open' => (bool) ($windowState['is_open'] ?? false),
            'last_inbound_at' => ($windowState['last_inbound_at'] ?? null)?->toIso8601String(),
            'expires_at' => ($windowState['expires_at'] ?? null)?->toIso8601String(),
            'seconds_remaining' => (int) ($windowState['seconds_remaining'] ?? 0),
        ];
    }
}
