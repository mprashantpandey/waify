import PlatformShell from '@/Layouts/PlatformShell';
import { Head, router, usePage } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Bell, CheckCircle2, ExternalLink, ShieldAlert } from 'lucide-react';

export default function PlatformNotificationsIndex({ notifications, stats }: any) {
    const { auth } = usePage().props as any;
    const markRead = (notification: any) => router.post(route('platform.notifications.read', notification.id), {}, { preserveScroll: true });
    const markAllRead = () => router.post(route('platform.notifications.read-all'), {}, { preserveScroll: true });
    const clearResolved = () => router.post(route('platform.notifications.clear-resolved-operational'), {}, { preserveScroll: true });

    return (
        <PlatformShell auth={auth}>
            <Head title="Platform Notifications" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-waify-text dark:text-waify-dark-text">Platform notifications</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Failed webhooks, failed payments, automation failures, and WABA health alerts.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="warning">{stats.unread} unread</Badge>
                        <Badge variant="danger">{stats.critical} critical</Badge>
                        <Button type="button" variant="secondary" size="sm" onClick={markAllRead} disabled={stats.unread === 0}>
                            <CheckCircle2 className="h-4 w-4" />
                            Mark all read
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={clearResolved} disabled={stats.unread === 0}>
                            <CheckCircle2 className="h-4 w-4" />
                            Clear resolved
                        </Button>
                    </div>
                </div>
                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <Card><CardContent className="py-14 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No platform notifications found.</CardContent></Card>
                    ) : notifications.data.map((notification: any) => (
                        <Card key={notification.id} className={!notification.read_at ? 'border-waify-green/30' : undefined}>
                            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 gap-3">
                                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300">
                                        {notification.severity === 'critical' ? <ShieldAlert className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">{notification.title}</p>
                                            <Badge variant={notification.severity === 'critical' ? 'danger' : notification.severity === 'warning' ? 'warning' : 'info'}>{notification.severity}</Badge>
                                            {!notification.read_at && <Badge variant="info">Unread</Badge>}
                                        </div>
                                        {notification.body && <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{notification.body}</p>}
                                        <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{notification.account?.name ? `${notification.account.name} · ` : ''}{notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}</p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    {notification.action_url && <a href={notification.action_url}><Button size="sm" variant="secondary"><ExternalLink className="h-4 w-4" />Open</Button></a>}
                                    {!notification.read_at && <Button size="sm" onClick={() => markRead(notification)}><CheckCircle2 className="h-4 w-4" />Read</Button>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </PlatformShell>
    );
}
