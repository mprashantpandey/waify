import AppShell from '@/Layouts/AppShell';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/UI/Tabs';

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
    last_message_at: string | null;
    created_at: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

export default function SupportHub({
    workspace,
    openThreads,
    closedThreads,
    liveThreads,
    faqs,
}: {
    workspace: any;
    openThreads: Thread[];
    closedThreads: Thread[];
    liveThreads: Thread[];
    faqs: FaqItem[];
}) {
    const initialTab = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('tab') || 'live'
        : 'live';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [faqQuery, setFaqQuery] = useState('');

    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

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
        <AppShell>
            <Head title="Support Hub" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Support Hub
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Live chat, tickets, and help articles in one place
                    </p>
                </div>
                <div className="flex justify-end">
                    <Link
                        href={route('app.support.index', { workspace: workspace.slug })}
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        Create Ticket
                    </Link>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="live">Live Chat</TabsTrigger>
                    <TabsTrigger value="tickets">Tickets Opened</TabsTrigger>
                    <TabsTrigger value="history">Previous Chats</TabsTrigger>
                    <TabsTrigger value="faqs">FAQs</TabsTrigger>
                </TabsList>

                    <TabsContent value="live" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                <CardTitle className="text-xl font-bold">Live Chat</CardTitle>
                                <CardDescription>Chat with support or request a live agent</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Use the live chat bubble at the bottom-right of your screen.
                                </div>
                                {liveThreads.length > 0 ? (
                                    <div className="space-y-2">
                                    {liveThreads.map((thread) => {
                                        const threadKey = thread.slug ?? thread.id;
                                        return (
                                            <Link
                                                key={thread.id}
                                                href={route('app.support.show', { workspace: workspace.slug, thread: threadKey })}
                                                className="block rounded-lg border border-blue-200 dark:border-blue-800 p-3 text-sm hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition"
                                            >
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {thread.subject}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Live agent requested · {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : '—'}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        No live agent requests yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tickets" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                                <CardTitle className="text-xl font-bold">Open Tickets</CardTitle>
                                <CardDescription>Your currently open support requests</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {openThreads.length === 0 && (
                                        <div className="p-6 text-sm text-gray-500 dark:text-gray-400">
                                            No open tickets.
                                        </div>
                                    )}
                                    {openThreads.map((thread) => {
                                        const threadKey = thread.slug ?? thread.id;
                                        return (
                                            <Link
                                                key={thread.id}
                                                href={route('app.support.show', { workspace: workspace.slug, thread: threadKey })}
                                                className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {thread.subject}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Priority: {thread.priority ?? 'normal'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Last message: {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : '—'}
                                                    </div>
                                                </div>
                                                    <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                        {thread.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
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
                                    {closedThreads.map((thread) => {
                                        const threadKey = thread.slug ?? thread.id;
                                        return (
                                            <Link
                                                key={thread.id}
                                                href={route('app.support.show', { workspace: workspace.slug, thread: threadKey })}
                                                className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                                            >
                                                <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {thread.subject}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Priority: {thread.priority ?? 'normal'}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Closed · {thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : '—'}
                                                    </div>
                                                </div>
                                                    <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                        {thread.status}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="faqs" className="space-y-4">
                        <Card className="border-0 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                                <CardTitle className="text-xl font-bold">FAQs</CardTitle>
                                <CardDescription>Quick answers to common questions</CardDescription>
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
        </AppShell>
    );
}
