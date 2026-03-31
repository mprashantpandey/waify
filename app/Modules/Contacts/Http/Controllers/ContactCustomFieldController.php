<?php

namespace App\Modules\Contacts\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Contacts\Models\ContactCustomField;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ContactCustomFieldController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $fields = ContactCustomField::query()
            ->where('account_id', $account->id)
            ->orderBy('order')
            ->orderBy('id')
            ->get()
            ->map(fn (ContactCustomField $field) => [
                'id' => $field->id,
                'key' => $field->key,
                'name' => $field->name,
                'type' => $field->type,
                'options' => $field->options ?? [],
                'required' => (bool) $field->required,
                'order' => (int) $field->order,
            ]);

        return Inertia::render('Contacts/Fields/Index', [
            'account' => $account,
            'fields' => $fields,
            'field_types' => [
                ['value' => 'text', 'label' => 'Text'],
                ['value' => 'textarea', 'label' => 'Long text'],
                ['value' => 'number', 'label' => 'Number'],
                ['value' => 'date', 'label' => 'Date'],
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'phone', 'label' => 'Phone'],
                ['value' => 'boolean', 'label' => 'Yes / No'],
                ['value' => 'select', 'label' => 'Select'],
                ['value' => 'multiselect', 'label' => 'Multi-select'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,number,date,email,phone,boolean,select,multiselect',
            'options' => 'nullable|array',
            'options.*' => 'nullable|string|max:255',
            'required' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0|max:999',
        ]);

        $key = $this->makeUniqueKey($account->id, $validated['name']);
        $options = $this->normalizeOptions($validated['type'], $validated['options'] ?? []);

        ContactCustomField::create([
            'account_id' => $account->id,
            'key' => $key,
            'name' => trim($validated['name']),
            'type' => $validated['type'],
            'options' => $options,
            'required' => (bool) ($validated['required'] ?? false),
            'order' => (int) ($validated['order'] ?? 0),
        ]);

        return back()->with('success', 'Custom field added.');
    }

    public function update(Request $request, ContactCustomField $field)
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($field->account_id, $account->id)) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,number,date,email,phone,boolean,select,multiselect',
            'options' => 'nullable|array',
            'options.*' => 'nullable|string|max:255',
            'required' => 'nullable|boolean',
            'order' => 'nullable|integer|min:0|max:999',
        ]);

        $field->update([
            'name' => trim($validated['name']),
            'type' => $validated['type'],
            'options' => $this->normalizeOptions($validated['type'], $validated['options'] ?? []),
            'required' => (bool) ($validated['required'] ?? false),
            'order' => (int) ($validated['order'] ?? 0),
        ]);

        return back()->with('success', 'Custom field updated.');
    }

    public function destroy(Request $request, ContactCustomField $field)
    {
        $account = $request->attributes->get('account') ?? current_account();
        if (!account_ids_match($field->account_id, $account->id)) {
            abort(404);
        }

        $key = $field->key;
        $field->delete();

        \App\Modules\WhatsApp\Models\WhatsAppContact::query()
            ->where('account_id', $account->id)
            ->get()
            ->each(function ($contact) use ($key): void {
                $custom = $contact->custom_fields ?? [];
                if (array_key_exists($key, $custom)) {
                    unset($custom[$key]);
                    $contact->forceFill(['custom_fields' => $custom])->save();
                }
            });

        return back()->with('success', 'Custom field deleted.');
    }

    private function makeUniqueKey(int $accountId, string $name): string
    {
        $base = Str::slug($name, '_');
        if ($base === '') {
            $base = 'field';
        }

        $key = $base;
        $suffix = 2;
        while (ContactCustomField::query()->where('account_id', $accountId)->where('key', $key)->exists()) {
            $key = "{$base}_{$suffix}";
            $suffix++;
        }

        return $key;
    }

    private function normalizeOptions(string $type, array $options): ?array
    {
        if (!in_array($type, ['select', 'multiselect'], true)) {
            return null;
        }

        $clean = collect($options)
            ->map(fn ($option) => is_string($option) ? trim($option) : '')
            ->filter()
            ->values()
            ->all();

        return $clean === [] ? null : $clean;
    }
}
