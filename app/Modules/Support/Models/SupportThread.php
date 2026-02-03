<?php

namespace App\Modules\Support\Models;

use App\Models\User;
use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SupportThread extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'account_id',
        'created_by',
        'subject',
        'status',
        'mode',
        'channel',
        'priority',
        'category',
        'tags',
        'assigned_to',
        'first_response_due_at',
        'first_response_at',
        'due_at',
        'resolved_at',
        'last_response_at',
        'escalated_at',
        'escalation_level',
        'last_message_at'];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'first_response_due_at' => 'datetime',
            'first_response_at' => 'datetime',
            'due_at' => 'datetime',
            'resolved_at' => 'datetime',
            'last_response_at' => 'datetime',
            'escalated_at' => 'datetime',
            'tags' => 'array'];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportMessage::class, 'support_thread_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    protected static function booted(): void
    {
        static::created(function (SupportThread $thread) {
            if ($thread->slug) {
                return;
            }
            $base = $thread->subject ? Str::slug($thread->subject) : 'support-thread';
            if ($base === '') {
                $base = 'support-thread';
            }
            $thread->slug = $base.'-'.$thread->id;
            $thread->saveQuietly();
        });
    }

    public static function resolveThread($value): ?self
    {
        if ($value instanceof self) {
            return $value;
        }
        return self::where('slug', $value)->orWhere('id', $value)->first();
    }
}
