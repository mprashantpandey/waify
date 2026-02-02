<?php

namespace App\Modules\Contacts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Contacts\Models\ContactActivity;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\Contacts\Models\ContactTag;
use App\Modules\Contacts\Services\ContactService;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(
        protected ContactService $contactService
    ) {
    }

    /**
     * Display a listing of contacts.
     */
    public function index(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $query = WhatsAppContact::where('workspace_id', $workspace->id)
            ->with(['tags', 'segments']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('wa_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by tags
        if ($request->has('tags') && !empty($request->tags)) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->whereIn('contact_tags.id', $request->tags);
            });
        }

        // Filter by segments
        if ($request->has('segments') && !empty($request->segments)) {
            $query->whereHas('segments', function ($q) use ($request) {
                $q->whereIn('contact_segments.id', $request->segments);
            });
        }

        $contacts = $query->orderBy('created_at', 'desc')
            ->paginate(50)
            ->through(function ($contact) {
                return [
                    'id' => $contact->id,
                    'slug' => $contact->slug,
                    'wa_id' => $contact->wa_id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'company' => $contact->company,
                    'status' => $contact->status ?? 'active',
                    'message_count' => $contact->message_count ?? 0,
                    'last_seen_at' => $contact->last_seen_at?->toIso8601String(),
                    'last_contacted_at' => $contact->last_contacted_at?->toIso8601String(),
                    'tags' => $contact->tags->map(function ($tag) {
                        return [
                            'id' => $tag->id,
                            'name' => $tag->name,
                            'color' => $tag->color,
                        ];
                    }),
                    'created_at' => $contact->created_at->toIso8601String(),
                ];
            });

        // Get available tags and segments for filters
        $tags = ContactTag::where('workspace_id', $workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        $segments = ContactSegment::where('workspace_id', $workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'contact_count']);

        return Inertia::render('Contacts/Index', [
            'workspace' => $workspace,
            'contacts' => $contacts,
            'tags' => $tags,
            'segments' => $segments,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'tags' => $request->tags ?? [],
                'segments' => $request->segments ?? [],
            ],
        ]);
    }

    /**
     * Show the form for creating a new contact.
     */
    public function create(Request $request): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $tags = ContactTag::where('workspace_id', $workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Contacts/Create', [
            'workspace' => $workspace,
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created contact.
     */
    public function store(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $validated = $request->validate([
            'wa_id' => 'required|string',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,blocked,opt_out',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:contact_tags,id',
        ]);

        $contact = $this->contactService->createOrUpdateContact(
            $validated,
            $workspace->id,
            $request->user()->id
        );

        // Add tags if provided
        if (isset($validated['tags']) && !empty($validated['tags'])) {
            $this->contactService->addTags($contact, $validated['tags']);
        }

        return redirect()->route('app.contacts.show', [
            'workspace' => $workspace->slug,
            'contact' => $contact->slug,
        ])->with('success', 'Contact created successfully.');
    }

    /**
     * Display the specified contact.
     */
    public function show(Request $request, WhatsAppContact $contact): Response
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($contact->workspace_id !== $workspace->id) {
            abort(404);
        }

        $contact->load(['tags', 'segments', 'conversations' => function ($query) {
            $query->orderBy('last_message_at', 'desc')->limit(10);
        }]);

        $activities = ContactActivity::where('contact_id', $contact->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                    ] : null,
                    'created_at' => $activity->created_at->toIso8601String(),
                ];
            });

        $tags = ContactTag::where('workspace_id', $workspace->id)
            ->orderBy('name')
            ->get(['id', 'name', 'color']);

        return Inertia::render('Contacts/Show', [
            'workspace' => $workspace,
            'contact' => [
                'id' => $contact->id,
                'slug' => $contact->slug,
                'wa_id' => $contact->wa_id,
                'name' => $contact->name,
                'email' => $contact->email,
                'phone' => $contact->phone,
                'company' => $contact->company,
                'notes' => $contact->notes,
                'status' => $contact->status ?? 'active',
                'source' => $contact->source,
                'message_count' => $contact->message_count ?? 0,
                'last_seen_at' => $contact->last_seen_at?->toIso8601String(),
                'last_contacted_at' => $contact->last_contacted_at?->toIso8601String(),
                'tags' => $contact->tags->map(function ($tag) {
                    return [
                        'id' => $tag->id,
                        'name' => $tag->name,
                        'color' => $tag->color,
                    ];
                }),
                'segments' => $contact->segments->map(function ($segment) {
                    return [
                        'id' => $segment->id,
                        'name' => $segment->name,
                    ];
                }),
                'created_at' => $contact->created_at->toIso8601String(),
            ],
            'activities' => $activities,
            'tags' => $tags,
        ]);
    }

    /**
     * Update the specified contact.
     */
    public function update(Request $request, WhatsAppContact $contact)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($contact->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:active,inactive,blocked,opt_out',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:contact_tags,id',
        ]);

        $contact->update($validated);

        // Sync tags
        if (isset($validated['tags'])) {
            $contact->tags()->sync($validated['tags']);
        }

        ContactActivity::create([
            'workspace_id' => $workspace->id,
            'contact_id' => $contact->id,
            'user_id' => $request->user()->id,
            'type' => 'contact_updated',
            'title' => 'Contact updated',
            'description' => 'Contact information was updated',
        ]);

        return back()->with('success', 'Contact updated successfully.');
    }

    /**
     * Add note to contact.
     */
    public function addNote(Request $request, WhatsAppContact $contact)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($contact->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'note' => 'required|string',
        ]);

        $this->contactService->addNote($contact, $validated['note'], $request->user()->id);

        return back()->with('success', 'Note added successfully.');
    }

    /**
     * Import contacts from CSV.
     */
    public function import(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('imports');

        try {
            $result = $this->contactService->importFromCsv(
                storage_path("app/{$path}"),
                $workspace->id,
                $request->user()->id
            );

            Storage::delete($path);

            return back()->with('success', "Import completed: {$result['imported']} imported, {$result['updated']} updated.");
        } catch (\Exception $e) {
            Storage::delete($path);
            return back()->withErrors(['error' => 'Import failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Export contacts to CSV.
     */
    public function export(Request $request)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        $filters = [
            'tags' => $request->tags ?? [],
            'segments' => $request->segments ?? [],
            'status' => $request->status,
        ];

        $filename = $this->contactService->exportToCsv($workspace->id, $filters);

        return response()->download($filename)->deleteFileAfterSend();
    }

    /**
     * Merge duplicate contacts.
     */
    public function merge(Request $request, WhatsAppContact $contact)
    {
        $workspace = $request->attributes->get('workspace') ?? current_workspace();

        if ($contact->workspace_id !== $workspace->id) {
            abort(404);
        }

        $validated = $request->validate([
            'duplicate_ids' => 'required|array',
            'duplicate_ids.*' => 'exists:whatsapp_contacts,id',
        ]);

        try {
            $this->contactService->mergeContacts($contact, $validated['duplicate_ids']);

            return redirect()->route('app.contacts.show', [
                'workspace' => $workspace->slug,
                'contact' => $contact->id,
            ])->with('success', 'Contacts merged successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to merge contacts: ' . $e->getMessage()]);
        }
    }
}
