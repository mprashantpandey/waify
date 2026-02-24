<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use App\Models\SupportThread;
use App\Models\User;
use App\Services\SupportTicketEmailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupportDeskController extends Controller
{
    public function __construct(
        protected SupportTicketEmailService $emailService
    ) {
    }

    public function hub(): RedirectResponse
    {
        return redirect()->route('platform.support.index');
    }

    public function index(Request $request): Response
    {
        $status = trim((string) $request->input('status', ''));
        $search = trim((string) $request->input('search', ''));
        $accountId = is_numeric($request->input('account_id')) ? (int) $request->input('account_id') : null;
        $assigned = trim((string) $request->input('assigned', ''));

        $threads = SupportThread::query()
            ->with(['account:id,name,slug', 'creator:id,name,email', 'assignee:id,name,email'])
            ->withCount('messages')
            ->when($accountId, fn ($q) => $q->where('account_id', $accountId))
            ->when(in_array($status, ['open', 'closed', 'pending'], true), fn ($q) => $q->where('status', $status))
            ->when($assigned === 'me', fn ($q) => $q->where('assigned_to', $request->user()->id))
            ->when($assigned === 'unassigned', fn ($q) => $q->whereNull('assigned_to'))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('subject', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhereHas('account', fn ($a) => $a->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc(DB::raw('COALESCE(last_message_at, created_at)'))
            ->paginate(25)
            ->withQueryString()
            ->through(function (SupportThread $thread) {
                return [
                    'id' => $thread->id,
                    'slug' => $thread->slug,
                    'subject' => $thread->subject,
                    'status' => $thread->status,
                    'priority' => $thread->priority,
                    'category' => $thread->category,
                    'last_message_at' => $thread->last_message_at?->toIso8601String(),
                    'created_at' => $thread->created_at?->toIso8601String(),
                    'messages_count' => (int) $thread->messages_count,
                    'account' => $thread->account ? [
                        'id' => $thread->account->id,
                        'name' => $thread->account->name,
                        'slug' => $thread->account->slug,
                    ] : null,
                    'creator' => $thread->creator ? [
                        'id' => $thread->creator->id,
                        'name' => $thread->creator->name,
                        'email' => $thread->creator->email,
                    ] : null,
                    'assignee' => $thread->assignee ? [
                        'id' => $thread->assignee->id,
                        'name' => $thread->assignee->name,
                        'email' => $thread->assignee->email,
                    ] : null,
                ];
            });

        $admins = User::query()->where('is_super_admin', true)->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Platform/Support/Index', [
            'threads' => $threads,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'account_id' => $accountId,
                'assigned' => $assigned,
            ],
            'admins' => $admins,
        ]);
    }

    public function show(string $thread): Response
    {
        $supportThread = $this->resolveThread($thread);
        $supportThread->load([
            'account:id,name,slug',
            'creator:id,name,email',
            'assignee:id,name,email',
            'messages.sender:id,name,email',
        ]);

        $admins = User::query()->where('is_super_admin', true)->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('Platform/Support/Show', [
            'thread' => [
                'id' => $supportThread->id,
                'slug' => $supportThread->slug,
                'subject' => $supportThread->subject,
                'status' => $supportThread->status,
                'priority' => $supportThread->priority,
                'category' => $supportThread->category,
                'account' => $supportThread->account,
                'creator' => $supportThread->creator,
                'assignee' => $supportThread->assignee,
                'created_at' => $supportThread->created_at?->toIso8601String(),
                'last_message_at' => $supportThread->last_message_at?->toIso8601String(),
                'messages' => $supportThread->messages->map(fn (SupportMessage $message) => [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'sender_name' => $message->sender?->name ?? ($message->sender_type === 'admin' ? 'Platform Support' : 'User'),
                    'sender_email' => $message->sender?->email,
                    'body' => $message->body,
                    'created_at' => $message->created_at?->toIso8601String(),
                ])->values(),
            ],
            'admins' => $admins,
        ]);
    }

    public function message(Request $request, string $thread): RedirectResponse
    {
        $supportThread = $this->resolveThread($thread);
        $validated = $request->validate(['message' => 'required|string|min:1|max:10000']);

        $message = SupportMessage::create([
            'support_thread_id' => $supportThread->id,
            'sender_type' => 'admin',
            'sender_id' => $request->user()->id,
            'body' => $validated['message'],
        ]);

        if ($supportThread->status === 'closed') {
            $supportThread->status = 'open';
        }
        $supportThread->last_message_at = now();
        if (!$supportThread->assigned_to) {
            $supportThread->assigned_to = $request->user()->id;
        }
        $supportThread->save();
        $this->emailService->notifyTenantAdminReply($supportThread, $message);

        return back()->with('success', 'Reply sent to tenant ticket.');
    }

    public function update(Request $request, string $thread): RedirectResponse
    {
        $supportThread = $this->resolveThread($thread);

        $validated = $request->validate([
            'status' => 'nullable|in:open,closed,pending',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'category' => 'nullable|string|max:100',
            'assigned_to' => 'nullable',
        ]);

        $payload = [];
        if (array_key_exists('status', $validated) && $validated['status']) {
            $payload['status'] = $validated['status'];
        }
        if (array_key_exists('priority', $validated) && $validated['priority']) {
            $payload['priority'] = $validated['priority'];
        }
        if (array_key_exists('category', $validated)) {
            $payload['category'] = $validated['category'] ?: null;
        }
        if (array_key_exists('assigned_to', $validated)) {
            $assignedTo = $validated['assigned_to'];
            if ($assignedTo === '' || $assignedTo === null) {
                $payload['assigned_to'] = null;
            } else {
                $adminId = (int) $assignedTo;
                $exists = User::where('id', $adminId)->where('is_super_admin', true)->exists();
                if (! $exists) {
                    return back()->with('error', 'Assignee must be a platform admin.');
                }
                $payload['assigned_to'] = $adminId;
            }
        }

        $changes = [];
        foreach (['status', 'priority', 'category', 'assigned_to'] as $field) {
            if (array_key_exists($field, $payload)) {
                $before = $supportThread->getOriginal($field);
                $after = $payload[$field];
                if ((string) ($before ?? '') !== (string) ($after ?? '')) {
                    $changes[$field] = [$before, $after];
                }
            }
        }

        if (! empty($payload)) {
            $supportThread->update($payload);
        }

        if (! empty($changes)) {
            $this->emailService->notifyTenantTicketUpdated($supportThread->fresh(['creator', 'account', 'assignee']), $changes, $request->user());
        }

        return back()->with('success', 'Ticket updated.');
    }

    private function resolveThread(string $value): SupportThread
    {
        return SupportThread::query()
            ->where(function ($q) use ($value) {
                $q->where('slug', $value);
                if (is_numeric($value)) {
                    $q->orWhere('id', (int) $value);
                }
            })
            ->firstOrFail();
    }
}
