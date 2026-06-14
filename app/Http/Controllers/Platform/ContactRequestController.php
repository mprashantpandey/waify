<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\ContactRequest;
use App\Modules\Contacts\Services\ContactService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['all', ContactRequest::STATUS_NEW, ContactRequest::STATUS_REVIEWED, ContactRequest::STATUS_CLOSED])],
            'per_page' => ['nullable', 'integer', 'min:10', 'max:50'],
        ]);

        $query = ContactRequest::query()
            ->with(['handler:id,name,email', 'convertedAccount:id,name,slug', 'convertedContact:id,name,email,wa_id,slug'])
            ->latest();

        if (($filters['status'] ?? 'all') !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['q'])) {
            $search = trim($filters['q']);
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $requests = $query
            ->paginate((int) ($filters['per_page'] ?? 15))
            ->withQueryString()
            ->through(fn (ContactRequest $contactRequest) => $this->requestPayload($contactRequest));

        return Inertia::render('Platform/ContactRequests/Index', [
            'requests' => $requests,
            'filters' => [
                'q' => $filters['q'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'per_page' => (int) ($filters['per_page'] ?? 15),
            ],
            'stats' => [
                'total' => ContactRequest::count(),
                'new' => ContactRequest::where('status', ContactRequest::STATUS_NEW)->count(),
                'reviewed' => ContactRequest::where('status', ContactRequest::STATUS_REVIEWED)->count(),
                'closed' => ContactRequest::where('status', ContactRequest::STATUS_CLOSED)->count(),
                'converted' => ContactRequest::whereNotNull('converted_at')->count(),
            ],
            'accounts' => Account::orderBy('name')->limit(200)->get(['id', 'name', 'slug']),
        ]);
    }

    public function update(Request $request, ContactRequest $contactRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([ContactRequest::STATUS_NEW, ContactRequest::STATUS_REVIEWED, ContactRequest::STATUS_CLOSED])],
        ]);

        $contactRequest->forceFill([
            'status' => $validated['status'],
            'handled_by' => $validated['status'] === ContactRequest::STATUS_NEW ? null : $request->user()?->id,
            'handled_at' => $validated['status'] === ContactRequest::STATUS_NEW ? null : now(),
        ])->save();

        return back()->with('success', 'Contact request updated.');
    }

    public function convert(Request $request, ContactRequest $contactRequest, ContactService $contacts): RedirectResponse
    {
        $validated = $request->validate([
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
        ]);

        if ($contactRequest->converted_contact_id) {
            return back()->with('info', 'This contact request has already been converted.');
        }

        $contact = DB::transaction(function () use ($request, $contactRequest, $contacts, $validated) {
            $accountId = (int) $validated['account_id'];
            $leadIdentifier = 'lead:'.sha1(strtolower($contactRequest->email).'|'.$contactRequest->id);

            $contact = $contacts->createOrUpdateContact([
                'wa_id' => $leadIdentifier,
                'name' => $contactRequest->name,
                'email' => $contactRequest->email,
                'source' => $contactRequest->source ?: 'public_contact',
                'notes' => trim("Public contact request: {$contactRequest->subject}\n\n{$contactRequest->message}"),
                'metadata' => [
                    'lead_source' => $contactRequest->source ?: 'public_contact',
                    'contact_request_id' => $contactRequest->id,
                    'contact_request_subject' => $contactRequest->subject,
                    'converted_from_platform_contact_request' => true,
                ],
            ], $accountId, $request->user()?->id);

            $contactRequest->forceFill([
                'status' => ContactRequest::STATUS_REVIEWED,
                'handled_by' => $request->user()?->id,
                'handled_at' => now(),
                'converted_account_id' => $accountId,
                'converted_contact_id' => $contact->id,
                'converted_at' => now(),
            ])->save();

            app(\App\Services\AppNotificationService::class)->workspace(
                $accountId,
                'lead_assigned',
                'New lead converted from public contact',
                "{$contactRequest->name} ({$contactRequest->email}) was converted into a workspace contact.",
                'info',
                route('app.contacts.index', ['contact' => $contact->slug]),
                ['contact_request_id' => $contactRequest->id, 'contact_id' => $contact->id],
                $request->user()
            );

            return $contact;
        });

        return back()->with('success', "Lead converted to contact {$contact->name}.");
    }

    public function destroy(ContactRequest $contactRequest): RedirectResponse
    {
        $contactRequest->delete();

        return back()->with('success', 'Contact request deleted.');
    }

    protected function requestPayload(ContactRequest $contactRequest): array
    {
        return [
            'id' => $contactRequest->id,
            'name' => $contactRequest->name,
            'email' => $contactRequest->email,
            'subject' => $contactRequest->subject,
            'message' => $contactRequest->message,
            'status' => $contactRequest->status,
            'source' => $contactRequest->source,
            'ip_address' => $contactRequest->ip_address,
            'user_agent' => $contactRequest->user_agent,
            'handled_at' => $contactRequest->handled_at?->toIso8601String(),
            'handler' => $contactRequest->handler ? [
                'id' => $contactRequest->handler->id,
                'name' => $contactRequest->handler->name,
                'email' => $contactRequest->handler->email,
            ] : null,
            'converted_at' => $contactRequest->converted_at?->toIso8601String(),
            'converted_account' => $contactRequest->convertedAccount ? [
                'id' => $contactRequest->convertedAccount->id,
                'name' => $contactRequest->convertedAccount->name,
                'slug' => $contactRequest->convertedAccount->slug,
            ] : null,
            'converted_contact' => $contactRequest->convertedContact ? [
                'id' => $contactRequest->convertedContact->id,
                'name' => $contactRequest->convertedContact->name,
                'email' => $contactRequest->convertedContact->email,
                'wa_id' => $contactRequest->convertedContact->wa_id,
                'slug' => $contactRequest->convertedContact->slug,
            ] : null,
            'created_at' => $contactRequest->created_at?->toIso8601String(),
        ];
    }
}
