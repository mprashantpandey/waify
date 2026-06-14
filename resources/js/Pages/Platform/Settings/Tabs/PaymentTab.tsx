import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Banknote, CalendarClock, CreditCard, DollarSign, Receipt, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PaymentTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function PaymentTab({ data, setData, errors }: PaymentTabProps) {
    const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
    const selfHostedEnabled = data.payment?.self_hosted_payments_enabled ?? true;
    const toggle = (checked: boolean, onChange: (checked: boolean) => void) => (
        <label className="relative inline-flex cursor-pointer items-center">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
        </label>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Razorpay Payment Gateway
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Razorpay */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Razorpay</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="payment.razorpay_key_id" value="Key ID" />
                                <TextInput
                                    id="payment.razorpay_key_id"
                                    type="text"
                                    value={data.payment?.razorpay_key_id || ''}
                                    onChange={(e) => setData('payment.razorpay_key_id', e.target.value)}
                                    className="mt-1"
                                    placeholder="rzp_test_..."
                                />
                                <InputError message={errors['payment.razorpay_key_id']} />
                            </div>
                            <div>
                                <InputLabel htmlFor="payment.razorpay_key_secret" value="Key Secret" />
                                <div className="relative mt-1">
                                    <TextInput
                                        id="payment.razorpay_key_secret"
                                        type={showRazorpaySecret ? 'text' : 'password'}
                                        value={data.payment?.razorpay_key_secret || ''}
                                        onChange={(e) => setData('payment.razorpay_key_secret', e.target.value)}
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        {showRazorpaySecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors['payment.razorpay_key_secret']} />
                            </div>
                            <div>
                                <InputLabel htmlFor="payment.razorpay_webhook_secret" value="Webhook Secret" />
                                <TextInput
                                    id="payment.razorpay_webhook_secret"
                                    type="password"
                                    value={data.payment?.razorpay_webhook_secret || ''}
                                    onChange={(e) => setData('payment.razorpay_webhook_secret', e.target.value)}
                                    className="mt-1"
                                />
                                <InputError message={errors['payment.razorpay_webhook_secret']} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <InputLabel value="Enable Razorpay" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Accept INR payments via Razorpay</p>
                                </div>
                                {toggle(data.payment?.razorpay_enabled || false, (checked) => setData('payment.razorpay_enabled', checked))}
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <InputLabel value="Allow Wallet Self Top-up" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Let account owners add wallet credits from billing settings</p>
                                </div>
                                {toggle(data.payment?.wallet_self_topup_enabled || false, (checked) => setData('payment.wallet_self_topup_enabled', checked))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarClock className="h-5 w-5" />
                        Subscription Recovery Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="payment.subscription_grace_days" value="Grace Period After Renewal Date" />
                            <TextInput
                                id="payment.subscription_grace_days"
                                type="number"
                                value={data.payment?.subscription_grace_days ?? 3}
                                onChange={(e) => setData('payment.subscription_grace_days', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                min="0"
                                max="90"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Workspace remains active during this many overdue days.</p>
                            <InputError message={errors['payment.subscription_grace_days']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.renewal_reminder_days" value="Renewal Reminder Lead Time" />
                            <TextInput
                                id="payment.renewal_reminder_days"
                                type="number"
                                value={data.payment?.renewal_reminder_days ?? 7}
                                onChange={(e) => setData('payment.renewal_reminder_days', parseInt(e.target.value) || 0)}
                                className="mt-1"
                                min="0"
                                max="90"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Send reminder this many days before period end.</p>
                            <InputError message={errors['payment.renewal_reminder_days']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.renewal_reminder_time" value="Reminder Time" />
                            <TextInput
                                id="payment.renewal_reminder_time"
                                type="time"
                                value={data.payment?.renewal_reminder_time || '09:00'}
                                onChange={(e) => setData('payment.renewal_reminder_time', e.target.value)}
                                className="mt-1"
                            />
                            <InputError message={errors['payment.renewal_reminder_time']} />
                        </div>
                        <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-slate-700">
                            <div>
                                <InputLabel value="Auto-disable Overdue Workspaces" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Disable workspace access after the overdue threshold.</p>
                            </div>
                            {toggle(data.payment?.auto_disable_overdue_enabled || false, (checked) => setData('payment.auto_disable_overdue_enabled', checked))}
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.auto_disable_overdue_days" value="Auto-disable After Days" />
                            <TextInput
                                id="payment.auto_disable_overdue_days"
                                type="number"
                                value={data.payment?.auto_disable_overdue_days ?? 7}
                                onChange={(e) => setData('payment.auto_disable_overdue_days', parseInt(e.target.value) || 1)}
                                className="mt-1"
                                min="1"
                                max="180"
                            />
                            <InputError message={errors['payment.auto_disable_overdue_days']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Self-Hosted Payment Methods
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-slate-700">
                        <div>
                            <InputLabel value="Enable Self-Hosted Payments" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Allow workspace owners to create Zyptos invoices/orders from billing.</p>
                        </div>
                        {toggle(selfHostedEnabled, (checked) => setData('payment.self_hosted_payments_enabled', checked))}
                    </div>
                    <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${selfHostedEnabled ? '' : 'opacity-50'}`}>
                        {[
                            ['payment.method_bank_enabled', 'Bank Transfer / UPI'],
                            ['payment.method_razorpay_enabled', 'Razorpay one-time'],
                        ].map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-slate-700">
                                <InputLabel value={label} />
                                {toggle(data.payment?.[key.replace('payment.', '')] ?? true, (checked) => setData(key, checked))}
                            </div>
                        ))}
                    </div>
                    <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                        <div className="flex items-start gap-3">
                            <Banknote className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>Offline checkout now uses one customer-facing option: <strong>Bank Transfer / UPI</strong>. These details appear on unpaid invoices and invoice emails.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="payment.upi_id" value="UPI ID" />
                            <TextInput id="payment.upi_id" value={data.payment?.upi_id || ''} onChange={(e) => setData('payment.upi_id', e.target.value)} className="mt-1" placeholder="billing@upi" />
                            <InputError message={errors['payment.upi_id']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.upi_payee_name" value="UPI Payee Name" />
                            <TextInput id="payment.upi_payee_name" value={data.payment?.upi_payee_name || ''} onChange={(e) => setData('payment.upi_payee_name', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.upi_payee_name']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.bank_account_name" value="Bank Account Name" />
                            <TextInput id="payment.bank_account_name" value={data.payment?.bank_account_name || ''} onChange={(e) => setData('payment.bank_account_name', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.bank_account_name']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.bank_account_number" value="Bank Account Number" />
                            <TextInput id="payment.bank_account_number" value={data.payment?.bank_account_number || ''} onChange={(e) => setData('payment.bank_account_number', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.bank_account_number']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.bank_ifsc" value="IFSC" />
                            <TextInput id="payment.bank_ifsc" value={data.payment?.bank_ifsc || ''} onChange={(e) => setData('payment.bank_ifsc', e.target.value.toUpperCase())} className="mt-1" />
                            <InputError message={errors['payment.bank_ifsc']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.bank_name" value="Bank Name" />
                            <TextInput id="payment.bank_name" value={data.payment?.bank_name || ''} onChange={(e) => setData('payment.bank_name', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.bank_name']} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="payment.manual_payment_note" value="Additional Payment Instructions" />
                            <textarea
                                id="payment.manual_payment_note"
                                value={data.payment?.manual_payment_note || ''}
                                onChange={(e) => setData('payment.manual_payment_note', e.target.value)}
                                className="mt-1 min-h-24 w-full rounded-md border-gray-300 shadow-sm focus:border-waify-green focus:ring-waify-green dark:border-slate-700 dark:bg-slate-900 dark:text-waify-dark-text"
                            />
                            <InputError message={errors['payment.manual_payment_note']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Currency & Pricing
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="payment.default_currency" value="Default Currency" />
                            <select
                                id="payment.default_currency"
                                value={data.payment?.default_currency || 'USD'}
                                onChange={(e) => setData('payment.default_currency', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="JPY">JPY - Japanese Yen</option>
                                <option value="AUD">AUD - Australian Dollar</option>
                                <option value="CAD">CAD - Canadian Dollar</option>
                                <option value="SGD">SGD - Singapore Dollar</option>
                                <option value="AED">AED - UAE Dirham</option>
                            </select>
                            <InputError message={errors['payment.default_currency']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.currency_symbol_position" value="Symbol Position" />
                            <select
                                id="payment.currency_symbol_position"
                                value={data.payment?.currency_symbol_position || 'before'}
                                onChange={(e) => setData('payment.currency_symbol_position', e.target.value)}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                            >
                                <option value="before">Before ($100)</option>
                                <option value="after">After (100$)</option>
                            </select>
                            <InputError message={errors['payment.currency_symbol_position']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Invoice & Tax
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="payment.legal_name" value="Legal Business Name" />
                            <TextInput id="payment.legal_name" value={data.payment?.legal_name || ''} onChange={(e) => setData('payment.legal_name', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.legal_name']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.gstin" value="Supplier GSTIN" />
                            <TextInput id="payment.gstin" value={data.payment?.gstin || ''} onChange={(e) => setData('payment.gstin', e.target.value.toUpperCase())} className="mt-1" />
                            <InputError message={errors['payment.gstin']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.tax_rate" value="Default Tax Rate (%)" />
                            <TextInput
                                id="payment.tax_rate"
                                type="number"
                                value={data.payment?.tax_rate || 0}
                                onChange={(e) => setData('payment.tax_rate', parseFloat(e.target.value) || 0)}
                                className="mt-1"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                            <InputError message={errors['payment.tax_rate']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.sac_code" value="SAC Code" />
                            <TextInput id="payment.sac_code" type="text" value={data.payment?.sac_code || '998313'} onChange={(e) => setData('payment.sac_code', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.sac_code']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.invoice_prefix" value="Invoice Prefix" />
                            <TextInput
                                id="payment.invoice_prefix"
                                type="text"
                                value={data.payment?.invoice_prefix || 'INV-'}
                                onChange={(e) => setData('payment.invoice_prefix', e.target.value)}
                                className="mt-1"
                                placeholder="INV-"
                            />
                            <InputError message={errors['payment.invoice_prefix']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.invoice_number_start" value="Invoice Number Start" />
                            <TextInput
                                id="payment.invoice_number_start"
                                type="number"
                                value={data.payment?.invoice_number_start || 1}
                                onChange={(e) => setData('payment.invoice_number_start', parseInt(e.target.value) || 1)}
                                className="mt-1"
                                min="1"
                            />
                            <InputError message={errors['payment.invoice_number_start']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.state_code" value="Supplier State Code" />
                            <TextInput id="payment.state_code" value={data.payment?.state_code || ''} onChange={(e) => setData('payment.state_code', e.target.value.toUpperCase())} className="mt-1" placeholder="MH, DL, KA" />
                            <InputError message={errors['payment.state_code']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.state" value="Supplier State" />
                            <TextInput id="payment.state" value={data.payment?.state || ''} onChange={(e) => setData('payment.state', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.state']} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="payment.address_line1" value="Registered Address" />
                            <TextInput id="payment.address_line1" value={data.payment?.address_line1 || ''} onChange={(e) => setData('payment.address_line1', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.address_line1']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.city" value="City" />
                            <TextInput id="payment.city" value={data.payment?.city || ''} onChange={(e) => setData('payment.city', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.city']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="payment.postal_code" value="Postal Code" />
                            <TextInput id="payment.postal_code" value={data.payment?.postal_code || ''} onChange={(e) => setData('payment.postal_code', e.target.value)} className="mt-1" />
                            <InputError message={errors['payment.postal_code']} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
