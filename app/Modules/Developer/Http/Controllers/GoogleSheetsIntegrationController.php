<?php

namespace App\Modules\Developer\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\GoogleSheetsIntegration;
use App\Modules\Developer\Jobs\AppendGoogleSheetsDeliveryJob;
use App\Modules\Developer\Services\GoogleSheetsIntegrationService;
use App\Modules\Developer\Services\TenantWebhookService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GoogleSheetsIntegrationController extends Controller
{
    public function __construct(protected GoogleSheetsIntegrationService $service)
    {
    }

    public function store(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'spreadsheet_id' => 'required|string|max:255',
            'sheet_name' => 'required|string|max:120',
            'service_account_json' => 'required|string',
            'event_keys' => 'required|array|min:1',
            'event_keys.*' => 'string|in:' . implode(',', TenantWebhookService::EVENT_KEYS),
            'append_headers' => 'nullable|boolean',
            'include_payload_json' => 'nullable|boolean',
        ]);

        $credentials = $this->service->parseServiceAccountJson((string) $validated['service_account_json']);

        GoogleSheetsIntegration::create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'spreadsheet_id' => trim((string) $validated['spreadsheet_id']),
            'sheet_name' => trim((string) $validated['sheet_name']),
            'service_account_email' => $credentials['service_account_email'],
            'service_account_private_key' => $credentials['service_account_private_key'],
            'service_account_client_id' => $credentials['service_account_client_id'],
            'project_id' => $credentials['project_id'],
            'event_keys' => array_values(array_unique((array) $validated['event_keys'])),
            'append_headers' => (bool) ($validated['append_headers'] ?? true),
            'include_payload_json' => (bool) ($validated['include_payload_json'] ?? true),
            'is_active' => true,
        ]);

        return back()->with('success', 'Google Sheets integration added. Share the sheet with the service account email before testing.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);
        $integration = GoogleSheetsIntegration::query()->where('account_id', $account->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'spreadsheet_id' => 'sometimes|required|string|max:255',
            'sheet_name' => 'sometimes|required|string|max:120',
            'service_account_json' => 'nullable|string',
            'event_keys' => 'nullable|array|min:1',
            'event_keys.*' => 'string|in:' . implode(',', TenantWebhookService::EVENT_KEYS),
            'append_headers' => 'nullable|boolean',
            'include_payload_json' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $updates = [];
        foreach (['name', 'spreadsheet_id', 'sheet_name', 'append_headers', 'include_payload_json', 'is_active'] as $field) {
            if (array_key_exists($field, $validated)) {
                $updates[$field] = $validated[$field];
            }
        }
        if (array_key_exists('event_keys', $validated)) {
            $updates['event_keys'] = array_values(array_unique((array) $validated['event_keys']));
        }
        if (!empty($validated['service_account_json'])) {
            $credentials = $this->service->parseServiceAccountJson((string) $validated['service_account_json']);
            $updates = array_merge($updates, $credentials);
        }

        $integration->update($updates);

        return back()->with('success', 'Google Sheets integration updated.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);
        $integration = GoogleSheetsIntegration::query()->where('account_id', $account->id)->findOrFail($id);
        $integration->delete();

        return back()->with('success', 'Google Sheets integration removed.');
    }

    public function test(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);
        $integration = GoogleSheetsIntegration::query()->where('account_id', $account->id)->findOrFail($id);

        $delivery = $integration->deliveries()->create([
            'account_id' => $account->id,
            'event_key' => 'contact.created',
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'idempotency_key' => 'manual_test_' . now()->timestamp,
            'payload' => [
                'name' => 'Zyptos Test Lead',
                'phone' => '+919999999999',
                'wa_id' => '919999999999',
                'status' => 'test',
                'message' => 'This is a Google Sheets integration test row.',
            ],
            'status' => 'pending',
            'attempts' => 0,
        ]);

        AppendGoogleSheetsDeliveryJob::dispatch($delivery->id);

        return back()->with('success', 'Google Sheets test queued. Check the sheet in a few seconds.');
    }

    protected function ensureDeveloperManager(Request $request): void
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
            abort(403, 'Only account owners/admins can manage Google Sheets integrations.');
        }
    }
}
