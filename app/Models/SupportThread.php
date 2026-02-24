<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SupportThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'created_by',
        'subject',
        'slug',
        'status',
        'priority',
        'category',
        'assigned_to',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $thread) {
            if (! $thread->slug) {
                $base = Str::slug($thread->subject ?: 'support-ticket');
                $thread->slug = ($base ?: 'support-ticket') . '-' . Str::lower(Str::random(6));
            }
            if (! $thread->status) {
                $thread->status = 'open';
            }
            if (! $thread->priority) {
                $thread->priority = 'normal';
            }
        });
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportMessage::class)->orderBy('created_at');
    }
}
