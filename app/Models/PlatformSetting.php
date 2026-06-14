<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlatformSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description'];

    /**
     * Get setting value with type casting.
     */
    public function getValueAttribute($value)
    {
        $type = $this->attributes['type'] ?? $this->type ?? 'string';

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer' => (int) $value,
            'float' => (float) $value,
            'json' => is_array($value) ? $value : json_decode((string) $value, true),
            default => $value,
        };
    }

    /**
     * Set setting value with type conversion.
     */
    public function setValueAttribute($value)
    {
        $type = $this->attributes['type'] ?? $this->type ?? 'string';

        $this->attributes['value'] = match ($type) {
            'boolean' => $value ? '1' : '0',
            'integer' => (string) $value,
            'json' => json_encode($value, JSON_THROW_ON_ERROR),
            default => is_array($value) || is_object($value)
                ? json_encode($value, JSON_THROW_ON_ERROR)
                : (string) $value,
        };
    }

    /**
     * Get setting by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }

    /**
     * Set setting by key.
     */
    public static function set(string $key, $value, string $type = 'string', string $group = 'general', ?string $description = null): void
    {
        $setting = static::firstOrNew(['key' => $key]);
        $setting->type = $type;
        $setting->group = $group;
        $setting->description = $description;
        $setting->value = $value;
        $setting->save();
    }
}
