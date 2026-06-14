import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Drawer, PageHeader, StatusBadge, ThemedIconTile, Toolbar } from '@/Components/UI/Elements';
import { Building2, CheckCircle2, Clock, Eye, Inbox, Mail, Search, Trash2, UserPlus, UserRound, XCircle } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

interface ContactRequest {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'reviewed' | 'closed';
    source: string;
    ip_address?: string | null;
    user_agent?: string | null;
    handled_at?: string | null;
    handler?: { id: number; name: string; email: string } | null;
    converted_at?: string | null;
    converted_account?: { id: number; name: string; slug?: string | null } | null;
    converted_contact?: { id: number; name: string | null; email?: string | null; wa_id?: string | null; slug?: string | null } | null;
    created_at: string;
}

interface PaginatedRequests {
    data: ContactRequest[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type Filters = { q?: string; status?: string; per_page?: number };

function statusTone(status: string): 'success' | 'warning' | 'info' | 'default' {
    if (status === 'closed') return 'success';
    if (status === 'reviewed') return 'info';
    if (status === 'new') return 'warning';
    return 'default';
}

function statusLabel(status: string) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: string | number; icon: any; tone?: 'green' | 'blue' | 'amber' | 'purple' }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                        <p className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                    </div>
                    <ThemedIconTile tone={tone}>
                        <Icon className="h-5 w-5" />
                    </ThemedIconTile>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PlatformContactRequestsIndex({
    requests,
    filters,
    stats,
    accounts = [],
}: {
    requests: PaginatedRequests;
    filters: Filters;
    stats: { total: number; new: number; reviewed: number; closed: number; converted?: number };
    accounts?: Array<{ id: number; name: string; slug?: string | null }>;
}) {
    const { auth } = usePage().props as any;
    const confirm = useConfirm();
    const [localFilters, setLocalFilters] = useState<Filters>({
        q: filters?.q || '',
        status: filters?.status || 'all',
        per_page: filters?.per_page || 15,
    });
    const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
    const [convertAccountId, setConvertAccountId] = useState<string>('');

    const queryParams = (extra: Record<string, any> = {}) => ({
        q: localFilters.q || undefined,
        status: localFilters.status && localFilters.status !== 'all' ? localFilters.status : undefined,
        per_page: localFilters.per_page || 15,
        ...extra,
    });

    const applyFilters = () => {
        router.get(route('platform.contact-requests.index'), queryParams({ page: undefined }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setLocalFilters({ q: '', status: 'all', per_page: 15 });
        router.get(route('platform.contact-requests.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const goToPage = (page: number) => {
        router.get(route('platform.contact-requests.index'), queryParams({ page }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const updateStatus = (contactRequest: ContactRequest, status: ContactRequest['status']) => {
        router.patch(route('platform.contact-requests.update', { contactRequest: contactRequest.id }), { status }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedRequest((current) => current && current.id === contactRequest.id ? { ...current, status } : current);
            },
        });
    };

    const convertLead = (contactRequest: ContactRequest) => {
        if (!convertAccountId) return;

        router.post(route('platform.contact-requests.convert', { contactRequest: contactRequest.id }), { account_id: Number(convertAccountId) }, {
            preserveScroll: true,
            onSuccess: () => {
                setConvertAccountId('');
                setSelectedRequest(null);
            },
        });
    };

    const deleteRequest = async (contactRequest: ContactRequest) => {
        const confirmed = await confirm({
            title: 'Delete contact request',
            message: `Delete the contact request from ${contactRequest.name}?`,
            confirmText: 'Delete request',
            variant: 'danger',
        });
        if (!confirmed) return;

        router.delete(route('platform.contact-requests.destroy', { contactRequest: contactRequest.id }), {
            preserveScroll: true,
            onSuccess: () => setSelectedRequest(null),
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Contact Requests" />
            <div className="space-y-6">
                <PageHeader
                    title="Contact requests"
                    description="Leads and messages submitted from the public contact page."
                    actions={<Button type="button" variant="secondary" onClick={clearFilters}>Reset filters</Button>}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard label="Total requests" value={stats.total} icon={Inbox} />
                    <StatCard label="New" value={stats.new} icon={Mail} tone="amber" />
                    <StatCard label="Reviewed" value={stats.reviewed} icon={Eye} tone="blue" />
                    <StatCard label="Closed" value={stats.closed} icon={CheckCircle2} tone="green" />
                    <StatCard label="Converted" value={stats.converted || 0} icon={UserPlus} tone="purple" />
                </div>

                <Toolbar
                    filters={(
                        <>
                            <div className="relative min-w-64">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-waify-text-muted" />
                                <input
                                    value={localFilters.q || ''}
                                    onChange={(event) => setLocalFilters({ ...localFilters, q: event.target.value })}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') applyFilters();
                                    }}
                                    className="waify-input w-full pl-9"
                                    placeholder="Search name, email, subject..."
                                />
                            </div>
                            <select
                                value={localFilters.status || 'all'}
                                onChange={(event) => setLocalFilters({ ...localFilters, status: event.target.value })}
                                className="waify-input min-w-40"
                            >
                                <option value="all">All statuses</option>
                                <option value="new">New</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="closed">Closed</option>
                            </select>
                        </>
                    )}
                    actions={<Button type="button" onClick={applyFilters}><Search className="h-4 w-4" />Search</Button>}
                />

                {requests.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <ThemedIconTile tone="gray" size="lg">
                                <Inbox className="h-5 w-5" />
                            </ThemedIconTile>
                            <p className="mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">No contact requests found</p>
                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">New public contact form submissions will appear here.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {requests.data.map((contactRequest) => (
                            <Card key={contactRequest.id} className="transition hover:border-waify-green/40">
                                <CardContent className="p-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <ThemedIconTile tone={contactRequest.status === 'new' ? 'amber' : contactRequest.status === 'reviewed' ? 'blue' : 'green'}>
                                                <Mail className="h-5 w-5" />
                                            </ThemedIconTile>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <StatusBadge tone={statusTone(contactRequest.status)} dot>{statusLabel(contactRequest.status)}</StatusBadge>
                                                    <span className="inline-flex items-center gap-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {new Date(contactRequest.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="mt-2 truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{contactRequest.subject}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    <span className="inline-flex items-center gap-1">
                                                        <UserRound className="h-3.5 w-3.5" />
                                                        {contactRequest.name}
                                                    </span>
                                                    <a href={`mailto:${contactRequest.email}`} className="font-medium text-waify-green-dark hover:underline dark:text-emerald-300">
                                                        {contactRequest.email}
                                                    </a>
                                                </div>
                                                <p className="mt-2 line-clamp-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{contactRequest.message}</p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedRequest(contactRequest)}>
                                                <Eye className="h-4 w-4" />
                                                View
                                            </Button>
                                            {contactRequest.status === 'new' && (
                                                <Button type="button" variant="secondary" size="sm" onClick={() => updateStatus(contactRequest, 'reviewed')}>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Reviewed
                                                </Button>
                                            )}
                                            {contactRequest.status !== 'closed' && (
                                                <Button type="button" variant="secondary" size="sm" onClick={() => updateStatus(contactRequest, 'closed')}>
                                                    <XCircle className="h-4 w-4" />
                                                    Close
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {requests.last_page > 1 && (
                    <div className="flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-3 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            Showing {requests.per_page * (requests.current_page - 1) + 1} to {Math.min(requests.per_page * requests.current_page, requests.total)} of {requests.total}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {Array.from({ length: requests.last_page }, (_, index) => index + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className={`h-9 min-w-9 rounded-btn px-3 text-sm font-semibold transition ${
                                        page === requests.current_page
                                            ? 'bg-waify-green text-waify-ink'
                                            : 'border border-gray-200 bg-white text-waify-text hover:bg-gray-50 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:hover:bg-waify-dark-surface-2'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Drawer
                open={Boolean(selectedRequest)}
                onClose={() => setSelectedRequest(null)}
                title={selectedRequest?.subject || 'Contact request'}
                description={selectedRequest ? `${selectedRequest.name} <${selectedRequest.email}>` : undefined}
                className="sm:max-w-2xl"
            >
                {selectedRequest && (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone={statusTone(selectedRequest.status)} dot>{statusLabel(selectedRequest.status)}</StatusBadge>
                            <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{new Date(selectedRequest.created_at).toLocaleString()}</span>
                        </div>

                        <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-waify-text dark:text-waify-dark-text">{selectedRequest.message}</p>
                        </div>

                        {selectedRequest.converted_at && (
                            <div className="rounded-card border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                                <div className="flex items-center gap-2 font-semibold">
                                    <UserPlus className="h-4 w-4" />
                                    Converted to lead
                                </div>
                                <p className="mt-1 text-xs">
                                    {selectedRequest.converted_account?.name || 'Workspace'} · {selectedRequest.converted_contact?.name || selectedRequest.name} · {new Date(selectedRequest.converted_at).toLocaleString()}
                                </p>
                            </div>
                        )}

                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Email</p>
                                <a href={`mailto:${selectedRequest.email}`} className="mt-1 inline-block font-medium text-waify-green-dark hover:underline dark:text-emerald-300">{selectedRequest.email}</a>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Source</p>
                                <p className="mt-1 text-waify-text dark:text-waify-dark-text">{selectedRequest.source.replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">IP address</p>
                                <p className="mt-1 text-waify-text dark:text-waify-dark-text">{selectedRequest.ip_address || 'Not captured'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Handled by</p>
                                <p className="mt-1 text-waify-text dark:text-waify-dark-text">{selectedRequest.handler?.name || 'Not handled yet'}</p>
                            </div>
                        </div>

                        {selectedRequest.user_agent && (
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">User agent</p>
                                <p className="mt-1 break-words text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{selectedRequest.user_agent}</p>
                            </div>
                        )}

                        {!selectedRequest.converted_at && (
                            <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                    <Building2 className="h-4 w-4" />
                                    Convert to workspace contact
                                </div>
                                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                    <select
                                        value={convertAccountId}
                                        onChange={(event) => setConvertAccountId(event.target.value)}
                                        className="waify-input min-w-0 flex-1"
                                    >
                                        <option value="">Select workspace</option>
                                        {accounts.map((account) => (
                                            <option key={account.id} value={account.id}>{account.name}</option>
                                        ))}
                                    </select>
                                    <Button type="button" onClick={() => convertLead(selectedRequest)} disabled={!convertAccountId}>
                                        <UserPlus className="h-4 w-4" />
                                        Convert
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-waify-dark-border">
                            {selectedRequest.status !== 'reviewed' && (
                                <Button type="button" variant="secondary" onClick={() => updateStatus(selectedRequest, 'reviewed')}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    Mark reviewed
                                </Button>
                            )}
                            {selectedRequest.status !== 'closed' && (
                                <Button type="button" variant="secondary" onClick={() => updateStatus(selectedRequest, 'closed')}>
                                    <XCircle className="h-4 w-4" />
                                    Close
                                </Button>
                            )}
                            <Button type="button" variant="danger" onClick={() => deleteRequest(selectedRequest)}>
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                )}
            </Drawer>
        </PlatformShell>
    );
}
