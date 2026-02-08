<?php

namespace App\Modules\Contacts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SegmentController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $segments = ContactSegment::where('account_id', $account->id)
            ->orderBy('name')
            ->get()
            ->map(fn ($seg) => [
                'id' => $seg->id,
                'name' => $seg->name,
                'description' => $seg->description,
                'contact_count' => $seg->contact_count,
                'last_calculated_at' => $seg->last_calculated_at?->toIso8601String(),
                'filters' => $seg->filters,
                'created_at' => $seg->created_at->toIso8601String(),
            ]);

        return Inertia::render('Contacts/Segments/Index', [
            'account' => $account,
            'segments' => $segments,
        ]);
    }

    public function create(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $filterFields = [
            ['value' => 'name', 'label' => 'Name'],
            ['value' => 'wa_id', 'label' => 'WhatsApp ID'],
            ['value' => 'email', 'label' => 'Email'],
            ['value' => 'phone', 'label' => 'Phone'],
            ['value' => 'company', 'label' => 'Company'],
            ['value' => 'status', 'label' => 'Status'],
            ['value' => 'source', 'label' => 'Source'],
        ];

        return Inertia::render('Contacts/Segments/Create', [
            'account' => $account,
            'filter_fields' => $filterFields,
        ]);
    }

    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'filters' => 'nullable|array',
            'filters.*.field' => 'required|string|max:100',
            'filters.*.operator' => 'required|string|in:equals,not_equals,contains,not_contains,starts_with,ends_with,greater_than,less_than,is_empty,is_not_empty',
            'filters.*.value' => 'nullable|string|max:500',
        ]);

        $segment = ContactSegment::create([
            'account_id' => $account->id,
            'created_by' => $request->user()->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'filters' => $validated['filters'] ?? [],
        ]);

        $segment->calculateContactCount();

        return redirect()->route('app.contacts.segments.index')->with('success', 'Segment created successfully.');
    }

    public function show(Request $request, ContactSegment $segment): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ((int) $segment->account_id !== (int) $account->id) {
            abort(404);
        }

        $segment->calculateContactCount();

        $contacts = $segment->contactsQuery()
            ->with('tags:id,name,color')
            ->orderBy('updated_at', 'desc')
            ->paginate(20)
            ->through(fn ($c) => [
                'id' => $c->id,
                'slug' => $c->slug,
                'wa_id' => $c->wa_id,
                'name' => $c->name,
                'email' => $c->email,
                'company' => $c->company,
                'status' => $c->status ?? 'active',
                'tags' => $c->tags->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'color' => $t->color]),
                'last_contacted_at' => $c->last_contacted_at?->toIso8601String(),
                'created_at' => $c->created_at->toIso8601String(),
            ]);

        return Inertia::render('Contacts/Segments/Show', [
            'account' => $account,
            'segment' => [
                'id' => $segment->id,
                'name' => $segment->name,
                'description' => $segment->description,
                'contact_count' => $segment->contact_count,
                'filters' => $segment->filters,
                'last_calculated_at' => $segment->last_calculated_at?->toIso8601String(),
            ],
            'contacts' => $contacts,
        ]);
    }

    public function edit(Request $request, ContactSegment $segment): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ((int) $segment->account_id !== (int) $account->id) {
            abort(404);
        }

        $filterFields = [
            ['value' => 'name', 'label' => 'Name'],
            ['value' => 'wa_id', 'label' => 'WhatsApp ID'],
            ['value' => 'email', 'label' => 'Email'],
            ['value' => 'phone', 'label' => 'Phone'],
            ['value' => 'company', 'label' => 'Company'],
            ['value' => 'status', 'label' => 'Status'],
            ['value' => 'source', 'label' => 'Source'],
        ];

        return Inertia::render('Contacts/Segments/Edit', [
            'account' => $account,
            'segment' => [
                'id' => $segment->id,
                'name' => $segment->name,
                'description' => $segment->description,
                'filters' => $segment->filters ?? [],
            ],
            'filter_fields' => $filterFields,
        ]);
    }

    public function update(Request $request, ContactSegment $segment)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ((int) $segment->account_id !== (int) $account->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'filters' => 'nullable|array',
            'filters.*.field' => 'required|string|max:100',
            'filters.*.operator' => 'required|string|in:equals,not_equals,contains,not_contains,starts_with,ends_with,greater_than,less_than,is_empty,is_not_empty',
            'filters.*.value' => 'nullable|string|max:500',
        ]);

        $segment->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'filters' => $validated['filters'] ?? [],
        ]);

        $segment->calculateContactCount();

        return redirect()->route('app.contacts.segments.show', $segment)->with('success', 'Segment updated successfully.');
    }

    public function destroy(Request $request, ContactSegment $segment)
    {
        $account = $request->attributes->get('account') ?? current_account();

        if ((int) $segment->account_id !== (int) $account->id) {
            abort(404);
        }

        $segment->delete();

        return redirect()->route('app.contacts.segments.index')->with('success', 'Segment deleted successfully.');
    }

    public function recalculate(ContactSegment $segment)
    {
        $account = request()->attributes->get('account') ?? current_account();

        if ((int) $segment->account_id !== (int) $account->id) {
            abort(404);
        }

        $segment->calculateContactCount();

        return back()->with('success', 'Segment count recalculated.');
    }
}
