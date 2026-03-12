<?php

namespace App\Modules\Contacts\Services;

use App\Modules\Contacts\Models\ContactActivity;
use App\Modules\Contacts\Models\ContactSegment;
use App\Modules\Contacts\Models\ContactTag;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ContactService
{
    /**
     * Create or update a contact.
     */
    public function createOrUpdateContact(array $data, int $accountId, ?int $userId = null): WhatsAppContact
    {
        $data = $this->applyConsentRules($data);
        if (($data['status'] ?? null) === 'opt_out') {
            $data['do_not_contact'] = true;
            $data['opted_out_at'] = $data['opted_out_at'] ?? now();
        }
        if (($data['status'] ?? null) === 'active' && ($data['do_not_contact'] ?? null) === false) {
            $data['opted_in_at'] = $data['opted_in_at'] ?? now();
        }

        $contact = WhatsAppContact::updateOrCreate(
            [
                'account_id' => $accountId,
                'wa_id' => $data['wa_id'] ?? $data['phone'] ?? null],
            array_merge($data, [
                'account_id' => $accountId,
                'source' => $data['source'] ?? 'manual'])
        );

        // Log activity
        if ($userId) {
            ContactActivity::create([
                'account_id' => $accountId,
                'contact_id' => $contact->id,
                'user_id' => $userId,
                'type' => $contact->wasRecentlyCreated ? 'contact_created' : 'contact_updated',
                'title' => $contact->wasRecentlyCreated ? 'Contact created' : 'Contact updated',
                'description' => $contact->wasRecentlyCreated
                    ? "Contact {$contact->name} was created"
                    : "Contact {$contact->name} was updated"]);
        }

        return $contact;
    }

    /**
     * Add tags to a contact.
     */
    public function addTags(WhatsAppContact $contact, array $tagIds): void
    {
        $contact->tags()->syncWithoutDetaching($tagIds);

        ContactActivity::create([
            'account_id' => $contact->account_id,
            'contact_id' => $contact->id,
            'type' => 'tag_added',
            'title' => 'Tags added',
            'description' => 'Tags were added to contact']);
    }

    /**
     * Remove tags from a contact.
     */
    public function removeTags(WhatsAppContact $contact, array $tagIds): void
    {
        $contact->tags()->detach($tagIds);

        ContactActivity::create([
            'account_id' => $contact->account_id,
            'contact_id' => $contact->id,
            'type' => 'tag_removed',
            'title' => 'Tags removed',
            'description' => 'Tags were removed from contact']);
    }

    /**
     * Add note to contact.
     */
    public function addNote(WhatsAppContact $contact, string $note, ?int $userId = null): void
    {
        $existingNotes = $contact->notes ?? '';
        $newNotes = $existingNotes ? "{$existingNotes}\n\n{$note}" : $note;

        $contact->update(['notes' => $newNotes]);

        ContactActivity::create([
            'account_id' => $contact->account_id,
            'contact_id' => $contact->id,
            'user_id' => $userId,
            'type' => 'note_added',
            'title' => 'Note added',
            'description' => $note]);
    }

    /**
     * Merge duplicate contacts.
     * Uses lock to prevent concurrent merges.
     */
    public function mergeContacts(WhatsAppContact $primaryContact, array $duplicateIds): WhatsAppContact
    {
        // Use lock to prevent concurrent merges
        $lockKey = "contact_merge:{$primaryContact->id}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 300); // 5 minute lock

        if (!$lock->get()) {
            throw new \Exception('Contact merge is already in progress.');
        }

        try {
            return $this->performMerge($primaryContact, $duplicateIds);
        } finally {
            $lock->release();
        }
    }

    /**
     * Perform the actual merge operation.
     */
    protected function performMerge(WhatsAppContact $primaryContact, array $duplicateIds): WhatsAppContact
    {
        DB::beginTransaction();

        try {
            // Get all duplicate contacts (with lock)
            $duplicates = WhatsAppContact::whereIn('id', $duplicateIds)
                ->where('account_id', $primaryContact->account_id)
                ->where('id', '!=', $primaryContact->id)
                ->lockForUpdate()
                ->get();

            foreach ($duplicates as $duplicate) {
                // Merge tags
                $duplicate->tags()->each(function ($tag) use ($primaryContact) {
                    $primaryContact->tags()->syncWithoutDetaching([$tag->id]);
                });

                // Merge segments
                $duplicate->segments()->each(function ($segment) use ($primaryContact) {
                    $primaryContact->segments()->syncWithoutDetaching([$segment->id]);
                });

                // Update conversations to point to primary contact
                $duplicate->conversations()->update(['whatsapp_contact_id' => $primaryContact->id]);

                // Merge metadata
                $primaryMetadata = $primaryContact->metadata ?? [];
                $duplicateMetadata = $duplicate->metadata ?? [];
                $primaryContact->update([
                    'metadata' => array_merge($primaryMetadata, $duplicateMetadata)]);

                // Log merge activity
                ContactActivity::create([
                    'account_id' => $primaryContact->account_id,
                    'contact_id' => $primaryContact->id,
                    'type' => 'contact_merged',
                    'title' => 'Contact merged',
                    'description' => "Contact {$duplicate->name} ({$duplicate->wa_id}) was merged into this contact",
                    'metadata' => ['merged_contact_id' => $duplicate->id]]);

                // Delete duplicate
                $duplicate->delete();
            }

            DB::commit();

            return $primaryContact->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to merge contacts', [
                'primary_contact_id' => $primaryContact->id,
                'duplicate_ids' => $duplicateIds,
                'error' => $e->getMessage()]);

            throw $e;
        }
    }

    /**
     * Import contacts from CSV.
     * Uses lock to prevent concurrent imports.
     */
    public function importFromCsv(string $filePath, int $accountId, ?int $userId = null): array
    {
        // Use cache lock to prevent concurrent imports for the same account
        $lockKey = "contact_import:account:{$accountId}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 600); // 10 minute lock

        if (!$lock->get()) {
            throw new \Exception('Contact import is already in progress for this account. Please wait.');
        }

        try {
            return $this->performImport($filePath, $accountId, $userId);
        } finally {
            $lock->release();
        }
    }

    /**
     * Perform the actual import operation.
     */
    protected function performImport(string $filePath, int $accountId, ?int $userId = null): array
    {
        $imported = 0;
        $updated = 0;
        $errors = [];

        $handle = fopen($filePath, 'r');
        if (!$handle) {
            throw new \Exception('Failed to open CSV file');
        }

        // Read header row
        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            throw new \Exception('CSV file is empty or invalid');
        }

        // Map headers to contact fields
        $headerMap = [
            'wa_id' => ['wa_id', 'whatsapp_id', 'phone', 'phone_number'],
            'name' => ['name', 'full_name', 'contact_name'],
            'email' => ['email', 'email_address'],
            'phone' => ['phone', 'phone_number', 'mobile'],
            'company' => ['company', 'organization', 'org'],
            'notes' => ['notes', 'note', 'description'],
            'status' => ['status'],
            'do_not_contact' => ['do_not_contact', 'dnc', 'suppressed'],
            'opted_in_at' => ['opted_in_at', 'opt_in_at'],
            'opt_in_source' => ['opt_in_source'],
            'opt_in_notes' => ['opt_in_notes'],
            'opted_out_at' => ['opted_out_at', 'opt_out_at'],
            'opt_out_reason' => ['opt_out_reason'],
            'opt_out_channel' => ['opt_out_channel'],
            'consent_status' => ['consent_status', 'consent', 'opt_status'],
        ];

        $columnIndexes = [];
        foreach ($headerMap as $field => $possibleHeaders) {
            foreach ($possibleHeaders as $possibleHeader) {
                $index = array_search(strtolower($possibleHeader), array_map('strtolower', $headers));
                if ($index !== false) {
                    $columnIndexes[$field] = $index;
                    break;
                }
            }
        }

        $rowNumber = 1;
        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;

            try {
                $data = [];
                foreach ($columnIndexes as $field => $index) {
                    if (isset($row[$index]) && $row[$index] !== '') {
                        $data[$field] = trim($row[$index]);
                    }
                }

                if (isset($data['status'])) {
                    $status = strtolower(trim((string) $data['status']));
                    if (!in_array($status, ['active', 'inactive', 'blocked', 'opt_out'], true)) {
                        unset($data['status']);
                    } else {
                        $data['status'] = $status;
                    }
                }

                if (isset($data['do_not_contact'])) {
                    $parsed = $this->parseBoolean((string) $data['do_not_contact']);
                    if ($parsed === null) {
                        unset($data['do_not_contact']);
                    } else {
                        $data['do_not_contact'] = $parsed;
                    }
                }

                foreach (['opted_in_at', 'opted_out_at'] as $dateField) {
                    if (isset($data[$dateField])) {
                        try {
                            $data[$dateField] = Carbon::parse((string) $data[$dateField]);
                        } catch (\Throwable $e) {
                            unset($data[$dateField]);
                        }
                    }
                }

                if (empty($data['wa_id']) && empty($data['phone'])) {
                    $errors[] = "Row {$rowNumber}: Missing phone number or WhatsApp ID";
                    continue;
                }

                $data['wa_id'] = $this->normalizeWaId((string) ($data['wa_id'] ?? $data['phone'] ?? ''));
                if ($data['wa_id'] === null) {
                    $errors[] = "Row {$rowNumber}: Invalid phone number/WhatsApp ID format";
                    continue;
                }
                $data = $this->applyConsentRules($data);
                $data['source'] = 'csv_import';

                // Use transaction and lock to prevent race conditions
                \DB::transaction(function () use ($accountId, $data, $userId, &$imported, &$updated) {
                    $contact = WhatsAppContact::where('account_id', $accountId)
                        ->where('wa_id', $data['wa_id'])
                        ->lockForUpdate() // Row-level lock
                        ->first();

                    if ($contact) {
                        $contact->update($data);
                        $updated++;
                    } else {
                        $this->createOrUpdateContact($data, $accountId, $userId);
                        $imported++;
                    }
                });
            } catch (\Exception $e) {
                $errors[] = "Row {$rowNumber}: {$e->getMessage()}";
            }
        }

        fclose($handle);

        return [
            'imported' => $imported,
            'updated' => $updated,
            'errors' => $errors];
    }

    /**
     * Export contacts to CSV.
     * Uses lock to prevent concurrent exports.
     */
    public function exportToCsv(int $accountId, array $filters = []): string
    {
        // Use lock to prevent concurrent exports
        $lockKey = "contact_export:account:{$accountId}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 300); // 5 minute lock

        if (!$lock->get()) {
            throw new \Exception('Contact export is already in progress for this account. Please wait.');
        }

        try {
            return $this->performExport($accountId, $filters);
        } finally {
            $lock->release();
        }
    }

    /**
     * Perform the actual export operation.
     */
    protected function performExport(int $accountId, array $filters = []): string
    {
        $query = WhatsAppContact::where('account_id', $accountId);

        // Apply filters
        if (isset($filters['tags']) && !empty($filters['tags'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->whereIn('contact_tags.id', $filters['tags']);
            });
        }

        if (isset($filters['segments']) && !empty($filters['segments'])) {
            $query->whereHas('segments', function ($q) use ($filters) {
                $q->whereIn('contact_segments.id', $filters['segments']);
            });
        }

        if (isset($filters['status']) && $filters['status']) {
            $query->where('status', $filters['status']);
        }

        $contacts = $query->with('tags')->get();

        // Use unique filename with account ID and timestamp to prevent conflicts
        $filename = storage_path("app/contacts_export_{$accountId}_" . time() . '_' . uniqid() . '.csv');
        $handle = fopen($filename, 'w');

        // Write header
        fputcsv($handle, [
            'wa_id',
            'name',
            'email',
            'phone',
            'company',
            'status',
            'do_not_contact',
            'opted_in_at',
            'opt_in_source',
            'opted_out_at',
            'opt_out_reason',
            'opt_out_channel',
            'tags',
            'notes',
            'created_at',
        ]);

        // Write rows
        foreach ($contacts as $contact) {
            $tags = $contact->tags->pluck('name')->join(', ');
            fputcsv($handle, [
                $contact->wa_id,
                $contact->name ?? '',
                $contact->email ?? '',
                $contact->phone ?? '',
                $contact->company ?? '',
                $contact->status ?? 'active',
                $contact->do_not_contact ? '1' : '0',
                optional($contact->opted_in_at)->toDateTimeString(),
                $contact->opt_in_source ?? '',
                optional($contact->opted_out_at)->toDateTimeString(),
                $contact->opt_out_reason ?? '',
                $contact->opt_out_channel ?? '',
                $tags,
                $contact->notes ?? '',
                $contact->created_at->toDateTimeString()]);
        }

        fclose($handle);

        return $filename;
    }

    /**
     * Find duplicate contacts.
     */
    public function findDuplicates(int $accountId, string $field = 'wa_id'): array
    {
        $duplicates = WhatsAppContact::where('account_id', $accountId)
            ->select($field, DB::raw('COUNT(*) as count'))
            ->groupBy($field)
            ->having('count', '>', 1)
            ->get();

        $groups = [];
        foreach ($duplicates as $duplicate) {
            $contacts = WhatsAppContact::where('account_id', $accountId)
                ->where($field, $duplicate->$field)
                ->get();

            $groups[] = $contacts;
        }

        return $groups;
    }

    /**
     * Recalculate segment contact counts.
     * Uses lock to prevent concurrent recalculations.
     */
    public function recalculateSegmentCounts(int $accountId): void
    {
        // Use lock to prevent concurrent recalculations
        $lockKey = "segment_recalculate:account:{$accountId}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 600); // 10 minute lock

        if (!$lock->get()) {
            throw new \Exception('Segment recalculation is already in progress for this account.');
        }

        try {
            $segments = ContactSegment::where('account_id', $accountId)->get();

            foreach ($segments as $segment) {
                $segment->calculateContactCount();
            }
        } finally {
            $lock->release();
        }
    }

    protected function normalizeWaId(string $value): ?string
    {
        $digits = preg_replace('/\D+/', '', trim($value)) ?? '';
        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '00')) {
            $digits = ltrim(substr($digits, 2), '0');
        }

        if (strlen($digits) < 6 || strlen($digits) > 20) {
            return null;
        }

        return $digits;
    }

    protected function parseBoolean(string $value): ?bool
    {
        $normalized = strtolower(trim($value));
        if ($normalized === '') {
            return null;
        }

        return match ($normalized) {
            '1', 'true', 'yes', 'y', 'opt_out', 'opted_out', 'suppressed', 'dnc' => true,
            '0', 'false', 'no', 'n', 'opt_in', 'opted_in', 'active' => false,
            default => null,
        };
    }

    /**
     * @param array<string,mixed> $data
     * @return array<string,mixed>
     */
    protected function applyConsentRules(array $data): array
    {
        $status = strtolower(trim((string) ($data['status'] ?? '')));
        $consentStatus = strtolower(trim((string) ($data['consent_status'] ?? '')));
        $doNotContact = array_key_exists('do_not_contact', $data) ? (bool) $data['do_not_contact'] : null;

        if (in_array($consentStatus, ['opted_out', 'opt_out', 'suppressed', 'unsubscribed', 'dnc'], true)) {
            $status = 'opt_out';
            $doNotContact = true;
        } elseif (in_array($consentStatus, ['opted_in', 'opt_in', 'consented'], true)) {
            $status = $status !== '' ? $status : 'active';
            $doNotContact = false;
        } elseif ($consentStatus === 'inactive' && $status === '') {
            $status = 'inactive';
        }

        if ($status === 'blocked') {
            $doNotContact = true;
        }

        if ($doNotContact === true && $status === '') {
            $status = 'opt_out';
        }

        if ($status === 'opt_out') {
            $data['do_not_contact'] = true;
            $data['opted_out_at'] = $data['opted_out_at'] ?? now();
            $data['opted_in_at'] = null;
        } elseif ($status === 'active' && $doNotContact === false) {
            $data['do_not_contact'] = false;
            $data['opted_in_at'] = $data['opted_in_at'] ?? now();
            $data['opted_out_at'] = null;
            $data['opt_out_reason'] = null;
            $data['opt_out_channel'] = null;
        } elseif ($doNotContact !== null) {
            $data['do_not_contact'] = $doNotContact;
        }

        if ($status !== '' && in_array($status, ['active', 'inactive', 'blocked', 'opt_out'], true)) {
            $data['status'] = $status;
        }

        unset($data['consent_status']);

        return $data;
    }
}
