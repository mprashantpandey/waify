import PlatformShell from '@/Layouts/PlatformShell';
import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { PageHeader, StatusBadge, ThemedIconTile } from '@/Components/UI/Elements';
import { CheckCircle2, Clock3, Mail, Send, Users, XCircle } from 'lucide-react';

type Campaign = {
    id: number;
    name: string;
    subject: string;
    audience: string;
    status: string;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    pending_count: number;
    offer_code?: string | null;
    cta_label?: string | null;
    cta_url?: string | null;
    failure_reason?: string | null;
    creator?: { name: string; email: string } | null;
    created_at?: string | null;
    queued_at?: string | null;
    sent_at?: string | null;
};

type Audience = { key: string; label: string; count: number };

type CampaignForm = {
    name: string;
    subject: string;
    audience: string;
    body: string;
    cta_label: string;
    cta_url: string;
    offer_code: string;
    custom_recipients: string;
};

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    if (status === 'sent') return 'success';
    if (['queued', 'sending'].includes(status)) return 'warning';
    if (status === 'failed') return 'danger';
    if (status === 'draft') return 'info';
    return 'default';
}

function dateTime(value?: string | null) {
    if (!value) return '-';
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatCard({ label, value, icon: Icon, tone = 'green' }: { label: string; value: number | string; icon: any; tone?: 'green' | 'amber' | 'red' | 'blue' }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                        <p className="mt-2 text-xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                    </div>
                    <ThemedIconTile tone={tone} size="sm"><Icon className="h-4 w-4" /></ThemedIconTile>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PlatformEmailCampaignsIndex({
    campaigns = [],
    stats = {},
    audiences = [],
}: {
    campaigns: Campaign[];
    stats: { total?: number; sending?: number; sent?: number; failed?: number };
    audiences: Audience[];
}) {
    const { auth, errors } = usePage().props as any;
    const [form, setForm] = useState<CampaignForm>({
        name: '',
        subject: '',
        audience: 'workspace_owners',
        body: '',
        cta_label: '',
        cta_url: '',
        offer_code: '',
        custom_recipients: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const selectedAudience = useMemo(() => audiences.find((audience) => audience.key === form.audience), [audiences, form.audience]);
    const customCount = useMemo(() => {
        if (form.audience !== 'custom') return selectedAudience?.count || 0;
        return Array.from(new Set(form.custom_recipients.split(/[\r\n,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))).length;
    }, [form.audience, form.custom_recipients, selectedAudience]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        setSubmitting(true);
        router.post(route('platform.email-campaigns.store'), form, {
            preserveScroll: true,
            onFinish: () => setSubmitting(false),
            onSuccess: () => setForm({
                name: '',
                subject: '',
                audience: 'workspace_owners',
                body: '',
                cta_label: '',
                cta_url: '',
                offer_code: '',
                custom_recipients: '',
            }),
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Email campaigns" />
            <div className="space-y-5">
                <PageHeader
                    title="Email campaigns"
                    description="Send newsletters, offers, product updates, and payment-plan promotions from Zyptos admin using the configured platform mail setup."
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <StatCard label="Campaigns" value={stats.total || 0} icon={Mail} tone="blue" />
                    <StatCard label="Queued / sending" value={stats.sending || 0} icon={Clock3} tone="amber" />
                    <StatCard label="Sent" value={stats.sent || 0} icon={CheckCircle2} tone="green" />
                    <StatCard label="Failed" value={stats.failed || 0} icon={XCircle} tone="red" />
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                    <Card>
                        <CardContent className="p-5">
                            <div className="mb-4 flex items-center gap-3">
                                <ThemedIconTile tone="green"><Send className="h-5 w-5" /></ThemedIconTile>
                                <div>
                                    <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Create bulk email</h2>
                                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Messages are queued and sent in batches by the worker.</p>
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <label className="block">
                                        <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Campaign name</span>
                                        <input className="waify-input mt-1 w-full" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="May offer / newsletter" required />
                                        {errors?.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Audience</span>
                                        <select className="waify-input mt-1 w-full" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}>
                                            {audiences.map((audience) => (
                                                <option key={audience.key} value={audience.key}>{audience.label}{audience.count ? ` (${audience.count})` : ''}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                {form.audience === 'custom' && (
                                    <label className="block">
                                        <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Custom emails</span>
                                        <textarea className="waify-input mt-1 min-h-24 w-full" value={form.custom_recipients} onChange={(event) => setForm({ ...form, custom_recipients: event.target.value })} placeholder="one@email.com, two@email.com" />
                                        <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Separate emails by comma, semicolon, or new line.</p>
                                    </label>
                                )}

                                <label className="block">
                                    <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Subject</span>
                                    <input className="waify-input mt-1 w-full" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Special Zyptos offer for your workspace" required />
                                    {errors?.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
                                </label>

                                <label className="block">
                                    <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Email body</span>
                                    <textarea className="waify-input mt-1 min-h-44 w-full" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Write the offer or newsletter content..." required />
                                    {errors?.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
                                </label>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <label className="block">
                                        <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Offer code</span>
                                        <input className="waify-input mt-1 w-full" value={form.offer_code} onChange={(event) => setForm({ ...form, offer_code: event.target.value })} placeholder="ZYPTOS20" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">CTA label</span>
                                        <input className="waify-input mt-1 w-full" value={form.cta_label} onChange={(event) => setForm({ ...form, cta_label: event.target.value })} placeholder="View offer" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">CTA URL</span>
                                        <input className="waify-input mt-1 w-full" value={form.cta_url} onChange={(event) => setForm({ ...form, cta_url: event.target.value })} placeholder="https://zyptos.com/pricing" />
                                        {errors?.cta_url && <p className="mt-1 text-xs text-red-600">{errors.cta_url}</p>}
                                    </label>
                                </div>

                                <div className="rounded-card border border-emerald-100 bg-emerald-50/70 p-3 text-sm text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                                    <div className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Estimated recipients: {customCount}</div>
                                    <p className="mt-1 text-xs opacity-80">Duplicate emails are removed before sending.</p>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={submitting || customCount < 1}>
                                        <Send className="h-4 w-4" />
                                        {submitting ? 'Queueing...' : 'Queue campaign'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-0">
                            <div className="border-b border-gray-100 p-5 dark:border-waify-dark-border">
                                <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Recent campaigns</h2>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Delivery counts update as the queue worker sends batches.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border">
                                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                        <tr>
                                            <th className="px-4 py-3">Campaign</th>
                                            <th className="px-4 py-3">Audience</th>
                                            <th className="px-4 py-3">Delivery</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                        {campaigns.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-12 text-center text-waify-text-muted dark:text-waify-dark-text-muted">No email campaigns yet.</td>
                                            </tr>
                                        ) : campaigns.map((campaign) => (
                                            <tr key={campaign.id} className="align-top">
                                                <td className="px-4 py-3">
                                                    <div className="max-w-72 font-semibold text-waify-text dark:text-waify-dark-text">{campaign.name}</div>
                                                    <div className="mt-1 max-w-72 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{campaign.subject}</div>
                                                    {campaign.offer_code && <StatusBadge tone="success" className="mt-2">{campaign.offer_code}</StatusBadge>}
                                                    {campaign.failure_reason && <p className="mt-2 max-w-72 text-xs text-red-600 dark:text-red-300">{campaign.failure_reason}</p>}
                                                </td>
                                                <td className="px-4 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                    {campaign.audience.replace(/_/g, ' ')}
                                                    <div className="mt-1 text-xs">Created {dateTime(campaign.created_at)}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-waify-text dark:text-waify-dark-text">{campaign.sent_count}/{campaign.recipient_count} sent</div>
                                                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{campaign.failed_count} failed · {campaign.pending_count} pending</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge tone={statusTone(campaign.status)} dot>{campaign.status}</StatusBadge>
                                                    {campaign.sent_at && <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{dateTime(campaign.sent_at)}</div>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PlatformShell>
    );
}
