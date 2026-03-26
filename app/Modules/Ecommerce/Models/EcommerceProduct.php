<?php

namespace App\Modules\Ecommerce\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EcommerceProduct extends Model
{
    protected $fillable = [
        'account_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'currency',
        'status',
        'stock',
        'metadata',
    ];

    protected $casts = [
        'price' => 'integer',
        'stock' => 'integer',
        'metadata' => 'array',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Account::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(EcommerceOrder::class, 'product_id');
    }
}

