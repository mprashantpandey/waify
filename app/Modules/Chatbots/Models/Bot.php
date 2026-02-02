<?php

namespace App\Modules\Chatbots\Models;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bot extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'name',
        'description',
        'status',
        'is_default',
        'applies_to',
        'version',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'applies_to' => 'array',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function flows(): HasMany
    {
        return $this->hasMany(BotFlow::class)->orderBy('priority');
    }

    public function executions(): HasMany
    {
        return $this->hasMany(BotExecution::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function appliesToConnection(int $connectionId): bool
    {
        if (empty($this->applies_to)) {
            return false;
        }

        if ($this->applies_to['all_connections'] ?? false) {
            return true;
        }

        $connectionIds = $this->applies_to['connection_ids'] ?? [];
        return in_array($connectionId, $connectionIds);
    }
}
