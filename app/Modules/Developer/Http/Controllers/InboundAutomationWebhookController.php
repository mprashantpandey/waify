<?php

namespace App\Modules\Developer\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\InboundAutomationWebhook;
use App\Modules\Contacts\Models\ContactCustomField;
use App\Modules\Developer\Services\InboundAutomationWebhookService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class InboundAutomationWebhookController extends Controller
{
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
            abort(403, 'Only account owners/admins can manage inbound automation webhooks.');
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $validated = $this->validatePayload($request, $account->id);

        $webhook = InboundAutomationWebhook::query()->create([
            'account_id' => $account->id,
            'name' => trim((string) $validated['name']),
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'action_type' => $validated['action_type'],
            'campaign_sequence_id' => $validated['campaign_sequence_id'] ?? null,
            'whatsapp_connection_id' => $validated['whatsapp_connection_id'] ?? null,
            'whatsapp_template_id' => $validated['whatsapp_template_id'] ?? null,
            'payload_mappings' => $this->normalizePayloadMappings($validated),
            'template_variable_paths' => $this->normalizeStringArray($validated['template_variable_paths'] ?? []),
            'template_static_params' => $this->normalizeStringArray($validated['template_static_params'] ?? []),
        ]);

        return back()->with('success', 'Inbound automation webhook created.')->with('new_inbound_webhook_secret', [
            'id' => $webhook->id,
            'secret' => $webhook->signing_secret,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $webhook = InboundAutomationWebhook::query()
            ->where('account_id', $account->id)
            ->findOrFail($id);

        $validated = $this->validatePayload($request, $account->id, true);

        $updates = [];
        foreach (['name', 'action_type', 'campaign_sequence_id', 'whatsapp_connection_id', 'whatsapp_template_id'] as $field) {
            if (array_key_exists($field, $validated)) {
                $updates[$field] = $validated[$field];
            }
        }
        if (array_key_exists('is_active', $validated)) {
            $updates['is_active'] = (bool) $validated['is_active'];
        }
        if (array_key_exists('payload_mappings', $validated) || array_key_exists('phone_path', $validated) || array_key_exists('custom_field_paths', $validated)) {
            $updates['payload_mappings'] = $this->normalizePayloadMappings($validated);
        }
        if (array_key_exists('template_variable_paths', $validated)) {
            $updates['template_variable_paths'] = $this->normalizeStringArray($validated['template_variable_paths'] ?? []);
        }
        if (array_key_exists('template_static_params', $validated)) {
            $updates['template_static_params'] = $this->normalizeStringArray($validated['template_static_params'] ?? []);
        }
        if (!empty($validated['rotate_secret'])) {
            $updates['signing_secret'] = Str::random(48);
        }

        $webhook->update($updates);

        $response = back()->with('success', 'Inbound automation webhook updated.');

        if (!empty($validated['rotate_secret'])) {
            $response->with('new_inbound_webhook_secret', [
                'id' => $webhook->id,
                'secret' => $webhook->signing_secret,
            ]);
        }

        return $response;
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        InboundAutomationWebhook::query()
            ->where('account_id', $account->id)
            ->findOrFail($id)
            ->delete();

        return back()->with('success', 'Inbound automation webhook deleted.');
    }

    public function handle(Request $request, string $publicKey, InboundAutomationWebhookService $service): JsonResponse
    {
        /** @var InboundAutomationWebhook $webhook */
        $webhook = InboundAutomationWebhook::query()
            ->with(['sequence', 'connection', 'template', 'account'])
            ->where('public_key', $publicKey)
            ->where('is_active', true)
            ->firstOrFail();

        if (!$service->verifySecret($webhook, $request)) {
            return response()->json([
                'ok' => false,
                'message' => 'Invalid webhook secret.',
            ], 401);
        }

        $payload = $request->json()->all();
        if (!is_array($payload) || $payload === []) {
            $payload = $request->all();
        }

        $idempotencyKey = $service->resolveIdempotencyKey($webhook, is_array($payload) ? $payload : [], $request);

        try {
            $log = $service->handle($webhook, is_array($payload) ? $payload : [], $request, $idempotencyKey);
        } catch (QueryException $e) {
            if ($this->isDuplicateIdempotency($e)) {
                $log = $service->logDuplicate($webhook, $idempotencyKey, is_array($payload) ? $payload : [], $request);

                return response()->json([
                    'ok' => true,
                    'duplicate' => true,
                    'request_id' => $log->request_id,
                    'message' => 'Duplicate webhook request ignored.',
                ], 202);
            }

            throw $e;
        } catch (\RuntimeException $e) {
            return response()->json([
                'ok' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'ok' => true,
            'request_id' => $log->request_id,
            'message' => 'Webhook processed.',
            'result' => $log->result,
        ]);
    }

    protected function validatePayload(Request $request, int $accountId, bool $updating = false): array
    {
        $fieldKeys = ContactCustomField::query()
            ->where('account_id', $accountId)
            ->pluck('key')
            ->filter()
            ->all();

        $rules = [
            'name' => [$updating ? 'sometimes' : 'required', 'string', 'max:120'],
            'is_active' => ['nullable', 'boolean'],
            'action_type' => [$updating ? 'sometimes' : 'required', Rule::in(InboundAutomationWebhookService::ACTION_TYPES)],
            'campaign_sequence_id' => [
                'nullable',
                Rule::requiredIf(fn () => ($request->input('action_type') ?? null) === 'start_sequence'),
                Rule::exists('campaign_sequences', 'id')->where('account_id', $accountId),
            ],
            'whatsapp_connection_id' => [
                'nullable',
                Rule::requiredIf(fn () => ($request->input('action_type') ?? null) === 'send_template'),
                Rule::exists('whatsapp_connections', 'id')->where('account_id', $accountId),
            ],
            'whatsapp_template_id' => [
                'nullable',
                Rule::requiredIf(fn () => ($request->input('action_type') ?? null) === 'send_template'),
                Rule::exists('whatsapp_templates', 'id')->where('account_id', $accountId),
            ],
            'phone_path' => [$updating ? 'sometimes' : 'required', 'string', 'max:120'],
            'name_path' => ['nullable', 'string', 'max:120'],
            'email_path' => ['nullable', 'string', 'max:120'],
            'company_path' => ['nullable', 'string', 'max:120'],
            'idempotency_path' => ['nullable', 'string', 'max:120'],
            'custom_field_paths' => ['nullable', 'array'],
            'template_variable_paths' => ['nullable', 'array'],
            'template_variable_paths.*' => ['nullable', 'string', 'max:120'],
            'template_static_params' => ['nullable', 'array'],
            'template_static_params.*' => ['nullable', 'string', 'max:1024'],
            'rotate_secret' => ['nullable', 'boolean'],
        ];

        foreach ($fieldKeys as $fieldKey) {
            $rules["custom_field_paths.{$fieldKey}"] = ['nullable', 'string', 'max:120'];
        }

        $validated = $request->validate($rules);

        $templateId = (int) ($validated['whatsapp_template_id'] ?? 0);
        $connectionId = (int) ($validated['whatsapp_connection_id'] ?? 0);
        if ($templateId > 0 && $connectionId > 0) {
            $template = DB::table('whatsapp_templates')
                ->where('id', $templateId)
                ->where('account_id', $accountId)
                ->first(['whatsapp_connection_id']);
            if ($template && (int) $template->whatsapp_connection_id !== $connectionId) {
                abort(422, 'Template must belong to the selected WhatsApp connection.');
            }
        }

        return $validated;
    }

    protected function normalizePayloadMappings(array $validated): array
    {
        return array_filter([
            'phone_path' => trim((string) ($validated['phone_path'] ?? 'phone')),
            'name_path' => trim((string) ($validated['name_path'] ?? 'name')),
            'email_path' => trim((string) ($validated['email_path'] ?? 'email')),
            'company_path' => trim((string) ($validated['company_path'] ?? 'company')),
            'idempotency_path' => trim((string) ($validated['idempotency_path'] ?? 'event_id')),
            'custom_field_paths' => collect((array) ($validated['custom_field_paths'] ?? []))
                ->map(fn ($value) => trim((string) $value))
                ->filter()
                ->all(),
        ], fn ($value) => !in_array($value, ['', [], null], true));
    }

    protected function normalizeStringArray(array $values): array
    {
        return collect($values)
            ->map(fn ($value) => trim((string) $value))
            ->filter(fn ($value) => $value !== '')
            ->values()
            ->all();
    }

    protected function isDuplicateIdempotency(QueryException $e): bool
    {
        $message = strtolower($e->getMessage());

        return str_contains($message, 'inbound_webhook_logs_unique_idempotency')
            || str_contains($message, 'duplicate entry')
            || str_contains($message, 'unique constraint failed');
    }
}
