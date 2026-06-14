import { Head, Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Bell, CheckCircle2, ExternalLink, Filter, ShieldAlert } from 'lucide-react';

type Notification = {
    id: number;
    type: string;
    severity: string;
    title: string;
    body?: string | null;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string | null;
};

type Paginated<T> = { data: T[]; total: number };

function severityVariant(severity: string): 'danger' | 'warning' | 'success' | 'info' | 'default' {
    if (severity === 'critical') return 'danger';
    if (severity === 'warning') return 'warning';
    if (severity === 'success') return 'success';
    if (severity === 'info') return 'info';
    return 'default';
}

export default function NotificationsIndex({ notifications, filters, stats }: { notifications: Paginated<Notification>; filters: any; stats: { unread: number; critical: number } }) {
    const markRead = (notification: Notification) => router.post(route('app.notifications.read', notification.id), {}, { preserveScroll: true });
    const markAllRead = () => router.post(route('app.notifications.read-all'), {}, { preserveScroll: true });

    return (
        <AppShell>
            <Head title="Notifications" />
            <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-waify-text dark:text-waify-dark-text">Notifications</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Workspace alerts for billing, leads, automation, and template quality.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="warning">{stats.unread} unread</Badge>
                        <Badge variant="danger">{stats.critical} critical</Badge>
                        <Button type="button" variant="secondary" size="sm" onClick={markAllRead} disabled={stats.unread === 0}>
                            <CheckCircle2 className="h-4 w-4" />
                            Mark all read
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="flex flex-wrap gap-2 p-4">
                        {['all', 'unread', 'read'].map((status) => (
                            <Link key={status} href={route('app.notifications.index', { ...filters, status })}>
                                <Button variant={(filters.status || 'all') === status ? 'primary' : 'secondary'} size="sm">
                                    <Filter className="h-4 w-4" />
                                    {status}
                                </Button>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {notifications.data.length === 0 ? (
                        <Card><CardContent className="py-14 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No notifications found.</CardContent></Card>
                    ) : notifications.data.map((notification) => (
                        <Card key={notification.id} className={!notification.read_at ? 'border-waify-green/30' : undefined}>
                            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 gap-3">
                                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-300">
                                        {notification.severity === 'critical' ? <ShieldAlert className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-waify-text dark:text-waify-dark-text">{notification.title}</p>
                                            <Badge variant={severityVariant(notification.severity)}>{notification.severity}</Badge>
                                            {!notification.read_at && <Badge variant="info">Unread</Badge>}
                                        </div>
                                        {notification.body && <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{notification.body}</p>}
                                        <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}</p>
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
        </AppShell>
    );
}
