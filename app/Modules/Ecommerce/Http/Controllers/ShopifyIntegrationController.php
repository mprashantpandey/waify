<?php

namespace App\Modules\Ecommerce\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ShopifyIntegration;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Ecommerce\Services\ShopifyIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShopifyIntegrationController extends Controller
{
    public function __construct(protected ShopifyIntegrationService $service)
    {
    }

    public function store(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureManager($request);

        $validated = $this->validatePayload($request, $account->id);
        $this->service->create($account, $validated);

        return back()->with('success', 'Shopify store connected. Webhooks are being prepared.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureManager($request);

        $integration = ShopifyIntegration::query()->where('account_id', $account->id)->findOrFail($id);
        $validated = $this->validatePayload($request, $account->id, true);
        $this->service->update($integration, $validated);

        return back()->with('success', 'Shopify store updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureManager($request);
        $integration = ShopifyIntegration::query()->where('account_id', $account->id)->findOrFail($id);
        $integration->delete();

        return back()->with('success', 'Shopify store removed.');
    }

    public function sync(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureManager($request);
        $integration = ShopifyIntegration::query()->where('account_id', $account->id)->findOrFail($id);

        $this->service->syncRecentData($integration);

        return back()->with('success', 'Shopify sync completed. Recent customers and orders were imported.');
    }

    public function handle(Request $request, ShopifyIntegration $integration): JsonResponse
    {
        if (!$integration->is_active) {
            return response()->json(['ok' => false, 'message' => 'Integration inactive.'], 410);
        }

        $result = $this->service->handleWebhook($integration, $request);

        return response()->json($result + ['ok' => true]);
    }

    protected function validatePayload(Request $request, int $accountId, bool $partial = false): array
    {
        $prefix = $partial ? 'sometimes|' : '';

        return $request->validate([
            'name' => $prefix . 'required|string|max:120',
            'shop_domain' => $prefix . 'required|string|max:255',
            'access_token' => ($partial ? 'nullable|string|max:255' : 'required|string|max:255'),
            'webhook_secret' => ($partial ? 'nullable|string|max:255' : 'required|string|max:255'),
            'abandoned_checkout_sequence_id' => ['nullable', 'integer', Rule::exists('campaign_sequences', 'id')->where(fn ($query) => $query->where('account_id', $accountId))],
            'auto_register_webhooks' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ] + ($partial ? [] : []));
    }

    protected function ensureManager(Request $request): void
    {
        $user = $request->user();
        $account = $request->attributes->get('account') ?? current_account();

        if (!$user || !$account) {
            abort(403);
        }

        if ((int) $account->owner_id === (int) $user->id) {
            return;
        }

        $membership = $account->users()->where('user_id', $user->id)->first();
        $role = (string) ($membership?->pivot?->role ?? '');
        if ($role !== 'admin') {
            abort(403, 'Only account owners/admins can manage Shopify stores.');
        }
    }
}
