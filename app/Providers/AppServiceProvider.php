<?php

namespace App\Providers;

use App\Modules\Floaters\Models\FloaterWidget;
use App\Modules\Floaters\Policies\FloaterWidgetPolicy;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Policies\WhatsAppConnectionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        WhatsAppConnection::class => WhatsAppConnectionPolicy::class,
        FloaterWidget::class => FloaterWidgetPolicy::class];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register BillingProviderManager as singleton
        $this->app->singleton(\App\Core\Billing\BillingProviderManager::class, function ($app) {
            return new \App\Core\Billing\BillingProviderManager();
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Register policies
        Gate::policy(WhatsAppConnection::class, WhatsAppConnectionPolicy::class);
        Gate::policy(\App\Modules\Chatbots\Models\Bot::class, \App\Modules\Chatbots\Policies\ChatbotPolicy::class);
        Gate::policy(FloaterWidget::class, FloaterWidgetPolicy::class);

        // Route model binding for 'plan' parameter - resolve by key (slug) instead of ID
        Route::bind('plan', function ($value) {
            // Try to resolve by key first (slug), fallback to ID for backward compatibility
            $plan = \App\Models\Plan::where('key', $value)->orWhere('id', $value)->first();
            if (!$plan) {
                abort(404, 'Plan not found');
            }
            return $plan;
        });

        // Route model binding for 'subscription' parameter - resolve by slug instead of ID
        Route::bind('subscription', function ($value) {
            // Try to resolve by slug first, fallback to ID for backward compatibility
            $subscription = \App\Models\Subscription::where('slug', $value)->orWhere('id', $value)->first();
            if (!$subscription) {
                abort(404, 'Subscription not found');
            }
            return $subscription;
        });

        // Route model binding for 'template' parameter - resolve by slug instead of ID
        Route::bind('template', function ($value) {
            // Try to resolve by slug first, fallback to ID for backward compatibility
            $template = \App\Modules\WhatsApp\Models\WhatsAppTemplate::where('slug', $value)->orWhere('id', $value)->first();
            if (!$template) {
                abort(404, 'Template not found');
            }
            return $template;
        });

        // Route model binding for 'connection' parameter - resolve by slug instead of ID
        // Route model binding for 'connection' parameter - resolve by slug first, fallback to ID
        Route::bind('connection', function ($value) {
            // Try to resolve by slug first, fallback to ID for backward compatibility
            $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('slug', $value)
                ->orWhere('id', $value)
                ->first();
            
            if (!$connection) {
                // Log the failure for debugging
                \Log::channel('whatsapp')->error('Connection not found in route binding', [
                    'value' => $value,
                    'type' => is_numeric($value) ? 'id' : 'slug',
                ]);
                abort(404, 'Connection not found');
            }
            
            // Log successful resolution
            \Log::channel('whatsapp')->info('Connection resolved in route binding', [
                'value' => $value,
                'connection_id' => $connection->id,
                'connection_slug' => $connection->slug,
                'resolved_by' => $connection->slug === $value ? 'slug' : 'id',
            ]);
            
            return $connection;
        });

        // Route model binding for 'campaign' parameter - resolve by slug instead of ID
        Route::bind('campaign', function ($value) {
            // Try to resolve by slug first, fallback to ID for backward compatibility
            $campaign = \App\Modules\Broadcasts\Models\Campaign::where('slug', $value)->orWhere('id', $value)->first();
            if (!$campaign) {
                abort(404, 'Campaign not found');
            }
            return $campaign;
        });

        // Route model binding for 'contact' parameter - resolve by slug instead of ID
        Route::bind('contact', function ($value) {
            // Try to resolve by slug first, fallback to ID for backward compatibility
            $contact = \App\Modules\WhatsApp\Models\WhatsAppContact::where('slug', $value)->orWhere('id', $value)->first();
            if (!$contact) {
                abort(404, 'Contact not found');
            }
            return $contact;
        });

    }
}
