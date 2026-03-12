<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLogSavedView extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_id',
        'scope',
        'kind',
        'name',
        'correlation_id',
        'filters',
        'is_shared',
    ];

    protected $casts = [
        'filters' => 'array',
        'is_shared' => 'boolean',
        'user_id' => 'integer',
        'account_id' => 'integer',
    ];
}

