<?php

namespace App\Modules\Ecommerce\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcommerceOrder extends Model
{
    protected $fillable = [
        'account_id',
        'product_id',
        'customer_name',
        'customer_phone',
        'customer_wa_id',
        'quantity',
        'unit_price',
        'total_price',
        'currency',
        'status',
        'source',
        'notes',
        'ordered_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'integer',
        'total_price' => 'integer',
        'ordered_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Account::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(EcommerceProduct::class, 'product_id');
    }
}

