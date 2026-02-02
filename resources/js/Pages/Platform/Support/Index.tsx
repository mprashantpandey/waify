import { Link, router, usePage } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useRealtime } from '@/Providers/RealtimeProvider';

interface Thread {
    id: number;
    slug: string;
    subject: string;
    status: string;
    workspace: { id: number; name: string; slug: string } | null;
    last_message_at: string | null;
    created_at: string;
}

export default function PlatformSupportIndex({ threads }: { threads: Thread[] }) {
    const { branding } = usePage().props as any;
    const { subscribe } = useRealtime();
    const [items, setItems] = useState<Thread[]>(threads);
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        setItems(threads);
    }, [threads]);

    useEffect(() => {
        const unsubscribe = subscribe('platform.support', 'support.message.created', (payload: { thread_id?: number; created_at?: string }) => {
            if (!payload.thread_id) {
                return;
            }
            setItems((prev) => {
                const index = prev.findIndex((thread) => thread.id === payload.thread_id);
                if (index === -1) {
                    setHasNew(true);
                    return prev;
                }
                const next = [...prev];
                const updated = { ...next[index] };
                updated.last_message_at = payload.created_at ?? updated.last_message_at;
                next.splice(index, 1);
                next.unshift(updated);
                return next;
            });
        });

        return () => {
            unsubscribe();
        };
    }, [subscribe]);

    const supportContacts = useMemo(() => {
        return {
            email: branding?.support_email as string | undefined,
            phone: branding?.support_phone as string | undefined,
        };
    }, [branding?.support_email, branding?.support_phone]);

    return (
        <PlatformShell>
            <Head title="Support Requests" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Requests</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">All tenant support conversations</p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <CardTitle className="text-xl font-bold">Live Chat Access</CardTitle>
                        <CardDescription>Ways tenants can reach your support team</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Support Inbox</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Tenants can create tickets from their Support page.
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Email & Phone</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {supportContacts.email || supportContacts.phone
                                        ? `${supportContacts.email ?? '—'} ${supportContacts.phone ? `· ${supportContacts.phone}` : ''}`
                                        : 'Set support email/phone in Platform Settings → Branding.'}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Live Chat Widget</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Use the live chat bubble at the bottom-right of the screen.
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <CardTitle className="text-xl font-bold">Threads</CardTitle>
                        <CardDescription>Recent messages from tenants</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {hasNew && (
                            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-yellow-50/60 dark:bg-yellow-900/10 text-sm text-gray-700 dark:text-gray-200 flex items-center justify-between">
                                <span>New support activity available.</span>
                                <button
                                    onClick={() => {
                                        setHasNew(false);
                                        router.reload({ only: ['threads'] });
                                    }}
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Refresh
                                </button>
                            </div>
                        )}
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {items.length === 0 && (
                                <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                                    No support requests yet.
                                </div>
                            )}
                            {items.map((thread) => (
                                <Link
                                    key={thread.id}
                                    href={route('platform.support.show', { thread: thread.slug ?? thread.id })}
                                    className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {thread.subject}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Workspace: {thread.workspace?.name ?? 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : '—'}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
