import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Progress } from '@/Components/UI/Progress';
import {
    Calendar,
    Check,
    CheckCircle,
    CreditCard,
    Download,
    Eye,
    ExternalLink,
    FileText,
    MessageSquare,
    Plus,
    Printer,
    Receipt,
    Send,
    Upload,
    Users,
    WalletCards,
    X,
    XCircle,
    Zap,
} from 'lucide-react';
import {
    BillingInfoBanner,
    BillingSurface,
    BillingTable,
    billingTableClass,
    billingTdClass,
    billingThClass,
    billingTheadClass,
    billingTrClass,
} from '@/Components/Billing/BillingPage';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/useToast';
import { Head } from '@inertiajs/react';

declare global {
    interface Window {
        Razorpay?: any;
    }
}

type BillingTab = 'overview' | 'usage' | 'plans' | 'invoices' | 'payment';

interface Subscription {
    status: string;
    provider?: string;
    provider_ref?: string | null;
    provider_status?: string | null;
    trial_ends_at: string | null;
    current_period_start?: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    last_payment_at?: string | null;
    last_payment_failed_at?: string | null;
    last_error: string | null;
    discount_code?: string | null;
}

interface Plan {
    id?: number;
    name: string;
    key: string;
    description?: string | null;
    price_monthly: number | null;
    price_yearly: number | null;
    currency: string;
    limits: Record<string, number>;
    modules: string[];
    features?: string[];
    trial_days?: number;
    requires_admin_approval?: boolean;
    is_current?: boolean;
    can_renew?: boolean;
    warnings?: string[];
}

interface Usage {
    messages_sent: number;
    template_sends: number;
    ai_credits_used: number;
    storage_bytes: number;
}

interface Account {
    slug: string;
    owner_id: number | string;
    name?: string;
    owner?: { name?: string; email?: string };
}

interface Wallet {
    balance_minor: number;
    currency: string;
}

interface Payment {
    id: number;
    provider: string;
    payment_method?: string | null;
    provider_order_id: string;
    provider_payment_id: string | null;
    invoice_number?: string | null;
    amount: number;
    base_amount?: number;
    discount_amount?: number;
    discount_code?: string | null;
    taxable_amount?: number;
    tax_amount?: number;
    tax_rate?: number;
    cgst_amount?: number;
    sgst_amount?: number;
    igst_amount?: number;
    tax_snapshot?: {
        tax_type?: string;
        sac_code?: string;
        supplier?: TaxProfile;
        customer?: TaxProfile;
    } | null;
    currency: string;
    status: string;
    plan: { id: number; name: string } | null;
    created_at: string;
    paid_at: string | null;
    failed_at: string | null;
    proof_uploaded_at?: string | null;
    proof_original_name?: string | null;
    has_proof?: boolean;
    rejection_reason?: string | null;
    metadata?: {
        payment_method_label?: string;
        payment_instructions?: Record<string, string | null>;
        [key: string]: any;
    } | null;
    timeline?: Array<{
        event: string;
        label: string;
        at: string;
        actor_name?: string | null;
        meta?: Record<string, any>;
    }>;
}

interface CheckoutPreview {
    plan_name: string;
    billing_cycle: 'monthly' | 'yearly';
    base_amount: number;
    discount_amount: number;
    taxable_amount: number;
    tax_amount: number;
    cgst_amount: number;
    sgst_amount: number;
    igst_amount: number;
    tax_rate: number;
    tax_type: string;
    amount_due: number;
    currency: string;
    discount: null | {
        code: string;
        name: string;
        discount_type: string;
        percent_off?: number | null;
        amount_off?: number | null;
        amount_off_minor: number;
    };
}

interface TaxProfile {
    legal_name?: string | null;
    email?: string | null;
    gstin?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    state_code?: string | null;
    postal_code?: string | null;
    country?: string | null;
}

interface TransactionRow {
    type: 'payment' | 'wallet';
    id: number;
    direction: 'credit' | 'debit';
    amount_minor: number;
    currency: string;
    status: string;
    source: string;
    reference: string | null;
    notes: string | null;
    created_at: string;
}

interface UsageHistory {
    period: string;
    messages_sent: number;
    template_sends: number;
    ai_credits_used: number;
}

interface BlockedEvent {
    id: number;
    data: {
        limit_key: string;
        current_usage: number;
        limit: number;
        intended_increment: number;
    };
    created_at: string;
}

interface PaymentMethodOption {
    key: 'bank' | 'razorpay';
    label: string;
    enabled: boolean;
}

export default function BillingIndex({
    active_tab = 'overview',
    auto_checkout_plan_key = null,
    account,
    subscription,
    plan,
    usage,
    current_usage,
    limits = {},
    usage_history = [],
    blocked_events = [],
    wallet,
    payments = [],
    transactions = [],
    plans = [],
    current_plan_key,
    razorpay_enabled = false,
    razorpay_key_id = null,
    payment_methods = [],
    current_connections_count = 0,
    current_agents_count = 0,
    billing_profile,
    supplier_tax_profile,
}: {
    active_tab?: BillingTab;
    auto_checkout_plan_key?: string | null;
    account: Account;
    subscription: Subscription | null;
    plan: Plan | null;
    usage: Usage;
    current_usage?: Usage;
    limits?: Record<string, number>;
    usage_history?: UsageHistory[];
    blocked_events?: BlockedEvent[];
    wallet: Wallet;
    payments?: Payment[];
    transactions?: TransactionRow[];
    plans?: Plan[];
    current_plan_key?: string | null;
    razorpay_enabled?: boolean;
    razorpay_key_id?: string | null;
    payment_methods?: PaymentMethodOption[];
    current_connections_count?: number;
    current_agents_count?: number;
    billing_profile?: TaxProfile;
    supplier_tax_profile?: TaxProfile;
}) {
    const { auth, branding } = usePage().props as any;
    const { confirm } = useNotifications();
    const checkoutBrandName = branding?.platform_name || 'Zyptos';
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<BillingTab>(active_tab);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'razorpay'>('razorpay');
    const [promoCode, setPromoCode] = useState('');
    const [switchingPlan, setSwitchingPlan] = useState<string | null>(null);
    const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
    const [checkoutPreview, setCheckoutPreview] = useState<CheckoutPreview | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [autoCheckoutOpened, setAutoCheckoutOpened] = useState(false);
    const [uploadingProof, setUploadingProof] = useState<number | null>(null);
    const [showTopupDialog, setShowTopupDialog] = useState(false);
    const [previewInvoice, setPreviewInvoice] = useState<Payment | null>(null);
    const [topupAmountMajor, setTopupAmountMajor] = useState('');
    const [topupNotes, setTopupNotes] = useState('');

    const isOwner = Number(account.owner_id) === Number(auth?.user?.id);
    const currentUsage = current_usage ?? usage;
    const nextBillingDate = subscription?.current_period_end || subscription?.trial_ends_at;
    const razorpayEnabled = razorpay_enabled && Boolean(razorpay_key_id);
    const enabledPaymentMethods = payment_methods.filter((method) => method.enabled);
    const effectivePaymentMethod = enabledPaymentMethods.length === 1 ? enabledPaymentMethods[0].key : paymentMethod;
    const hasPaidCheckout = enabledPaymentMethods.length > 0;

    useEffect(() => {
        if (enabledPaymentMethods.length === 0) {
            return;
        }

        if (!enabledPaymentMethods.some((method) => method.key === paymentMethod)) {
            setPaymentMethod((enabledPaymentMethods.find((method) => method.key === 'razorpay') ?? enabledPaymentMethods[0]).key);
        }
    }, [enabledPaymentMethods, paymentMethod]);

    useEffect(() => {
        if (autoCheckoutOpened || !auto_checkout_plan_key || plans.length === 0) {
            return;
        }

        const candidate = plans.find((item) => item.key === auto_checkout_plan_key);
        if (!candidate || candidate.requires_admin_approval) {
            return;
        }

        setActiveTab('plans');
        setCheckoutPlan(candidate);
        setAutoCheckoutOpened(true);
    }, [autoCheckoutOpened, auto_checkout_plan_key, plans]);

    useEffect(() => {
        if (!checkoutPlan) {
            setCheckoutPreview(null);
            setCheckoutError(null);
            return;
        }

        const timeout = window.setTimeout(() => {
            setCheckoutLoading(true);
            setCheckoutError(null);
            axios.post(route('app.billing.preview', { plan: checkoutPlan.key }), {
                billing_cycle: billingCycle,
                promo_code: promoCode.trim() || undefined,
            }).then((response) => {
                setCheckoutPreview(response.data);
            }).catch((error) => {
                setCheckoutError(error?.response?.data?.message || error?.message || 'Could not preview checkout.');
                setCheckoutPreview(null);
            }).finally(() => setCheckoutLoading(false));
        }, 250);

        return () => window.clearTimeout(timeout);
    }, [checkoutPlan, billingCycle, promoCode]);

    const formatMoney = (minor: number | null | undefined, currency = 'INR', fractionDigits = 0) => {
        if (minor === null || minor === undefined) return 'Custom';
        if (minor === 0) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: fractionDigits,
        }).format(minor / 100);
    };

    const formatLimit = (limit: number | undefined) => {
        if (limit === undefined) return 'N/A';
        if (limit === -1 || limit === 9999 || limit === 9999999) return 'Unlimited';
        return limit.toLocaleString('en-IN');
    };

    const percentage = (used: number, limit: number | undefined) => {
        if (!limit || limit === -1 || limit === 9999 || limit === 9999999) return 0;
        return Math.min((used / limit) * 100, 100);
    };

    const selectedPrice = (candidate: Plan) => billingCycle === 'yearly' ? candidate.price_yearly : candidate.price_monthly;
    const currentPlan = plans.find((candidate) => candidate.key === current_plan_key) ?? plan;
    const walletMayCoverPlan = (candidate: Plan) => {
        const price = selectedPrice(candidate);

        return Boolean(price && price > 0 && wallet.currency === candidate.currency && wallet.balance_minor >= price);
    };

    const usageMeter = (label: string, icon: JSX.Element, used: number, limit: number | undefined, currentCount?: number) => {
        if (limit === undefined) return null;
        const pct = percentage(used, limit);
        const warn = pct >= 85;

        return (
            <div className="rounded-card bg-gray-50/80 p-4 ring-1 ring-gray-100 dark:bg-slate-800/50 dark:ring-slate-700">
                <div className="mb-3 flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${warn ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300' : 'bg-waify-green/10 text-waify-green'}`}>
                        {icon}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{label}</div>
                        <div className="mt-0.5 text-xs tabular-nums text-waify-text-muted dark:text-waify-dark-text-muted">
                            {used.toLocaleString('en-IN')} / {formatLimit(limit)}
                            {currentCount !== undefined && <span> ({currentCount} active)</span>}
                        </div>
                    </div>
                    <span className={`text-sm font-bold tabular-nums ${warn ? 'text-amber-600 dark:text-amber-300' : 'text-waify-text dark:text-waify-dark-text'}`}>
                        {Math.round(pct)}%
                    </span>
                </div>
                <Progress value={pct} variant={warn ? 'warning' : 'default'} className="h-2" />
                {warn && <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-300">Approaching limit. Consider upgrading or buying credits.</p>}
            </div>
        );
    };

    const loadRazorpay = () =>
        new Promise<void>((resolve, reject) => {
            if (typeof window !== 'undefined' && window.Razorpay) return resolve();
            const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve());
                existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay script'));
            document.head.appendChild(script);
        });

    const handleSwitchPlan = async (candidate: Plan) => {
        if (candidate.requires_admin_approval) {
            addToast({
                title: 'Admin approval required',
                description: 'Enterprise plans can only be activated by a platform admin.',
                variant: 'info',
            });
            return;
        }

        const price = selectedPrice(candidate);
        const isRenewal = Boolean(candidate.is_current && candidate.can_renew);

        if (price && price > 0) {
            setCheckoutPlan(candidate);
            return;
        }

        const confirmed = await confirm({
            title: isRenewal ? 'Renew Plan' : 'Switch Plan',
            message: isRenewal ? `Start ${candidate.name} again?` : `Switch to ${candidate.name}?`,
            variant: 'info',
        });
        if (!confirmed) return;
        setSwitchingPlan(candidate.key);
        router.post(route('app.billing.switch-plan', { plan: candidate.key }), {}, {
            onFinish: () => setSwitchingPlan(null),
            onSuccess: () => router.reload(),
        });
    };

    const closeCheckout = () => {
        if (switchingPlan) return;
        setCheckoutPlan(null);
        setCheckoutPreview(null);
        setCheckoutError(null);
    };

    const purchaseWithCredits = () => {
        if (!checkoutPlan || !checkoutPreview) return;

        setSwitchingPlan(checkoutPlan.key);
        router.post(route('app.billing.credits.purchase', { plan: checkoutPlan.key }), {
            billing_cycle: billingCycle,
            promo_code: promoCode.trim() || undefined,
        }, {
            onSuccess: () => {
                addToast({ title: 'Plan activated', description: 'Wallet credits were applied to this purchase.', variant: 'success' });
                setCheckoutPlan(null);
                router.reload({ only: ['subscription', 'plan', 'wallet', 'transactions', 'payments', 'plans'] });
            },
            onError: (errors) => {
                addToast({ title: 'Credit purchase failed', description: Object.values(errors)[0] as string || 'Could not apply wallet credits.', variant: 'error' });
            },
            onFinish: () => setSwitchingPlan(null),
        });
    };

    const submitCheckout = async () => {
        if (!checkoutPlan || !checkoutPreview) return;

        if (!hasPaidCheckout) {
            addToast({ title: 'Checkout unavailable', description: 'No self-hosted payment method is enabled.', variant: 'error' });
            return;
        }

        setSwitchingPlan(checkoutPlan.key);
        try {
            const method = effectivePaymentMethod;
            const order = await axios.post(route('app.billing.orders.store', { plan: checkoutPlan.key }), {
                billing_cycle: billingCycle,
                promo_code: promoCode.trim() || undefined,
                payment_method: method,
            });

            if (method === 'razorpay') {
                const razorpay = order.data.razorpay;
                const checkoutBrand = razorpay?.checkout_brand || order.data.checkout_brand || {};
                await loadRazorpay();
                const options: any = {
                    key: razorpay?.key_id,
                    amount: razorpay?.amount,
                    currency: razorpay?.currency || 'INR',
                    name: checkoutBrand.name || checkoutBrandName,
                    image: checkoutBrand.image || undefined,
                    description: checkoutPlan.name,
                    prefill: {
                        name: account.owner?.name || '',
                        email: account.owner?.email || '',
                    },
                    theme: { color: branding?.primary_color || '#00A548' },
                    handler: async (response: any) => {
                        await axios.post(route('app.billing.razorpay.confirm'), {
                            order_id: response.razorpay_order_id,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature,
                        });
                        addToast({ title: 'Payment successful. Plan activated.', variant: 'success' });
                        setCheckoutPlan(null);
                        router.reload();
                    },
                    modal: { ondismiss: () => setSwitchingPlan(null) },
                };
                options.order_id = razorpay?.order_id;
                new window.Razorpay(options).open();
                setSwitchingPlan(null);
            } else {
                addToast({ title: 'Invoice created', description: 'Complete payment and upload proof from the invoices tab.', variant: 'success' });
                setActiveTab('invoices');
                setCheckoutPlan(null);
                router.reload({ only: ['payments', 'transactions', 'subscription', 'plan'] });
            }
        } catch (error: any) {
            addToast({ title: 'Checkout failed', description: error?.response?.data?.message || error?.message, variant: 'error' });
            setSwitchingPlan(null);
        }
    };

    const submitTopup = async (event: React.FormEvent) => {
        event.preventDefault();
        const amountMinor = Math.round(Number(topupAmountMajor) * 100);
        if (!amountMinor || amountMinor < 100) {
            addToast({ title: 'Enter a valid amount', variant: 'error' });
            return;
        }
        try {
            await loadRazorpay();
            const order = await axios.post(route('app.billing.wallet.topup'), {
                amount_minor: amountMinor,
                notes: topupNotes || undefined,
            });
            const options: any = {
                key: order.data.key_id,
                amount: order.data.amount,
                currency: order.data.currency,
                name: 'Zyptos Wallet',
                description: 'Wallet top-up',
                theme: { color: '#00A548' },
                handler: async (response: any) => {
                    await axios.post(route('app.billing.wallet.topup.confirm'), {
                        order_id: response.razorpay_order_id,
                        payment_id: response.razorpay_payment_id,
                        signature: response.razorpay_signature,
                    });
                    setShowTopupDialog(false);
                    setTopupAmountMajor('');
                    setTopupNotes('');
                    addToast({ title: 'Wallet balance updated', variant: 'success' });
                    router.reload();
                },
            };
            new window.Razorpay(options).open();
        } catch (error: any) {
            addToast({ title: 'Top-up failed', description: error?.response?.data?.message || error?.message, variant: 'error' });
        }
    };

    const invoiceId = (payment: Payment) => payment.invoice_number || payment.provider_order_id || `INV-${payment.id}`;
    const taxProfileLine = (profile?: TaxProfile | null) => [profile?.address_line1, profile?.address_line2, profile?.city, profile?.state, profile?.postal_code, profile?.country].filter(Boolean).join(', ') || '-';
    const invoiceSupplier = (payment: Payment) => payment.tax_snapshot?.supplier ?? supplier_tax_profile;
    const invoiceCustomer = (payment: Payment) => payment.tax_snapshot?.customer ?? billing_profile;
    const invoiceBaseAmount = (payment: Payment) => payment.base_amount ?? Math.max((payment.amount ?? 0) - (payment.tax_amount ?? 0), 0);
    const invoiceTaxableAmount = (payment: Payment) => payment.taxable_amount ?? Math.max((payment.amount ?? 0) - (payment.tax_amount ?? 0), 0);
    const taxRateLabel = (payment: Payment) => Number(payment.tax_rate ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    const splitTaxRateLabel = (payment: Payment) => (Number(payment.tax_rate ?? 0) / 2).toLocaleString('en-IN', { maximumFractionDigits: 2 });

    const downloadInvoice = (payment: Payment) => {
        window.location.href = route('app.billing.invoices.download', payment.id);
        addToast({ title: 'Invoice download started', description: `${invoiceId(payment)}.pdf`, variant: 'success' });
    };

    const uploadProof = async (payment: Payment, file: File | null) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('proof', file);
        setUploadingProof(payment.id);
        try {
            await axios.post(route('app.billing.orders.proof', payment.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            addToast({ title: 'Payment proof uploaded', description: 'Zyptos admin will review and activate the plan.', variant: 'success' });
            router.reload({ only: ['payments', 'transactions'] });
        } catch (error: any) {
            addToast({ title: 'Upload failed', description: error?.response?.data?.message || error?.message, variant: 'error' });
        } finally {
            setUploadingProof(null);
        }
    };

    const printInvoice = () => {
        window.print();
    };

    const overview = (
        <>
            {subscription?.status === 'past_due' && (
                <BillingInfoBanner variant="warning" title="Payment past due" message={subscription.last_error || 'Update payment or choose an active plan to keep features available.'} />
            )}
            {subscription?.status === 'canceled' && (
                <BillingInfoBanner variant="danger" title="Subscription canceled" message="Reactivate it or choose a new plan." />
            )}
            {subscription?.status === 'paused' && (
                <BillingInfoBanner variant="warning" title="Subscription paused" message="Contact support or choose a plan to reactivate access." />
            )}
            {currentPlan && subscription?.status === 'active' && (
                <BillingInfoBanner
                    title={`${currentPlan.name} plan active`}
                    message={`${nextBillingDate ? `Renews ${new Date(nextBillingDate).toLocaleDateString('en-IN')}. ` : ''}${(wallet.balance_minor / 100).toLocaleString('en-IN')} ${wallet.currency} wallet balance available.`}
                />
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="font-semibold text-waify-text dark:text-waify-dark-text">Usage this billing period</h3>
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab('usage')}>View detailed usage</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {usageMeter('Messages Sent', <Send className="h-4 w-4" />, usage.messages_sent, currentPlan?.limits.messages_monthly)}
                        {usageMeter('Template Sends', <FileText className="h-4 w-4" />, usage.template_sends, currentPlan?.limits.template_sends_monthly)}
                        {usageMeter('WhatsApp connection', <Zap className="h-4 w-4" />, current_connections_count, currentPlan?.limits.whatsapp_connections, current_connections_count)}
                        {usageMeter('Agents', <Users className="h-4 w-4" />, current_agents_count, currentPlan?.limits.agents, current_agents_count)}
                    </div>
                </Card>

                <Card className="p-5">
                    <h3 className="mb-3 font-semibold text-waify-text dark:text-waify-dark-text">Current plan</h3>
                    {currentPlan ? (
                        <div className="space-y-4">
                            <div>
                                <div className="text-2xl font-bold text-waify-text dark:text-waify-dark-text">{currentPlan.name}</div>
                                <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{formatMoney(currentPlan.price_monthly, currentPlan.currency)} / month</p>
                                {subscription?.provider === 'razorpay' && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="secondary">Razorpay one-time payment</Badge>
                                        {subscription.provider_status && <Badge variant="secondary">{subscription.provider_status}</Badge>}
                                        {subscription.provider_ref && <Badge variant="secondary">{subscription.provider_ref}</Badge>}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4 dark:border-slate-700">
                                <Button size="sm" onClick={() => setActiveTab('plans')}>Change plan</Button>
                                {isOwner && subscription?.status === 'active' && !subscription.cancel_at_period_end && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={async () => {
                                            if (await confirm({ title: 'Cancel Subscription', message: 'Cancel at the end of the current period?', variant: 'warning' })) {
                                                router.post(route('app.billing.cancel'));
                                            }
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                                {subscription?.cancel_at_period_end && (
                                    <Badge variant="warning">Cancels at period end</Badge>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No plan assigned.</p>
                            <Button onClick={() => setActiveTab('plans')}>Select plan</Button>
                        </div>
                    )}
                </Card>
            </div>
        </>
    );

    const usageTab = (
        <>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {usageMeter('Messages', <MessageSquare className="h-4 w-4" />, currentUsage.messages_sent, limits.messages_monthly)}
                {usageMeter('Templates', <FileText className="h-4 w-4" />, currentUsage.template_sends, limits.template_sends_monthly)}
                {usageMeter('AI credits', <Zap className="h-4 w-4" />, currentUsage.ai_credits_used, limits.ai_credits_monthly)}
            </div>
            <BillingTable>
                <table className={billingTableClass}>
                    <thead className={billingTheadClass}>
                        <tr>
                            <th className={billingThClass}>Period</th>
                            <th className={billingThClass}>Messages</th>
                            <th className={billingThClass}>Templates</th>
                            <th className={billingThClass}>AI Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usage_history.length === 0 ? (
                            <tr><td colSpan={4} className="px-5 py-12 text-center text-waify-text-muted dark:text-waify-dark-text-muted">No usage history available.</td></tr>
                        ) : usage_history.map((period) => (
                            <tr key={period.period} className={billingTrClass}>
                                <td className={`${billingTdClass} font-semibold`}>{period.period}</td>
                                <td className={billingTdClass}>{period.messages_sent.toLocaleString('en-IN')}</td>
                                <td className={billingTdClass}>{period.template_sends.toLocaleString('en-IN')}</td>
                                <td className={billingTdClass}>{period.ai_credits_used.toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </BillingTable>
            {blocked_events.length > 0 && (
                <Card className="border-red-200 p-5 dark:border-red-500/30">
                    <h3 className="mb-3 font-semibold text-red-900 dark:text-red-100">Limit blocked events</h3>
                    <div className="space-y-3">
                        {blocked_events.map((event) => (
                            <div key={event.id} className="rounded-card border border-red-200 bg-red-50 p-4 text-sm dark:border-red-500/30 dark:bg-red-500/10">
                                <div className="font-semibold text-red-800 dark:text-red-200">{event.data.limit_key} limit exceeded</div>
                                <p className="mt-1 text-red-700 dark:text-red-300">
                                    Usage {event.data.current_usage.toLocaleString('en-IN')} / {event.data.limit.toLocaleString('en-IN')} on {new Date(event.created_at).toLocaleString()}.
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </>
    );

    const plansTab = (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Compare plans and upgrade anytime. Checkout opens a full invoice preview before payment.</p>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex h-9 rounded-card border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                        {(['monthly', 'yearly'] as const).map((cycle) => (
                            <button
                                key={cycle}
                                type="button"
                                onClick={() => setBillingCycle(cycle)}
                                className={`rounded-md px-3 text-xs font-semibold capitalize transition-colors ${billingCycle === cycle ? 'bg-waify-green text-waify-ink' : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`}
                            >
                                {cycle}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {!hasPaidCheckout && (
                <BillingInfoBanner variant="warning" title="Checkout disabled" message="No self-hosted payment method is enabled. Paid plans can still be purchased with wallet credits when the balance covers the invoice total." />
            )}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {plans.map((candidate) => {
                    const price = selectedPrice(candidate);
                    const canAttemptCreditPurchase = walletMayCoverPlan(candidate);
                    return (
                        <Card key={candidate.key} className={`relative flex h-full flex-col p-6 ${candidate.is_current ? 'ring-2 ring-waify-green' : ''}`}>
                            {candidate.is_current && (
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-waify-green px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-waify-ink">
                                    Current plan
                                </span>
                            )}
                            <h3 className="text-lg font-bold text-waify-text dark:text-waify-dark-text">{candidate.name}</h3>
                            {candidate.description && <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{candidate.description}</p>}
                            <div className="mt-4">
                                <span className="text-3xl font-bold text-waify-text dark:text-waify-dark-text">{formatMoney(price, candidate.currency)}</span>
                                {price !== null && <span className="text-sm text-waify-text-muted dark:text-waify-dark-text-muted"> / {billingCycle === 'yearly' ? 'year' : 'month'}</span>}
                            </div>
                            {price !== null && price > 0 && canAttemptCreditPurchase && (
                                <Badge variant="success" className="mt-3 w-fit">Wallet credits available</Badge>
                            )}
                            {candidate.requires_admin_approval && (
                                <Badge variant="warning" className="mt-3 w-fit">Admin approval required</Badge>
                            )}
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                <span><strong className="text-waify-text dark:text-waify-dark-text">{formatLimit(candidate.limits.messages_monthly)}</strong> msgs</span>
                                <span><strong className="text-waify-text dark:text-waify-dark-text">{formatLimit(candidate.limits.agents)}</strong> agents</span>
                            </div>
                            {candidate.warnings && candidate.warnings.length > 0 && (
                                <div className="mt-4 rounded-card border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                                    {candidate.warnings.map((warning) => <p key={warning}>{warning}</p>)}
                                </div>
                            )}
                            <ul className="mt-5 flex-1 space-y-2">
                                {((candidate.features?.length ? candidate.features : candidate.modules) ?? []).slice(0, 8).map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm text-waify-text dark:text-waify-dark-text">
                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-waify-green" />
                                        {feature.replace('automation.', '').replace(/\./g, ' ')}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant={candidate.is_current && !candidate.can_renew ? 'secondary' : 'primary'}
                                className="mt-6 w-full"
                                disabled={(candidate.is_current && !candidate.can_renew) || candidate.requires_admin_approval || switchingPlan === candidate.key || price === null || (price > 0 && !hasPaidCheckout && !canAttemptCreditPurchase) || (billingCycle === 'yearly' && !candidate.price_yearly)}
                                onClick={() => handleSwitchPlan(candidate)}
                            >
                                {switchingPlan === candidate.key ? 'Processing...' : candidate.is_current && !candidate.can_renew ? 'Current plan' : candidate.requires_admin_approval ? 'Contact admin' : candidate.can_renew ? 'Renew plan' : price === null ? 'Contact sales' : 'Choose plan'}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </>
    );

    const invoicesTab = (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
                <BillingTable>
            <table className={`${billingTableClass} min-w-[840px]`}>
                <thead className={billingTheadClass}>
                    <tr>
                        <th className={billingThClass}>Plan</th>
                        <th className={billingThClass}>Amount</th>
                        <th className={billingThClass}>Status</th>
                        <th className={billingThClass}>Provider</th>
                        <th className={billingThClass}>Order ID</th>
                        <th className={billingThClass}>Paid At</th>
                        <th className={`${billingThClass} text-right`}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.length === 0 ? (
                        <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-waify-text-muted dark:text-waify-dark-text-muted">No payments recorded yet.</td></tr>
                    ) : payments.map((payment) => (
                        <tr key={payment.id} className={billingTrClass}>
                            <td className={`${billingTdClass} font-medium`}>{payment.plan?.name ?? 'Unknown'}</td>
                            <td className={`${billingTdClass} font-semibold tabular-nums`}>{formatMoney(payment.amount, payment.currency)}</td>
                            <td className={billingTdClass}><Badge variant={payment.status === 'paid' ? 'success' : ['failed', 'void', 'voided'].includes(payment.status) ? 'danger' : 'default'}>{payment.status}</Badge></td>
                            <td className={billingTdClass}>{payment.metadata?.payment_method_label || payment.payment_method || payment.provider}</td>
                            <td className="px-5 py-3.5 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{payment.provider_order_id}</td>
                            <td className={billingTdClass}>{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : '-'}</td>
                            <td className="px-5 py-3.5">
                                <div className="flex flex-wrap justify-end gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setPreviewInvoice(payment)}>
                                        <Eye className="h-4 w-4" />
                                        Preview
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => downloadInvoice(payment)}>
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                    {!['paid', 'void', 'voided', 'cancelled', 'canceled'].includes(payment.status) && payment.payment_method !== 'razorpay' && (
                                        <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-btn px-2 text-sm font-medium text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-slate-800 dark:hover:text-waify-dark-text">
                                            <Upload className="h-4 w-4" />
                                            {uploadingProof === payment.id ? 'Uploading...' : payment.has_proof ? 'Replace proof' : 'Upload proof'}
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                className="hidden"
                                                disabled={uploadingProof === payment.id}
                                                onChange={(event) => uploadProof(payment, event.target.files?.[0] ?? null)}
                                            />
                                        </label>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                </BillingTable>
            </div>

            <Card className="h-fit p-5">
                <h3 className="mb-3 font-semibold text-waify-text dark:text-waify-dark-text">Billing profile</h3>
                <dl className="space-y-3 text-sm">
                    <div>
                        <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Billing name</dt>
                        <dd className="mt-0.5 font-medium text-waify-text dark:text-waify-dark-text">{billing_profile?.legal_name || account.name || account.slug}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Billing email</dt>
                        <dd className="mt-0.5 text-waify-text dark:text-waify-dark-text">{billing_profile?.email || account.owner?.email || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">GSTIN</dt>
                        <dd className="mt-0.5 font-mono text-waify-text dark:text-waify-dark-text">{billing_profile?.gstin || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Place of supply</dt>
                        <dd className="mt-0.5 text-waify-text dark:text-waify-dark-text">{[billing_profile?.state_code, billing_profile?.state].filter(Boolean).join(' - ') || '-'}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Address</dt>
                        <dd className="mt-0.5 text-waify-text dark:text-waify-dark-text">{taxProfileLine(billing_profile)}</dd>
                    </div>
                    <div>
                        <dt className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Currency</dt>
                        <dd className="mt-0.5 font-mono text-waify-text dark:text-waify-dark-text">{wallet.currency}</dd>
                    </div>
                </dl>
            </Card>
        </div>
    );

    const paymentTab = (
        <div className="space-y-4 overflow-hidden">
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="flex items-center gap-3 p-4">
                        <WalletCards className="h-9 w-9 rounded-lg bg-waify-green/10 p-2 text-waify-green" />
                        <div><div className="text-xs text-waify-text-muted">Wallet balance</div><div className="text-lg font-bold">{formatMoney(wallet.balance_minor, wallet.currency)}</div></div>
                    </Card>
                    <Card className="flex items-center gap-3 p-4">
                        <CheckCircle className="h-9 w-9 rounded-lg bg-blue-50 p-2 text-blue-600" />
                        <div><div className="text-xs text-waify-text-muted">Successful</div><div className="text-lg font-bold">{transactions.filter((tx) => ['success', 'paid'].includes(tx.status)).length}</div></div>
                    </Card>
                    <Card className="flex items-center gap-3 p-4">
                        <XCircle className="h-9 w-9 rounded-lg bg-red-50 p-2 text-red-600" />
                        <div><div className="text-xs text-waify-text-muted">Failed</div><div className="text-lg font-bold">{transactions.filter((tx) => tx.status === 'failed').length}</div></div>
                    </Card>
                </div>
                <div className="flex justify-end">
                    <Button onClick={() => setShowTopupDialog(true)}>
                        <Plus className="h-4 w-4" />
                        Add credits
                    </Button>
                </div>
                <BillingTable>
                    <table className={`${billingTableClass} min-w-[860px]`}>
                        <thead className={billingTheadClass}>
                            <tr>
                                <th className={billingThClass}>Type</th>
                                <th className={billingThClass}>Direction</th>
                                <th className={billingThClass}>Amount</th>
                                <th className={billingThClass}>Status</th>
                                <th className={billingThClass}>Reference</th>
                                <th className={billingThClass}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-waify-text-muted dark:text-waify-dark-text-muted">No transactions found.</td></tr>
                            ) : transactions.map((tx, index) => (
                                <tr key={`${tx.type}-${tx.id}-${index}`} className={billingTrClass}>
                                    <td className={`${billingTdClass} capitalize`}>{tx.type}</td>
                                    <td className={`${billingTdClass} capitalize`}>{tx.direction}</td>
                                    <td className={`${billingTdClass} font-semibold tabular-nums`}>{formatMoney(tx.amount_minor, tx.currency)}</td>
                                    <td className={billingTdClass}><Badge variant={tx.status === 'failed' ? 'danger' : tx.status === 'success' || tx.status === 'paid' ? 'success' : 'default'}>{tx.status}</Badge></td>
                                    <td className="px-5 py-3.5 font-mono text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{tx.reference || '-'}</td>
                                    <td className={billingTdClass}>{new Date(tx.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </BillingTable>
        </div>
    );

    const tabContent = {
        overview,
        usage: usageTab,
        plans: plansTab,
        invoices: invoicesTab,
        payment: paymentTab,
    }[activeTab];

    return (
        <AppShell>
            <Head title="Billing" />
            <div className="mx-auto max-w-[1400px] space-y-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-waify-text dark:text-waify-dark-text">Billing</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Plan, usage, invoices and payment methods.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => setShowTopupDialog(true)}><Zap className="h-4 w-4" /> Buy credits</Button>
                        <Button variant="secondary" onClick={() => setActiveTab('plans')}><ExternalLink className="h-4 w-4" /> Billing portal</Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {[
                        { label: 'Current plan', value: currentPlan?.name ?? 'No plan', sub: currentPlan ? `${formatMoney(currentPlan.price_monthly, currentPlan.currency)}/mo` : 'Choose a plan', icon: CreditCard },
                        { label: 'Wallet balance', value: formatMoney(wallet.balance_minor, wallet.currency), sub: 'available credits', icon: WalletCards },
                        { label: 'Period end', value: nextBillingDate ? new Date(nextBillingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Not set', sub: subscription?.status === 'paused' ? 'Paused' : subscription?.cancel_at_period_end ? 'Cancels at period end' : 'Active', icon: Calendar },
                        { label: 'Payments', value: payments.length.toLocaleString('en-IN'), sub: 'recorded invoices', icon: Receipt },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card key={item.label} className="flex items-center gap-3 p-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-waify-green/10 text-waify-green">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <div className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{item.label}</div>
                                    <div className="truncate text-lg font-bold text-waify-text dark:text-waify-dark-text">{item.value}</div>
                                    <div className="text-[11px] text-waify-text-muted dark:text-waify-dark-text-muted">{item.sub}</div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <BillingSurface active={activeTab} onTabChange={(tab) => setActiveTab(tab as BillingTab)}>
                    {tabContent}
                </BillingSurface>
            </div>

            {checkoutPlan && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-waify-ink/50 backdrop-blur-sm dark:bg-black/70" onClick={closeCheckout} aria-label="Close checkout" />
                    <section className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-slate-700">
                            <div>
                                <h2 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{checkoutPlan.can_renew ? 'Renew plan' : 'Checkout'}</h2>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{checkoutPlan.name} invoice preview and payment method.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={closeCheckout} aria-label="Close">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="sm:col-span-2 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Selected plan</div>
                                    <div className="mt-1 text-xl font-bold text-waify-text dark:text-waify-dark-text">{checkoutPlan.name}</div>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{checkoutPlan.description || 'Zyptos workspace subscription'}</p>
                                </div>
                                <div className="rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Cycle</div>
                                    <div className="mt-3 inline-flex h-9 rounded-card border border-gray-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
                                        {(['monthly', 'yearly'] as const).map((cycle) => (
                                            <button
                                                key={cycle}
                                                type="button"
                                                disabled={cycle === 'yearly' && !checkoutPlan.price_yearly}
                                                onClick={() => setBillingCycle(cycle)}
                                                className={`rounded-md px-2 text-xs font-semibold capitalize transition-colors disabled:opacity-40 ${billingCycle === cycle ? 'bg-waify-green text-waify-ink' : 'text-waify-text-muted hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:text-waify-dark-text'}`}
                                            >
                                                {cycle}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                                <div>
                                    <label className="text-xs font-medium text-waify-text-muted dark:text-waify-dark-text-muted">Promo code</label>
                                    <input
                                        value={promoCode}
                                        onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                                        placeholder="Enter promo code"
                                        className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm font-semibold uppercase text-waify-text outline-none placeholder:normal-case placeholder:font-normal placeholder:text-gray-400 focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-700 dark:bg-slate-950 dark:text-waify-dark-text"
                                    />
                                </div>
                                {checkoutPreview?.discount ? (
                                    <div className="flex items-end">
                                        <Badge variant="success" className="h-10 px-3">
                                            {checkoutPreview.discount.code}: save {formatMoney(checkoutPreview.discount_amount, checkoutPreview.currency)}
                                        </Badge>
                                    </div>
                                ) : promoCode.trim() && !checkoutLoading ? (
                                    <div className="flex items-end">
                                        <Badge variant="danger" className="h-10 px-3">Not applicable</Badge>
                                    </div>
                                ) : null}
                            </div>

                            <div className="rounded-card border border-gray-100 p-4 dark:border-slate-700">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Invoice total</h3>
                                    {checkoutLoading && <span className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Updating...</span>}
                                </div>
                                {checkoutError && <BillingInfoBanner variant="danger" title="Preview failed" message={checkoutError} />}
                                {checkoutPreview && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span>Base amount</span><span className="tabular-nums">{formatMoney(checkoutPreview.base_amount, checkoutPreview.currency, 2)}</span></div>
                                        {checkoutPreview.discount_amount > 0 && (
                                            <div className="flex justify-between text-emerald-700 dark:text-emerald-300"><span>Discount {checkoutPreview.discount?.code ? `(${checkoutPreview.discount.code})` : ''}</span><span className="tabular-nums">-{formatMoney(checkoutPreview.discount_amount, checkoutPreview.currency, 2)}</span></div>
                                        )}
                                        <div className="flex justify-between"><span>Taxable value</span><span className="tabular-nums">{formatMoney(checkoutPreview.taxable_amount, checkoutPreview.currency, 2)}</span></div>
                                        {checkoutPreview.cgst_amount > 0 && <div className="flex justify-between"><span>CGST</span><span className="tabular-nums">{formatMoney(checkoutPreview.cgst_amount, checkoutPreview.currency, 2)}</span></div>}
                                        {checkoutPreview.sgst_amount > 0 && <div className="flex justify-between"><span>SGST</span><span className="tabular-nums">{formatMoney(checkoutPreview.sgst_amount, checkoutPreview.currency, 2)}</span></div>}
                                        {checkoutPreview.igst_amount > 0 && <div className="flex justify-between"><span>IGST</span><span className="tabular-nums">{formatMoney(checkoutPreview.igst_amount, checkoutPreview.currency, 2)}</span></div>}
                                        <div className="flex justify-between border-t border-gray-100 pt-3 text-base font-bold dark:border-slate-700"><span>Total due</span><span className="tabular-nums">{formatMoney(checkoutPreview.amount_due, checkoutPreview.currency, 2)}</span></div>
                                    </div>
                                )}
                            </div>

                            {checkoutPreview && wallet.currency === checkoutPreview.currency && wallet.balance_minor >= checkoutPreview.amount_due && (
                                <div className="rounded-card border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Wallet credits can cover this invoice</div>
                                            <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-200">Balance: {formatMoney(wallet.balance_minor, wallet.currency, 2)}</p>
                                        </div>
                                        <Button type="button" variant="secondary" onClick={purchaseWithCredits} disabled={switchingPlan === checkoutPlan.key}>
                                            Use credits
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-waify-text dark:text-waify-dark-text">Payment method</h3>
                                {enabledPaymentMethods.length === 0 ? (
                                    <BillingInfoBanner variant="warning" title="No payment method enabled" message="Ask platform admin to enable Bank Transfer / UPI or Razorpay payments." />
                                ) : (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {enabledPaymentMethods.map((method) => {
                                            const active = effectivePaymentMethod === method.key;
                                            return (
                                                <button
                                                    key={method.key}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(method.key)}
                                                    className={`rounded-card border p-4 text-left transition ${active ? 'border-waify-green bg-waify-green/10 ring-2 ring-waify-green/20 dark:border-emerald-400' : 'border-gray-200 bg-white hover:border-waify-green/40 dark:border-slate-700 dark:bg-slate-950'}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="font-semibold text-waify-text dark:text-waify-dark-text">{method.label}</span>
                                                        {active && <CheckCircle className="h-4 w-4 text-waify-green" />}
                                                    </div>
                                                    <p className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                        {method.key === 'razorpay' ? 'Pay instantly by card, UPI, or netbanking.' : 'Create invoice with Bank/UPI instructions and upload payment proof.'}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <Button type="button" variant="secondary" onClick={closeCheckout} disabled={Boolean(switchingPlan)}>Cancel</Button>
                            <Button type="button" onClick={submitCheckout} disabled={!checkoutPreview || checkoutLoading || !hasPaidCheckout || switchingPlan === checkoutPlan.key}>
                                {switchingPlan === checkoutPlan.key ? 'Processing...' : effectivePaymentMethod === 'razorpay' ? 'Pay now' : 'Create invoice'}
                            </Button>
                        </div>
                    </section>
                </div>
            )}

            {showTopupDialog && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-waify-ink/50 backdrop-blur-sm dark:bg-black/70" onClick={() => setShowTopupDialog(false)} aria-label="Close top-up dialog" />
                    <section className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-slate-700">
                            <div>
                                <h2 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Add wallet credits</h2>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Credits are added after Razorpay payment confirmation.</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setShowTopupDialog(false)} aria-label="Close">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <form className="flex min-h-0 flex-1 flex-col" onSubmit={submitTopup}>
                            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
                                <div>
                                    <label className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Amount ({wallet.currency})</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={topupAmountMajor}
                                        onChange={(event) => setTopupAmountMajor(event.target.value)}
                                        className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-700 dark:bg-slate-950 dark:text-waify-dark-text"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Notes</label>
                                    <input
                                        type="text"
                                        value={topupNotes}
                                        onChange={(event) => setTopupNotes(event.target.value)}
                                        placeholder="Optional"
                                        className="mt-1 h-10 w-full rounded-btn border border-gray-200 bg-white px-3 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/15 dark:border-slate-700 dark:bg-slate-950 dark:text-waify-dark-text"
                                    />
                                </div>
                            </div>
                            <div className="flex shrink-0 justify-end gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 dark:border-slate-700 dark:bg-slate-800/60">
                                <Button type="button" variant="secondary" onClick={() => setShowTopupDialog(false)}>Cancel</Button>
                                <Button type="submit"><Plus className="h-4 w-4" /> Add credits</Button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {previewInvoice && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-waify-ink/50 backdrop-blur-sm dark:bg-black/70" onClick={() => setPreviewInvoice(null)} aria-label="Close invoice preview" />
                    <section className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-gray-100 bg-white shadow-pop dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-slate-700">
                            <div>
                                <h2 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">Invoice {invoiceId(previewInvoice)}</h2>
                                <p className="mt-0.5 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{previewInvoice.plan?.name || 'Subscription'} · {new Date(previewInvoice.created_at).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" onClick={printInvoice}><Printer className="h-4 w-4" /> Print</Button>
                                <Button variant="secondary" size="sm" onClick={() => downloadInvoice(previewInvoice)}><Download className="h-4 w-4" /> Download</Button>
                                <Button variant="ghost" size="sm" onClick={() => setPreviewInvoice(null)} aria-label="Close"><X className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 overflow-y-auto p-6">
                            <div className="rounded-card border border-gray-200 bg-white p-8 text-waify-text shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-waify-dark-text">
                                <div className="flex items-start justify-between gap-6 border-b border-gray-200 pb-6 dark:border-slate-600">
                                    <div>
                                        <div className="mb-4 flex items-center gap-2">
                                            {branding?.logo_url ? (
                                                <img src={branding.logo_url} alt={checkoutBrandName} className="max-h-10 w-auto" />
                                            ) : (
                                                <>
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-waify-green text-waify-ink">
                                                        <MessageSquare className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-xl font-bold">{checkoutBrandName}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="text-sm font-semibold">{invoiceSupplier(previewInvoice)?.legal_name || 'Zyptos'}</div>
                                        <div className="mt-1 max-w-sm text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">{taxProfileLine(invoiceSupplier(previewInvoice))}</div>
                                        <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">GSTIN: <span className="font-mono">{invoiceSupplier(previewInvoice)?.gstin || '-'}</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">TAX INVOICE</div>
                                        <div className="mt-1 font-mono text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{invoiceId(previewInvoice)}</div>
                                        <Badge variant={previewInvoice.status === 'paid' ? 'success' : previewInvoice.status === 'failed' ? 'danger' : 'warning'} className="mt-3">{previewInvoice.status}</Badge>
                                    </div>
                                </div>
                                <div className="grid gap-4 border-b border-gray-200 py-6 text-sm dark:border-slate-600 sm:grid-cols-2">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Bill to</div>
                                        <div className="mt-1 font-semibold">{invoiceCustomer(previewInvoice)?.legal_name || account.name || account.slug}</div>
                                        <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{invoiceCustomer(previewInvoice)?.email || account.owner?.email || '-'}</div>
                                        <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{taxProfileLine(invoiceCustomer(previewInvoice))}</div>
                                        <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">GSTIN: <span className="font-mono">{invoiceCustomer(previewInvoice)?.gstin || '-'}</span></div>
                                    </div>
                                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                                        <div><div className="text-xs text-waify-text-muted">Issued</div><div className="mt-1 font-medium">{new Date(previewInvoice.created_at).toLocaleDateString('en-IN')}</div></div>
                                        <div><div className="text-xs text-waify-text-muted">Paid</div><div className="mt-1 font-medium">{previewInvoice.paid_at ? new Date(previewInvoice.paid_at).toLocaleDateString('en-IN') : '-'}</div></div>
                                        <div><div className="text-xs text-waify-text-muted">Provider</div><div className="mt-1 font-medium capitalize">{previewInvoice.provider}</div></div>
                                        <div><div className="text-xs text-waify-text-muted">SAC</div><div className="mt-1 font-mono font-medium">{previewInvoice.tax_snapshot?.sac_code || '-'}</div></div>
                                    </div>
                                </div>
                                <table className="mt-6 w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200 text-left text-xs uppercase tracking-wider text-waify-text-muted dark:border-slate-600">
                                            <th className="py-2 font-semibold">Description</th>
                                            <th className="py-2 text-right font-semibold">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-gray-100 dark:border-slate-700">
                                            <td className="py-3">{previewInvoice.plan?.name || 'Subscription'} plan</td>
                                            <td className="py-3 text-right tabular-nums">{formatMoney(invoiceBaseAmount(previewInvoice), previewInvoice.currency, 2)}</td>
                                        </tr>
                                        {(previewInvoice.discount_amount ?? 0) > 0 && (
                                            <tr className="border-b border-gray-100 dark:border-slate-700">
                                                <td className="py-3">Discount {previewInvoice.discount_code ? `(${previewInvoice.discount_code})` : ''}</td>
                                                <td className="py-3 text-right tabular-nums">-{formatMoney(previewInvoice.discount_amount, previewInvoice.currency, 2)}</td>
                                            </tr>
                                        )}
                                        <tr className="border-b border-gray-100 dark:border-slate-700">
                                            <td className="py-3">Taxable value</td>
                                            <td className="py-3 text-right tabular-nums">{formatMoney(invoiceTaxableAmount(previewInvoice), previewInvoice.currency, 2)}</td>
                                        </tr>
                                        {(previewInvoice.cgst_amount ?? 0) > 0 && (
                                            <tr className="border-b border-gray-100 dark:border-slate-700">
                                                <td className="py-3">CGST @ {splitTaxRateLabel(previewInvoice)}%</td>
                                                <td className="py-3 text-right tabular-nums">{formatMoney(previewInvoice.cgst_amount, previewInvoice.currency, 2)}</td>
                                            </tr>
                                        )}
                                        {(previewInvoice.sgst_amount ?? 0) > 0 && (
                                            <tr className="border-b border-gray-100 dark:border-slate-700">
                                                <td className="py-3">SGST @ {splitTaxRateLabel(previewInvoice)}%</td>
                                                <td className="py-3 text-right tabular-nums">{formatMoney(previewInvoice.sgst_amount, previewInvoice.currency, 2)}</td>
                                            </tr>
                                        )}
                                        {(previewInvoice.igst_amount ?? 0) > 0 && (
                                            <tr className="border-b border-gray-100 dark:border-slate-700">
                                                <td className="py-3">IGST @ {taxRateLabel(previewInvoice)}%</td>
                                                <td className="py-3 text-right tabular-nums">{formatMoney(previewInvoice.igst_amount, previewInvoice.currency, 2)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <div className="mt-6 flex justify-end">
                                    <div className="w-64 border-t border-gray-200 pt-3 text-lg font-bold dark:border-slate-600">
                                        <div className="flex justify-between"><span>Total</span><span className="tabular-nums">{formatMoney(previewInvoice.amount, previewInvoice.currency, 2)}</span></div>
                                    </div>
                                </div>
                                <p className="mt-6 border-t border-gray-100 pt-4 text-xs text-waify-text-muted dark:border-slate-700 dark:text-waify-dark-text-muted">
                                    Payment reference: {previewInvoice.provider_payment_id || previewInvoice.provider_order_id}. This is a computer-generated invoice.
                                </p>
                                {!['paid', 'cancelled', 'canceled', 'void', 'voided'].includes(previewInvoice.status) && previewInvoice.metadata?.payment_instructions && (
                                    <div className="mt-4 rounded-card border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                                        <div className="font-semibold">Bank Transfer / UPI details</div>
                                        <div className="mt-2 grid gap-1">
                                            {Object.entries(previewInvoice.metadata.payment_instructions).map(([key, value]) => value ? (
                                                <div key={key} className="flex justify-between gap-3">
                                                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="font-mono text-right">{value}</span>
                                                </div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}
                                {(previewInvoice.timeline || []).length > 0 && (
                                    <div className="mt-4 rounded-card border border-gray-100 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                                        <div className="text-xs font-semibold uppercase tracking-wider text-waify-text-muted dark:text-waify-dark-text-muted">Payment timeline</div>
                                        <div className="mt-3 space-y-3">
                                            {(previewInvoice.timeline || []).slice().reverse().map((entry, index) => (
                                                <div key={`${entry.event}-${entry.at}-${index}`} className="flex gap-3 text-xs">
                                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-waify-green" />
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-waify-text dark:text-waify-dark-text">{entry.label}</p>
                                                        <p className="mt-0.5 text-waify-text-muted dark:text-waify-dark-text-muted">
                                                            {new Date(entry.at).toLocaleString('en-IN')}{entry.actor_name ? ` by ${entry.actor_name}` : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </AppShell>
    );
}
