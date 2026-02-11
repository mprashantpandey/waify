<?php

namespace App\Services;

use Illuminate\Contracts\Notifications\Dispatcher;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class NotificationDispatchService
{
    public function __construct(
        protected Dispatcher $dispatcher
    ) {
    }

    /**
     * Dispatch notifications with best-effort dedupe.
     *
     * @param  mixed  $notifiables  Model|array|Collection
     */
    public function send(mixed $notifiables, Notification $notification, int $dedupeSeconds = 45): int
    {
        $targets = $this->normalizeNotifiables($notifiables);
        if ($targets->isEmpty()) {
            return 0;
        }

        $sent = 0;
        foreach ($targets as $notifiable) {
            if (!$this->isDeliverable($notifiable)) {
                continue;
            }

            $cacheKey = $this->buildDedupeKey($notifiable, $notification);
            if (!Cache::add($cacheKey, now()->timestamp, now()->addSeconds(max(1, $dedupeSeconds)))) {
                continue;
            }

            $this->dispatcher->send($notifiable, $notification);
            $sent++;
        }

        return $sent;
    }

    protected function normalizeNotifiables(mixed $notifiables): Collection
    {
        if ($notifiables instanceof Collection) {
            return $notifiables->filter()->values();
        }

        if (is_array($notifiables)) {
            return collect($notifiables)->filter()->values();
        }

        return $notifiables ? collect([$notifiables]) : collect();
    }

    protected function isDeliverable(mixed $notifiable): bool
    {
        if (is_object($notifiable) && method_exists($notifiable, 'routeNotificationFor')) {
            $mailRoute = $notifiable->routeNotificationFor('mail');
            return filled($mailRoute);
        }

        return true;
    }

    protected function buildDedupeKey(mixed $notifiable, Notification $notification): string
    {
        $recipient = 'unknown';
        if (is_object($notifiable)) {
            $recipient = method_exists($notifiable, 'getKey')
                ? (string) $notifiable->getKey()
                : spl_object_hash($notifiable);
        }

        $fingerprint = method_exists($notification, 'fingerprint')
            ? (string) $notification->fingerprint()
            : sha1($notification::class);

        return 'notif:dedupe:' . sha1($notification::class . '|' . $recipient . '|' . $fingerprint);
    }
}

