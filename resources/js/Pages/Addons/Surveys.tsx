import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent } from '@/Components/UI/Card';
import { AddonPage, EmptyPanel, MiniStatus, PaginationMeta, ServerListControls, StatGrid } from './Shared';
import { Modal, ThemedIconTile } from '@/Components/UI/Elements';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { BarChart3, ClipboardList, Copy, Edit3, ExternalLink, MessageSquareText, Plus, Star, Tag, Trash2, UserRoundPlus } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';

type Survey = {
    id: number;
    name: string;
    type: string;
    trigger: string;
    responses: number;
    status: string;
    averageScore?: number | null;
    questions?: string[];
    autoCreateContact?: boolean;
    contactNameField?: string | null;
    contactPhoneField?: string | null;
    contactEmailField?: string | null;
    autoTagNames?: string[];
    successMessage?: string | null;
    automationEnabled?: boolean;
    automationBotFlowId?: number | null;
    publicUrl: string;
};

export default function Surveys({
    surveys = [],
    tags = [],
    automationFlows = [],
    filters = {},
    pagination = null,
}: {
    surveys: Survey[];
    tags?: string[];
    automationFlows?: Array<{ id: number; name: string; bot_name: string }>;
    filters?: Record<string, any>;
    pagination?: PaginationMeta | null;
}) {
    const confirm = useConfirm();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Survey | null>(null);
    const form = useForm({
        name: '',
        type: 'Lead form',
        trigger: '',
        status: 'draft',
        average_score: '' as number | string,
        questions: ['What are you interested in?', 'What is your budget?', 'When should we contact you?'],
        auto_create_contact: true,
        contact_name_field: 'respondent_name',
        contact_phone_field: 'respondent_phone',
        contact_email_field: 'respondent_email',
        auto_tag_names: ['Form lead'],
        success_message: 'Thanks. Our team will contact you shortly.',
        automation_enabled: false,
        automation_bot_flow_id: '' as number | string,
    });
    const openCreate = () => {
        setEditing(null);
        form.setData({
            name: '',
            type: 'Lead form',
            trigger: '',
            status: 'draft',
            average_score: '',
            questions: ['What are you interested in?', 'What is your budget?', 'When should we contact you?'],
            auto_create_contact: true,
            contact_name_field: 'respondent_name',
            contact_phone_field: 'respondent_phone',
            contact_email_field: 'respondent_email',
            auto_tag_names: ['Form lead'],
            success_message: 'Thanks. Our team will contact you shortly.',
            automation_enabled: false,
            automation_bot_flow_id: '',
        });
        setOpen(true);
    };
    const openEdit = (survey: Survey) => {
        setEditing(survey);
        form.setData({
            name: survey.name,
            type: survey.type,
            trigger: survey.trigger,
            status: survey.status,
            average_score: survey.averageScore ?? '',
            questions: survey.questions?.length ? survey.questions : ['How was your experience?'],
            auto_create_contact: survey.autoCreateContact ?? true,
            contact_name_field: survey.contactNameField || 'respondent_name',
            contact_phone_field: survey.contactPhoneField || 'respondent_phone',
            contact_email_field: survey.contactEmailField || 'respondent_email',
            auto_tag_names: survey.autoTagNames?.length ? survey.autoTagNames : [],
            success_message: survey.successMessage || '',
            automation_enabled: survey.automationEnabled ?? false,
            automation_bot_flow_id: survey.automationBotFlowId ?? '',
        });
        setOpen(true);
    };
    const save = () => {
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
        editing ? form.patch(route('app.surveys.update', editing.id), options) : form.post(route('app.surveys.store'), options);
    };
    const remove = async (survey: Survey) => {
        const confirmed = await confirm({
            title: 'Delete form',
            message: `Delete "${survey.name}" and its workspace form configuration?`,
            confirmText: 'Delete form',
            variant: 'danger',
        });
        if (confirmed) router.delete(route('app.surveys.destroy', survey.id), { preserveScroll: true });
    };

    return (
        <AppShell>
            <Head title="Surveys & Forms" />
            <AddonPage title="Surveys & Forms" description="Collect CSAT, NPS, and campaign feedback inside WhatsApp." actions={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create form</Button>}>
                <StatGrid stats={[
                    { label: 'Forms', value: surveys.length, icon: ClipboardList, tone: 'green' },
                    { label: 'Responses', value: surveys.reduce((sum, item) => sum + item.responses, 0), icon: BarChart3, tone: 'blue' },
                    { label: 'Active flows', value: surveys.filter((item) => item.status === 'active').length, icon: MessageSquareText, tone: 'purple' },
                    { label: 'Avg score', value: surveys.length ? (surveys.reduce((sum, item) => sum + Number(item.averageScore || 0), 0) / Math.max(surveys.filter((item) => item.averageScore).length, 1)).toFixed(1) : '-', icon: Star, tone: 'amber' },
                ]} />
                <ServerListControls routeName="app.surveys.index" filters={filters} pagination={pagination} searchPlaceholder="Search forms, type, trigger" />
                {surveys.length === 0 && <EmptyPanel title="No forms yet" description="Create a survey or feedback form for this workspace." action={<Button onClick={openCreate}>Create form</Button>} />}
                <div className="grid gap-4">
                    {surveys.map((survey) => (
                        <Card key={survey.id}>
                            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                    <ThemedIconTile tone="purple"><ClipboardList className="h-5 w-5" /></ThemedIconTile>
                                    <div>
                                        <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">{survey.name}</h3>
                                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{survey.type} · {survey.trigger}</p>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                            {survey.autoCreateContact && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"><UserRoundPlus className="h-3 w-3" />Creates contact</span>}
                                            {survey.automationEnabled && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"><MessageSquareText className="h-3 w-3" />Starts automation</span>}
                                            {(survey.autoTagNames || []).slice(0, 3).map((tag) => <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-waify-green-soft px-2 py-1 text-waify-green-dark dark:bg-emerald-500/10 dark:text-emerald-200"><Tag className="h-3 w-3" />{tag}</span>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold">{survey.responses} responses</span>
                                    <MiniStatus status={survey.status} />
                                    <Button size="sm" variant="secondary" onClick={() => navigator.clipboard?.writeText(survey.publicUrl)}><Copy className="h-3.5 w-3.5" />Copy link</Button>
                                    <a href={survey.publicUrl} target="_blank" rel="noreferrer"><Button size="sm" variant="secondary"><ExternalLink className="h-3.5 w-3.5" />Open</Button></a>
                                    <Button size="sm" variant="secondary" onClick={() => openEdit(survey)}><Edit3 className="h-3.5 w-3.5" />Edit</Button>
                                    <Button size="sm" variant="ghost" onClick={() => remove(survey)}><Trash2 className="h-3.5 w-3.5" />Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit form' : 'Create form'} description="Saved to this workspace." footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={form.processing}>Save</Button></>}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Name<Input className="mt-1" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Type<Input className="mt-1" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Trigger<Input className="mt-1" value={form.data.trigger} onChange={(e) => form.setData('trigger', e.target.value)} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Average score<Input className="mt-1" type="number" step="0.1" value={form.data.average_score} onChange={(e) => form.setData('average_score', e.target.value === '' ? '' : Number(e.target.value))} /></label>
                        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">Status<select className="waify-input mt-1" value={form.data.status} onChange={(e) => form.setData('status', e.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select></label>
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Questions<textarea className="waify-input mt-1 min-h-28" value={form.data.questions.join('\n')} onChange={(e) => form.setData('questions', e.target.value.split('\n').map((line) => line.trim()).filter(Boolean))} /></label>
                        <div className="sm:col-span-2 rounded-lg border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <label className="flex items-start gap-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                <input type="checkbox" className="mt-1" checked={form.data.auto_create_contact} onChange={(e) => form.setData('auto_create_contact', e.target.checked)} />
                                <span>
                                    Create or update contact on submission
                                    <span className="mt-1 block text-xs font-normal text-waify-text-muted dark:text-waify-dark-text-muted">Use public forms as lead capture pages. A contact is created only when a phone number is available.</span>
                                </span>
                            </label>
                            {form.data.auto_create_contact && (
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <FieldSelect label="Name field" value={form.data.contact_name_field} questions={form.data.questions} onChange={(value) => form.setData('contact_name_field', value)} />
                                    <FieldSelect label="Phone field" value={form.data.contact_phone_field} questions={form.data.questions} onChange={(value) => form.setData('contact_phone_field', value)} />
                                    <FieldSelect label="Email field" value={form.data.contact_email_field} questions={form.data.questions} onChange={(value) => form.setData('contact_email_field', value)} />
                                    <label className="sm:col-span-3 text-sm font-medium text-waify-text dark:text-waify-dark-text">
                                        Auto tags
                                        <Input
                                            className="mt-1"
                                            list="survey-tag-options"
                                            value={form.data.auto_tag_names.join(', ')}
                                            onChange={(e) => form.setData('auto_tag_names', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
                                            placeholder="Lead, Website form, Hot prospect"
                                        />
                                        <datalist id="survey-tag-options">{tags.map((tag) => <option key={tag} value={tag} />)}</datalist>
                                    </label>
                                </div>
                            )}
                        </div>
                        <label className="sm:col-span-2 text-sm font-medium text-waify-text dark:text-waify-dark-text">Success message<textarea className="waify-input mt-1 min-h-20" value={form.data.success_message} onChange={(e) => form.setData('success_message', e.target.value)} /></label>
                        <div className="sm:col-span-2 rounded-lg border border-waify-border bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <label className="flex items-start gap-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">
                                <input type="checkbox" className="mt-1" checked={form.data.automation_enabled} onChange={(e) => form.setData('automation_enabled', e.target.checked)} />
                                <span>
                                    Start automation after submission
                                    <span className="mt-1 block text-xs font-normal text-waify-text-muted dark:text-waify-dark-text-muted">Runs the selected active chatbot flow for the created contact. This works best with a WhatsApp connection and a flow that sends a template, payment link, assignment, or AI-agent reply.</span>
                                </span>
                            </label>
                            {form.data.automation_enabled && (
                                <label className="mt-4 block text-sm font-medium text-waify-text dark:text-waify-dark-text">
                                    Flow to run
                                    <select className="waify-input mt-1" value={form.data.automation_bot_flow_id} onChange={(event) => form.setData('automation_bot_flow_id', event.target.value ? Number(event.target.value) : '')}>
                                        <option value="">Select active flow</option>
                                        {automationFlows.map((flow) => <option key={flow.id} value={flow.id}>{flow.bot_name} / {flow.name}</option>)}
                                    </select>
                                    {automationFlows.length === 0 && <span className="mt-1 block text-xs text-amber-600 dark:text-amber-300">Create and activate an automation flow before enabling this.</span>}
                                </label>
                            )}
                        </div>
                    </div>
                </Modal>
            </AddonPage>
        </AppShell>
    );
}

function FieldSelect({ label, value, questions, onChange }: { label: string; value: string; questions: string[]; onChange: (value: string) => void }) {
    return (
        <label className="text-sm font-medium text-waify-text dark:text-waify-dark-text">
            {label}
            <select className="waify-input mt-1" value={value || ''} onChange={(event) => onChange(event.target.value)}>
                <option value="">Auto detect</option>
                <option value="respondent_name">Built-in name</option>
                <option value="respondent_phone">Built-in phone</option>
                <option value="respondent_email">Built-in email</option>
                {questions.map((question, index) => <option key={`${question}-${index}`} value={`answer_${index}`}>{question}</option>)}
            </select>
        </label>
    );
}
