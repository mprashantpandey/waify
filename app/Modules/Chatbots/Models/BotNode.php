<?php

namespace App\Modules\Chatbots\Models;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BotNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'bot_flow_id',
        'type',
        'config',
        'sort_order'];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'sort_order' => 'integer'];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function flow(): BelongsTo
    {
        return $this->belongsTo(BotFlow::class, 'bot_flow_id');
    }

    public function actionJobs(): HasMany
    {
        return $this->hasMany(BotActionJob::class, 'node_id');
    }
}
