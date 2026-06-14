<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TemplateController extends Controller
{
    /**
     * Display all templates across all accounts.
     */
    public function index(Request $request): Response
    {
        $query = WhatsAppTemplate::with(['account', 'connection']);

        // Filters
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('account_id') && $request->account_id) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%')
                    ->orWhere('body_text', 'like', '%'.$request->search.'%');
            });
        }

        $templates = $query->orderBy('created_at', 'desc')
            ->paginate(30)
            ->withQueryString()
            ->through(fn ($template) => $this->serializeTemplate($template));

        $selectedTemplate = null;
        if ($request->filled('template')) {
            $selected = WhatsAppTemplate::with(['account', 'connection'])
                ->where('slug', $request->input('template'))
                ->orWhere('id', $request->input('template'))
                ->first();

            if ($selected) {
                $selectedTemplate = $this->serializeTemplate($selected, true);
            }
        }

        // Get filter options
        $statuses = WhatsAppTemplate::select('status')
            ->distinct()
            ->pluck('status')
            ->toArray();

        $accounts = Account::select('id', 'name')
            ->whereIn('id', WhatsAppTemplate::distinct()->pluck('account_id'))
            ->get();

        return Inertia::render('Platform/Templates/Index', [
            'templates' => $templates,
            'filters' => [
                'status' => $request->status,
                'account_id' => $request->account_id,
                'search' => $request->search],
            'filter_options' => [
                'statuses' => $statuses,
                'accounts' => $accounts],
            'selectedTemplate' => $selectedTemplate]);
    }

    /**
     * Display a specific template.
     */
    public function show(WhatsAppTemplate $template): RedirectResponse
    {
        return redirect()->route('platform.templates.index', ['template' => $template->slug]);
    }

    protected function serializeTemplate(WhatsAppTemplate $template, bool $full = false): array
    {
        $data = [
            'id' => $template->id,
            'slug' => $template->slug,
            'name' => $template->name,
            'language' => $template->language,
            'category' => $template->category,
            'status' => $template->status,
            'quality_score' => $template->quality_score,
            'account' => [
                'id' => $template->account->id,
                'name' => $template->account->name,
                'slug' => $template->account->slug],
            'connection' => $template->connection ? [
                'id' => $template->connection->id,
                'name' => $template->connection->name] : null,
            'last_synced_at' => $template->last_synced_at?->toIso8601String(),
            'last_meta_error' => $template->last_meta_error,
            'created_at' => $template->created_at->toIso8601String()];

        if ($full) {
            $data += [
                'body_text' => $template->body_text,
                'header_type' => $template->header_type,
                'header_text' => $template->header_text,
                'footer_text' => $template->footer_text,
                'buttons' => $template->buttons,
                'components' => $template->components,
                'is_archived' => $template->is_archived];
        }

        return $data;
    }
}
