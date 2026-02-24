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
    messages: Array<{ id: number; sender_type: string; sender_name: string; body: string; created_at?: string | null; attachments?: Array<{ id: number; file_name: string; mime_type?: string | null; file_size: number; download_url: string }> }>;
};

export default function SupportShow({ thread }: { thread: Thread }) {
    const replyForm = useForm<{ message: string; attachments: File[] }>({ message: '', attachments: [] });
    const fmtBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let value = bytes;
        let i = 0;
        while (value >= 1024 && i < units.length - 1) { value /= 1024; i += 1; }
        return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
    };

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
                                {(message.attachments?.length || 0) > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {message.attachments!.map((a) => (
                                            <a key={a.id} href={a.download_url} target="_blank" rel="noreferrer" className="rounded-md border border-gray-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 dark:border-gray-700 dark:text-blue-300 dark:hover:bg-blue-900/20">
                                                {a.file_name} ({fmtBytes(a.file_size)})
                                            </a>
                                        ))}
                                    </div>
                                )}
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
                        <form onSubmit={(e) => { e.preventDefault(); replyForm.post(route('app.support.message', { thread: thread.slug }), { forceFormData: true, onSuccess: () => replyForm.reset() }); }} className="space-y-3">
                            <Textarea
                                value={replyForm.data.message}
                                onChange={(e) => replyForm.setData('message', e.target.value)}
                                className="min-h-[140px]"
                                placeholder="Describe the issue, steps tried, and expected behavior..."
                                disabled={thread.status === 'closed' || replyForm.processing}
                            />
                            {replyForm.errors.message && <p className="text-sm text-red-600">{replyForm.errors.message}</p>}
                            <div>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => replyForm.setData('attachments', Array.from(e.target.files || []))}
                                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 dark:file:bg-gray-800"
                                    disabled={thread.status === 'closed' || replyForm.processing}
                                />
                                <p className="mt-1 text-xs text-gray-500">Up to 5 files, 10MB each.</p>
                                {replyForm.data.attachments.length > 0 && (
                                    <ul className="mt-2 space-y-1 text-xs text-gray-500">
                                        {replyForm.data.attachments.map((f, i) => <li key={`${f.name}-${i}`}>{f.name}</li>)}
                                    </ul>
                                )}
                            </div>
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
