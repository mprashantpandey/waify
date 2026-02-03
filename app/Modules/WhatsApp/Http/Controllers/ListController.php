<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppList;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends Controller
{
    /**
     * Display a listing of lists.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $lists = WhatsAppList::where('account_id', $account->id)
            ->with('connection')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($list) {
                return [
                    'id' => $list->id,
                    'name' => $list->name,
                    'button_text' => $list->button_text,
                    'description' => $list->description,
                    'footer_text' => $list->footer_text,
                    'sections_count' => count($list->sections ?? []),
                    'total_rows' => collect($list->sections ?? [])->sum(fn($s) => count($s['rows'] ?? [])),
                    'is_active' => $list->is_active,
                    'connection' => [
                        'id' => $list->connection->id,
                        'name' => $list->connection->name,
                    ],
                    'created_at' => $list->created_at->toIso8601String(),
                ];
            });

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->where('status', 'connected')
            ->get()
            ->map(fn($conn) => [
                'id' => $conn->id,
                'name' => $conn->name,
            ]);

        return Inertia::render('WhatsApp/Lists/Index', [
            'account' => $account,
            'lists' => $lists,
            'connections' => $connections,
        ]);
    }

    /**
     * Show the form for creating a new list.
     */
    public function create(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->where('status', 'connected')
            ->get()
            ->map(fn($conn) => [
                'id' => $conn->id,
                'name' => $conn->name,
            ]);

        return Inertia::render('WhatsApp/Lists/Create', [
            'account' => $account,
            'connections' => $connections,
        ]);
    }

    /**
     * Store a newly created list.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'whatsapp_connection_id' => 'required|exists:whatsapp_connections,id',
            'name' => 'required|string|max:255',
            'button_text' => 'required|string|max:20',
            'description' => 'nullable|string|max:1024',
            'footer_text' => 'nullable|string|max:60',
            'sections' => 'required|array|min:1|max:10',
            'sections.*.title' => 'required|string|max:24',
            'sections.*.rows' => 'required|array|min:1|max:10',
            'sections.*.rows.*.id' => 'required|string|max:200',
            'sections.*.rows.*.title' => 'required|string|max:24',
            'sections.*.rows.*.description' => 'nullable|string|max:72',
        ]);

        // Verify connection belongs to account
        $connection = WhatsAppConnection::where('id', $validated['whatsapp_connection_id'])
            ->where('account_id', $account->id)
            ->firstOrFail();

        // Validate total rows
        $totalRows = collect($validated['sections'])->sum(fn($s) => count($s['rows']));
        if ($totalRows > 10) {
            return redirect()->back()->withErrors([
                'sections' => 'Total rows across all sections cannot exceed 10.',
            ])->withInput();
        }

        $list = WhatsAppList::create([
            'account_id' => $account->id,
            'whatsapp_connection_id' => $validated['whatsapp_connection_id'],
            'name' => $validated['name'],
            'button_text' => $validated['button_text'],
            'description' => $validated['description'] ?? null,
            'footer_text' => $validated['footer_text'] ?? null,
            'sections' => $validated['sections'],
            'is_active' => true,
        ]);

        // Validate structure
        $errors = $list->validateStructure();
        if (!empty($errors)) {
            $list->delete();
            return redirect()->back()->withErrors(['sections' => $errors])->withInput();
        }

        return redirect()->route('app.whatsapp.lists.index')
            ->with('success', 'List created successfully.');
    }

    /**
     * Display the specified list.
     */
    public function show(Request $request, WhatsAppList $list): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ($list->account_id !== $account->id) {
            abort(404);
        }

        $list->load('connection');

        return Inertia::render('WhatsApp/Lists/Show', [
            'account' => $account,
            'list' => [
                'id' => $list->id,
                'name' => $list->name,
                'button_text' => $list->button_text,
                'description' => $list->description,
                'footer_text' => $list->footer_text,
                'sections' => $list->sections,
                'is_active' => $list->is_active,
                'connection' => [
                    'id' => $list->connection->id,
                    'name' => $list->connection->name,
                ],
                'created_at' => $list->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified list.
     */
    public function edit(Request $request, WhatsAppList $list): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ($list->account_id !== $account->id) {
            abort(404);
        }

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->where('status', 'connected')
            ->get()
            ->map(fn($conn) => [
                'id' => $conn->id,
                'name' => $conn->name,
            ]);

        return Inertia::render('WhatsApp/Lists/Edit', [
            'account' => $account,
            'list' => [
                'id' => $list->id,
                'whatsapp_connection_id' => $list->whatsapp_connection_id,
                'name' => $list->name,
                'button_text' => $list->button_text,
                'description' => $list->description,
                'footer_text' => $list->footer_text,
                'sections' => $list->sections,
                'is_active' => $list->is_active,
            ],
            'connections' => $connections,
        ]);
    }

    /**
     * Update the specified list.
     */
    public function update(Request $request, WhatsAppList $list)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ($list->account_id !== $account->id) {
            abort(404);
        }

        $validated = $request->validate([
            'whatsapp_connection_id' => 'required|exists:whatsapp_connections,id',
            'name' => 'required|string|max:255',
            'button_text' => 'required|string|max:20',
            'description' => 'nullable|string|max:1024',
            'footer_text' => 'nullable|string|max:60',
            'sections' => 'required|array|min:1|max:10',
            'sections.*.title' => 'required|string|max:24',
            'sections.*.rows' => 'required|array|min:1|max:10',
            'sections.*.rows.*.id' => 'required|string|max:200',
            'sections.*.rows.*.title' => 'required|string|max:24',
            'sections.*.rows.*.description' => 'nullable|string|max:72',
        ]);

        // Verify connection belongs to account
        $connection = WhatsAppConnection::where('id', $validated['whatsapp_connection_id'])
            ->where('account_id', $account->id)
            ->firstOrFail();

        // Validate total rows
        $totalRows = collect($validated['sections'])->sum(fn($s) => count($s['rows']));
        if ($totalRows > 10) {
            return redirect()->back()->withErrors([
                'sections' => 'Total rows across all sections cannot exceed 10.',
            ])->withInput();
        }

        $list->update([
            'whatsapp_connection_id' => $validated['whatsapp_connection_id'],
            'name' => $validated['name'],
            'button_text' => $validated['button_text'],
            'description' => $validated['description'] ?? null,
            'footer_text' => $validated['footer_text'] ?? null,
            'sections' => $validated['sections'],
        ]);

        // Validate structure
        $errors = $list->fresh()->validateStructure();
        if (!empty($errors)) {
            return redirect()->back()->withErrors(['sections' => $errors])->withInput();
        }

        return redirect()->route('app.whatsapp.lists.index')
            ->with('success', 'List updated successfully.');
    }

    /**
     * Remove the specified list.
     */
    public function destroy(Request $request, WhatsAppList $list)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ($list->account_id !== $account->id) {
            abort(404);
        }

        $list->delete();

        return redirect()->route('app.whatsapp.lists.index')
            ->with('success', 'List deleted successfully.');
    }

    /**
     * Toggle list active status.
     */
    public function toggle(Request $request, WhatsAppList $list)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ($list->account_id !== $account->id) {
            abort(404);
        }

        $list->update(['is_active' => !$list->is_active]);

        return redirect()->back()->with('success', 'List status updated.');
    }
}
