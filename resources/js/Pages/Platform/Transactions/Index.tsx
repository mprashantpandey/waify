import PlatformShell from '@/Layouts/PlatformShell';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { PageHeader, StatusBadge, ThemedIconTile, Toolbar } from '@/Components/UI/Elements';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    ArrowDownLeft,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    Clock3,
    CreditCard,
    Download,
    Eye,
    FileText,
    Filter,
    ReceiptIndianRupee,
    RotateCcw,
    Send,
    Wallet,
    X,
    XCircle,
} from 'lucide-react';

type Transaction = {
    id: string;
    payment_order_id?: number;
    kind: 'wallet' | 'payment' | string;
    account?: { id?: number; name?: string | null; slug?: string | null } | null;
    direction: 'credit' | 'debit' | string;
    amount_minor: number;
    base_amount?: number;
    discount_amount?: number;
    taxable_amount?: number;
    tax_amount?: number;
    discount_code?: string | null;
    currency: string;
    status: string;
    source: string;
    reference?: string | null;
    notes?: string | null;
    payment_method?: string | null;
    payment_method_label?: string | null;
    invoice_number?: string | null;
    plan?: string | null;
    has_proof?: boolean;
    proof_original_name?: string | null;
    proof_uploaded_at?: string | null;
    rejection_reason?: string | null;
    timeline?: Array<{ event: string; label: string; at: string; actor_name?: string | null }>;
    actor?: { id: number; name: string; email: string } | null;
    created_at: string;
};

type Filters = {
    account_id?: string;
    status?: string;
    source?: string;
    kind?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
};

function amount(minor: number, currency: string) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR' }).format((minor || 0) / 100);
}

function statusTone(status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' {
    if (['success', 'paid', 'captured'].includes(status)) return 'success';
    if (['failed', 'cancelled', 'canceled', 'rejected'].includes(status)) return 'danger';
    if (['void', 'voided'].includes(status)) return 'default';
    if (['pending', 'pending_approval', 'created', 'authorized'].includes(status)) return 'warning';
    if (['refunded'].includes(status)) return 'info';
    return 'default';
}

function sourceLabel(source?: string | null) {
    return (source || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateTime(value?: string | null) {
    if (!value) return 'Not recorded';
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatCard({ label, value, helper, icon: Icon, tone = 'green' }: { label: string; value: string | number; helper?: string; icon: any; tone?: 'green' | 'blue' | 'amber' | 'purple' | 'red' | 'gray' }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                        <p className="mt-2 text-xl font-bold text-waify-text dark:text-waify-dark-text">{value}</p>
                        {helper && <p className="mt-1 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{helper}</p>}
                    </div>
                    <ThemedIconTile tone={tone} size="sm">
                        <Icon className="h-4 w-4" />
                    </ThemedIconTile>
                </div>
            </CardContent>
        </Card>
    );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="rounded-card border border-gray-100 bg-gray-50/70 p-3 dark:border-waify-dark-border dark:bg-waify-dark-surface-2/60">
            <div className="text-[11px] font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold text-waify-text dark:text-waify-dark-text">{value || '-'}</div>
        </div>
    );
}

function PaymentActions({
    tx,
    onApprove,
    onReject,
    onRemind,
    onVoid,
}: {
    tx: Transaction;
    onApprove: (tx: Transaction) => void;
    onReject: (tx: Transaction) => void;
    onRemind: (tx: Transaction) => void;
    onVoid: (tx: Transaction) => void;
}) {
    if (tx.kind !== 'payment' || !tx.payment_order_id) return null;

    const canReview = ['created', 'pending_approval', 'rejected'].includes(tx.status);
    const canVoid = ['created', 'pending_approval', 'rejected', 'failed'].includes(tx.status);

    return (
        <div className="flex flex-wrap items-center gap-2">
            <a href={route('platform.transactions.payments.invoice', tx.payment_order_id)} target="_blank" rel="noreferrer">
                <Button type="button" variant="secondary" size="sm"><Download className="h-3.5 w-3.5" />Invoice</Button>
            </a>
            {tx.has_proof && (
                <a href={route('platform.transactions.payments.proof', tx.payment_order_id)} target="_blank" rel="noreferrer">
                    <Button type="button" variant="secondary" size="sm"><FileText className="h-3.5 w-3.5" />Proof</Button>
                </a>
            )}
            {canReview && (
                <>
                    <Button type="button" variant="secondary" size="sm" onClick={() => onRemind(tx)}><Send className="h-3.5 w-3.5" />Remind</Button>
                    <Button type="button" size="sm" onClick={() => onApprove(tx)}><CheckCircle2 className="h-3.5 w-3.5" />Approve</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => onReject(tx)}><XCircle className="h-3.5 w-3.5" />Reject</Button>
                </>
            )}
            {canVoid && (
                <Button type="button" variant="secondary" size="sm" onClick={() => onVoid(tx)}><XCircle className="h-3.5 w-3.5" />Void</Button>
            )}
        </div>
    );
}

export default function PlatformTransactionsIndex({
    transactions = [],
    filters = {},
    accounts = [],
}: {
    transactions: Transaction[];
    filters: Filters;
    accounts: Array<{ id: number; name: string; slug: string }>;
}) {
    const { auth } = usePage().props as any;
    const [localFilters, setLocalFilters] = useState<Filters>(filters || {});
    const [approvalTx, setApprovalTx] = useState<Transaction | null>(null);
    const [approvalReference, setApprovalReference] = useState('');
    const [rejectionTx, setRejectionTx] = useState<Transaction | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [voidTx, setVoidTx] = useState<Transaction | null>(null);
    const [voidReason, setVoidReason] = useState('');
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(transactions[0] || null);

    const stats = useMemo(() => {
        const currency = transactions[0]?.currency || 'INR';
        const paymentRows = transactions.filter((tx) => tx.kind === 'payment');
        const walletRows = transactions.filter((tx) => tx.kind === 'wallet');
        const pendingApprovals = paymentRows.filter((tx) => tx.status === 'pending_approval').length;
        const unpaidInvoices = paymentRows.filter((tx) => ['created', 'rejected'].includes(tx.status)).length;
        const voidedInvoices = paymentRows.filter((tx) => ['void', 'voided'].includes(tx.status)).length;
        const successfulAmount = paymentRows
            .filter((tx) => ['paid', 'success', 'captured'].includes(tx.status))
            .reduce((sum, tx) => sum + (tx.amount_minor || 0), 0);
        const creditAmount = walletRows.filter((tx) => tx.direction === 'credit').reduce((sum, tx) => sum + (tx.amount_minor || 0), 0);
        const debitAmount = walletRows.filter((tx) => tx.direction === 'debit').reduce((sum, tx) => sum + (tx.amount_minor || 0), 0);

        return {
            pendingApprovals,
            unpaidInvoices,
            voidedInvoices,
            successfulPayments: amount(successfulAmount, currency),
            walletNet: amount(creditAmount - debitAmount, currency),
        };
    }, [transactions]);

    const reviewQueue = useMemo(
        () => transactions.filter((tx) => tx.kind === 'payment' && ['pending_approval', 'created', 'rejected'].includes(tx.status)).slice(0, 5),
        [transactions]
    );

    const sources = useMemo(() => Array.from(new Set(transactions.map((tx) => tx.source).filter(Boolean))).sort(), [transactions]);

    const applyFilters = () => {
        const normalized = Object.fromEntries(Object.entries(localFilters).filter(([, value]) => value !== undefined && value !== ''));
        router.get(route('platform.transactions.index'), normalized as any, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        setLocalFilters({});
        router.get(route('platform.transactions.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const openApprovePayment = (tx: Transaction) => {
        setApprovalTx(tx);
        setApprovalReference('');
    };

    const submitApprovePayment = () => {
        if (!approvalTx) return;
        router.post(route('platform.transactions.payments.approve', approvalTx.payment_order_id), {
            payment_reference: approvalReference,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setApprovalTx(null);
                setSelectedTx(null);
            },
        });
    };

    const openRejectPayment = (tx: Transaction) => {
        setRejectionTx(tx);
        setRejectionReason('');
    };

    const submitRejectPayment = () => {
        if (!rejectionTx || !rejectionReason.trim()) return;
        router.post(route('platform.transactions.payments.reject', rejectionTx.payment_order_id), {
            reason: rejectionReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectionTx(null);
                setSelectedTx(null);
            },
        });
    };

    const sendPaymentReminder = (tx: Transaction) => {
        router.post(route('platform.transactions.payments.remind', tx.payment_order_id), {}, {
            preserveScroll: true,
        });
    };

    const openVoidPayment = (tx: Transaction) => {
        setVoidTx(tx);
        setVoidReason('');
    };

    const submitVoidPayment = () => {
        if (!voidTx || !voidReason.trim()) return;
        router.post(route('platform.transactions.payments.void', voidTx.payment_order_id), {
            reason: voidReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setVoidTx(null);
                setSelectedTx(null);
            },
        });
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Transactions" />
            <div className="space-y-5">
                <PageHeader
                    title="Transactions"
                    description="Review invoices, approve Bank/UPI proofs, trace Razorpay payments, and audit workspace wallet movements."
                    actions={<Button type="button" variant="secondary" onClick={resetFilters}><RotateCcw className="h-4 w-4" />Reset</Button>}
                />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Needs review" value={stats.pendingApprovals} helper="Uploaded payment proofs" icon={AlertCircle} tone={stats.pendingApprovals > 0 ? 'amber' : 'green'} />
                    <StatCard label="Open invoices" value={stats.unpaidInvoices} helper="Created or rejected" icon={Clock3} tone={stats.unpaidInvoices > 0 ? 'red' : 'gray'} />
                    <StatCard label="Paid revenue" value={stats.successfulPayments} helper="Loaded result set" icon={ReceiptIndianRupee} tone="green" />
                    <StatCard label="Voided invoices" value={stats.voidedInvoices} helper="Cancelled stale invoices" icon={XCircle} tone="gray" />
                </div>

                {reviewQueue.length > 0 && (
                    <Card className="border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-500/10">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-100">
                                        <AlertCircle className="h-4 w-4" />
                                        Payment review queue
                                    </div>
                                    <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-100/70">Approve valid proofs, reject bad proofs with a clear reason, or send a reminder for unpaid invoices.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {reviewQueue.map((tx) => (
                                        <button
                                            key={tx.id}
                                            type="button"
                                            onClick={() => setSelectedTx(tx)}
                                            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100 dark:bg-waify-dark-surface dark:text-amber-100 dark:ring-amber-400/20"
                                        >
                                            {tx.invoice_number || tx.reference || `Order #${tx.payment_order_id}`} · {amount(tx.amount_minor, tx.currency)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Toolbar
                    search={{
                        value: localFilters.search || '',
                        onChange: (value) => setLocalFilters({ ...localFilters, search: value || undefined }),
                        placeholder: 'Search invoice, UTR, workspace, plan, discount...',
                    }}
                    filters={(
                        <>
                            <select value={localFilters.kind || ''} onChange={(event) => setLocalFilters({ ...localFilters, kind: event.target.value || undefined })} className="waify-input min-w-32">
                                <option value="">All types</option>
                                <option value="payment">Payments</option>
                                <option value="wallet">Wallet</option>
                            </select>
                            <select value={localFilters.account_id || ''} onChange={(event) => setLocalFilters({ ...localFilters, account_id: event.target.value || undefined })} className="waify-input min-w-44">
                                <option value="">All workspaces</option>
                                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                            </select>
                            <select value={localFilters.status || ''} onChange={(event) => setLocalFilters({ ...localFilters, status: event.target.value || undefined })} className="waify-input min-w-40">
                                <option value="">All statuses</option>
                                <option value="paid">Paid</option>
                                <option value="success">Success</option>
                                <option value="created">Created</option>
                                <option value="pending_approval">Pending approval</option>
                                <option value="rejected">Rejected</option>
                                <option value="void">Void</option>
                                <option value="failed">Failed</option>
                            </select>
                            <select value={localFilters.source || ''} onChange={(event) => setLocalFilters({ ...localFilters, source: event.target.value || undefined })} className="waify-input min-w-44">
                                <option value="">All sources</option>
                                {sources.map((source) => <option key={source} value={source}>{sourceLabel(source)}</option>)}
                            </select>
                            <input type="date" value={localFilters.date_from || ''} onChange={(event) => setLocalFilters({ ...localFilters, date_from: event.target.value || undefined })} className="waify-input w-40" aria-label="From date" />
                            <input type="date" value={localFilters.date_to || ''} onChange={(event) => setLocalFilters({ ...localFilters, date_to: event.target.value || undefined })} className="waify-input w-40" aria-label="To date" />
                        </>
                    )}
                    actions={<Button type="button" onClick={applyFilters}><Filter className="h-4 w-4" />Apply</Button>}
                />

                <Card>
                    <CardContent className="p-0">
                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <ThemedIconTile tone="gray" size="lg"><Wallet className="h-5 w-5" /></ThemedIconTile>
                                <p className="mt-4 text-sm font-semibold text-waify-text dark:text-waify-dark-text">No transactions found</p>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Try changing filters, or wait for wallet and subscription activity.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-waify-dark-border">
                                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">
                                        <tr>
                                            <th className="px-4 py-3">Transaction</th>
                                            <th className="px-4 py-3">Workspace</th>
                                            <th className="px-4 py-3">Amount</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Method</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                                        {transactions.map((tx) => {
                                            const isCredit = tx.direction === 'credit';
                                            const DirectionIcon = isCredit ? ArrowDownLeft : ArrowUpRight;
                                            return (
                                                <tr key={tx.id} className={cn('align-top transition hover:bg-gray-50/80 dark:hover:bg-waify-dark-surface-2/70', selectedTx?.id === tx.id && 'bg-waify-green-soft/30 dark:bg-waify-dark-green-soft/30')}>
                                                    <td className="px-4 py-3">
                                                        <div className="flex min-w-64 items-start gap-3">
                                                            <ThemedIconTile tone={tx.kind === 'payment' ? 'green' : isCredit ? 'blue' : 'amber'} size="sm">
                                                                {tx.kind === 'payment' ? <CreditCard className="h-4 w-4" /> : <DirectionIcon className="h-4 w-4" />}
                                                            </ThemedIconTile>
                                                            <div className="min-w-0">
                                                                <button type="button" onClick={() => setSelectedTx(tx)} className="max-w-64 truncate text-left font-semibold text-waify-text hover:text-waify-green-dark dark:text-waify-dark-text dark:hover:text-emerald-300">
                                                                    {tx.invoice_number || tx.reference || `${sourceLabel(tx.kind)} ${tx.id}`}
                                                                </button>
                                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                                    <StatusBadge tone={tx.kind === 'payment' ? 'info' : 'muted'}>{sourceLabel(tx.kind)}</StatusBadge>
                                                                    {tx.plan && <StatusBadge tone="muted">{tx.plan}</StatusBadge>}
                                                                    {tx.has_proof && <StatusBadge tone="warning">Proof uploaded</StatusBadge>}
                                                                </div>
                                                                {tx.notes && <p className="mt-1 max-w-64 truncate text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{tx.notes}</p>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {tx.account?.id ? (
                                                            <Link href={route('platform.accounts.show', { account: tx.account.id })} className="inline-flex max-w-48 items-center gap-1 truncate font-medium text-waify-green-dark hover:underline dark:text-emerald-300">
                                                                <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                                <span className="truncate">{tx.account.name || `Workspace #${tx.account.id}`}</span>
                                                            </Link>
                                                        ) : (
                                                            <span className="text-waify-text-muted dark:text-waify-dark-text-muted">Platform</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className={cn('font-bold', isCredit ? 'text-emerald-700 dark:text-emerald-300' : 'text-waify-text dark:text-waify-dark-text')}>
                                                            {isCredit ? '+' : '-'}{amount(tx.amount_minor, tx.currency)}
                                                        </div>
                                                        {tx.kind === 'payment' && (
                                                            <div className="mt-1 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">
                                                                Tax {amount(tx.tax_amount || 0, tx.currency)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3"><StatusBadge tone={statusTone(tx.status)} dot>{sourceLabel(tx.status)}</StatusBadge></td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-waify-text dark:text-waify-dark-text">{tx.payment_method_label || sourceLabel(tx.source)}</div>
                                                        {tx.discount_amount ? <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">Discount {tx.discount_code || ''} {amount(tx.discount_amount, tx.currency)}</div> : null}
                                                    </td>
                                                    <td className="px-4 py-3 text-waify-text-muted dark:text-waify-dark-text-muted">{dateTime(tx.created_at)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedTx(tx)}><Eye className="h-3.5 w-3.5" />View</Button>
                                                            <PaymentActions tx={tx} onApprove={openApprovePayment} onReject={openRejectPayment} onRemind={sendPaymentReminder} onVoid={openVoidPayment} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {selectedTx && (
                <div className="fixed inset-0 z-[190] flex justify-end">
                    <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setSelectedTx(null)} aria-label="Close transaction details" />
                    <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-gray-100 bg-white shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-bg">
                        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 p-5 backdrop-blur dark:border-waify-dark-border dark:bg-waify-dark-bg/95">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <StatusBadge tone={statusTone(selectedTx.status)} dot>{sourceLabel(selectedTx.status)}</StatusBadge>
                                        <StatusBadge tone={selectedTx.kind === 'payment' ? 'info' : 'muted'}>{sourceLabel(selectedTx.kind)}</StatusBadge>
                                    </div>
                                    <h2 className="mt-3 text-lg font-bold text-waify-text dark:text-waify-dark-text">{selectedTx.invoice_number || selectedTx.reference || selectedTx.id}</h2>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{dateTime(selectedTx.created_at)}</p>
                                </div>
                                <button type="button" onClick={() => setSelectedTx(null)} className="rounded-btn p-2 text-waify-text-muted hover:bg-gray-100 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2" aria-label="Close">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-5 p-5">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <DetailItem label="Amount" value={amount(selectedTx.amount_minor, selectedTx.currency)} />
                                <DetailItem label="Workspace" value={selectedTx.account?.name || 'Platform'} />
                                <DetailItem label="Payment method" value={selectedTx.payment_method_label || sourceLabel(selectedTx.source)} />
                                <DetailItem label="Plan" value={selectedTx.plan || '-'} />
                                <DetailItem label="Tax" value={amount(selectedTx.tax_amount || 0, selectedTx.currency)} />
                                <DetailItem label="Discount" value={(selectedTx.discount_amount || 0) > 0 ? `${selectedTx.discount_code || 'Discount'} · ${amount(selectedTx.discount_amount || 0, selectedTx.currency)}` : '-'} />
                                <DetailItem label="Reference" value={selectedTx.reference || '-'} />
                                <DetailItem label="Actor" value={selectedTx.actor ? `${selectedTx.actor.name} (${selectedTx.actor.email})` : '-'} />
                            </div>

                            {selectedTx.kind === 'payment' && (
                                <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Payment review</h3>
                                        {selectedTx.has_proof ? <StatusBadge tone="warning">Proof uploaded</StatusBadge> : <StatusBadge tone="muted">No proof</StatusBadge>}
                                    </div>
                                    <div className="space-y-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                                        <p>Proof file: <span className="font-medium text-waify-text dark:text-waify-dark-text">{selectedTx.proof_original_name || '-'}</span></p>
                                        <p>Uploaded: <span className="font-medium text-waify-text dark:text-waify-dark-text">{dateTime(selectedTx.proof_uploaded_at)}</span></p>
                                        {selectedTx.rejection_reason && <p>Rejection: <span className="font-medium text-red-700 dark:text-red-300">{selectedTx.rejection_reason}</span></p>}
                                    </div>
                                    <div className="mt-4">
                                        <PaymentActions tx={selectedTx} onApprove={openApprovePayment} onReject={openRejectPayment} onRemind={sendPaymentReminder} onVoid={openVoidPayment} />
                                    </div>
                                </div>
                            )}

                            {selectedTx.timeline && selectedTx.timeline.length > 0 && (
                                <div className="rounded-card border border-gray-100 p-4 dark:border-waify-dark-border">
                                    <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Timeline</h3>
                                    <div className="mt-3 space-y-3">
                                        {selectedTx.timeline.slice().reverse().map((item, index) => (
                                            <div key={`${item.event}-${item.at}-${index}`} className="flex gap-3">
                                                <span className="mt-1 h-2 w-2 rounded-full bg-waify-green" />
                                                <div>
                                                    <p className="text-sm font-medium text-waify-text dark:text-waify-dark-text">{item.label}</p>
                                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{dateTime(item.at)}{item.actor_name ? ` · ${item.actor_name}` : ''}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}

            {approvalTx && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setApprovalTx(null)} aria-label="Close" />
                    <div className="relative w-full max-w-md rounded-card border border-gray-100 bg-white p-5 shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface">
                        <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Approve payment</h3>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{approvalTx.invoice_number || approvalTx.reference} · {amount(approvalTx.amount_minor, approvalTx.currency)}</p>
                        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Payment reference or UTR</label>
                        <input value={approvalReference} onChange={(event) => setApprovalReference(event.target.value)} className="waify-input mt-1 w-full" autoFocus placeholder="Optional reference from bank/Razorpay" />
                        <div className="mt-5 flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setApprovalTx(null)}>Cancel</Button>
                            <Button type="button" onClick={submitApprovePayment}><CheckCircle2 className="h-4 w-4" />Approve</Button>
                        </div>
                    </div>
                </div>
            )}

            {rejectionTx && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setRejectionTx(null)} aria-label="Close" />
                    <div className="relative w-full max-w-md rounded-card border border-gray-100 bg-white p-5 shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface">
                        <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Reject payment proof</h3>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{rejectionTx.invoice_number || rejectionTx.reference} · customer will receive this reason.</p>
                        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Reason</label>
                        <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} className="waify-input mt-1 min-h-24 w-full" autoFocus placeholder="Example: UTR not visible or amount does not match invoice." />
                        <div className="mt-5 flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setRejectionTx(null)}>Cancel</Button>
                            <Button type="button" variant="secondary" disabled={!rejectionReason.trim()} onClick={submitRejectPayment}><XCircle className="h-4 w-4" />Reject</Button>
                        </div>
                    </div>
                </div>
            )}

            {voidTx && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setVoidTx(null)} aria-label="Close" />
                    <div className="relative w-full max-w-md rounded-card border border-gray-100 bg-white p-5 shadow-pop dark:border-waify-dark-border dark:bg-waify-dark-surface">
                        <h3 className="text-base font-semibold text-waify-text dark:text-waify-dark-text">Void invoice</h3>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">
                            {voidTx.invoice_number || voidTx.reference} will be closed as unpaid and hidden from payment instructions.
                        </p>
                        <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Reason</label>
                        <textarea value={voidReason} onChange={(event) => setVoidReason(event.target.value)} className="waify-input mt-1 min-h-24 w-full" autoFocus placeholder="Example: duplicate test invoice or customer created a newer invoice." />
                        <div className="mt-5 flex justify-end gap-2">
                            <Button type="button" variant="secondary" onClick={() => setVoidTx(null)}>Cancel</Button>
                            <Button type="button" variant="secondary" disabled={!voidReason.trim()} onClick={submitVoidPayment}><XCircle className="h-4 w-4" />Void invoice</Button>
                        </div>
                    </div>
                </div>
            )}
        </PlatformShell>
    );
}
