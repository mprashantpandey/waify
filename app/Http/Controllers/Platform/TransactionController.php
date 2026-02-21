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
        $accountIdRaw = $request->input('account_id');
        $accountId = is_numeric($accountIdRaw) ? (int) $accountIdRaw : null;
        $status = $request->input('status');
        $source = $request->input('source');
        $search = trim((string) $request->input('search', ''));
        $page = max(1, (int) $request->input('page', 1));
        $perPage = (int) $request->input('per_page', 25);
        if (!in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 25;
        }

        $walletQuery = WalletTransaction::query()->with('account:id,name,slug', 'actor:id,name,email');
        $paymentQuery = PaymentOrder::query()->with('account:id,name,slug', 'plan:id,name');

        if ($accountId !== null) {
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

        $rows = $walletRows
            ->concat($paymentRows)
            ->sortByDesc('created_at')
            ->values();

        if ($search !== '') {
            $needle = mb_strtolower($search);
            $rows = $rows->filter(function (array $row) use ($needle) {
                $haystacks = [
                    $row['id'] ?? '',
                    $row['kind'] ?? '',
                    $row['status'] ?? '',
                    $row['source'] ?? '',
                    $row['reference'] ?? '',
                    $row['notes'] ?? '',
                    $row['account']['name'] ?? '',
                    (string) ($row['account']['id'] ?? ''),
                ];

                foreach ($haystacks as $value) {
                    if (str_contains(mb_strtolower((string) $value), $needle)) {
                        return true;
                    }
                }

                return false;
            })->values();
        }

        $total = $rows->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $offset = ($page - 1) * $perPage;
        $data = $rows->slice($offset, $perPage)->values();
        $from = $total === 0 ? 0 : $offset + 1;
        $to = $total === 0 ? 0 : min($offset + $perPage, $total);

        return Inertia::render('Platform/Transactions/Index', [
            'transactions' => [
                'data' => $data,
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
                'from' => $from,
                'to' => $to,
            ],
            'filters' => [
                'account_id' => $accountId,
                'status' => $status,
                'source' => $source,
                'search' => $search,
                'per_page' => $perPage,
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
