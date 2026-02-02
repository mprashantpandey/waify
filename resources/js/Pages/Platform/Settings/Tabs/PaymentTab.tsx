import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { CreditCard, DollarSign, Receipt, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PaymentTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function PaymentTab({ data, setData, errors }: PaymentTabProps) {
    const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);

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
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.payment?.razorpay_enabled || false}
                                        onChange={(e) => setData('payment.razorpay_enabled', e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
