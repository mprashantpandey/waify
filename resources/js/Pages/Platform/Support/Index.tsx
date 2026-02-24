import { Head, Link, router } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';

type Props = {
  auth?: any;
  threads: any;
  filters: { status?: string; search?: string; assigned?: string; account_id?: number | null };
};

export default function PlatformSupportIndex({ auth, threads, filters }: Props) {
  const setFilter = (patch: Record<string, any>) => {
    router.get(route('platform.support.index'), { ...filters, ...patch }, { preserveState: true, replace: true });
  };

  return (
    <PlatformShell auth={auth}>
      <Head title="Support Desk" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Support Desk</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage tenant support tickets and reply from the platform panel.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>Platform-wide tenant support queue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <TextInput value={filters.search || ''} onChange={(e) => setFilter({ search: e.target.value, page: 1 })} placeholder="Search subject, slug, tenant" />
              <select value={filters.status || ''} onChange={(e) => setFilter({ status: e.target.value, page: 1 })} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
              <select value={filters.assigned || ''} onChange={(e) => setFilter({ assigned: e.target.value, page: 1 })} className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">
                <option value="">All assignment</option>
                <option value="me">Assigned to me</option>
                <option value="unassigned">Unassigned</option>
              </select>
              <button type="button" onClick={() => setFilter({ search: '', status: '', assigned: '', page: 1 })} className="rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700">Clear</button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Ticket</th>
                    <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Assignee</th>
                    <th className="px-4 py-3 text-left font-semibold">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {(threads?.data || []).length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No tickets found.</td></tr>
                  )}
                  {(threads?.data || []).map((t: any) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-4 py-3">
                        <Link href={route('platform.support.show', { thread: t.slug })} className="font-semibold text-blue-600 dark:text-blue-400">
                          {t.subject}
                        </Link>
                        <div className="text-xs text-gray-500">#{t.slug} · {t.messages_count} msgs · {t.priority || 'normal'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{t.account?.name || '-'}</div>
                        <div className="text-xs text-gray-500">{t.creator?.email || t.creator?.name || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${t.status === 'closed' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' : t.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{t.assignee?.name || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{t.last_message_at ? new Date(t.last_message_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlatformShell>
  );
}
