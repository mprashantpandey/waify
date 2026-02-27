<?php

namespace App\Modules\WhatsApp\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use App\Modules\WhatsApp\Services\TemplateManagementService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    public function __construct(
        protected TemplateManagementService $templateManagementService
    ) {
    }
    /**
     * Display a listing of templates.
     */
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $query = WhatsAppTemplate::where('account_id', $account->id)
            ->with('connection')
            ->where(function ($q) {
                // Legacy rows may have NULL is_archived.
                $q->where('is_archived', false)
                    ->orWhereNull('is_archived');
            });

        // Filters
        if ($request->has('connection') && $request->connection) {
            $query->where('whatsapp_connection_id', $request->connection);
        }

        if ($request->has('status') && $request->status) {
            $query->whereRaw('LOWER(TRIM(status)) = ?', [strtolower(trim((string) $request->status))]);
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        if ($request->has('language') && $request->language) {
            $query->where('language', $request->language);
        }

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('body_text', 'like', "%{$search}%");
            });
        }

        $templates = $query->orderBy('name')
            ->orderBy('language')
            ->paginate(20)
            ->through(function ($template) {
                return [
                    'id' => $template->id,
                    'slug' => $template->slug,
                    'name' => $template->name,
                    'language' => $template->language,
                    'category' => $template->category,
                    'status' => $template->status,
                    'body_text' => $template->body_text,
                    'has_buttons' => $template->has_buttons,
                    'variable_count' => $template->variable_count,
                    'connection' => [
                        'id' => $template->connection->id,
                        'name' => $template->connection->name],
                    'last_synced_at' => $template->last_synced_at?->toIso8601String()];
            });

        $connectionColumns = ['id', 'name'];
        if (Schema::hasColumn('whatsapp_connections', 'last_synced_at')) {
            $connectionColumns[] = 'last_synced_at';
        }
        if (Schema::hasColumn('whatsapp_connections', 'last_meta_error')) {
            $connectionColumns[] = 'last_meta_error';
        }

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->get($connectionColumns)
            ->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'name' => $connection->name,
                    'last_synced_at' => $connection->last_synced_at?->toIso8601String(),
                    'last_sync_error' => $connection->last_meta_error,
                ];
            });

        return Inertia::render('WhatsApp/Templates/Index', [
            'account' => $account,
            'templates' => $templates,
            'connections' => $connections,
            'sync_report' => session('sync_report'),
            'filters' => [
                'connection' => $request->connection,
                'status' => $request->status,
                'category' => $request->category,
                'language' => $request->language,
                'search' => $request->search]]);
    }

    /**
     * Display the specified template.
     */
    public function show(Request $request, WhatsAppTemplate $template): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->load('connection');

        return Inertia::render('WhatsApp/Templates/Show', [
            'account' => $account,
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
                'variable_count' => $template->variable_count,
                'has_buttons' => $template->has_buttons,
                'last_synced_at' => $template->last_synced_at?->toIso8601String(),
                'last_meta_error' => $template->last_meta_error,
                'connection' => [
                    'id' => $template->connection->id,
                    'name' => $template->connection->name]]]);
    }

    /**
     * Archive a template.
     */
    public function archive(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->update(['is_archived' => true]);

        return redirect()->route('app.whatsapp.templates.index')->with('success', 'Template archived successfully.');
    }

    /**
     * Restore an archived template.
     */
    public function restore(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->update(['is_archived' => false]);

        return redirect()->back()->with('success', 'Template restored successfully.');
    }

    /**
     * Delete a template permanently.
     */
    public function destroy(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->delete();

        return redirect()->route('app.whatsapp.templates.index')->with('success', 'Template deleted successfully.');
    }

    /**
     * Show the form for creating a new template.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->where('is_active', true)
            ->get(['id', 'name', 'waba_id']);

        // Allow page to load even without connections - frontend will show error message
        // This provides better UX than redirecting
        return Inertia::render('WhatsApp/Templates/Create', [
            'account' => $account,
            'connections' => $connections]);
    }

    /**
     * Store a newly created template.
     */
    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'whatsapp_connection_id' => 'required|exists:whatsapp_connections,id',
            'name' => 'required|string|max:512|regex:/^[a-zA-Z0-9_]+$/',
            'language' => 'required|string|min:2|max:10|regex:/^[a-z]{2}(_[A-Z]{2})?$/',
            'category' => 'required|in:MARKETING,UTILITY,AUTHENTICATION',
            'header_type' => 'nullable|in:NONE,TEXT,IMAGE,VIDEO,DOCUMENT',
            'header_text' => 'nullable|string|max:60|required_if:header_type,TEXT',
            'header_media_url' => 'nullable|url',
            'header_media_handle' => 'nullable|string|max:1024',
            'body_text' => 'required|string|max:1024',
            'body_examples' => 'nullable|array',
            'body_examples.*' => 'string|max:100',
            'footer_text' => 'nullable|string|max:60',
            'buttons' => 'nullable|array|max:3',
            'buttons.*.type' => 'required_with:buttons|in:QUICK_REPLY,URL,PHONE_NUMBER',
            'buttons.*.text' => 'required_with:buttons|string|max:20',
            'buttons.*.url' => 'nullable|url|required_if:buttons.*.type,URL',
            'buttons.*.url_example' => 'nullable|string|max:200',
            'buttons.*.phone_number' => 'nullable|string|required_if:buttons.*.type,PHONE_NUMBER']);

        if (
            in_array(($validated['header_type'] ?? 'NONE'), ['IMAGE', 'VIDEO', 'DOCUMENT'], true)
            && empty($validated['header_media_url'])
            && empty($validated['header_media_handle'])
        ) {
            return back()->withErrors([
                'header_media_url' => 'Media header templates require an uploaded sample (URL or Meta handle).',
            ])->withInput();
        }

        $connection = WhatsAppConnection::where('account_id', $account->id)
            ->findOrFail($validated['whatsapp_connection_id']);

        Gate::authorize('update', $connection);

        try {
            Log::channel('whatsapp')->info('Creating template', [
                'account_id' => $account->id,
                'connection_id' => $connection->id,
                'template_name' => $validated['name']]);

            $result = $this->templateManagementService->createTemplate($connection, $validated);

            Log::channel('whatsapp')->info('Template created successfully', [
                'account_id' => $account->id,
                'connection_id' => $connection->id,
                'template_name' => $validated['name'],
                'meta_template_id' => $result['id'] ?? null]);

            return redirect()->route('app.whatsapp.templates.index')
                ->with('success', 'Template created successfully and submitted to Meta for approval.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Re-throw validation exceptions so they're handled properly
            throw $e;
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Template creation failed', [
                'account_id' => $account->id,
                'connection_id' => $connection->id,
                'template_name' => $validated['name'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()]);

            $errorMessage = $e->getMessage();
            $displayMessage = str_starts_with($errorMessage, 'Failed to create template:')
                ? $errorMessage
                : 'Failed to create template: ' . $errorMessage;

            if ($request->header('X-Inertia')) {
                return back()->withErrors(['create' => $displayMessage])->withInput();
            }

            return back()->withErrors(['create' => $displayMessage])->withInput();
        }
    }

    /**
     * Show the form for editing a template.
     */
    public function edit(Request $request, WhatsAppTemplate $template): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $template->load('connection');

        // Check template status from Meta
        $metaStatus = null;
        $rejectionReason = null;
        try {
            if ($template->meta_template_id) {
                $statusData = $this->templateManagementService->getTemplateStatus(
                    $template->connection,
                    $template->meta_template_id
                );
                $metaStatus = strtolower($statusData['status'] ?? $template->status);
                $rejectionReason = $statusData['rejection_reason'] ?? null;
                
                // Update local status if different
                if ($metaStatus !== strtolower($template->status)) {
                    $template->update([
                        'status' => $metaStatus,
                        'last_synced_at' => now()]);
                }
            }
        } catch (\Exception $e) {
            Log::channel('whatsapp')->warning('Failed to fetch template status from Meta', [
                'template_id' => $template->id,
                'error' => $e->getMessage()]);
        }

        return Inertia::render('WhatsApp/Templates/Edit', [
            'account' => $account,
            'template' => [
                'id' => $template->id,
                'slug' => $template->slug,
                'name' => $template->name,
                'language' => $template->language,
                'category' => $template->category,
                'status' => $metaStatus ?? strtolower($template->status),
                'rejection_reason' => $rejectionReason,
                'header_type' => $template->header_type ?? 'NONE',
                'header_text' => $template->header_text,
                'header_media_url' => $template->header_media_url ?? null,
                'header_media_handle' => $this->extractHeaderHandle($template->components ?? []),
                'body_text' => $template->body_text,
                'footer_text' => $template->footer_text,
                'buttons' => $template->buttons ?? [],
                'meta_template_id' => $template->meta_template_id,
                'connection' => [
                    'id' => $template->connection->id,
                    'name' => $template->connection->name]]]);
    }

    /**
     * Update a template (creates new version).
     */
    public function update(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:512|regex:/^[a-zA-Z0-9_]+$/',
            'language' => 'required|string|min:2|max:10|regex:/^[a-z]{2}(_[A-Z]{2})?$/',
            'category' => 'required|in:MARKETING,UTILITY,AUTHENTICATION',
            'header_type' => 'nullable|in:NONE,TEXT,IMAGE,VIDEO,DOCUMENT',
            'header_text' => 'nullable|string|max:60|required_if:header_type,TEXT',
            'header_media_url' => 'nullable|url',
            'header_media_handle' => 'nullable|string|max:1024',
            'body_text' => 'required|string|max:1024',
            'body_examples' => 'nullable|array',
            'body_examples.*' => 'string|max:100',
            'footer_text' => 'nullable|string|max:60',
            'buttons' => 'nullable|array|max:3',
            'buttons.*.type' => 'required_with:buttons|in:QUICK_REPLY,URL,PHONE_NUMBER',
            'buttons.*.text' => 'required_with:buttons|string|max:20',
            'buttons.*.url' => 'nullable|url|required_if:buttons.*.type,URL',
            'buttons.*.url_example' => 'nullable|string|max:200',
            'buttons.*.phone_number' => 'nullable|string|required_if:buttons.*.type,PHONE_NUMBER']);

        if (
            in_array(($validated['header_type'] ?? 'NONE'), ['IMAGE', 'VIDEO', 'DOCUMENT'], true)
            && empty($validated['header_media_url'])
            && empty($validated['header_media_handle'])
        ) {
            return back()->withErrors([
                'header_media_url' => 'Media header templates require an uploaded sample (URL or Meta handle).',
            ])->withInput();
        }

        $connection = $template->connection;
        Gate::authorize('update', $connection);

        try {
            $result = $this->templateManagementService->updateTemplate($connection, $template, $validated);
            $effectiveName = $result['_effective_template_name'] ?? null;
            $autoVersioned = (bool) ($result['_auto_versioned_name'] ?? false);
            $message = 'Template updated successfully. A new version has been submitted to Meta for approval.';
            if ($autoVersioned && is_string($effectiveName) && $effectiveName !== '') {
                $message .= " Meta required a new unique template name, so it was created as '{$effectiveName}'.";
            }

            return redirect()->route('app.whatsapp.templates.index')->with('success', $message);
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Template update failed', [
                'account_id' => $account->id,
                'template_id' => $template->id,
                'error' => $e->getMessage()]);

            return back()->withErrors([
                'update' => 'Failed to update template: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Upload media file for template header.
     */
    public function uploadMedia(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'type' => 'required|in:IMAGE,VIDEO,DOCUMENT']);

        $file = $request->file('file');
        $type = $validated['type'];

        // Validate file type based on header type
        $mimeRules = [
            'IMAGE' => 'mimes:jpg,jpeg,png,gif,webp',
            'VIDEO' => 'mimetypes:video/mp4,video/quicktime,video/3gpp',
            'DOCUMENT' => 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,zip'];
        
        $request->validate([
            'file' => $mimeRules[$type] ?? 'file']);

        // Store file
        $path = $file->store('whatsapp-templates', 'public');
        $url = rtrim(config('app.url'), '/') . Storage::url($path);

        return response()->json([
            'url' => $url,
            'path' => $path]);

    }

    /**
     * Check template status from Meta.
     */
    public function checkStatus(Request $request, WhatsAppTemplate $template)
    {
        $account = $request->attributes->get('account') ?? current_account();

        // Ensure template belongs to account
        if (!account_ids_match($template->account_id, $account->id)) {
            abort(404);
        }

        if (!$template->meta_template_id) {
            return back()->with('error', 'Template has not been submitted to Meta yet.');
        }

        try {
            $statusData = $this->templateManagementService->getTemplateStatus(
                $template->connection,
                $template->meta_template_id
            );

            $metaStatus = strtolower($statusData['status'] ?? $template->status);
            $rejectionReason = $statusData['rejection_reason'] ?? null;

            $template->update([
                'status' => $metaStatus,
                'last_synced_at' => now(),
                'last_meta_error' => $rejectionReason]);

            return back()->with('success', 'Template status updated from Meta.');
        } catch (\Exception $e) {
            Log::channel('whatsapp')->error('Template status check failed', [
                'template_id' => $template->id,
                'error' => $e->getMessage()]);

            return back()->with('error', 'Failed to check template status: ' . $e->getMessage());
        }
    }

    protected function extractHeaderHandle(array $components): ?string
    {
        foreach ($components as $component) {
            if (strtoupper((string) ($component['type'] ?? '')) !== 'HEADER') {
                continue;
            }

            $handle = trim((string) ($component['example']['header_handle'][0] ?? ''));
            if ($handle !== '') {
                return $handle;
            }
        }

        return null;
    }
}
