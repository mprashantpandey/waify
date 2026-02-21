<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlatformAccountController extends Controller
{
    public function __construct(
        protected WalletService $walletService
    ) {
    }

    /**
     * Display a listing of all accounts.
     */
    public function index(Request $request): Response
    {
        $query = Account::with('owner');

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhereHas('owner', function ($q) use ($search) {
                        $q->where('email', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $accounts = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'slug' => $account->slug,
                    'status' => $account->status,
                    'disabled_reason' => $account->disabled_reason,
                    'disabled_at' => $account->disabled_at?->toIso8601String(),
                    'owner' => [
                        'id' => $account->owner->id,
                        'name' => $account->owner->name,
                        'email' => $account->owner->email],
                    'created_at' => $account->created_at->toIso8601String()];
            });

        return Inertia::render('Platform/Accounts/Index', [
            'accounts' => $accounts,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status]]);
    }

    /**
     * Display the specified account.
     */
    public function show(Account $account): Response
    {
        $account->load(['owner', 'users', 'modules']);
        $wallet = $this->walletService->getOrCreateWallet($account);

        // Get WhatsApp connection count
        $whatsappConnectionsCount = 0;
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConnection::class)) {
            $whatsappConnectionsCount = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('account_id', $account->id)->count();
        }

        // Get conversation count
        $conversationsCount = 0;
        if (class_exists(\App\Modules\WhatsApp\Models\WhatsAppConversation::class)) {
            $conversationsCount = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('account_id', $account->id)->count();
        }

        return Inertia::render('Platform/Accounts/Show', [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'slug' => $account->slug,
                'status' => $account->status,
                'disabled_reason' => $account->disabled_reason,
                'disabled_at' => $account->disabled_at?->toIso8601String(),
                'owner' => [
                    'id' => $account->owner->id,
                    'name' => $account->owner->name,
                    'email' => $account->owner->email],
                'members_count' => $account->users->count(),
                'modules_enabled' => $account->modules->where('enabled', true)->count(),
                'whatsapp_connections_count' => $whatsappConnectionsCount,
                'conversations_count' => $conversationsCount,
                'wallet' => [
                    'balance_minor' => (int) $wallet->balance_minor,
                    'currency' => $wallet->currency,
                ],
                'created_at' => $account->created_at->toIso8601String()]]);
    }

    /**
     * Disable a account.
     */
    public function disable(Request $request, Account $account)
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500']);

        $account->disable($validated['reason'] ?? null);

        return redirect()->back()->with('success', 'Account disabled successfully.');
    }

    /**
     * Enable a account.
     */
    public function enable(Account $account)
    {
        $account->enable();

        return redirect()->back()->with('success', 'Account enabled successfully.');
    }
}
