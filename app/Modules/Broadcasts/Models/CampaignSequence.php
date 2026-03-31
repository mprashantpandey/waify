<?php

namespace App\Modules\Broadcasts\Models;

use App\Models\Account;
use App\Models\User;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class CampaignSequence extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'campaign_sequences';

    protected $fillable = [
        'account_id',
        'whatsapp_connection_id',
        'created_by',
        'slug',
        'name',
        'description',
        'status',
        'audience_type',
        'audience_filters',
        'custom_recipients',
        'enrolled_count',
        'active_enrollment_count',
        'completed_enrollment_count',
        'failed_enrollment_count',
        'activated_at',
        'paused_at',
        'metadata',
    ];

    protected $casts = [
        'audience_filters' => 'array',
        'custom_recipients' => 'array',
        'metadata' => 'array',
        'activated_at' => 'datetime',
        'paused_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $sequence): void {
            if (!$sequence->slug) {
                $sequence->slug = static::generateSlug($sequence);
            }
        });

        static::updating(function (self $sequence): void {
            if ($sequence->isDirty('name') && !$sequence->isDirty('slug')) {
                $sequence->slug = static::generateSlug($sequence);
            }
        });
    }

    public static function generateSlug(self $sequence): string
    {
        $base = Str::slug($sequence->name ?: 'sequence');
        $slug = $base !== '' ? $base : 'sequence';
        $original = $slug;
        $counter = 1;

        while (static::query()
            ->where('account_id', $sequence->account_id ?? 0)
            ->where('slug', $slug)
            ->where('id', '!=', $sequence->id ?? 0)
            ->exists()) {
            $slug = $original . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function connection(): BelongsTo
    {
        return $this->belongsTo(WhatsAppConnection::class, 'whatsapp_connection_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(CampaignSequenceStep::class)->orderBy('step_order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(CampaignSequenceEnrollment::class);
    }
}
