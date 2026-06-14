<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Modules\Support\Events\SupportMessageCreated;
use App\Modules\Support\Models\SupportMessage;
use App\Modules\Support\Models\SupportThread;
use App\Notifications\SupportAgentReplied;
use App\Services\AI\SupportAssistantService;
use App\Services\NotificationDispatchService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SupportController extends Controller
{
    public function index(Request $request): Response
    {
        $this->escalateOverdue();

        $perPage = min(50, max(10, (int) $request->integer('per_page', 15)));

        $query = SupportThread::with('account.owner', 'assignee')
            ->when($request->filled('q'), function ($query) use ($request) {
                $search = '%'.(string) $request->string('q')->trim().'%';
                $query->where(function ($inner) use ($search) {
                    $inner->where('subject', 'like', $search)
                        ->orWhereHas('account', fn ($account) => $account->where('name', 'like', $search));
                });
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', function ($query) use ($request) {
                if ($request->input('status') === 'closed') {
                    $query->whereIn('status', ['closed', 'resolved']);

                    return;
                }

                if ($request->input('status') === 'open') {
                    $query->whereNotIn('status', ['closed', 'resolved']);

                    return;
                }

                $query->where('status', $request->input('status'));
            });

        $threads = $query
            ->orderByDesc('last_message_at')
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (SupportThread $thread) => $this->serializeThread($thread));

        $selectedThread = null;
        $messages = collect();
        $auditLogs = [];
        if ($request->filled('ticket')) {
            $selected = SupportThread::resolveThread($request->input('ticket'));
            if ($selected) {
                $selected->load('account.owner', 'assignee');
                $selectedThread = $this->serializeThread($selected);
                $messages = $this->messages($selected);
                $auditLogs = $this->auditLogs($selected->id);
            }
        }

        return Inertia::render('Platform/Support/Index', [
            'threads' => $threads,
            'filters' => [
                'q' => $request->input('q', ''),
                'status' => $request->input('status', 'all'),
                'per_page' => $perPage],
            'stats' => [
                'total' => SupportThread::count(),
                'open' => SupportThread::whereNotIn('status', ['closed', 'resolved'])->count(),
                'closed' => SupportThread::whereIn('status', ['closed', 'resolved'])->count(),
                'urgent' => SupportThread::where('priority', 'urgent')->count()],
            'selectedThread' => $selectedThread,
            'messages' => $messages,
            'admins' => $this->platformAdmins(),
            'auditLogs' => $auditLogs]);
    }

    public function show(Request $request, $thread): RedirectResponse
    {
        $thread = SupportThread::resolveThread($thread);
        if (! $thread) {
            abort(404);
        }

        return redirect()->route('platform.support.index', ['ticket' => $thread->slug ?? $thread->id]);
    }

    public function hub(Request $request): RedirectResponse
    {
        return redirect()->route('platform.support.index');
    }

    public function message(Request $request, $thread)
    {
        $thread = SupportThread::resolveThread($thread);
        if (! $thread) {
            abort(404);
        }

        $hasFiles = $request->hasFile('attachments');
        if (! trim((string) $request->input('message')) && ! $hasFiles) {
            return redirect()->back()->withErrors(['message' => 'Message or attachment is required.']);
        }

        $validated = $request->validate([
            'message' => 'nullable|string|max:2000',
            'attachments.*' => $this->attachmentRules()]);

        $body = trim((string) $request->input('message', ''));
        $message = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'admin',
            'sender_id' => $request->user()->id,
            'body' => $body]);
        $this->storeAttachments($message, $request->file('attachments', []));

        $thread->update([
            'last_message_at' => now(),
            'last_response_at' => now(),
            'first_response_at' => $thread->first_response_at ?: now()]);
        $message->load('thread');
        event(new SupportMessageCreated($message));
        $this->logAction($thread, 'agent_replied');
        $this->notifyCustomer($thread);

        return redirect()->back()->with('success', 'Reply sent.');
    }

    public function assistant(Request $request, $thread, SupportAssistantService $assistant)
    {
        if (! PlatformSetting::get('ai.enabled', false)) {
            return response()->json(['error' => 'AI assistant is disabled.'], 403);
        }

        $thread = SupportThread::resolveThread($thread);
        if (! $thread) {
            abort(404);
        }
        $thread->load('account');
        $action = $request->input('action', 'reply');

        $messages = SupportMessage::where('support_thread_id', $thread->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->reverse()
            ->values();

        try {
            $suggestion = $assistant->generateReply($thread, $messages, $action);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }

        return response()->json([
            'suggestion' => $suggestion]);
    }

    public function close(Request $request, $thread)
    {
        $thread = SupportThread::resolveThread($thread);
        if (! $thread) {
            abort(404);
        }
        $thread->update([
            'status' => 'closed',
            'last_message_at' => now(),
            'resolved_at' => now()]);
        $systemMessage = SupportMessage::create([
            'support_thread_id' => $thread->id,
            'sender_type' => 'system',
            'sender_id' => null,
            'body' => 'Chat closed by support.']);
        $systemMessage->load('thread');
        event(new SupportMessageCreated($systemMessage));
        $this->logAction($thread, 'chat_closed');

        return redirect()->back()->with('success', 'Chat closed.');
    }

    public function update(Request $request, $thread)
    {
        $thread = SupportThread::resolveThread($thread);
        if (! $thread) {
            abort(404);
        }

        $validated = $request->validate([
            'status' => 'nullable|string|in:open,pending,closed',
            'priority' => 'nullable|string|in:low,normal,high,urgent',
            'assigned_to' => 'nullable|integer',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:30']);

        if (isset($validated['assigned_to'])) {
            $admin = \App\Models\User::where('id', $validated['assigned_to'])
                ->where('is_platform_admin', true)
                ->first();
            $validated['assigned_to'] = $admin?->id;
        }

        $updates = array_filter($validated, fn ($value) => $value !== null);
        $thread->update($updates);

        if (array_key_exists('status', $updates)) {
            $systemMessage = SupportMessage::create([
                'support_thread_id' => $thread->id,
                'sender_type' => 'system',
                'sender_id' => null,
                'body' => 'Ticket status updated to '.$updates['status'].'.']);
            $systemMessage->load('thread');
            event(new SupportMessageCreated($systemMessage));
        }
        if (array_key_exists('assigned_to', $updates)) {
            $this->logAction($thread, 'assigned', ['assigned_to' => $updates['assigned_to']]);
        }
        if (array_key_exists('priority', $updates)) {
            $this->logAction($thread, 'priority_changed', ['priority' => $updates['priority']]);
        }
        if (array_key_exists('category', $updates)) {
            $this->logAction($thread, 'category_changed', ['category' => $updates['category']]);
        }
        if (array_key_exists('tags', $updates)) {
            $this->logAction($thread, 'tags_changed', ['tags' => $updates['tags']]);
        }
        if (array_key_exists('status', $updates)) {
            $this->logAction($thread, 'status_changed', ['status' => $updates['status']]);
        }

        return redirect()->back()->with('success', 'Ticket updated.');
    }

    protected function platformAdmins(): array
    {
        return \App\Models\User::where('is_platform_admin', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email])
            ->values()
            ->toArray();
    }

    protected function serializeThread(SupportThread $thread): array
    {
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
            'assigned_to' => $thread->assigned_to,
            'assignee' => $thread->assignee ? [
                'id' => $thread->assignee->id,
                'name' => $thread->assignee->name,
                'email' => $thread->assignee->email] : null,
            'account' => [
                'id' => $thread->account?->id,
                'name' => $thread->account?->name,
                'slug' => $thread->account?->slug,
                'owner' => [
                    'id' => $thread->account?->owner?->id,
                    'name' => $thread->account?->owner?->name,
                    'email' => $thread->account?->owner?->email]],
            'last_message_at' => $thread->last_message_at?->toIso8601String(),
            'created_at' => $thread->created_at->toIso8601String()];
    }

    protected function messages(SupportThread $thread)
    {
        return SupportMessage::where('support_thread_id', $thread->id)
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
                            'url' => route('support.attachments.show', ['attachment' => $attachment->id])];
                    })->values()];
            });
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
                'escalation_level' => max(1, (int) $thread->escalation_level + 1)]);
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
                'escalation_level' => 1]);
            $this->logAction($thread, 'first_response_overdue');
        }
    }

    protected function logAction(SupportThread $thread, string $action, array $meta = []): void
    {
        \App\Modules\Support\Models\SupportAuditLog::create([
            'support_thread_id' => $thread->id,
            'user_id' => request()->user()?->id,
            'action' => $action,
            'meta' => $meta]);
    }

    protected function storeAttachments(SupportMessage $message, array $files): void
    {
        foreach ($files as $file) {
            if (! $file) {
                continue;
            }
            $path = $file->store('support/attachments', 'public');
            $message->attachments()->create([
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize() ?: 0]);
        }
    }

    protected function attachmentRules(): array
    {
        $maxMb = (int) PlatformSetting::get('performance.max_upload_size', 10);
        $maxKb = max(1, $maxMb) * 1024;
        $types = $this->allowedAttachmentTypes();
        $rules = ['file', 'max:'.$maxKb];
        if (! empty($types)) {
            $rules[] = 'mimes:'.implode(',', $types);
        }

        return $rules;
    }

    protected function allowedAttachmentTypes(): array
    {
        $raw = PlatformSetting::get('performance.allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx');
        $types = array_filter(array_map('trim', explode(',', (string) $raw)));

        return array_values(array_unique($types));
    }

    protected function notifyCustomer(SupportThread $thread): void
    {
        if (! PlatformSetting::get('support.email_notifications_enabled', true)) {
            return;
        }
        if (! PlatformSetting::get('support.notify_customers', true)) {
            return;
        }
        $thread->loadMissing('creator', 'account.owner');
        $recipient = $thread->creator ?: $thread->account?->owner;
        if (! $recipient) {
            return;
        }

        app(NotificationDispatchService::class)->send($recipient, new SupportAgentReplied($thread), $this->supportEmailCooldownSeconds());
    }

    protected function supportEmailCooldownSeconds(): int
    {
        $minutes = (int) PlatformSetting::get('support.email_thread_notify_gap_minutes', 60);

        return max(60, $minutes * 60);
    }

    protected function auditLogs(int $threadId): array
    {
        return \App\Modules\Support\Models\SupportAuditLog::with('user')
            ->where('support_thread_id', $threadId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'meta' => $log->meta,
                    'created_at' => $log->created_at?->toIso8601String(),
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email] : null];
            })
            ->values()
            ->toArray();
    }

    protected function getFaqs(): array
    {
        $raw = \App\Models\PlatformSetting::get('support.faqs');
        $decoded = [];
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true) ?: [];
        }

        if (! is_array($decoded) || empty($decoded)) {
            return [
                [
                    'question' => 'How do I connect WhatsApp?',
                    'answer' => 'Go to WABA Account and follow the automatic setup wizard to connect your WhatsApp Business account.'],
                [
                    'question' => 'How do users contact support?',
                    'answer' => 'Users open Support and create a ticket. Replies and attachments stay available in the ticket thread.'],
                [
                    'question' => 'Where can I see my past tickets?',
                    'answer' => 'Open Support Hub and check the Previous Chats tab.']];
        }

        return $decoded;
    }
}
