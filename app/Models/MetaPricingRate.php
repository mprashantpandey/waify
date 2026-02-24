<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaPricingRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'meta_pricing_version_id',
        'category',
        'pricing_model',
        'amount_minor',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'amount_minor' => 'integer',
            'meta' => 'array',
        ];
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(MetaPricingVersion::class, 'meta_pricing_version_id');
    }
}

