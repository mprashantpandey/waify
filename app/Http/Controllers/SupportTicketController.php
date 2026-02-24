<?php

namespace App\Http\Controllers;

use App\Models\SupportMessage;
use App\Models\SupportThread;
use App\Services\SupportTicketEmailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function __construct(
        protected SupportTicketEmailService $emailService
    ) {
    }

    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $status = (string) $request->string('status', '');
        $search = trim((string) $request->string('search', ''));

        $threads = SupportThread::query()
            ->with(['creator:id,name,email', 'assignee:id,name,email'])
            ->where('account_id', $account->id)
            ->when(in_array($status, ['open', 'closed', 'pending'], true), fn ($q) => $q->where('status', $status))
            ->when($search !== '', function ($q) use ($search) {
                $q->where(function ($inner) use ($search) {
                    $inner->where('subject', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->withCount('messages')
            ->orderByDesc(DB::raw('COALESCE(last_message_at, created_at)'))
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Support/Index', [
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'threads' => $threads,
        ]);
    }

    public function hub(Request $request): RedirectResponse
    {
        return redirect()->route('app.support.index', $request->only(['status', 'search']));
    }

    public function store(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:2|max:10000',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'category' => 'nullable|string|max:100',
        ]);

        [$thread, $message] = DB::transaction(function () use ($account, $user, $validated) {
            $thread = SupportThread::create([
                'account_id' => $account->id,
                'created_by' => $user->id,
                'subject' => $validated['subject'],
                'priority' => $validated['priority'] ?? 'normal',
                'category' => $validated['category'] ?: null,
                'status' => 'open',
                'last_message_at' => now(),
            ]);

            $message = SupportMessage::create([
                'support_thread_id' => $thread->id,
                'sender_type' => 'user',
                'sender_id' => $user->id,
                'body' => $validated['message'],
            ]);

            return [$thread, $message];
        });

        $this->emailService->notifyPlatformTicketCreated($thread, $message);

        return redirect()->route('app.support.index')->with('success', 'Support ticket created successfully.');
    }

    public function show(Request $request, string $thread): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $supportThread = $this->resolveThread($thread, (int) $account->id);
        $supportThread->load([
            'creator:id,name,email',
            'assignee:id,name,email',
            'messages.sender:id,name,email',
        ]);

        return Inertia::render('Support/Show', [
            'thread' => [
                'id' => $supportThread->id,
                'slug' => $supportThread->slug,
                'subject' => $supportThread->subject,
                'status' => $supportThread->status,
                'priority' => $supportThread->priority,
                'category' => $supportThread->category,
                'created_at' => optional($supportThread->created_at)->toIso8601String(),
                'updated_at' => optional($supportThread->updated_at)->toIso8601String(),
                'last_message_at' => optional($supportThread->last_message_at)->toIso8601String(),
                'creator' => $supportThread->creator,
                'assignee' => $supportThread->assignee,
                'messages' => $supportThread->messages->map(fn (SupportMessage $message) => [
                    'id' => $message->id,
                    'sender_type' => $message->sender_type,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender?->name ?? ($message->sender_type === 'admin' ? 'Platform Support' : 'User'),
                    'body' => $message->body,
                    'created_at' => optional($message->created_at)->toIso8601String(),
                ])->values(),
            ],
        ]);
    }

    public function message(Request $request, string $thread): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();
        $supportThread = $this->resolveThread($thread, (int) $account->id);

        $validated = $request->validate([
            'message' => 'required|string|min:1|max:10000',
        ]);

        if ($supportThread->status === 'closed') {
            return redirect()->back()->with('error', 'This ticket is closed. Reopen it before replying.');
        }

        $message = SupportMessage::create([
            'support_thread_id' => $supportThread->id,
            'sender_type' => 'user',
            'sender_id' => $user->id,
            'body' => $validated['message'],
        ]);

        $supportThread->forceFill(['last_message_at' => now()])->save();
        $this->emailService->notifyPlatformTenantReply($supportThread, $message);

        return redirect()->route('app.support.show', ['thread' => $supportThread->slug])->with('success', 'Reply sent.');
    }

    public function close(Request $request, string $thread): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $supportThread = $this->resolveThread($thread, (int) $account->id);
        $before = $supportThread->status;
        $supportThread->update(['status' => 'closed']);
        $this->emailService->notifyPlatformTicketUpdated($supportThread->fresh(['creator', 'account']), ['status' => [$before, 'closed']], $request->user());

        return redirect()->back()->with('success', 'Ticket closed.');
    }

    public function reopen(Request $request, string $thread): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $supportThread = $this->resolveThread($thread, (int) $account->id);
        $before = $supportThread->status;
        $supportThread->update(['status' => 'open', 'last_message_at' => now()]);
        $this->emailService->notifyPlatformTicketUpdated($supportThread->fresh(['creator', 'account']), ['status' => [$before, 'open']], $request->user());

        return redirect()->back()->with('success', 'Ticket reopened.');
    }

    private function resolveThread(string $value, int $accountId): SupportThread
    {
        return SupportThread::query()
            ->where('account_id', $accountId)
            ->where(function ($q) use ($value) {
                $q->where('slug', $value);
                if (is_numeric($value)) {
                    $q->orWhere('id', (int) $value);
                }
            })
            ->firstOrFail();
    }
}
