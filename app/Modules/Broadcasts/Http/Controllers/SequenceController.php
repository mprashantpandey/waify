<?php

namespace App\Modules\Broadcasts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Broadcasts\Models\CampaignSequence;
use App\Modules\Broadcasts\Services\SequenceService;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SequenceController extends Controller
{
    public function __construct(protected SequenceService $sequenceService)
    {
    }

    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $sequences = CampaignSequence::query()
            ->where('account_id', $account->id)
            ->with(['connection', 'creator', 'steps'])
            ->latest('id')
            ->paginate(15)
            ->through(fn (CampaignSequence $sequence) => [
                'id' => $sequence->id,
                'slug' => $sequence->slug,
                'name' => $sequence->name,
                'description' => $sequence->description,
                'status' => $sequence->status,
                'audience_type' => $sequence->audience_type,
                'steps_count' => $sequence->steps->count(),
                'enrolled_count' => $sequence->enrolled_count,
                'active_enrollment_count' => $sequence->active_enrollment_count,
                'completed_enrollment_count' => $sequence->completed_enrollment_count,
                'failed_enrollment_count' => $sequence->failed_enrollment_count,
                'activated_at' => $sequence->activated_at?->toIso8601String(),
                'connection' => $sequence->connection ? [
                    'id' => $sequence->connection->id,
                    'name' => $sequence->connection->name,
                ] : null,
                'created_by' => $sequence->creator ? [
                    'id' => $sequence->creator->id,
                    'name' => $sequence->creator->name,
                ] : null,
            ]);

        return Inertia::render('Broadcasts/Sequences/Index', [
            'sequences' => $sequences,
        ]);
    }

    public function create(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $connections = WhatsAppConnection::query()
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $templates = WhatsAppTemplate::query()
            ->where('account_id', $account->id)
            ->whereIn(DB::raw('LOWER(TRIM(status))'), ['approved', 'active'])
            ->where(function ($query) {
                $query->where('is_archived', false)->orWhereNull('is_archived');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'language', 'whatsapp_connection_id']);

        $segments = ContactSegment::query()
            ->where('account_id', $account->id)
            ->orderBy('name')
            ->get(['id', 'name', 'contact_count']);

        return Inertia::render('Broadcasts/Sequences/Create', [
            'connections' => $connections,
            'templates' => $templates,
            'segments' => $segments,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'whatsapp_connection_id' => [
                'required',
                Rule::exists('whatsapp_connections', 'id')->where('account_id', $account->id),
            ],
            'audience_type' => 'required|in:contacts,segment,custom',
            'audience_filters' => 'nullable|array',
            'audience_filters.segment_ids' => 'required_if:audience_type,segment|nullable|array|min:1',
            'audience_filters.segment_ids.*' => [
                'integer',
                Rule::exists('contact_segments', 'id')->where('account_id', $account->id),
            ],
            'custom_recipients' => 'required_if:audience_type,custom|nullable|array|min:1',
            'custom_recipients.*.phone' => 'nullable|string|max:50',
            'custom_recipients.*.name' => 'nullable|string|max:255',
            'steps' => 'required|array|min:1',
            'steps.*.type' => 'required|in:text,template',
            'steps.*.delay_minutes' => 'nullable|integer|min:0|max:43200',
            'steps.*.message_text' => 'nullable|string|max:4096',
            'steps.*.whatsapp_template_id' => [
                'nullable',
                Rule::exists('whatsapp_templates', 'id')->where(function (Builder $query) use ($account) {
                    $query->where('account_id', $account->id)
                        ->whereIn(DB::raw('LOWER(TRIM(status))'), ['approved', 'active'])
                        ->where(function ($inner) {
                            $inner->where('is_archived', false)->orWhereNull('is_archived');
                        });
                }),
            ],
            'steps.*.template_params' => 'nullable|array',
            'steps.*.template_params.*' => 'nullable|string|max:1024',
        ]);

        foreach ($validated['steps'] as $index => $step) {
            if (($step['type'] ?? null) === 'text' && trim((string) ($step['message_text'] ?? '')) === '') {
                return back()->withErrors(["steps.$index.message_text" => 'Text steps need a message.'])->withInput();
            }
            if (($step['type'] ?? null) === 'template' && empty($step['whatsapp_template_id'])) {
                return back()->withErrors(["steps.$index.whatsapp_template_id" => 'Template steps need a template.'])->withInput();
            }
        }

        if (($validated['audience_type'] ?? null) === 'custom') {
            $validated['custom_recipients'] = array_values(array_filter(
                $validated['custom_recipients'] ?? [],
                fn (array $recipient) => trim((string) ($recipient['phone'] ?? '')) !== ''
            ));

            if (empty($validated['custom_recipients'])) {
                return back()->withErrors(['custom_recipients' => 'Add at least one recipient phone number.'])->withInput();
            }
        }

        $sequence = $this->sequenceService->createSequence($account, $request->user(), $validated);

        return redirect()
            ->route('app.broadcasts.sequences.show', ['sequence' => $sequence->slug])
            ->with('success', 'Sequence created.');
    }

    public function show(Request $request, CampaignSequence $sequence): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($sequence->account_id, $account->id)) {
            abort(404);
        }

        $sequence->load([
            'connection',
            'creator',
            'steps.template',
            'enrollments' => fn ($query) => $query->latest('id')->limit(50),
        ]);

        return Inertia::render('Broadcasts/Sequences/Show', [
            'sequence' => [
                'id' => $sequence->id,
                'slug' => $sequence->slug,
                'name' => $sequence->name,
                'description' => $sequence->description,
                'status' => $sequence->status,
                'audience_type' => $sequence->audience_type,
                'activated_at' => $sequence->activated_at?->toIso8601String(),
                'paused_at' => $sequence->paused_at?->toIso8601String(),
                'enrolled_count' => $sequence->enrolled_count,
                'active_enrollment_count' => $sequence->active_enrollment_count,
                'completed_enrollment_count' => $sequence->completed_enrollment_count,
                'failed_enrollment_count' => $sequence->failed_enrollment_count,
                'connection' => $sequence->connection ? [
                    'id' => $sequence->connection->id,
                    'name' => $sequence->connection->name,
                ] : null,
                'steps' => $sequence->steps->map(fn ($step) => [
                    'id' => $step->id,
                    'step_order' => $step->step_order,
                    'delay_minutes' => $step->delay_minutes,
                    'type' => $step->type,
                    'message_text' => $step->message_text,
                    'template' => $step->template ? [
                        'id' => $step->template->id,
                        'name' => $step->template->name,
                    ] : null,
                ])->values(),
                'enrollments' => $sequence->enrollments->map(fn ($enrollment) => [
                    'id' => $enrollment->id,
                    'name' => $enrollment->name,
                    'wa_id' => $enrollment->wa_id,
                    'status' => $enrollment->status,
                    'sent_steps_count' => $enrollment->sent_steps_count,
                    'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                    'last_step_sent_at' => $enrollment->last_step_sent_at?->toIso8601String(),
                    'failure_reason' => $enrollment->failure_reason,
                ])->values(),
            ],
        ]);
    }

    public function activate(Request $request, CampaignSequence $sequence): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($sequence->account_id, $account->id)) {
            abort(404);
        }

        $this->sequenceService->activateSequence($sequence);

        return back()->with('success', 'Sequence activated.');
    }

    public function pause(Request $request, CampaignSequence $sequence): RedirectResponse
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($sequence->account_id, $account->id)) {
            abort(404);
        }

        $this->sequenceService->pauseSequence($sequence);

        return back()->with('success', 'Sequence paused.');
    }
}
