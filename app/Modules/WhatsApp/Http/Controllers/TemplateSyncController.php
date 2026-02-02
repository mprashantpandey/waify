<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Services\TemplateSyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TemplateSyncController extends Controller
{
    public function __construct(
        protected TemplateSyncService $syncService
    ) {
    }

    /**
     * Sync templates from Meta for a connection.
     */
    public function store(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $validated = $request->validate([
            'connection_id' => 'required|exists:whatsapp_connections,id',
        ]);

        $connection = WhatsAppConnection::where('workspace_id', $workspace->id)
            ->findOrFail($validated['connection_id']);

        // Only owners/admins can sync
        Gate::authorize('update', $connection);

        try {
            $result = $this->syncService->sync($connection);

            return redirect()->back()->with('success', sprintf(
                'Synced %d templates (%d created, %d updated)',
                $result['total'],
                $result['created'],
                $result['updated']
            ));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'sync' => 'Failed to sync templates: ' . $e->getMessage(),
            ]);
        }
    }
}

