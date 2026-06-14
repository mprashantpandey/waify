<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'razorpay_plan_id',
        'billing_period',
        'billing_interval',
        'is_active',
        'is_public',
        'trial_days',
        'sort_order',
        'limits',
        'modules',
        'metadata'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'price_monthly' => 'integer',
            'price_yearly' => 'integer',
            'billing_interval' => 'integer',
            'trial_days' => 'integer',
            'sort_order' => 'integer',
            'limits' => 'array',
            'modules' => 'array',
            'metadata' => 'array'];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function requiresAdminApproval(): bool
    {
        return strtolower((string) $this->key) === 'enterprise';
    }

    public function publicFeatures(): array
    {
        $metadata = is_array($this->metadata) ? $this->metadata : [];
        $features = $metadata['public_features'] ?? null;

        if (is_array($features) && ! empty($features)) {
            return array_values(array_filter(array_map('strval', $features)));
        }

        $limits = is_array($this->limits) ? $this->limits : [];
        $fallback = [];

        if (isset($limits['whatsapp_connections'])) {
            $fallback[] = '1 WhatsApp connection per workspace';
        }

        if (isset($limits['agents'])) {
            $agents = (int) $limits['agents'];
            $fallback[] = $agents === -1 ? 'Unlimited agents' : $agents.' agent'.($agents === 1 ? '' : 's');
        }

        if (isset($limits['messages_monthly'])) {
            $messages = (int) $limits['messages_monthly'];
            $fallback[] = $messages === -1 ? 'Unlimited messages/month' : number_format($messages).' messages/month';
        }

        if (isset($limits['template_sends_monthly'])) {
            $templates = (int) $limits['template_sends_monthly'];
            $fallback[] = $templates === -1 ? 'Unlimited template sends/month' : number_format($templates).' template sends/month';
        }

        if (($this->trial_days ?? 0) > 0) {
            $fallback[] = $this->trial_days.'-day free trial';
        }

        return $fallback;
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'key';
    }
}
