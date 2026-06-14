import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Building2, Check, ChevronLeft, KeyRound, MessageCircle, RefreshCw, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';
import { Badge } from '@/Components/UI/Badge';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import BrandLogo from '@/Components/Branding/BrandLogo';
import { ThemeToggle } from '@/Components/UI/ThemeToggle';
import { useToast } from '@/hooks/useToast';

interface Plan {
    id: number;
    key: string;
    name: string;
    description: string;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    trial_days: number;
    limits: Record<string, any>;
    modules: string[];
}

type ConnectionMethod = 'embedded' | 'manual' | 'qr' | 'later';

interface EmbeddedSignup {
    enabled?: boolean;
    appId?: string | null;
    configId?: string | null;
    coexistenceEnabled?: boolean;
    coexistenceConfigId?: string | null;
    apiVersion?: string | null;
}

function formatPrice(amount: number | null, currency = 'INR') {
    if (amount === null) return 'Custom';
    if (amount === 0) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount / 100);
}

function formatLimit(value: any, label: string) {
    if (value === undefined || value === null) return null;
    if (Number(value) === -1) return `Unlimited ${label}`;
    return `${Number(value).toLocaleString('en-IN')} ${label}`;
}

function highlights(plan?: Plan) {
    if (!plan) return [];

    return [
        formatLimit(plan.limits?.messages_monthly, 'messages/month'),
        formatLimit(plan.limits?.template_sends_monthly, 'template sends/month'),
        formatLimit(plan.limits?.agents, Number(plan.limits?.agents) === 1 ? 'agent' : 'agents'),
    ].filter(Boolean) as string[];
}

export default function Onboarding({
    plans = [],
    defaultPlanKey = '',
    workspaceTypes = {},
    embeddedSignup = {},
}: {
    plans?: Plan[];
    defaultPlanKey?: string;
    workspaceTypes?: Record<string, string>;
    embeddedSignup?: EmbeddedSignup;
}) {
    const fallbackPlan = plans.find((plan) => plan.key === defaultPlanKey) ?? plans[0];
    const [selectedPlanKey, setSelectedPlanKey] = useState(fallbackPlan?.key ?? defaultPlanKey);
    const { toast } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        workspace_type: 'business',
        industry: '',
        plan_key: fallbackPlan?.key ?? defaultPlanKey,
        connection_method: (embeddedSignup.enabled ? 'embedded' : 'manual') as ConnectionMethod,
    });

    const selectedPlan = useMemo(() => plans.find((plan) => plan.key === selectedPlanKey), [plans, selectedPlanKey]);

    useEffect(() => {
        if (plans.length === 0 || selectedPlan) return;

        setSelectedPlanKey(plans[0].key);
        setData('plan_key', plans[0].key);
    }, [plans, selectedPlan, setData]);

    const selectPlan = (plan: Plan) => {
        setSelectedPlanKey(plan.key);
        setData('plan_key', plan.key);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('onboarding.store'), {
            onError: (formErrors) => {
                const firstError = Object.values(formErrors)[0];
                toast.error('Workspace was not created', typeof firstError === 'string' ? firstError : 'Please check the highlighted fields and try again.');
            },
        });
    };

    return (
        <BrandingWrapper>
            <Head title="Set up workspace" />
            <div className="min-h-screen bg-waify-bg text-waify-text antialiased dark:bg-waify-dark-bg dark:text-waify-dark-text">
                <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-5 dark:border-waify-dark-border dark:bg-waify-dark-surface sm:px-8">
                    <Link href={route('landing')} className="flex items-center gap-2">
                        <BrandLogo variant="auto" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link href={route('dashboard')} className="hidden text-sm font-semibold text-waify-green-dark hover:underline dark:text-emerald-300 sm:inline">
                            Dashboard
                        </Link>
                    </div>
                </header>

                <main className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-[1180px] gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="flex items-start gap-3">
                            <Link href={route('dashboard')} className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-btn text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text">
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <Badge variant="success">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Minimal setup
                                </Badge>
                                <h1 className="mt-3 text-2xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">Create your workspace</h1>
                                <p className="mt-1 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                    Add workspace details, choose a plan, and pick how you want to connect your WhatsApp Business account.
                                </p>
                            </div>
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <div className="rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
                                {Object.values(errors)[0] || 'Please check the highlighted fields and try again.'}
                            </div>
                        )}

                        <section className="rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <div className="mb-4 flex items-center gap-3">
                                <StepIcon icon={Building2} />
                                <div>
                                    <h2 className="font-semibold text-waify-text dark:text-waify-dark-text">Workspace details</h2>
                                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Used for billing, users, WABA setup, and routing.</p>
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Workspace name" value={data.name} onChange={(value) => setData('name', value)} error={errors.name} required placeholder="Zyptos Business" className="sm:col-span-2" autoFocus />
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-waify-text dark:text-waify-dark-text">Workspace type</label>
                                    <select
                                        value={data.workspace_type}
                                        onChange={(event) => setData('workspace_type', event.target.value)}
                                        className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm text-waify-text shadow-sm focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text"
                                    >
                                        {Object.entries(workspaceTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                    </select>
                                    <InputError message={errors.workspace_type} className="mt-1" />
                                </div>
                                <Field label="Industry" value={data.industry} onChange={(value) => setData('industry', value)} error={errors.industry} placeholder="Retail, education, healthcare..." />
                            </div>
                        </section>

                        <section className="rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <StepIcon icon={Zap} />
                                    <div>
                                        <h2 className="font-semibold text-waify-text dark:text-waify-dark-text">Choose plan</h2>
                                        <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">You can change this later from Billing.</p>
                                    </div>
                                </div>
                                {selectedPlan?.trial_days ? <Badge variant="success">{selectedPlan.trial_days}-day trial</Badge> : null}
                            </div>

                            <div className="grid gap-3 md:grid-cols-3">
                                {plans.map((plan) => (
                                    <PlanCard key={plan.id} plan={plan} selected={plan.key === selectedPlanKey} onSelect={() => selectPlan(plan)} />
                                ))}
                            </div>
                            {plans.length === 0 && (
                                <div className="rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100">
                                    No public plans are configured. Zyptos will use the platform default plan.
                                </div>
                            )}
                            <InputError message={errors.plan_key} className="mt-2" />
                        </section>

                        <section className="rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <div className="mb-4 flex items-center gap-3">
                                <StepIcon icon={MessageCircle} />
                                <div>
                                    <h2 className="font-semibold text-waify-text dark:text-waify-dark-text">Connect WhatsApp</h2>
                                    <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Choose the setup path to open immediately after workspace creation.</p>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <ConnectionCard
                                    id="embedded"
                                    selected={data.connection_method === 'embedded'}
                                    disabled={!embeddedSignup.enabled}
                                    title="Embedded / Auto"
                                    badge="Recommended"
                                    icon={Sparkles}
                                    description={embeddedSignup.enabled ? 'Use Meta embedded signup. Choose new number, migration, or coexistence on the WABA setup page.' : 'Needs Meta app ID and Embedded Signup Config ID in admin settings.'}
                                    onSelect={() => setData('connection_method', 'embedded')}
                                />
                                <ConnectionCard
                                    id="manual"
                                    selected={data.connection_method === 'manual'}
                                    title="Manual setup"
                                    icon={KeyRound}
                                    description="Paste WABA ID, Phone Number ID, and permanent token. Verify webhook only if receiving messages."
                                    onSelect={() => setData('connection_method', 'manual')}
                                />
                                <ConnectionCard
                                    id="qr"
                                    selected={data.connection_method === 'qr'}
                                    title="QR connection"
                                    icon={RefreshCw}
                                    description="Unofficial WhatsApp QR login with throttling and safety controls. Anti-ban is not guaranteed."
                                    onSelect={() => setData('connection_method', 'qr')}
                                />
                                <ConnectionCard
                                    id="later"
                                    selected={data.connection_method === 'later'}
                                    title="Do it later"
                                    icon={ShieldCheck}
                                    description="Create the workspace now and connect WhatsApp from WABA Account when ready."
                                    onSelect={() => setData('connection_method', 'later')}
                                />
                            </div>
                            <InputError message={errors.connection_method} className="mt-2" />
                            <div className="mt-4 rounded-card border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-100">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <p className="leading-6">
                                        Existing WhatsApp chat history is not imported into Zyptos by the normal Cloud API. New conversations sync after webhooks are active. Contacts can be rebuilt from new messages or imported by CSV.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col gap-3 rounded-card border border-waify-border bg-white p-4 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                Workspace timezone is selected automatically from platform defaults. You do not need to enter it.
                            </div>
                            <Button type="submit" disabled={processing || !data.name.trim()} className="sm:min-w-[220px]">
                                {processing ? 'Creating workspace...' : 'Create workspace'}
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>

                    <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
                        <div className="rounded-card border border-waify-border bg-white p-5 shadow-card dark:border-waify-dark-border dark:bg-waify-dark-surface">
                            <div className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Summary</div>
                            <div className="mt-4 space-y-4">
                                <SummaryRow label="Workspace" value={data.name || 'Not named yet'} />
                                <SummaryRow label="Plan" value={selectedPlan ? `${selectedPlan.name} - ${formatPrice(selectedPlan.price_monthly, selectedPlan.currency)}/mo` : 'Default plan'} />
                                <SummaryRow label="Connection" value={connectionLabel(data.connection_method)} />
                            </div>
                            {selectedPlan && (
                                <div className="mt-5 rounded-card bg-waify-green/5 p-4 dark:bg-waify-green/10">
                                    <div className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{selectedPlan.name} includes</div>
                                    <div className="mt-3 space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        {highlights(selectedPlan).map((item) => (
                                            <div key={item} className="flex items-center gap-2">
                                                <Check className="h-4 w-4 text-waify-green" />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-waify-green" />
                                            <span>{selectedPlan.modules.length} enabled features</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="rounded-card border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/20 dark:text-blue-100">
                            <div className="font-semibold">Real setup flow</div>
                            <p className="mt-1 leading-6">
                                Embedded / Auto opens Meta setup where users can choose a new Cloud API number, API migration, or eligible coexistence. Manual setup opens the credential form.
                            </p>
                        </div>
                    </aside>
                </main>
            </div>
        </BrandingWrapper>
    );
}

function StepIcon({ icon: Icon }: { icon: any }) {
    return (
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green">
            <Icon className="h-5 w-5" />
        </span>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    placeholder,
    required = false,
    autoFocus = false,
    className = '',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    autoFocus?: boolean;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="mb-1.5 block text-xs font-semibold text-waify-text dark:text-waify-dark-text">
                {label}{required && <span className="text-red-500"> *</span>}
            </label>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                autoFocus={autoFocus}
                placeholder={placeholder}
                className="h-10 w-full rounded-btn border border-waify-border bg-white px-3 text-sm text-waify-text shadow-sm placeholder:text-waify-text-muted/60 focus:border-waify-green focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-slate-900 dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted/60"
            />
            <InputError message={error} className="mt-1" />
        </div>
    );
}

function PlanCard({ plan, selected, onSelect }: { plan: Plan; selected: boolean; onSelect: () => void }) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`rounded-card border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-card-lg ${
                selected
                    ? 'border-waify-green bg-waify-green/5 ring-2 ring-waify-green/25 dark:bg-waify-green/10'
                    : 'border-waify-border bg-gray-50 hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900'
            }`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="font-semibold text-waify-text dark:text-waify-dark-text">{plan.name}</div>
                    <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{plan.description}</div>
                </div>
                <SelectionDot selected={selected} />
            </div>
            <div className="mt-4">
                <span className="text-2xl font-bold text-waify-text dark:text-waify-dark-text">{formatPrice(plan.price_monthly, plan.currency)}</span>
                {plan.price_monthly !== null && plan.price_monthly > 0 && <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted"> / month</span>}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                {plan.trial_days > 0 && <Badge variant="success">{plan.trial_days} day trial</Badge>}
                <Badge variant="secondary">{plan.modules.length} features</Badge>
            </div>
        </button>
    );
}

function ConnectionCard({
    selected,
    disabled = false,
    title,
    badge,
    description,
    icon: Icon,
    onSelect,
}: {
    id: ConnectionMethod;
    selected: boolean;
    disabled?: boolean;
    title: string;
    badge?: string;
    description: string;
    icon: any;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onSelect}
            className={`rounded-card border p-4 text-left transition ${
                selected
                    ? 'border-waify-green bg-waify-green/5 ring-2 ring-waify-green/25 dark:bg-waify-green/10'
                    : 'border-waify-border bg-gray-50 hover:border-waify-green/50 dark:border-waify-dark-border dark:bg-slate-900'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 hover:shadow-card-lg'}`}
        >
            <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-waify-green shadow-sm dark:bg-slate-800">
                    <Icon className="h-5 w-5" />
                </span>
                <SelectionDot selected={selected} />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <div className="font-semibold text-waify-text dark:text-waify-dark-text">{title}</div>
                {badge && <Badge variant="success">{badge}</Badge>}
            </div>
            <p className="mt-2 text-sm leading-6 text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
        </button>
    );
}

function SelectionDot({ selected }: { selected: boolean }) {
    return (
        <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${selected ? 'border-waify-green bg-waify-green text-white' : 'border-gray-300 dark:border-slate-600'}`}>
            {selected && <Check className="h-3.5 w-3.5" />}
        </span>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
            <div className="mt-1 text-sm font-semibold text-waify-text dark:text-waify-dark-text">{value}</div>
        </div>
    );
}

function connectionLabel(value: ConnectionMethod) {
    if (value === 'embedded') return 'Embedded / Auto connection';
    if (value === 'manual') return 'Manual WABA setup';
    if (value === 'qr') return 'QR connection';
    return 'Connect later';
}
