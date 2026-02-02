import PlatformShell from '@/Layouts/PlatformShell';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/Tabs';
import { useState } from 'react';

interface Thread {
    id: number;
    slug: string;
    subject: string;
    status: string;
    mode: string;
    channel?: string;
    priority?: string;
    category?: string | null;
    tags?: string[];
    due_at?: string | null;
    first_response_due_at?: string | null;
    escalation_level?: number;
    assignee?: { id: number; name: string; email: string } | null;
    workspace: { id: number; name: string; slug: string; owner?: { name?: string; email?: string } } | null;
    last_message_at: string | null;
    created_at: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

export default function PlatformSupportHub({
    openThreads,
    closedThreads,
    liveThreads,
    faqs,
}: {
    openThreads: Thread[];
    closedThreads: Thread[];
    liveThreads: Thread[];
    faqs: FaqItem[];
}) {
    const [faqQuery, setFaqQuery] = useState('');

    const filteredFaqs = faqs.filter((faq) => {
        const query = faqQuery.trim().toLowerCase();
        if (!query) {
            return true;
        }
        return (
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        );
    });

    const formatCountdown = (dateStr?: string | null) => {
        if (!dateStr) {
            return '—';
        }
        const diffMs = new Date(dateStr).getTime() - Date.now();
        if (diffMs <= 0) {
            return 'Overdue';
        }
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
        return `Due in ${diffHours}h`;
    };

    return (
        <PlatformShell>
            <Head title="Support Hub" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Hub</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Live chat, tickets, and FAQs</p>
                </div>

                <Tabs defaultValue="live">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="live">Live Chats</TabsTrigger>
                    <TabsTrigger value="tickets">Open Tickets</TabsTrigger>
                    <TabsTrigger value="history">Previous Chats</TabsTrigger>
                    <TabsTrigger value="status">Status Portal</TabsTrigger>
                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
                </TabsList>

                    <TabsContent value="live" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                <CardTitle className="text-xl font-bold">Live Chats</CardTitle>
                                <CardDescription>Tenants requesting a live agent</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {liveThreads.length === 0 && (
                                        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                                            No live agent requests right now.
                                        </div>
                                    )}
                                    {liveThreads.map((thread) => (
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
                                                Priority: {thread.priority ?? 'normal'} · Assignee: {thread.assignee?.name || 'Unassigned'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Workspace: {thread.workspace?.name ?? 'Unknown'} · {thread.workspace?.owner?.email || '—'}
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
                    </TabsContent>

                    <TabsContent value="tickets" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                <CardTitle className="text-xl font-bold">Open Tickets</CardTitle>
                                <CardDescription>All open support requests</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {openThreads.length === 0 && (
                                        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                                            No open tickets.
                                        </div>
                                    )}
                                    {openThreads.map((thread) => (
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
                                                Priority: {thread.priority ?? 'normal'} · Assignee: {thread.assignee?.name || 'Unassigned'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Workspace: {thread.workspace?.name ?? 'Unknown'} · {thread.workspace?.owner?.email || '—'}
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
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                <CardTitle className="text-xl font-bold">Previous Chats</CardTitle>
                                <CardDescription>Closed tickets and past conversations</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {closedThreads.length === 0 && (
                                        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                                            No previous chats yet.
                                        </div>
                                    )}
                                    {closedThreads.map((thread) => (
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
                                                Priority: {thread.priority ?? 'normal'} · Assignee: {thread.assignee?.name || 'Unassigned'}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Workspace: {thread.workspace?.name ?? 'Unknown'} · {thread.workspace?.owner?.email || '—'}
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
                    </TabsContent>

                    <TabsContent value="status" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                                <CardTitle className="text-xl font-bold">Status Portal</CardTitle>
                                <CardDescription>Track SLA and due dates across tickets</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                {[...openThreads, ...closedThreads].map((thread) => (
                                    <div key={thread.id} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">{thread.subject}</div>
                                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                {thread.status}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            Priority: {thread.priority ?? 'normal'} · Category: {thread.category ?? '—'} · Assignee:{' '}
                                            {thread.assignee?.name || 'Unassigned'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            First response due:{' '}
                                            {thread.first_response_due_at ? new Date(thread.first_response_due_at).toLocaleString() : '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Resolution due: {thread.due_at ? new Date(thread.due_at).toLocaleString() : '—'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            SLA: {formatCountdown(thread.due_at)} · First response: {formatCountdown(thread.first_response_due_at)}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            Escalation level: {thread.escalation_level ?? 0}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="faqs" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                                <CardTitle className="text-xl font-bold">FAQs</CardTitle>
                                <CardDescription>Shared answers for tenants</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={faqQuery}
                                        onChange={(e) => setFaqQuery(e.target.value)}
                                        className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
                                        placeholder="Search FAQs..."
                                    />
                                </div>
                                {filteredFaqs.length === 0 && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        No FAQs matched your search.
                                    </div>
                                )}
                                {filteredFaqs.map((faq, index) => (
                                    <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">{faq.question}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{faq.answer}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </PlatformShell>
    );
}
