<?php

namespace App\Modules\Contacts\Models;

use App\Models\User;
use App\Models\Account;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class ContactSegment extends Model
{
    use HasFactory;

    protected $table = 'contact_segments';

    protected $fillable = [
        'account_id',
        'created_by',
        'name',
        'description',
        'filters',
        'contact_count',
        'last_calculated_at'];

    protected $casts = [
        'filters' => 'array',
        'last_calculated_at' => 'datetime'];

    /**
     * Get the account.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * Get the user who created the segment.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get contacts in this segment.
     */
    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(WhatsAppContact::class, 'contact_segment_contact', 'contact_segment_id', 'contact_id')
            ->withTimestamps();
    }

    /**
     * Build a contacts query for this segment.
     */
    public function contactsQuery(): Builder
    {
        $query = WhatsAppContact::where('account_id', $this->account_id);

        if (!empty($this->filters)) {
            return $this->applyFilters($query, $this->filters);
        }

        // If no filters, fall back to explicit segment membership if present.
        if ($this->contacts()->exists()) {
            return $query->whereIn('id', $this->contacts()->select('whatsapp_contacts.id'));
        }

        return $query;
    }

    /**
     * Calculate and update contact count based on filters.
     * Uses lock to prevent concurrent calculations.
     */
    public function calculateContactCount(): int
    {
        // Use lock to prevent concurrent calculations
        $lockKey = "segment_calculate:{$this->id}";
        $lock = \Illuminate\Support\Facades\Cache::lock($lockKey, 60); // 1 minute lock

        if (!$lock->get()) {
            // Return cached count if calculation is in progress
            return $this->contact_count;
        }

        try {
            $query = $this->contactsQuery();

            $count = $query->count();
            $this->lockForUpdate()->update([
                'contact_count' => $count,
                'last_calculated_at' => now()]);

            return $count;
        } finally {
            $lock->release();
        }
    }

    /**
     * Apply filters to query.
     */
    protected function applyFilters($query, array $filters)
    {
        foreach ($filters as $filter) {
            $field = $filter['field'] ?? null;
            $operator = $filter['operator'] ?? 'equals';
            $value = $filter['value'] ?? null;

            if (!$field || $value === null) {
                continue;
            }

            switch ($operator) {
                case 'equals':
                    $query->where($field, $value);
                    break;
                case 'not_equals':
                    $query->where($field, '!=', $value);
                    break;
                case 'contains':
                    $query->where($field, 'like', "%{$value}%");
                    break;
                case 'not_contains':
                    $query->where($field, 'not like', "%{$value}%");
                    break;
                case 'starts_with':
                    $query->where($field, 'like', "{$value}%");
                    break;
                case 'ends_with':
                    $query->where($field, 'like', "%{$value}");
                    break;
                case 'greater_than':
                    $query->where($field, '>', $value);
                    break;
                case 'less_than':
                    $query->where($field, '<', $value);
                    break;
                case 'is_empty':
                    $query->whereNull($field)->orWhere($field, '');
                    break;
                case 'is_not_empty':
                    $query->whereNotNull($field)->where($field, '!=', '');
                    break;
            }
        }

        return $query;
    }
}
