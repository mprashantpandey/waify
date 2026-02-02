<?php

namespace App\Modules\Broadcasts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Broadcasts\Jobs\SendScheduledCampaignJob;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Broadcasts\Services\CampaignService;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CampaignController extends Controller
{
    public function __construct(
        protected CampaignService $campaignService
    ) {
    }

    /**
     * Display a listing of campaigns.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $query = Campaign::where('workspace_id', $workspace->id)
            ->with(['connection', 'template', 'creator'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $campaigns = $query->paginate(20)->through(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'slug' => $campaign->slug,
                    'name' => $campaign->name,
                'description' => $campaign->description,
                'status' => $campaign->status,
                'type' => $campaign->type,
                'total_recipients' => $campaign->total_recipients,
                'sent_count' => $campaign->sent_count,
                'delivered_count' => $campaign->delivered_count,
                'read_count' => $campaign->read_count,
                'failed_count' => $campaign->failed_count,
                'completion_percentage' => $campaign->completion_percentage,
                'scheduled_at' => $campaign->scheduled_at?->toIso8601String(),
                'started_at' => $campaign->started_at?->toIso8601String(),
                'completed_at' => $campaign->completed_at?->toIso8601String(),
                'connection' => $campaign->connection ? [
                    'id' => $campaign->connection->id,
                    'name' => $campaign->connection->name,
                ] : null,
                'template' => $campaign->template ? [
                    'id' => $campaign->template->id,
                    'name' => $campaign->template->name,
                ] : null,
                'created_by' => $campaign->creator ? [
                    'id' => $campaign->creator->id,
                    'name' => $campaign->creator->name,
                ] : null,
                'created_at' => $campaign->created_at->toIso8601String(),
            ];
        });

        return Inertia::render('Broadcasts/Index', [
            'workspace' => $workspace,
            'campaigns' => $campaigns,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new campaign.
     */
    public function create(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        // Get available connections
        $connections = WhatsAppConnection::where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->get()
            ->map(function ($connection) {
                return [
                    'id' => $connection->id,
                    'name' => $connection->name,
                    'phone_number_id' => $connection->phone_number_id,
                ];
            });

        // Get available templates
        $templates = WhatsAppTemplate::where('workspace_id', $workspace->id)
            ->where('status', 'APPROVED')
            ->where('is_archived', false)
            ->with('connection')
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'language' => $template->language,
                    'category' => $template->category,
                    'body_text' => $template->body_text,
                    'connection_id' => $template->whatsapp_connection_id,
                ];
            });

        // Get contacts count for recipient selection
        $contactsCount = WhatsAppContact::where('workspace_id', $workspace->id)->count();

        return Inertia::render('Broadcasts/Create', [
            'workspace' => $workspace,
            'connections' => $connections,
            'templates' => $templates,
            'contactsCount' => $contactsCount,
        ]);
    }

    /**
     * Store a newly created campaign.
     */
    public function store(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:template,text,media',
            'whatsapp_connection_id' => 'required|exists:whatsapp_connections,id',
            'whatsapp_template_id' => 'required_if:type,template|exists:whatsapp_templates,id',
            'template_params' => 'nullable|array',
            'message_text' => 'required_if:type,text|string',
            'media_url' => 'required_if:type,media|url',
            'media_type' => 'required_if:type,media|in:image,video,document,audio',
            'recipient_type' => 'required|in:contacts,custom,segment',
            'recipient_filters' => 'nullable|array',
            'custom_recipients' => 'required_if:recipient_type,custom|array',
            'custom_recipients.*.phone' => 'required_with:custom_recipients|string',
            'custom_recipients.*.name' => 'nullable|string',
            'scheduled_at' => 'nullable|date|after:now',
            'send_delay_seconds' => 'nullable|integer|min:0|max:3600',
            'respect_opt_out' => 'boolean',
        ]);

        try {
            DB::beginTransaction();

            $campaign = Campaign::create([
                'workspace_id' => $workspace->id,
                'whatsapp_connection_id' => $validated['whatsapp_connection_id'],
                'whatsapp_template_id' => $validated['whatsapp_template_id'] ?? null,
                'created_by' => $request->user()->id,
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'type' => $validated['type'],
                'status' => $validated['scheduled_at'] ? 'scheduled' : 'draft',
                'template_params' => $validated['template_params'] ?? null,
                'message_text' => $validated['message_text'] ?? null,
                'media_url' => $validated['media_url'] ?? null,
                'media_type' => $validated['media_type'] ?? null,
                'scheduled_at' => $validated['scheduled_at'] ? new \DateTime($validated['scheduled_at']) : null,
                'recipient_type' => $validated['recipient_type'],
                'recipient_filters' => $validated['recipient_filters'] ?? null,
                'custom_recipients' => $validated['custom_recipients'] ?? null,
                'send_delay_seconds' => $validated['send_delay_seconds'] ?? 0,
                'respect_opt_out' => $validated['respect_opt_out'] ?? true,
            ]);

            // Prepare recipients
            $this->campaignService->prepareRecipients($campaign);

            // Schedule campaign if scheduled_at is set
            if ($campaign->scheduled_at) {
                SendScheduledCampaignJob::dispatch($campaign->id)
                    ->delay($campaign->scheduled_at);
            }

            DB::commit();

            return redirect()->route('app.broadcasts.show', [
                'workspace' => $workspace->slug,
                'campaign' => $campaign->id,
            ])->with('success', 'Campaign created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create campaign', [
                'workspace_id' => $workspace->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to create campaign: ' . $e->getMessage(),
            ])->withInput();
        }
    }

    /**
     * Display the specified campaign.
     */
    public function show(Request $request, Campaign $campaign): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($campaign->workspace_id !== $workspace->id) {
            abort(404);
        }

        $campaign->load(['connection', 'template', 'creator', 'recipients' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(100);
        }]);

        $stats = [
            'total' => $campaign->total_recipients,
            'sent' => $campaign->sent_count,
            'delivered' => $campaign->delivered_count,
            'read' => $campaign->read_count,
            'failed' => $campaign->failed_count,
            'pending' => $campaign->recipients()->where('status', 'pending')->count(),
            'completion_percentage' => $campaign->completion_percentage,
            'delivery_rate' => $campaign->delivery_rate,
            'read_rate' => $campaign->read_rate,
        ];

        return Inertia::render('Broadcasts/Show', [
            'workspace' => $workspace,
            'campaign' => [
                'id' => $campaign->id,
                'slug' => $campaign->slug,
                'name' => $campaign->name,
                'description' => $campaign->description,
                'status' => $campaign->status,
                'type' => $campaign->type,
                'scheduled_at' => $campaign->scheduled_at?->toIso8601String(),
                'started_at' => $campaign->started_at?->toIso8601String(),
                'completed_at' => $campaign->completed_at?->toIso8601String(),
                'connection' => $campaign->connection ? [
                    'id' => $campaign->connection->id,
                    'name' => $campaign->connection->name,
                ] : null,
                'template' => $campaign->template ? [
                    'id' => $campaign->template->id,
                    'name' => $campaign->template->name,
                ] : null,
                'created_by' => $campaign->creator ? [
                    'id' => $campaign->creator->id,
                    'name' => $campaign->creator->name,
                ] : null,
                'created_at' => $campaign->created_at->toIso8601String(),
            ],
            'stats' => $stats,
            'recipients' => $campaign->recipients->map(function ($recipient) {
                return [
                    'id' => $recipient->id,
                    'phone_number' => $recipient->phone_number,
                    'name' => $recipient->name,
                    'status' => $recipient->status,
                    'sent_at' => $recipient->sent_at?->toIso8601String(),
                    'delivered_at' => $recipient->delivered_at?->toIso8601String(),
                    'read_at' => $recipient->read_at?->toIso8601String(),
                    'failed_at' => $recipient->failed_at?->toIso8601String(),
                    'failure_reason' => $recipient->failure_reason,
                ];
            }),
        ]);
    }

    /**
     * Start a campaign.
     */
    public function start(Request $request, Campaign $campaign)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($campaign->workspace_id !== $workspace->id) {
            abort(404);
        }

        if (!$campaign->canStart()) {
            return back()->withErrors([
                'error' => 'Campaign cannot be started in its current state.',
            ]);
        }

        try {
            $this->campaignService->startCampaign($campaign);

            return back()->with('success', 'Campaign started successfully.');
        } catch (\Exception $e) {
            Log::error('Failed to start campaign', [
                'campaign_id' => $campaign->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'error' => 'Failed to start campaign: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Pause a campaign.
     */
    public function pause(Request $request, Campaign $campaign)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($campaign->workspace_id !== $workspace->id) {
            abort(404);
        }

        if ($campaign->status !== 'sending') {
            return back()->withErrors([
                'error' => 'Only active campaigns can be paused.',
            ]);
        }

        $campaign->update(['status' => 'paused']);

        return back()->with('success', 'Campaign paused successfully.');
    }

    /**
     * Cancel a campaign.
     */
    public function cancel(Request $request, Campaign $campaign)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($campaign->workspace_id !== $workspace->id) {
            abort(404);
        }

        if (!in_array($campaign->status, ['draft', 'scheduled', 'sending', 'paused'])) {
            return back()->withErrors([
                'error' => 'Campaign cannot be cancelled in its current state.',
            ]);
        }

        $campaign->update(['status' => 'cancelled']);

        return back()->with('success', 'Campaign cancelled successfully.');
    }
}
