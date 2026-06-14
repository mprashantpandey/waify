<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\PaymentOrder;
use App\Models\WalletTransaction;
use App\Services\SelfHostedBillingService;
use App\Services\AppNotificationService;
use App\Services\InvoicePdfService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {}

    public function index(Request $request): Response
    {
        $accountId = $request->input('account_id');
        $status = $request->input('status');
        $source = $request->input('source');
        $kind = $request->input('kind');
        $search = trim((string) $request->input('search', ''));
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $walletQuery = WalletTransaction::query()->with('account:id,name,slug', 'actor:id,name,email');
        $paymentQuery = PaymentOrder::query()->with('account:id,name,slug', 'plan:id,name');

        if ($accountId) {
            $walletQuery->where('account_id', $accountId);
            $paymentQuery->where('account_id', $accountId);
        }
        if ($status) {
            $walletQuery->where('status', $status);
            $paymentQuery->where('status', $status);
        }
        if ($source) {
            $walletQuery->where('source', $source);
            if ($source === 'subscription_payment') {
                $paymentQuery->whereNull('payment_method');
            } elseif (str_starts_with((string) $source, 'subscription_')) {
                $paymentQuery->where('payment_method', substr((string) $source, strlen('subscription_')));
            } else {
                $paymentQuery->whereRaw('1 = 0');
            }
        }
        if ($dateFrom) {
            $walletQuery->whereDate('created_at', '>=', $dateFrom);
            $paymentQuery->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo) {
            $walletQuery->whereDate('created_at', '<=', $dateTo);
            $paymentQuery->whereDate('created_at', '<=', $dateTo);
        }
        if ($search !== '') {
            $walletQuery->where(function ($query) use ($search) {
                $query->where('reference', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('account', fn ($accountQuery) => $accountQuery->where('name', 'like', "%{$search}%"));
            });
            $paymentQuery->where(function ($query) use ($search) {
                $query->where('provider_order_id', 'like', "%{$search}%")
                    ->orWhere('provider_payment_id', 'like', "%{$search}%")
                    ->orWhere('invoice_number', 'like', "%{$search}%")
                    ->orWhere('discount_code', 'like', "%{$search}%")
                    ->orWhere('rejection_reason', 'like', "%{$search}%")
                    ->orWhereHas('account', fn ($accountQuery) => $accountQuery->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('plan', fn ($planQuery) => $planQuery->where('name', 'like', "%{$search}%"));
            });
        }

        $walletRows = $kind === 'payment'
            ? collect()
            : $walletQuery->orderByDesc('created_at')->limit(300)->get()->map(function (WalletTransaction $tx) {
            return [
                'id' => 'w-'.$tx->id,
                'kind' => 'wallet',
                'account' => [
                    'id' => $tx->account_id,
                    'name' => $tx->account?->name,
                    'slug' => $tx->account?->slug,
                ],
                'direction' => $tx->direction,
                'amount_minor' => (int) $tx->amount_minor,
                'currency' => $tx->currency,
                'status' => $tx->status,
                'source' => $tx->source,
                'reference' => $tx->reference,
                'notes' => $tx->notes,
                'actor' => $tx->actor ? [
                    'id' => $tx->actor->id,
                    'name' => $tx->actor->name,
                    'email' => $tx->actor->email,
                ] : null,
                'created_at' => $tx->created_at->toIso8601String(),
            ];
        });

        $paymentRows = $kind === 'wallet'
            ? collect()
            : $paymentQuery->orderByDesc('created_at')->limit(300)->get()->map(function (PaymentOrder $order) {
            return [
                'id' => 'p-'.$order->id,
                'payment_order_id' => $order->id,
                'kind' => 'payment',
                'account' => [
                    'id' => $order->account_id,
                    'name' => $order->account?->name,
                    'slug' => $order->account?->slug,
                ],
                'direction' => 'credit',
                'amount_minor' => (int) $order->amount,
                'base_amount' => (int) $order->base_amount,
                'discount_amount' => (int) $order->discount_amount,
                'taxable_amount' => (int) $order->taxable_amount,
                'tax_amount' => (int) $order->tax_amount,
                'discount_code' => $order->discount_code,
                'currency' => $order->currency,
                'status' => $order->status,
                'source' => $order->payment_method ? 'subscription_'.$order->payment_method : 'subscription_payment',
                'reference' => $order->provider_order_id,
                'notes' => $order->provider_payment_id ?: $order->rejection_reason,
                'payment_method' => $order->payment_method,
                'payment_method_label' => $order->metadata['payment_method_label'] ?? $order->payment_method,
                'invoice_number' => $order->invoice_number,
                'plan' => $order->plan?->name,
                'has_proof' => (bool) $order->proof_path,
                'proof_original_name' => $order->proof_original_name,
                'proof_uploaded_at' => $order->proof_uploaded_at?->toIso8601String(),
                'rejection_reason' => $order->rejection_reason,
                'timeline' => is_array($order->metadata['timeline'] ?? null) ? $order->metadata['timeline'] : [],
                'actor' => null,
                'created_at' => $order->created_at->toIso8601String(),
            ];
        });

        $rows = $walletRows->concat($paymentRows)->sortByDesc('created_at')->values()->take(500);

        return Inertia::render('Platform/Transactions/Index', [
            'transactions' => $rows,
            'filters' => [
                'account_id' => $accountId,
                'status' => $status,
                'source' => $source,
                'kind' => $kind,
                'search' => $search,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'accounts' => Account::orderBy('name')->limit(200)->get(['id', 'name', 'slug']),
        ]);
    }

    public function credit(Request $request, Account $account)
    {
        $validated = $request->validate([
            'amount_minor' => 'required|integer|min:1|max:100000000',
            'notes' => 'nullable|string|max:255',
        ]);

        $tx = $this->walletService->credit(
            account: $account,
            amountMinor: (int) $validated['amount_minor'],
            source: 'platform_credit',
            actor: $request->user(),
            reference: 'platform_credit:'.now()->timestamp,
            notes: $validated['notes'] ?? null
        );
        app(AppNotificationService::class)->auditDestructive(
            'platform_wallet_credit',
            "Wallet credited for {$account->name}",
            $request->user(),
            $account,
            $tx,
            ['amount_minor' => (int) $validated['amount_minor'], 'currency' => $tx->currency, 'notes' => $validated['notes'] ?? null],
            $request
        );

        return back()->with('success', 'Wallet credited successfully.');
    }

    public function debit(Request $request, Account $account)
    {
        $validated = $request->validate([
            'amount_minor' => 'required|integer|min:1|max:100000000',
            'notes' => 'nullable|string|max:255',
        ]);

        $tx = $this->walletService->debit(
            account: $account,
            amountMinor: (int) $validated['amount_minor'],
            source: 'platform_debit',
            actor: $request->user(),
            reference: 'platform_debit:'.now()->timestamp,
            notes: $validated['notes'] ?? null
        );

        if ($tx->status !== 'success') {
            return back()->with('error', 'Wallet debit failed due to insufficient balance.');
        }
        app(AppNotificationService::class)->auditDestructive(
            'platform_wallet_debit',
            "Wallet debited for {$account->name}",
            $request->user(),
            $account,
            $tx,
            ['amount_minor' => (int) $validated['amount_minor'], 'currency' => $tx->currency, 'notes' => $validated['notes'] ?? null],
            $request
        );

        return back()->with('success', 'Wallet debited successfully.');
    }

    public function approvePayment(Request $request, PaymentOrder $paymentOrder, SelfHostedBillingService $billing)
    {
        $validated = $request->validate([
            'payment_reference' => ['nullable', 'string', 'max:120'],
        ]);

        $billing->approve($paymentOrder, $request->user(), $validated['payment_reference'] ?? null);
        app(\App\Services\AppNotificationService::class)->auditDestructive(
            'payment_approved',
            "Payment order {$paymentOrder->provider_order_id} approved",
            $request->user(),
            $paymentOrder->account,
            $paymentOrder,
            ['payment_reference' => $validated['payment_reference'] ?? null],
            $request
        );

        return back()->with('success', 'Payment approved and subscription activated.');
    }

    public function rejectPayment(Request $request, PaymentOrder $paymentOrder, SelfHostedBillingService $billing)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $billing->reject($paymentOrder, $request->user(), $validated['reason']);
        app(\App\Services\AppNotificationService::class)->auditDestructive(
            'payment_rejected',
            "Payment order {$paymentOrder->provider_order_id} rejected",
            $request->user(),
            $paymentOrder->account,
            $paymentOrder,
            ['reason' => $validated['reason']],
            $request
        );

        return back()->with('success', 'Payment proof rejected.');
    }

    public function remindPayment(Request $request, PaymentOrder $paymentOrder, SelfHostedBillingService $billing)
    {
        $billing->sendReminder($paymentOrder, $request->user());
        app(AppNotificationService::class)->auditDestructive(
            'payment_reminder_sent',
            "Payment reminder sent for {$paymentOrder->provider_order_id}",
            $request->user(),
            $paymentOrder->account,
            $paymentOrder,
            [],
            $request
        );

        return back()->with('success', 'Payment reminder sent.');
    }

    public function voidPayment(Request $request, PaymentOrder $paymentOrder, SelfHostedBillingService $billing)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        if ($paymentOrder->status === 'paid') {
            return back()->with('error', 'Paid invoices cannot be voided.');
        }

        if (in_array($paymentOrder->status, ['void', 'voided', 'cancelled', 'canceled'], true)) {
            return back()->with('success', 'Invoice is already voided.');
        }

        $meta = is_array($paymentOrder->metadata) ? $paymentOrder->metadata : [];
        $meta['void_reason'] = $validated['reason'];
        $paymentOrder->forceFill([
            'status' => 'void',
            'failed_at' => now(),
            'rejected_at' => now(),
            'rejection_reason' => $validated['reason'],
            'metadata' => $meta,
        ])->save();

        $billing->recordOrderEvent($paymentOrder->fresh(['account.owner', 'plan']), 'invoice_voided', 'Invoice voided', $request->user(), [
            'reason' => $validated['reason'],
        ]);

        app(AppNotificationService::class)->auditDestructive(
            'invoice_voided',
            "Invoice {$paymentOrder->invoice_number} voided",
            $request->user(),
            $paymentOrder->account,
            $paymentOrder,
            ['reason' => $validated['reason']],
            $request
        );

        return back()->with('success', 'Invoice voided successfully.');
    }

    public function proof(PaymentOrder $paymentOrder)
    {
        abort_unless($paymentOrder->proof_path && Storage::disk('local')->exists($paymentOrder->proof_path), 404);

        return Storage::disk('local')->download($paymentOrder->proof_path, $paymentOrder->proof_original_name ?: 'payment-proof');
    }

    public function invoice(PaymentOrder $paymentOrder, InvoicePdfService $pdf)
    {
        $paymentOrder->loadMissing(['account.owner', 'plan']);
        $fileName = ($paymentOrder->invoice_number ?: $paymentOrder->provider_order_id).'.pdf';

        return response($pdf->render($paymentOrder), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
        ]);
    }
}
