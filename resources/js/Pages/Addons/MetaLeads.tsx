import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { AddonPage, EmptyPanel, MiniStatus, PaginationMeta, ServerListControls, StatGrid } from './Shared';
import { Drawer, Toolbar, ThemedIconTile } from '@/Components/UI/Elements';
import { BadgeIndianRupee, Edit3, Facebook, MapPin, Phone, RefreshCw, Settings2, Target, Trash2, UserCheck, UserPlus } from 'lucide-react';
import { Input } from '@/Components/UI/Input';
import { useConfirm } from '@/hooks/useConfirm';

type Lead = { id: number; name: string; phone: string | null; email?: string | null; city: string; stage: string; platform: string; sourceType?: string; form: string; adName: string; campaignName?: string | null; cpl: number; score: number; assignee: string; autoTags?: string[]; time: string | null };
type MetaIntegration = {
    connected: boolean;
    status: string;
    lastSyncAt?: string | null;
    lastError?: string | null;
    pageName?: string | null;
    pageId?: string | null;
    formName?: string | null;
    formId?: string | null;
    autoCreateContact?: boolean;
    forms?: Array<{ id: string; name: string; status?: string | null }>;
} | null;

export default function MetaLeads({ leads = [], filters = {}, pagination = null, metaIntegration = null }: { leads: Lead[]; filters?: Record<string, any>; pagination?: PaginationMeta | null; metaIntegration?: MetaIntegration }) {
    const confirm = useConfirm();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<Lead | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Lead | null>(null);
    const form = useForm({
        name: '',
        phone: '',
        email: '',
        city: '',
        stage: 'new',
        platform: 'Facebook',
        source_type: 'meta_lead',
        form_name: '',
        ad_name: '',
        campaign_name: '',
        cost_per_lead: 0,
        score: 0,
        assignee_name: '',
        auto_tags: '',
        captured_at: '',
    });
    const filtered = useMemo(() => leads.filter((lead) => `${lead.name} ${lead.phone} ${lead.city}`.toLowerCase().includes(search.toLowerCase())), [leads, search]);
    const openCreate = () => {
        setEditing(null);
        form.setData({ name: '', phone: '', email: '', city: '', stage: 'new', platform: 'Facebook', source_type: 'meta_lead', form_name: '', ad_name: '', campaign_name: '', cost_per_lead: 0, score: 0, assignee_name: '', auto_tags: '', captured_at: '' });
        setFormOpen(true);
    };
    const openEdit = (lead: Lead) => {
        setEditing(lead);
        form.setData({
            name: lead.name,
            phone: lead.phone || '',
            email: lead.email || '',
            city: lead.city === 'Unknown' ? '' : lead.city,
            stage: lead.stage,
            platform: lead.platform,
            source_type: lead.sourceType || 'meta_lead',
            form_name: lead.form,
            ad_name: lead.adName,
            campaign_name: lead.campaignName || '',
            cost_per_lead: lead.cpl,
            score: lead.score,
            assignee_name: lead.assignee === 'Unassigned' ? '' : lead.assignee,
            auto_tags: (lead.autoTags || []).join(', '),
            captured_at: lead.time ? lead.time.slice(0, 16) : '',
        });
        setSelected(null);
        setFormOpen(true);
    };
    const save = () => {
        const payload = {
            ...form.data,
            auto_tags: String(form.data.auto_tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
        };
        const options = { preserveScroll: true, onSuccess: () => setFormOpen(false) };
        editing
            ? router.patch(route('app.meta-leads.update', editing.id), payload, options)
            : router.post(route('app.meta-leads.store'), payload, options);
    };
    const remove = async (lead: Lead) => {
        const confirmed = await confirm({
            title: 'Delete lead',
            message: `Delete "${lead.name}" from Meta Leads?`,
            confirmText: 'Delete lead',
            variant: 'danger',
        });
        if (confirmed) router.delete(route('app.meta-leads.destroy', lead.id), { preserveScroll: true, onSuccess: () => setSelected(null) });
    };
    const convert = (lead: Lead) => {
        router.post(route('app.meta-leads.contact', lead.id), {}, { preserveScroll: true });
    };
    const syncMetaLeads = () => {
        router.post(route('app.integrations.sync', 'meta-leads'), {}, { preserveScroll: true });
    };
    return (
        <AppShell>
            <Head title="Meta Leads" />
            <AddonPage
                title="Meta Leads"
                description="Leads are fetched from connected Meta Lead Ads forms through Facebook Login, sync, and provider webhooks."
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('app.integrations.index')}>
                            <Button type="button" variant="secondary"><Settings2 className="h-4 w-4" />Meta setup</Button>
                        </Link>
                        <Button type="button" onClick={syncMetaLeads} disabled={!metaIntegration?.connected}>
                            <RefreshCw className="h-4 w-4" />
                            Sync Meta leads
                        </Button>
                    </div>
                }
            >
                <Card className="border-emerald-100 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                    <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                {metaIntegration?.connected ? 'Meta Lead Ads connected' : 'Connect Meta Lead Ads'}
                            </div>
                            <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                {metaIntegration?.connected
                                    ? `${metaIntegration.pageName || 'Facebook Page'}${metaIntegration.formName ? ` · ${metaIntegration.formName}` : ''}${metaIntegration.lastSyncAt ? ` · synced ${new Date(metaIntegration.lastSyncAt).toLocaleString()}` : ''}`
                                    : 'Use Integrations > Meta Leads to connect Facebook, choose the Page/Form, enable auto-contact if needed, and run Sync now.'}
                            </p>
                            {metaIntegration?.lastError && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{metaIntegration.lastError}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-waify-text-muted dark:bg-waify-dark-surface dark:text-waify-dark-text-muted">{metaIntegration?.forms?.length || 0} forms cached</span>
                            <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-waify-text-muted dark:bg-waify-dark-surface dark:text-waify-dark-text-muted">{metaIntegration?.autoCreateContact ? 'Auto-contact on' : 'Auto-contact off'}</span>
                        </div>
                    </CardContent>
                </Card>
                <StatGrid stats={[
                    { label: 'Leads', value: leads.length, icon: Target, tone: 'green' },
                    { label: 'Qualified', value: leads.filter((lead) => lead.stage === 'qualified' || lead.stage === 'won').length, icon: UserCheck, tone: 'blue' },
                    { label: 'Avg CPL', value: `₹${Math.round((leads.reduce((sum, lead) => sum + lead.cpl, 0) || 0) / Math.max(leads.length, 1))}`, icon: BadgeIndianRupee, tone: 'amber' },
                    { label: 'Platforms', value: new Set(leads.map((lead) => lead.platform)).size, icon: Facebook, tone: 'purple' },
                ]} />
                <ServerListControls routeName="app.meta-leads.index" filters={filters} pagination={pagination} searchPlaceholder="Search leads, form, ad" />
                <Toolbar search={{ value: search, onChange: setSearch, placeholder: 'Filter current page' }} />
                {filtered.length === 0 ? <EmptyPanel title="No Meta leads yet" description={metaIntegration?.connected ? 'Run Sync Meta leads or wait for Meta webhook delivery from your connected lead form.' : 'Connect Meta Leads from Integrations to fetch real Facebook and Instagram Lead Ads submissions.'} action={<Link href={route('app.integrations.index')}><Button>Open integrations</Button></Link>} /> : (
                    <div className="grid gap-4">
                        {filtered.map((lead) => (
                            <Card key={lead.id}>
                                <CardContent className="flex flex-col gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <ThemedIconTile tone={lead.platform === 'Instagram' ? 'pink' : 'blue'}><Target className="h-5 w-5" /></ThemedIconTile>
                                        <div className="min-w-0">
                                            <h3 className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{lead.name}</h3>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{lead.phone || 'No phone'} · {lead.city}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4 xl:min-w-[560px]">
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Source</span><p className="font-semibold">{lead.sourceType === 'ctwa' ? 'CTWA' : lead.platform}</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Form</span><p className="truncate font-semibold">{lead.form}</p></div>
                                        <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Score</span><p className="font-semibold">{lead.score}</p></div>
                                        <div className="flex items-end justify-between gap-2"><MiniStatus status={lead.stage} /><Button size="sm" variant="secondary" onClick={() => setSelected(lead)}>Open</Button></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                <Drawer
                    open={Boolean(selected)}
                    onClose={() => setSelected(null)}
                    title={selected?.name || 'Lead details'}
                    description={selected ? `${selected.platform} · ${selected.form}` : undefined}
                    footer={<div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={!selected?.phone} onClick={() => selected && convert(selected)}><UserPlus className="h-4 w-4" />Convert</Button><Button variant="ghost" onClick={() => selected && remove(selected)}><Trash2 className="h-4 w-4" />Delete</Button><Button variant="secondary" onClick={() => selected && openEdit(selected)}><Edit3 className="h-4 w-4" />Edit</Button><Button onClick={() => setSelected(null)}>Close</Button></div>}
                >
                    {selected && (
                        <div className="space-y-4">
                            <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-waify-text dark:text-waify-dark-text">{selected.name}</p>
                                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{selected.adName}</p>
                                    </div>
                                    <MiniStatus status={selected.stage} />
                                </div>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted"><Phone className="h-3.5 w-3.5" />Phone</p>
                                    <p className="mt-1 font-semibold text-waify-text dark:text-waify-dark-text">{selected.phone || 'Not captured'}</p>
                                </div>
                                <div className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted"><MapPin className="h-3.5 w-3.5" />City</p>
                                    <p className="mt-1 font-semibold text-waify-text dark:text-waify-dark-text">{selected.city}</p>
                                </div>
                                <div className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Lead score</p>
                                    <p className="mt-1 font-semibold text-waify-text dark:text-waify-dark-text">{selected.score}</p>
                                </div>
                                <div className="rounded-card border border-gray-100 p-3 dark:border-waify-dark-border">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Cost per lead</p>
                                    <p className="mt-1 font-semibold text-waify-text dark:text-waify-dark-text">₹{selected.cpl}</p>
                                </div>
                            </div>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Routing</p>
                                    <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Assigned to {selected.assignee || 'Unassigned'} from {selected.form}. Campaign {selected.campaignName || selected.adName || 'not set'}. Auto tags: {(selected.autoTags || []).join(', ') || 'none'}.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </Drawer>
                <Drawer
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    title={editing ? 'Edit lead' : 'Add lead'}
                    description="Stored in this workspace lead pipeline."
                    footer={<div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={save} disabled={form.processing}>Save lead</Button></div>}
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Name<Input className="mt-1" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Phone<Input className="mt-1" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Email<Input className="mt-1" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">City<Input className="mt-1" value={form.data.city} onChange={(e) => form.setData('city', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Platform<select className="waify-input mt-1" value={form.data.platform} onChange={(e) => form.setData('platform', e.target.value)}><option>Facebook</option><option>Instagram</option></select></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Source type<select className="waify-input mt-1" value={form.data.source_type} onChange={(e) => form.setData('source_type', e.target.value)}><option value="meta_lead">Meta lead form</option><option value="ctwa">Click-to-WhatsApp</option><option value="manual">Manual</option></select></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Stage<select className="waify-input mt-1" value={form.data.stage} onChange={(e) => form.setData('stage', e.target.value)}><option value="new">New</option><option value="qualified">Qualified</option><option value="contacted">Contacted</option><option value="won">Won</option><option value="lost">Lost</option></select></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Form<Input className="mt-1" value={form.data.form_name} onChange={(e) => form.setData('form_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Ad name<Input className="mt-1" value={form.data.ad_name} onChange={(e) => form.setData('ad_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Campaign<Input className="mt-1" value={form.data.campaign_name} onChange={(e) => form.setData('campaign_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Auto tags<Input className="mt-1" value={form.data.auto_tags} onChange={(e) => form.setData('auto_tags', e.target.value)} placeholder="ctwa, hot lead" /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">CPL paise<Input className="mt-1" type="number" value={form.data.cost_per_lead} onChange={(e) => form.setData('cost_per_lead', Number(e.target.value))} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Score<Input className="mt-1" type="number" value={form.data.score} onChange={(e) => form.setData('score', Number(e.target.value))} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Assignee<Input className="mt-1" value={form.data.assignee_name} onChange={(e) => form.setData('assignee_name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Captured at<Input className="mt-1" type="datetime-local" value={form.data.captured_at} onChange={(e) => form.setData('captured_at', e.target.value)} /></label>
                    </div>
                </Drawer>
            </AddonPage>
        </AppShell>
    );
}
