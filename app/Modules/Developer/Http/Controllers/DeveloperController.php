<?php

namespace App\Modules\Developer\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\AccountApiKey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperController extends Controller
{
    /**
     * Developer page: API keys and link to docs.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $keys = AccountApiKey::where('account_id', $account->id)
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'key_prefix', 'last_used_at', 'created_at'])
            ->map(function (AccountApiKey $key) {
                return [
                    'id' => $key->id,
                    'name' => $key->name,
                    'key_prefix' => $key->key_prefix,
                    'last_used_at' => $key->last_used_at?->toIso8601String(),
                    'created_at' => $key->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Developer/Index', [
            'account' => $account,
            'api_keys' => $keys,
            'base_url' => config('app.url') . '/api/v1',
        ]);
    }

    /**
     * API documentation page (external API reference for tenants).
     */
    public function docs(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $baseUrl = config('app.url') . '/api/v1';

        $endpoints = $this->getDocumentedEndpoints($baseUrl);

        return Inertia::render('Developer/Docs', [
            'account' => $account,
            'base_url' => $baseUrl,
            'endpoints' => $endpoints,
        ]);
    }

    /**
     * Create a new API key. Plaintext key is returned only in this response.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $plaintext = AccountApiKey::generateKey();
        $hash = AccountApiKey::hashKey($plaintext);
        $prefix = AccountApiKey::prefixForDisplay($plaintext);

        AccountApiKey::create([
            'account_id' => $account->id,
            'name' => $validated['name'],
            'key_hash' => $hash,
            'key_prefix' => $prefix,
        ]);

        return back()->with('new_api_key', [
            'name' => $validated['name'],
            'key' => $plaintext,
            'key_prefix' => $prefix,
        ]);
    }

    /**
     * Revoke (delete) an API key.
     */
    public function destroy(Request $request, int $id)
    {
        $account = $request->attributes->get('account') ?? current_account();

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
                'example' => "curl -X GET \"{$baseUrl}/account\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/connections',
                'summary' => 'List WhatsApp connections',
                'description' => 'Returns WhatsApp connections for the account (id, name, status).',
                'auth' => true,
                'example' => "curl -X GET \"{$baseUrl}/connections\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/contacts',
                'summary' => 'List contacts',
                'description' => 'Returns contacts for the account with optional filters.',
                'auth' => true,
                'example' => "curl -X GET \"{$baseUrl}/contacts\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
            [
                'method' => 'GET',
                'path' => '/conversations',
                'summary' => 'List conversations',
                'description' => 'Returns conversations (open/closed) for the account.',
                'auth' => true,
                'example' => "curl -X GET \"{$baseUrl}/conversations\" \\\n  -H \"Authorization: Bearer YOUR_API_KEY\"",
            ],
        ];
    }
}
