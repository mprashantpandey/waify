<?php

namespace App\Modules\Floaters\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FloaterWidgetEvent extends Model
{
    use HasFactory;

    protected $table = 'floater_widget_events';

    protected $fillable = [
        'floater_widget_id',
        'workspace_id',
        'event_type',
        'path',
        'referrer',
        'user_agent',
        'ip_hash',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function widget(): BelongsTo
    {
        return $this->belongsTo(FloaterWidget::class, 'floater_widget_id');
    }
}
