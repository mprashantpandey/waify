<?php

namespace App\Modules\Floaters\Models;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class FloaterWidget extends Model
{
    use HasFactory;

    public const TYPE_FLOATER = 'floater';

    public const TYPE_QR = 'qr';

    public const TYPE_LINK = 'link';

    public const TYPE_BANNER = 'banner';

    protected $table = 'floater_widgets';

    protected $fillable = [
        'account_id',
        'whatsapp_connection_id',
        'name',
        'widget_type',
        'slug',
        'public_id',
        'is_active',
        'theme',
        'position',
        'show_on',
        'welcome_message',
        'whatsapp_phone'];

    protected $casts = [
        'is_active' => 'boolean',
        'theme' => 'array',
        'show_on' => 'array'];

    protected static function booted(): void
    {
        static::creating(function (FloaterWidget $widget) {
            if (!$widget->public_id) {
                $widget->public_id = (string) Str::uuid();
            }
            if (!$widget->slug || trim((string) $widget->slug) === '') {
                $widget->slug = static::generateSlug($widget);
            }
        });

        static::updating(function (FloaterWidget $widget) {
            if ($widget->isDirty('name') && !$widget->isDirty('slug')) {
                $widget->slug = static::generateSlug($widget);
            }
            if ((!$widget->slug || trim((string) $widget->slug) === '') && !$widget->isDirty('slug')) {
                $widget->slug = static::generateSlug($widget);
            }
        });
    }

    public static function generateSlug(FloaterWidget $widget): string
    {
        $base = Str::slug($widget->name ?? 'widget');
        if ($base === '') {
            $base = 'widget';
        }
        $slug = $base;
        $original = $slug;
        $counter = 1;

        while (static::where('account_id', $widget->account_id ?? 0)
            ->where('slug', $slug)
            ->where('id', '!=', $widget->id ?? 0)
            ->exists()) {
            $slug = $original.'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(FloaterWidgetEvent::class, 'floater_widget_id');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public static function allowedTypes(): array
    {
        return [
            self::TYPE_FLOATER,
            self::TYPE_QR,
            self::TYPE_LINK,
            self::TYPE_BANNER,
        ];
    }

    public function isEmbeddableType(): bool
    {
        return in_array($this->widget_type, [self::TYPE_FLOATER, self::TYPE_BANNER], true);
    }
}
