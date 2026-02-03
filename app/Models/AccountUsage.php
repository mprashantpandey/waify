<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountUsage extends Model
{
    use HasFactory;

    protected $table = 'account_usage';

    protected $fillable = [
        'account_id',
        'period',
        'messages_sent',
        'template_sends',
        'ai_credits_used',
        'storage_bytes'];

    protected function casts(): array
    {
        return [
            'messages_sent' => 'integer',
            'template_sends' => 'integer',
            'ai_credits_used' => 'integer',
            'storage_bytes' => 'integer'];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
