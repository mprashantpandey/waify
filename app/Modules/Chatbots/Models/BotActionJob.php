<?php

namespace App\Modules\Chatbots\Models;

use App\Models\Workspace;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BotActionJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'bot_execution_id',
        'node_id',
        'run_at',
        'status',
        'attempts',
        'last_error',
    ];

    protected function casts(): array
    {
        return [
            'run_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function execution(): BelongsTo
    {
        return $this->belongsTo(BotExecution::class, 'bot_execution_id');
    }

    public function node(): BelongsTo
    {
        return $this->belongsTo(BotNode::class, 'node_id');
    }

    public function isQueued(): bool
    {
        return $this->status === 'queued';
    }

    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    public function isDone(): bool
    {
        return $this->status === 'done';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }
}
