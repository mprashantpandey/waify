<?php

namespace App\Modules\Support\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Support\Events\SupportMessageCreated;
use App\Modules\Support\Models\SupportMessage;
use App\Modules\Support\Models\SupportThread;
use App\Notifications\SupportCustomerReplied;
use App\Notifications\SupportTicketCreated;
use App\Models\PlatformSetting;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $threads = SupportThread::where('workspace_id', $workspace->id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (SupportThread $thread) {
                return [
                    'id' => $thread->id,
                    'slug' => $thread->slug ?? (string) $thread->id,
                    'subject' => $thread->subject,
                    'status' => $thread->status,
                    'mode' => $thread->mode ?? 'bot',
                    'channel' => $thread->channel ?? 'ticket',
                    'priority' => $thread->priority ?? 'normal',
                    'category' => $thread->category,
                    'tags' => $thread->tags ?? [],
                    'due_at' => $thread->due_at?->toIso8601String(),
                    'first_response_due_at' => $thread->first_response_due_at?->toIso8601String(),
                    'escalation_level' => $thread->escalation_level ?? 0,
                    'last_message_at' => $thread->last_message_at?->toIso8601String(),
                    'created_at' => $thread->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Support/Index', [
            'workspace' => $workspace,
            'threads' => $threads,
        ]);
    }

    public function store(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $hasFiles = $request->hasFile('attachments');
        if (!trim((string) $request->input('message')) && !$hasFiles) {
            return redirect()->back()->withErrors(['message' => 'Message or attachment is required.']);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:200',
            'message' => 'nullable|string|max:2000',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable',
            'attachments.*' => $this->attachmentRules(),
        ]);
        $tags = $this->parseTags($request->input('tags'));

        $thread = SupportThread::create([
            'workspace_id' => $workspace->id,
            'created_by' => $request->user()->id,
            'subject' => $validated['subject'],
            'status' => 'open',
            'mode' => 'bot',
            'channel' => 'ticket',
            'priority' => 'normal',
            'category' => $validated['category'] ?? null,
            'tags' => $tags,
            'first_response_due_at' => $this->firstResponseDueAt(),
            'due_at' => $this->ticketDueAt(),
            'last_message_at' => now(),
        ]);

        $body = trim((string) $request->input('message', ''));
        $message = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'user',
            'sender_id' => $request->user()->id,
            'body' => $body,
        ]);
        $this->storeAttachments($message, $request->file('attachments', []));
        $message->load('thread');
        event(new SupportMessageCreated($message));
        $this->logAction($thread, 'ticket_created');
        $this->notifyPlatformAdmins(new SupportTicketCreated($thread));

        return redirect()->route('app.support.show', [
            'workspace' => $workspace->slug,
            'thread' => $thread->slug,
        ])->with('success', 'Support request created.');
    }

    public function show(Request $request, $thread)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        if (!$workspace && $request->route('workspace')) {
            $workspace = Workspace::where('slug', $request->route('workspace'))->first();
        }
        $threadValue = $thread instanceof SupportThread ? $thread->getKey() : $thread;
        $thread = SupportThread::resolveThread($threadValue);

        if (!$thread) {
            \Log::warning('Support thread not found', [
                'thread_param' => $thread,
                'thread_id' => $threadValue,
                'route_params' => $request->route()?->parameters() ?? [],
                'workspace_slug' => $request->route('workspace'),
                'workspace_id' => $workspace?->id,
            ]);
        }

        if ($thread && $workspace && $thread->workspace_id !== $workspace->id) {
            $user = $request->user();
            $target = Workspace::find($thread->workspace_id);
            if ($target && $user && $user->canAccessWorkspace($target)) {
                return redirect()->route('app.support.show', [
                    'workspace' => $target->slug,
                    'thread' => $thread->slug,
                ]);
            }
            abort(403);
        }

        if (!$thread) {
            return redirect()
                ->route('app.support.hub', [
                    'workspace' => $workspace?->slug ?? $request->route('workspace'),
                    'tab' => 'history',
                ])
                ->with('error', 'Support thread not found.');
        }

        $messages = SupportMessage::where('support_thread_id', $thread->id)
            ->orderBy('created_at')
            ->get()
            ->map(function (SupportMessage $message) {
                $message->loadMissing('attachments');
                return [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'sender_id' => $message->sender_id,
                    'body' => $message->body,
                    'created_at' => $message->created_at->toIso8601String(),
                    'attachments' => $message->attachments->map(function ($attachment) {
                        return [
                            'id' => $attachment->id,
                            'file_name' => $attachment->file_name,
                            'mime_type' => $attachment->mime_type,
                            'file_size' => $attachment->file_size,
                            'url' => route('support.attachments.show', ['attachment' => $attachment->id]),
                        ];
                    })->values(),
                ];
            });

        return Inertia::render('Support/Show', [
            'workspace' => $workspace,
            'thread' => [
                'id' => $thread->id,
                'slug' => $thread->slug ?? (string) $thread->id,
                'subject' => $thread->subject,
                'status' => $thread->status,
                'mode' => $thread->mode ?? 'bot',
                'channel' => $thread->channel ?? 'ticket',
                'priority' => $thread->priority ?? 'normal',
                'category' => $thread->category,
                'tags' => $thread->tags ?? [],
                'due_at' => $thread->due_at?->toIso8601String(),
                'first_response_due_at' => $thread->first_response_due_at?->toIso8601String(),
                'escalation_level' => $thread->escalation_level ?? 0,
                'created_at' => $thread->created_at->toIso8601String(),
            ],
            'messages' => $messages,
        ]);
    }

    public function hub(Request $request): Response
    {
        $this->escalateOverdue();
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $threads = SupportThread::where('workspace_id', $workspace->id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->get()
            ->map(function (SupportThread $thread) {
                return [
                    'id' => $thread->id,
                    'slug' => $thread->slug ?? (string) $thread->id,
                    'subject' => $thread->subject,
                    'status' => $thread->status,
                    'mode' => $thread->mode ?? 'bot',
                    'channel' => $thread->channel ?? 'ticket',
                    'priority' => $thread->priority ?? 'normal',
                    'category' => $thread->category,
                    'tags' => $thread->tags ?? [],
                    'due_at' => $thread->due_at?->toIso8601String(),
                    'first_response_due_at' => $thread->first_response_due_at?->toIso8601String(),
                    'escalation_level' => $thread->escalation_level ?? 0,
                    'last_message_at' => $thread->last_message_at?->toIso8601String(),
                    'created_at' => $thread->created_at->toIso8601String(),
                ];
            });

        $openThreads = $threads->filter(fn ($thread) => in_array($thread['status'], ['open', 'pending'], true) && ($thread['channel'] ?? 'ticket') === 'ticket')->values();
        $closedThreads = $threads->filter(fn ($thread) => $thread['status'] === 'closed')->values();
        $liveThreads = $threads->filter(fn ($thread) => ($thread['channel'] ?? 'ticket') === 'live' && $thread['status'] === 'open')->values();

        $faqs = $this->getFaqs();

        return Inertia::render('Support/Hub', [
            'workspace' => $workspace,
            'threads' => $threads,
            'openThreads' => $openThreads,
            'closedThreads' => $closedThreads,
            'liveThreads' => $liveThreads,
            'faqs' => $faqs,
        ]);
    }

    public function message(Request $request, $thread)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $thread = SupportThread::where('workspace_id', $workspace->id)
            ->where(function ($query) use ($thread) {
                $query->where('id', $thread)->orWhere('slug', $thread);
            })
            ->firstOrFail();

        $hasFiles = $request->hasFile('attachments');
        if (!trim((string) $request->input('message')) && !$hasFiles) {
            return redirect()->back()->withErrors(['message' => 'Message or attachment is required.']);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:2000',
            'attachments.*' => $this->attachmentRules(),
        ]);

        $body = trim((string) $request->input('message', ''));
        $message = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'user',
            'sender_id' => $request->user()->id,
            'body' => $body,
        ]);
        $this->storeAttachments($message, $request->file('attachments', []));

        $thread->update([
            'last_message_at' => now(),
            'last_response_at' => now(),
        ]);
        $message->load('thread');
        event(new SupportMessageCreated($message));
        $this->logAction($thread, 'customer_replied');
        $this->notifyPlatformAdmins(new SupportCustomerReplied($thread));

        return redirect()->back()->with('success', 'Message sent.');
    }

    public function live(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $thread = SupportThread::where('workspace_id', $workspace->id)
            ->where('channel', 'live')
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->first();

        if (!$thread) {
            return response()->json([
                'thread' => null,
                'messages' => [],
            ]);
        }

        $messages = SupportMessage::where('support_thread_id', $thread->id)
            ->orderBy('created_at')
            ->limit(50)
            ->get()
            ->map(function (SupportMessage $message) {
                $message->loadMissing('attachments');
                return [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'sender_id' => $message->sender_id,
                    'body' => $message->body,
                    'created_at' => $message->created_at->toIso8601String(),
                    'attachments' => $message->attachments->map(function ($attachment) {
                        return [
                            'id' => $attachment->id,
                            'file_name' => $attachment->file_name,
                            'mime_type' => $attachment->mime_type,
                            'file_size' => $attachment->file_size,
                            'url' => route('support.attachments.show', ['attachment' => $attachment->id]),
                        ];
                    })->values(),
                ];
            });

        return response()->json([
            'thread' => [
                'id' => $thread->id,
                'slug' => $thread->slug ?? (string) $thread->id,
                'subject' => $thread->subject,
                'status' => $thread->status,
                'mode' => $thread->mode ?? 'bot',
                'channel' => $thread->channel ?? 'live',
                'priority' => $thread->priority ?? 'normal',
            ],
            'messages' => $messages,
        ]);
    }

    public function liveMessage(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $hasFiles = $request->hasFile('attachments');
        if (!trim((string) $request->input('message')) && !$hasFiles) {
            return response()->json(['error' => 'Message or attachment is required.'], 422);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:2000',
            'subject' => 'nullable|string|max:200',
            'thread_id' => 'nullable|string',
            'attachments.*' => $this->attachmentRules(),
        ]);

        $thread = null;
        if (!empty($validated['thread_id'])) {
            $thread = SupportThread::where('workspace_id', $workspace->id)
                ->where(function ($query) use ($validated) {
                    $query->where('id', $validated['thread_id'])
                        ->orWhere('slug', $validated['thread_id']);
                })
                ->firstOrFail();
        }

        if (!$thread) {
            $thread = SupportThread::create([
                'workspace_id' => $workspace->id,
                'created_by' => $request->user()->id,
                'subject' => $validated['subject'] ?? 'Live chat',
                'status' => 'open',
                'mode' => 'bot',
                'channel' => 'live',
                'priority' => 'normal',
                'first_response_due_at' => $this->firstResponseDueAt(),
                'due_at' => $this->ticketDueAt(),
                'last_message_at' => now(),
            ]);
        } elseif (!$thread->channel) {
            $thread->update(['channel' => 'live']);
        }
        if ($thread->status === 'closed') {
            $thread->update(['status' => 'open']);
        }

        $body = trim((string) $request->input('message', ''));
        $message = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'user',
            'sender_id' => $request->user()->id,
            'body' => $body,
        ]);
        $this->storeAttachments($message, $request->file('attachments', []));

        $thread->update([
            'last_message_at' => now(),
            'last_response_at' => now(),
        ]);
        $message->load('thread');
        event(new SupportMessageCreated($message));
        $this->logAction($thread, 'customer_replied');
        $this->notifyPlatformAdmins(new SupportCustomerReplied($thread));

        $botReply = null;
        if (($thread->mode ?? 'bot') === 'bot' && \App\Models\PlatformSetting::get('ai.enabled', false) && $body !== '') {
            try {
                $assistant = app(\App\Services\AI\SupportAssistantService::class);
                $messages = SupportMessage::where('support_thread_id', $thread->id)
                    ->orderBy('created_at')
                    ->limit(20)
                    ->get();
                $reply = $assistant->generateReply($thread, $messages, 'reply');
                if ($reply) {
                    $botMessage = SupportMessage::create([
                        'support_thread_id' => $thread->id,
                        'sender_type' => 'bot',
                        'sender_id' => null,
                        'body' => $reply,
                    ]);
                    $botMessage->load('thread');
                    event(new SupportMessageCreated($botMessage));
                    $botReply = [
                        'id' => $botMessage->id,
                        'sender_type' => $botMessage->sender_type,
                        'sender_id' => $botMessage->sender_id,
                        'body' => $botMessage->body,
                        'created_at' => $botMessage->created_at->toIso8601String(),
                    ];
                }
            } catch (\Throwable $e) {
                // Ignore AI failures for live chat
            }
        }

        return response()->json([
            'thread' => [
                'id' => $thread->id,
                'slug' => $thread->slug ?? (string) $thread->id,
                'subject' => $thread->subject,
                'status' => $thread->status,
                'mode' => $thread->mode ?? 'bot',
                'channel' => $thread->channel ?? 'live',
                'priority' => $thread->priority ?? 'normal',
            ],
            'message' => [
                'id' => $message->id,
                'sender_type' => $message->sender_type,
                'sender_id' => $message->sender_id,
                'body' => $message->body,
                'created_at' => $message->created_at->toIso8601String(),
                'attachments' => $message->attachments->map(function ($attachment) {
                    return [
                        'id' => $attachment->id,
                        'file_name' => $attachment->file_name,
                        'mime_type' => $attachment->mime_type,
                        'file_size' => $attachment->file_size,
                        'url' => route('support.attachments.show', ['attachment' => $attachment->id]),
                    ];
                })->values(),
            ],
            'bot' => $botReply,
        ]);
    }

    public function liveRequestHuman(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $thread = SupportThread::where('workspace_id', $workspace->id)
            ->where('channel', 'live')
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->first();

        if (!$thread) {
            $thread = SupportThread::create([
                'workspace_id' => $workspace->id,
                'created_by' => $request->user()->id,
                'subject' => 'Live chat',
                'status' => 'open',
                'mode' => 'human',
                'channel' => 'live',
                'priority' => 'normal',
                'first_response_due_at' => $this->firstResponseDueAt(),
                'due_at' => $this->ticketDueAt(),
                'last_message_at' => now(),
            ]);
        } else {
            $thread->update([
                'mode' => 'human',
                'channel' => 'live',
                'last_message_at' => now(),
            ]);
        }

        $systemMessage = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'system',
            'sender_id' => null,
            'body' => 'Customer requested a live agent.',
        ]);
        $systemMessage->load('thread');
        event(new SupportMessageCreated($systemMessage));
        $this->logAction($thread, 'live_agent_requested');
        $this->notifyPlatformAdmins(new SupportTicketCreated($thread));

        return response()->json([
            'thread' => [
                'id' => $thread->id,
                'slug' => $thread->slug ?? (string) $thread->id,
                'subject' => $thread->subject,
                'status' => $thread->status,
                'mode' => $thread->mode ?? 'human',
                'channel' => $thread->channel ?? 'live',
                'priority' => $thread->priority ?? 'normal',
            ],
        ]);
    }

    public function close(Request $request, $thread)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $thread = SupportThread::where('workspace_id', $workspace->id)
            ->where(function ($query) use ($thread) {
                $query->where('id', $thread)->orWhere('slug', $thread);
            })
            ->firstOrFail();

        $thread->update([
            'status' => 'closed',
            'last_message_at' => now(),
            'resolved_at' => now(),
        ]);
        $systemMessage = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'system',
            'sender_id' => null,
            'body' => 'Chat closed by customer.',
        ]);
        $systemMessage->load('thread');
        event(new SupportMessageCreated($systemMessage));
        $this->logAction($thread, 'chat_closed');

        return redirect()->back()->with('success', 'Chat closed.');
    }

    public function reopen(Request $request, $thread)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $thread = SupportThread::where('workspace_id', $workspace->id)
            ->where(function ($query) use ($thread) {
                $query->where('id', $thread)->orWhere('slug', $thread);
            })
            ->firstOrFail();

        $thread->update([
            'status' => 'open',
            'last_message_at' => now(),
            'resolved_at' => null,
        ]);
        $systemMessage = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'system',
            'sender_id' => null,
            'body' => 'Chat reopened by customer.',
        ]);
        $systemMessage->load('thread');
        event(new SupportMessageCreated($systemMessage));
        $this->logAction($thread, 'chat_reopened');

        return redirect()->back()->with('success', 'Chat reopened.');
    }

    public function liveClose(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();
        $thread = SupportThread::where('workspace_id', $workspace->id)
            ->where('channel', 'live')
            ->where('status', 'open')
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->first();

        if ($thread) {
            $thread->update([
                'status' => 'closed',
                'last_message_at' => now(),
            ]);
            $systemMessage = SupportMessage::create([
                'support_thread_id' => $thread->id,
                'sender_type' => 'system',
                'sender_id' => null,
                'body' => 'Live chat closed by customer.',
            ]);
            $systemMessage->load('thread');
            event(new SupportMessageCreated($systemMessage));
        }

        return response()->json([
            'closed' => (bool) $thread,
        ]);
    }

    protected function getFaqs(): array
    {
        $raw = \App\Models\PlatformSetting::get('support.faqs');
        $decoded = [];
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true) ?: [];
        }

        if (!is_array($decoded) || empty($decoded)) {
            return [
                [
                    'question' => 'How do I connect WhatsApp?',
                    'answer' => 'Go to Connections and follow the setup wizard to connect your WhatsApp Business account.',
                ],
                [
                    'question' => 'How do I request a live agent?',
                    'answer' => 'Open Live Chat and click "Talk to a live agent" to hand off to support.',
                ],
                [
                    'question' => 'Where can I see my past tickets?',
                    'answer' => 'Open Support Hub and check the Previous Chats tab.',
                ],
            ];
        }

        return $decoded;
    }

    protected function firstResponseDueAt(): ?\Illuminate\Support\Carbon
    {
        $hours = (int) \App\Models\PlatformSetting::get('support.first_response_hours', 4);
        return now()->addHours($hours);
    }

    protected function ticketDueAt(): ?\Illuminate\Support\Carbon
    {
        $hours = (int) \App\Models\PlatformSetting::get('support.sla_hours', 48);
        return now()->addHours($hours);
    }

    protected function logAction(SupportThread $thread, string $action, array $meta = []): void
    {
        \App\Modules\Support\Models\SupportAuditLog::create([
            'support_thread_id' => $thread->id,
            'user_id' => request()->user()?->id,
            'action' => $action,
            'meta' => $meta,
        ]);
    }

    protected function escalateOverdue(): void
    {
        $overdue = SupportThread::where('status', 'open')
            ->whereNotNull('due_at')
            ->whereNull('escalated_at')
            ->where('due_at', '<', now())
            ->get();

        foreach ($overdue as $thread) {
            $thread->update([
                'escalated_at' => now(),
                'escalation_level' => max(1, (int) $thread->escalation_level + 1),
            ]);
            $this->logAction($thread, 'escalated', ['level' => $thread->escalation_level]);
        }

        $firstResponseOverdue = SupportThread::where('status', 'open')
            ->whereNotNull('first_response_due_at')
            ->whereNull('first_response_at')
            ->where('first_response_due_at', '<', now())
            ->get();

        foreach ($firstResponseOverdue as $thread) {
            if ((int) $thread->escalation_level >= 1) {
                continue;
            }
            $thread->update([
                'escalation_level' => 1,
            ]);
            $this->logAction($thread, 'first_response_overdue');
        }
    }

    protected function attachmentRules(): array
    {
        $maxMb = (int) PlatformSetting::get('performance.max_upload_size', 10);
        $maxKb = max(1, $maxMb) * 1024;
        $types = $this->allowedAttachmentTypes();
        $rules = ['file', 'max:' . $maxKb];
        if (!empty($types)) {
            $rules[] = 'mimes:' . implode(',', $types);
        }
        return $rules;
    }

    protected function allowedAttachmentTypes(): array
    {
        $raw = PlatformSetting::get('performance.allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx');
        $types = array_filter(array_map('trim', explode(',', (string) $raw)));
        return array_values(array_unique($types));
    }

    protected function parseTags(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('trim', $value)));
        }
        if (is_string($value)) {
            return array_values(array_filter(array_map('trim', explode(',', $value))));
        }
        return [];
    }

    protected function notifyPlatformAdmins(\Illuminate\Notifications\Notification $notification): void
    {
        if (!PlatformSetting::get('support.email_notifications_enabled', true)) {
            return;
        }
        if (!PlatformSetting::get('support.notify_admins', true)) {
            return;
        }

        $admins = User::where('is_platform_admin', true)->get();
        if ($admins->isEmpty()) {
            return;
        }
        Notification::send($admins, $notification);
    }

    protected function storeAttachments(SupportMessage $message, array $files): void
    {
        foreach ($files as $file) {
            if (!$file) {
                continue;
            }
            $path = $file->store('support/attachments', 'public');
            $message->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize() ?: 0,
            ]);
        }
    }
}
