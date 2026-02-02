<?php

namespace App\Modules\Support\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'support_thread_id',
        'sender_type',
        'sender_id',
        'body',
    ];

    public function thread(): BelongsTo
    {
        return $this->belongsTo(SupportThread::class, 'support_thread_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(SupportMessageAttachment::class, 'support_message_id');
    }
}
