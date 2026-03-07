<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OperationalAlertEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_key',
        'title',
        'severity',
        'scope',
        'dedupe_key',
        'status',
        'channels',
        'context',
        'error_message',
        'sent_at',
        'acknowledged_at',
        'acknowledged_by',
        'resolve_note',
    ];

    protected $casts = [
        'channels' => 'array',
        'context' => 'array',
        'sent_at' => 'datetime',
        'acknowledged_at' => 'datetime',
    ];
}
