<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\PaymentOrder;
use App\Models\WalletTransaction;
use App\Models\Account;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {
    }

    public function index(Request $request): Response
    {
        $accountId = $request->input('account_id');
        $status = $request->input('status');
        $source = $request->input('source');

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
        }

        $walletRows = $walletQuery->orderByDesc('created_at')->limit(300)->get()->map(function (WalletTransaction $tx) {
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

        $paymentRows = $paymentQuery->orderByDesc('created_at')->limit(300)->get()->map(function (PaymentOrder $order) {
            return [
                'id' => 'p-'.$order->id,
                'kind' => 'payment',
                'account' => [
                    'id' => $order->account_id,
                    'name' => $order->account?->name,
                    'slug' => $order->account?->slug,
                ],
                'direction' => 'credit',
                'amount_minor' => (int) $order->amount,
                'currency' => $order->currency,
                'status' => $order->status,
                'source' => 'subscription_payment',
                'reference' => $order->provider_order_id,
                'notes' => $order->provider_payment_id,
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

        $this->walletService->credit(
            account: $account,
            amountMinor: (int) $validated['amount_minor'],
            source: 'platform_credit',
            actor: $request->user(),
            reference: 'platform_credit:'.now()->timestamp,
            notes: $validated['notes'] ?? null
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

        return back()->with('success', 'Wallet debited successfully.');
    }
}
