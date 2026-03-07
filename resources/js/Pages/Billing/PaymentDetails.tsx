import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';

type Payment = {
  id: number;
  invoice_no: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: { id: number; name: string } | null;
  metadata: Record<string, unknown>;
  created_at: string | null;
  paid_at: string | null;
  failed_at: string | null;
};

export default function PaymentDetails({ payment }: { payment: Payment }) {
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount / 100);

  const statusVariant = payment.status === 'paid' ? 'success' : payment.status === 'failed' ? 'danger' : 'default';

  return (
    <AppShell>
      <Head title={`Invoice ${payment.invoice_no}`} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href={route('app.billing.history', {})} className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Payment History
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Invoice {payment.invoice_no}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Payment and invoice details</p>
          </div>
          <Link href={route('app.billing.history.download', { paymentOrder: payment.id })}>
            <Button>Download Invoice</Button>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Transaction overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatAmount(payment.amount, payment.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <div className="mt-1"><Badge variant={statusVariant as any}>{payment.status}</Badge></div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Plan</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{payment.plan?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-500">Provider</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{payment.provider}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Provider Order ID</p>
                <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">{payment.provider_order_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Provider Payment ID</p>
                <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all">{payment.provider_payment_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{payment.created_at ? new Date(payment.created_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Paid</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{payment.paid_at ? new Date(payment.paid_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Failed At</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{payment.failed_at ? new Date(payment.failed_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
