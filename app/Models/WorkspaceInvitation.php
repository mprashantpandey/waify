<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class WorkspaceInvitation extends Model
{
    protected $fillable = [
        'workspace_id',
        'invited_by',
        'email',
        'role',
        'token',
        'accepted_at',
        'expires_at',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public static function generateToken(): string
    {
        return Str::random(48);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
