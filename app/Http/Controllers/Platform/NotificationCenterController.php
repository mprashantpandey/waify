<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class NotificationCenterController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'severity' => ['nullable', 'string', 'max:20'],
            'type' => ['nullable', 'string', 'max:80'],
            'status' => ['nullable', 'in:all,unread,read'],
        ]);

        $query = AppNotification::with('account:id,name,slug')
            ->where('scope', 'platform')
            ->latest();

        if (! empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }
        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (($filters['status'] ?? 'all') === 'unread') {
            $query->whereNull('read_at');
        } elseif (($filters['status'] ?? 'all') === 'read') {
            $query->whereNotNull('read_at');
        }

        $notifications = $query->paginate(40)->withQueryString()->through(fn (AppNotification $notification) => [
            'id' => $notification->id,
            'type' => $notification->type,
            'severity' => $notification->severity,
            'title' => $notification->title,
            'body' => $notification->body,
            'action_url' => $notification->action_url,
            'data' => $notification->data,
            'account' => $notification->account ? [
                'id' => $notification->account->id,
                'name' => $notification->account->name,
                'slug' => $notification->account->slug,
            ] : null,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
        ]);

        return Inertia::render('Platform/Notifications/Index', [
            'notifications' => $notifications,
            'filters' => [
                'severity' => $filters['severity'] ?? '',
                'type' => $filters['type'] ?? '',
                'status' => $filters['status'] ?? 'all',
            ],
            'stats' => [
                'unread' => AppNotification::where('scope', 'platform')->whereNull('read_at')->count(),
                'critical' => AppNotification::where('scope', 'platform')->where('severity', 'critical')->whereNull('read_at')->count(),
            ],
        ]);
    }

    public function markRead(AppNotification $notification): RedirectResponse
    {
        abort_unless($notification->scope === 'platform', 404);
        $notification->forceFill(['read_at' => now()])->save();

        return back()->with('success', 'Notification marked read.');
    }

    public function markAllRead(): RedirectResponse
    {
        AppNotification::where('scope', 'platform')
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Platform notifications marked read.');
    }

    public function clearResolvedOperational(): RedirectResponse
    {
        $types = ['failed_webhook', 'webhook_failed', 'whatsapp_webhook_failed'];

        if (Schema::hasTable('whatsapp_webhook_events')) {
            $hasRecentFailures = DB::table('whatsapp_webhook_events')
                ->where('status', 'failed')
                ->where('updated_at', '>=', now()->subDay())
                ->exists();

            if (! $hasRecentFailures) {
                $types[] = 'failed_whatsapp_webhook';
            }
        }

        $updated = AppNotification::where('scope', 'platform')
            ->whereNull('read_at')
            ->whereIn('type', array_values(array_unique($types)))
            ->where('updated_at', '<=', now()->subMinutes(5))
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return back()->with(
            $updated > 0 ? 'success' : 'info',
            $updated > 0 ? "Cleared {$updated} resolved operational alert(s)." : 'No resolved operational alerts to clear.'
        );
    }
}
