<?php

namespace App\Modules\Developer\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AccountApiKey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperController extends Controller
{
    protected const AVAILABLE_SCOPES = [
        'account.read',
        'connections.read',
        'contacts.read',
        'conversations.read',
    ];

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
            abort(403, 'Only account owners/admins can manage API keys.');
        }
    }

    /**
     * Developer page: API keys and link to docs.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $keys = AccountApiKey::where('account_id', $account->id)
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'key_prefix', 'is_active', 'scopes', 'last_used_at', 'last_used_ip', 'expires_at', 'revoked_at', 'created_at'])
            ->map(function (AccountApiKey $key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'key_prefix' => $key->key_prefix,
                    'is_active' => (bool) ($key->is_active ?? true),
                    'scopes' => array_values((array) ($key->scopes ?? [])),
                    'last_used_at' => $key->last_used_at?->toIso8601String(),
                    'last_used_ip' => $key->last_used_ip,
                    'expires_at' => $key->expires_at?->toIso8601String(),
                    'revoked_at' => $key->revoked_at?->toIso8601String(),
                    'created_at' => $key->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Developer/Index', [
            'account' => $account,
            'api_keys' => $keys,
            'base_url' => config('app.url') . '/api/v1',
            'available_scopes' => self::AVAILABLE_SCOPES,
        ]);
    }

    /**
     * API documentation page (external API reference for tenants).
     */
    public function docs(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);
        $baseUrl = config('app.url') . '/api/v1';

        $endpoints = $this->getDocumentedEndpoints($baseUrl);

        return Inertia::render('Developer/Docs', [
            'account' => $account,
            'base_url' => $baseUrl,
            'endpoints' => $endpoints,
            'available_scopes' => self::AVAILABLE_SCOPES,
        ]);
    }

    /**
     * Create a new API key. Plaintext key is returned only in this response.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'scopes' => 'nullable|array',
            'scopes.*' => 'string|in:' . implode(',', self::AVAILABLE_SCOPES),
            'expires_in_days' => 'nullable|integer|min:1|max:3650',
        ]);

        $plaintext = AccountApiKey::generateKey();
        $hash = AccountApiKey::hashKey($plaintext);
        $prefix = AccountApiKey::prefixForDisplay($plaintext);

        AccountApiKey::create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'key_hash' => $hash,
            'key_prefix' => $prefix,
            'scopes' => array_values(array_unique((array) ($validated['scopes'] ?? self::AVAILABLE_SCOPES))),
            'is_active' => true,
            'expires_at' => !empty($validated['expires_in_days']) ? now()->addDays((int) $validated['expires_in_days']) : null,
        ]);

        return back()->with('new_api_key', [
            'name' => $validated['name'],
            'key' => $plaintext,
            'key_prefix' => $prefix,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $apiKey = AccountApiKey::where('account_id', $account->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'is_active' => 'sometimes|boolean',
            'scopes' => 'sometimes|array',
            'scopes.*' => 'string|in:' . implode(',', self::AVAILABLE_SCOPES),
            'expires_in_days' => 'nullable|integer|min:1|max:3650',
            'clear_expiry' => 'nullable|boolean',
        ]);

        if (array_key_exists('name', $validated)) {
            $apiKey->name = $validated['name'];
        }
        if (array_key_exists('is_active', $validated)) {
            $apiKey->is_active = (bool) $validated['is_active'];
            if (!(bool) $validated['is_active']) {
                $apiKey->revoked_at = now();
            } elseif ($apiKey->revoked_at) {
                $apiKey->revoked_at = null;
            }
        }
        if (array_key_exists('scopes', $validated)) {
            $apiKey->scopes = array_values(array_unique((array) $validated['scopes']));
        }
        if (!empty($validated['clear_expiry'])) {
            $apiKey->expires_at = null;
        } elseif (array_key_exists('expires_in_days', $validated) && $validated['expires_in_days']) {
            $apiKey->expires_at = now()->addDays((int) $validated['expires_in_days']);
        }

        $apiKey->save();

        return back()->with('success', 'API key updated.');
    }

    /**
     * Revoke (delete) an API key.
     */
    public function destroy(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $this->ensureDeveloperManager($request);

        $apiKey = AccountApiKey::where('account_id', $account->id)->findOrFail($id);
        $apiKey->delete();

        return back()->with('success', 'API key revoked.');
    }

    /**
     * Documented API endpoints for the external docs page.
     */
    protected function getDocumentedEndpoints(string $baseUrl): array
    {
        return [
            [
                'method' => 'GET',
                'path' => '/account',
                'summary' => 'Get current account',
                'description' => 'Returns the authenticated account profile (id, name, slug).',
                'auth' => true,
                'scope' => 'account.read',
                'example' => "curl -X GET \"{$baseUrl}/account\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/connections',
                'summary' => 'List WhatsApp connections',
                'description' => 'Returns WhatsApp connections for the account (id, name, status).',
                'auth' => true,
                'scope' => 'connections.read',
                'example' => "curl -X GET \"{$baseUrl}/connections?limit=20\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/contacts',
                'summary' => 'List contacts',
                'description' => 'Returns contacts for the account with optional filters.',
                'auth' => true,
                'scope' => 'contacts.read',
                'example' => "curl -X GET \"{$baseUrl}/contacts?search=john&status=active&limit=50\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/conversations',
                'summary' => 'List conversations',
                'description' => 'Returns conversations (open/closed) for the account.',
                'auth' => true,
                'scope' => 'conversations.read',
                'example' => "curl -X GET \"{$baseUrl}/conversations?status=open&limit=25\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
        ];
    }
}
