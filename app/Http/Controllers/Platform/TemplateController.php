<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    /**
     * Display all templates across all workspaces.
     */
    public function index(Request $request): Response
    {
        $query = WhatsAppTemplate::with(['workspace', 'connection']);

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('workspace_id') && $request->workspace_id) {
            $query->where('workspace_id', $request->workspace_id);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('body_text', 'like', '%' . $request->search . '%');
            });
        }

        $templates = $query->orderBy('created_at', 'desc')
            ->paginate(30)
            ->through(function ($template) {
                return [
                    'id' => $template->id,
                    'slug' => $template->slug,
                    'name' => $template->name,
                    'language' => $template->language,
                    'category' => $template->category,
                    'status' => $template->status,
                    'quality_score' => $template->quality_score,
                    'workspace' => [
                        'id' => $template->workspace->id,
                        'name' => $template->workspace->name,
                        'slug' => $template->workspace->slug,
                    ],
                    'connection' => $template->connection ? [
                        'id' => $template->connection->id,
                        'name' => $template->connection->name,
                    ] : null,
                    'last_synced_at' => $template->last_synced_at?->toIso8601String(),
                    'last_meta_error' => $template->last_meta_error,
                    'created_at' => $template->created_at->toIso8601String(),
                ];
            });

        // Get filter options
        $statuses = WhatsAppTemplate::select('status')
            ->distinct()
            ->pluck('status')
            ->toArray();

        $workspaces = Workspace::select('id', 'name')
            ->whereIn('id', WhatsAppTemplate::distinct()->pluck('workspace_id'))
            ->get();

        return Inertia::render('Platform/Templates/Index', [
            'templates' => $templates,
            'filters' => [
                'status' => $request->status,
                'workspace_id' => $request->workspace_id,
                'search' => $request->search,
            ],
            'filter_options' => [
                'statuses' => $statuses,
                'workspaces' => $workspaces,
            ],
        ]);
    }

    /**
     * Display a specific template.
     */
    public function show(WhatsAppTemplate $template): Response
    {
        $template->load(['workspace', 'connection']);

        return Inertia::render('Platform/Templates/Show', [
            'template' => [
                'id' => $template->id,
                'slug' => $template->slug,
                'name' => $template->name,
                'language' => $template->language,
                'category' => $template->category,
                'status' => $template->status,
                'quality_score' => $template->quality_score,
                'body_text' => $template->body_text,
                'header_type' => $template->header_type,
                'header_text' => $template->header_text,
                'footer_text' => $template->footer_text,
                'buttons' => $template->buttons,
                'components' => $template->components,
                'workspace' => [
                    'id' => $template->workspace->id,
                    'name' => $template->workspace->name,
                    'slug' => $template->workspace->slug,
                ],
                'connection' => $template->connection ? [
                    'id' => $template->connection->id,
                    'name' => $template->connection->name,
                ] : null,
                'last_synced_at' => $template->last_synced_at?->toIso8601String(),
                'last_meta_error' => $template->last_meta_error,
                'is_archived' => $template->is_archived,
                'created_at' => $template->created_at->toIso8601String(),
            ],
        ]);
    }
}
