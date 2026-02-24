import { Head, Link, useForm } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Textarea } from '@/Components/UI/Textarea';
import TextInput from '@/Components/TextInput';

export default function PlatformSupportShow({ auth, thread, admins }: any) {
  const replyForm = useForm({ message: '' });
  const metaForm = useForm({
    status: thread.status || 'open',
    priority: thread.priority || 'normal',
    category: thread.category || '',
    assigned_to: thread.assignee?.id ? String(thread.assignee.id) : '',
  });

  return (
    <PlatformShell auth={auth}>
      <Head title={`Support Desk: ${thread.subject}`} />
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={route('platform.support.index')} className="text-sm text-blue-600 dark:text-blue-400">← Back to Support Desk</Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{thread.subject}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">#{thread.slug} · Tenant: {thread.account?.name} · Created by {thread.creator?.email || thread.creator?.name}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conversation</CardTitle>
                <CardDescription>Tenant and platform support replies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(thread.messages || []).map((m: any) => (
                  <div key={m.id} className={`rounded-lg border px-4 py-3 ${m.sender_type === 'admin' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'}`}>
                    <div className="mb-1 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{m.sender_name}</span>
                      <span className="text-xs text-gray-500">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{m.body}</p>
                  </div>
                ))}
                {(!thread.messages || thread.messages.length === 0) && <p className="text-sm text-gray-500">No messages yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reply as Platform Support</CardTitle>
                <CardDescription>Response is visible to tenant in their support ticket.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); replyForm.post(route('platform.support.message', { thread: thread.slug }), { onSuccess: () => replyForm.reset('message') }); }} className="space-y-3">
                  <Textarea value={replyForm.data.message} onChange={(e) => replyForm.setData('message', e.target.value)} className="min-h-[140px]" placeholder="Write a clear response with next steps..." />
                  {replyForm.errors.message && <p className="text-sm text-red-600">{replyForm.errors.message}</p>}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={replyForm.processing}>{replyForm.processing ? 'Sending...' : 'Send Reply'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Controls</CardTitle>
                <CardDescription>Assignment and status</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); metaForm.post(route('platform.support.update', { thread: thread.slug })); }} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                    <select value={metaForm.data.status} onChange={(e) => metaForm.setData('status', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                      <option value="open">Open</option>
                      <option value="pending">Pending</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                    <select value={metaForm.data.priority} onChange={(e) => metaForm.setData('priority', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
                    <select value={metaForm.data.assigned_to} onChange={(e) => metaForm.setData('assigned_to', e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                      <option value="">Unassigned</option>
                      {(admins || []).map((a: any) => <option key={a.id} value={String(a.id)}>{a.name} ({a.email})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <TextInput value={metaForm.data.category} onChange={(e) => metaForm.setData('category', e.target.value)} className="mt-1 w-full" placeholder="billing / setup / bug" />
                  </div>
                  <Button type="submit" className="w-full" disabled={metaForm.processing}>{metaForm.processing ? 'Saving...' : 'Save Controls'}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
