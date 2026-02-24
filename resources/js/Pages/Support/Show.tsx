import { Head, Link, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Textarea } from '@/Components/UI/Textarea';

type Thread = {
    id: number;
    slug: string;
    subject: string;
    status: string;
    priority?: string | null;
    category?: string | null;
    creator?: { name?: string | null; email?: string | null } | null;
    messages: Array<{ id: number; sender_type: string; sender_name: string; body: string; created_at?: string | null }>;
};

export default function SupportShow({ thread }: { thread: Thread }) {
    const replyForm = useForm({ message: '' });

    return (
        <AppShell>
            <Head title={`Support: ${thread.subject}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <Link href={route('app.support.index')} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">← Back to Tickets</Link>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{thread.subject}</h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            #{thread.slug} · {thread.status} · {thread.priority || 'normal'}{thread.category ? ` · ${thread.category}` : ''}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {thread.status === 'closed' ? (
                            <Button type="button" variant="secondary" onClick={() => replyForm.post(route('app.support.reopen', { thread: thread.slug }))}>
                                Reopen Ticket
                            </Button>
                        ) : (
                            <Button type="button" variant="secondary" onClick={() => replyForm.post(route('app.support.close', { thread: thread.slug }))}>
                                Close Ticket
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Conversation</CardTitle>
                        <CardDescription>Support ticket messages</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {thread.messages.length === 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No messages yet.</div>
                        )}
                        {thread.messages.map((message) => (
                            <div key={message.id} className={`rounded-lg border px-4 py-3 ${message.sender_type === 'admin' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{message.sender_name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{message.created_at ? new Date(message.created_at).toLocaleString() : ''}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{message.body}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Reply</CardTitle>
                        <CardDescription>{thread.status === 'closed' ? 'Reopen the ticket to send a reply.' : 'Send a reply to support.'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => { e.preventDefault(); replyForm.post(route('app.support.message', { thread: thread.slug }), { onSuccess: () => replyForm.reset('message') }); }} className="space-y-3">
                            <Textarea
                                value={replyForm.data.message}
                                onChange={(e) => replyForm.setData('message', e.target.value)}
                                className="min-h-[140px]"
                                placeholder="Describe the issue, steps tried, and expected behavior..."
                                disabled={thread.status === 'closed' || replyForm.processing}
                            />
                            {replyForm.errors.message && <p className="text-sm text-red-600">{replyForm.errors.message}</p>}
                            <div className="flex justify-end">
                                <Button type="submit" disabled={thread.status === 'closed' || replyForm.processing}>
                                    {replyForm.processing ? 'Sending...' : 'Send Reply'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
