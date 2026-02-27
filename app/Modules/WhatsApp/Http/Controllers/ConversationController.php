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
use App\Modules\WhatsApp\Services\TemplateManagementService;
use App\Modules\WhatsApp\Services\WhatsAppClient;
use App\Services\AI\ConversationAssistantService;
use App\Core\Billing\PlanResolver;
use App\Models\AiUsageLog;
use App\Models\AiSuggestionFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
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
        protected TemplateManagementService $templateManagementService,
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
                'connection:id,account_id,name']);

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
            ->paginate(20)
            ->through(function ($conversation) {
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
                        'name' => $conversation->connection->name],
                    'assigned_to' => Schema::hasColumn('whatsapp_conversations', 'assigned_to')
                        ? $conversation->assigned_to
                        : null,
                    'priority' => Schema::hasColumn('whatsapp_conversations', 'priority')
                        ? $conversation->priority
                        : null,
                ];
            });

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

        // Load last 50 messages for initial render (optimized query)
        $messages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)
            ->select(['id', 'direction', 'type', 'text_body', 'payload', 'status', 'created_at', 'sent_at', 'delivered_at', 'read_at'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse() // Reverse to show oldest first
            ->values()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
                    'created_at' => $message->created_at->toIso8601String(),
                    'updated_at' => $message->updated_at?->toIso8601String(),
                    'sent_at' => $message->sent_at?->toIso8601String(),
                    'delivered_at' => $message->delivered_at?->toIso8601String(),
                    'read_at' => $message->read_at?->toIso8601String()];
            });

        $totalMessages = WhatsAppMessage::where('whatsapp_conversation_id', $conversation->id)->count();

        $templates = WhatsAppTemplate::where('account_id', $account->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->whereRaw('LOWER(TRIM(status)) = ?', ['approved'])
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
                'header_text',
                'footer_text',
                'buttons'])
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
            ->select(['id', 'direction', 'type', 'text_body', 'payload', 'status', 'created_at', 'sent_at', 'delivered_at', 'read_at'])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'direction' => $message->direction,
                    'type' => $message->type,
                    'text_body' => $message->text_body,
                    'payload' => $message->payload,
                    'status' => $message->status,
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
            } elseif ($assigneeId) {
                $description = "Assigned to {$assigneeName} by {$actorName}";
            } else {
                $description = "Unassigned by {$actorName}";
            }
            $auditPayloads[] = [
                'event_type' => 'assigned',
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

        // Ensure conversation belongs to account
        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:4096']);

        // Check message limit before sending
        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

        // Use transaction with lock to prevent duplicate message creation
        $message = DB::transaction(function () use ($account, $conversation, $validated) {
            return WhatsAppMessage::lockForUpdate()
                ->create([
                    'account_id' => $account->id,
                    'whatsapp_conversation_id' => $conversation->id,
                    'direction' => 'outbound',
                    'type' => 'text',
                    'text_body' => $validated['message'],
                    'status' => 'queued']);
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
                'payload' => $response]);

            // Increment usage counter
            $this->usageService->incrementMessages($account, 1);

            // Update conversation
            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($validated['message'], 0, 100)]);

            $this->touchContactAfterOutbound($conversation);

            // Broadcast message update and conversation update
            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Message sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);

            // Broadcast failed status
            event(new MessageUpdated($message));

            $msg = $e->getMessage();
            $is24hWindow = $e->getCode() === 131047
                || stripos($msg, '131047') !== false
                || stripos($msg, 'recovery') !== false
                || stripos($msg, 'template') !== false
                || stripos($msg, 'session') !== false
                || stripos($msg, '24 hour') !== false
                || stripos($msg, 'message outside') !== false;

            if ($is24hWindow) {
                return redirect()->back()->withErrors([
                    'message' => 'outside_24h',
                    'message_detail' => 'You can only send a template message to reopen this conversation. Use the template button above.']);
            }

            return redirect()->back()->withErrors([
                'message' => 'Failed to send message: ' . $e->getMessage()]);
        }
    }

    public function sendTemplateMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        if (!$request->has('variables') || $request->input('variables') === null || $request->input('variables') === '') {
            $request->merge(['variables' => []]);
        }

        $validated = $request->validate([
            'template_id' => 'required|integer|exists:whatsapp_templates,id',
            'variables' => 'sometimes|array',
            'variables.*' => 'nullable|string|max:1024']);

        $template = WhatsAppTemplate::where('account_id', $account->id)
            ->where('whatsapp_connection_id', $conversation->whatsapp_connection_id)
            ->whereRaw('LOWER(TRIM(status)) = ?', ['approved'])
            ->where(function ($query) {
                $query->where('is_archived', false)
                    ->orWhereNull('is_archived');
            })
            ->findOrFail($validated['template_id']);

        if (empty($template->meta_template_id)) {
            return redirect()->back()->withErrors([
                'template' => 'Template is missing Meta template ID. Sync templates from Meta and try again.',
            ]);
        }

        // Re-validate live status from Meta to avoid stale local status sending outdated versions.
        try {
            $statusData = $this->templateManagementService->getTemplateStatus($conversation->connection, (string) $template->meta_template_id);
            $liveStatus = strtolower(trim((string) ($statusData['status'] ?? $template->status ?? '')));
            $liveName = strtolower(trim((string) ($statusData['name'] ?? '')));
            $localName = strtolower(trim((string) $template->name));
            $liveLanguage = strtolower(trim((string) ($statusData['language'] ?? '')));
            $localLanguage = strtolower(trim((string) $template->language));
            $template->update([
                'status' => $liveStatus ?: $template->status,
                'last_synced_at' => now(),
                'last_meta_error' => $statusData['rejected_reason'] ?? $statusData['rejection_reason'] ?? null,
            ]);

            if ($liveName !== '' && $liveName !== $localName) {
                return redirect()->back()->withErrors([
                    'template' => 'Template mismatch detected on Meta. Please re-sync templates and try again.',
                ]);
            }

            if ($liveLanguage !== '' && $liveLanguage !== $localLanguage) {
                return redirect()->back()->withErrors([
                    'template' => 'Template language mismatch detected on Meta. Please re-sync templates and try again.',
                ]);
            }

            if (!in_array($liveStatus, ['approved', 'active'], true)) {
                return redirect()->back()->withErrors([
                    'template' => 'Template is not approved on Meta yet (current status: '.$liveStatus.').',
                ]);
            }

            // Meta delivery resolves template by name + language.
            // Ensure currently deliverable version is exactly this local template version.
            $deliverable = $this->templateManagementService->getDeliverableTemplateByNameLanguage(
                $conversation->connection,
                (string) $template->name,
                (string) $template->language
            );

            if ($deliverable && (string) ($deliverable['id'] ?? '') !== (string) $template->meta_template_id) {
                return redirect()->back()->withErrors([
                    'template' => 'A different approved version of this template is currently deliverable on Meta. Wait for this new version approval, then sync templates.',
                ]);
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::channel('whatsapp')->warning('Template live status verification failed before conversation send', [
                'template_id' => $template->id,
                'meta_template_id' => $template->meta_template_id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->withErrors([
                'template' => 'Could not verify latest template status from Meta. Please try again after template sync.',
            ]);
        }

        $requiredVars = $this->templateComposer->extractRequiredVariables($template);
        $variables = $this->normalizeTemplateVariables($validated['variables'] ?? []);
        $nonEmptyCount = count(array_filter($variables, static fn (string $value) => $value !== ''));
        if ($nonEmptyCount < (int) ($requiredVars['total'] ?? 0)) {
            return redirect()->back()->withErrors([
                'template' => "Template requires {$requiredVars['total']} variable(s), but only {$nonEmptyCount} non-empty value(s) were provided.",
            ]);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

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

            return redirect()->back()->with('success', 'Template sent successfully.');
        } catch (\Exception $e) {
            DB::rollBack();

            if (isset($message)) {
                $message->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()]);
                event(new MessageUpdated($message));
            }

            if (isset($templateSend)) {
                $templateSend->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()]);
            }

            return redirect()->back()->withErrors([
                'template' => 'Failed to send template. Please try again.']);
        }
    }

    public function sendMediaMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'type' => 'required|in:image,video,document',
            'caption' => 'nullable|string|max:1024',
            'attachment' => 'required|file|max:10240']);

        $mimeRules = [
            'image' => 'mimes:jpg,jpeg,png,gif,webp',
            'video' => 'mimetypes:video/mp4,video/quicktime,video/3gpp',
            'document' => 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip'];
        $request->validate([
            'attachment' => $mimeRules[$validated['type']] ?? 'file']);

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

        $file = $request->file('attachment');
        $path = $file->store('whatsapp-media', 'public');
        $url = rtrim(config('app.url'), '/') . Storage::url($path);

        $caption = $validated['caption'] ?? null;
        $filename = $file->getClientOriginalName();
        $type = $validated['type'];

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

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $caption ? substr($caption, 0, 100) : strtoupper($type) . ' attachment']);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Media sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'media' => 'Failed to send media. Please try again.']);
        }
    }

    public function sendLocationMessage(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'name' => 'nullable|string|max:120',
            'address' => 'nullable|string|max:255']);

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

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

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => 'Location shared']);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Location sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'location' => 'Failed to send location. Please try again.']);
        }
    }

    /**
     * Send a list message.
     */
    public function sendList(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if (!account_ids_match($conversation->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'list_id' => 'required|exists:whatsapp_lists,id',
        ]);

        $list = \App\Modules\WhatsApp\Models\WhatsAppList::where('id', $validated['list_id'])
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->firstOrFail();

        if ($list->whatsapp_connection_id !== $conversation->whatsapp_connection_id) {
            return redirect()->back()->withErrors([
                'list_id' => 'This list belongs to a different connection.']);
        }

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

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

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => $list->name]);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'List message sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'list' => 'Failed to send list: ' . $e->getMessage()]);
        }
    }

    /**
     * Send interactive buttons message.
     */
    public function sendInteractiveButtons(Request $request, WhatsAppConversation $conversation)
    {
        $account = $request->attributes->get('account') ?? current_account();

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
        ]);

        $this->entitlementService->assertWithinLimit($account, 'messages_monthly', 1);

        $conversation->load(['connection', 'contact']);

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

            $this->usageService->incrementMessages($account, 1);

            $conversation->update([
                'last_message_at' => now(),
                'last_message_preview' => substr($validated['body_text'], 0, 100)]);

            $this->touchContactAfterOutbound($conversation);

            event(new MessageUpdated($message));
            event(new ConversationUpdated($conversation));

            return redirect()->back()->with('success', 'Interactive buttons sent successfully.');
        } catch (\Exception $e) {
            $message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage()]);
            event(new MessageUpdated($message));

            return redirect()->back()->withErrors([
                'buttons' => 'Failed to send interactive buttons: ' . $e->getMessage()]);
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
}
