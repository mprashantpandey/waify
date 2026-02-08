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
            // Log all binding attempts
            \Log::channel('whatsapp')->info('Route binding attempt', [
                'value' => $value,
                'type' => is_numeric($value) ? 'id' : 'slug',
                'path' => request()->path(),
            ]);
            
            // Try to resolve by slug first, fallback to ID for backward compatibility
            $connection = \App\Modules\WhatsApp\Models\WhatsAppConnection::where('slug', $value)
                ->orWhere('id', $value)
                ->first();
            
            if (!$connection) {
                // Log the failure for debugging
                \Log::channel('whatsapp')->error('Connection not found in route binding', [
                    'value' => $value,
                    'type' => is_numeric($value) ? 'id' : 'slug',
                    'path' => request()->path(),
                    'all_connections_count' => \App\Modules\WhatsApp\Models\WhatsAppConnection::count(),
                ]);
                abort(404, 'Connection not found');
            }
            
            // Ensure connection has a slug (auto-fix)
            if (empty($connection->slug)) {
                $connection->slug = \App\Modules\WhatsApp\Models\WhatsAppConnection::generateSlug($connection);
                $connection->save();
                \Log::channel('whatsapp')->info('Auto-generated slug for connection', [
                    'connection_id' => $connection->id,
                    'new_slug' => $connection->slug,
                ]);
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

        // Route model binding for 'contact' - resolve by slug, wa_id, or id, scoped to current account
        Route::bind('contact', function ($value) {
            $account = request()->attributes->get('account') ?? current_account();
            if (!$account) {
                abort(404, 'Account not found');
            }
            $accountId = (int) $account->id;
            $contactModel = \App\Modules\WhatsApp\Models\WhatsAppContact::class;

            // Build candidate values for slug/wa_id (wa_id can be stored with/without country code)
            $candidates = array_unique(array_filter([$value]));
            if (is_string($value) && preg_match('/^\d+$/', $value)) {
                $len = strlen($value);
                if ($len === 10 && !str_starts_with($value, '91')) {
                    $candidates[] = '91' . $value;       // 8449183686 -> 918449183686
                    $candidates[] = '91' . '9' . $value;  // 8449183686 -> 91918449183686 (E.164 style)
                } elseif ($len === 12 && str_starts_with($value, '91')) {
                    $candidates[] = '9' . $value;         // 918449183686 -> 91918449183686
                } elseif ($len === 13 && str_starts_with($value, '919')) {
                    $candidates[] = substr($value, 1);    // 91918449183686 -> 918449183686
                }
            }

            $query = $contactModel::where('account_id', $accountId)
                ->where(function ($q) use ($candidates, $value) {
                    $q->whereIn('slug', $candidates)
                        ->orWhereIn('wa_id', $candidates);
                    if (is_numeric($value) && (int) $value > 0 && (int) $value < 2147483647) {
                        $q->orWhere('id', (int) $value);
                    }
                });
            $contact = $query->first();
            if ($contact) {
                return $contact;
            }
            abort(404, 'Contact not found');
        });

        // Route model binding for 'conversation' - scope to current account so inbox links never 404 for wrong account
        Route::bind('conversation', function ($value) {
            $account = request()->attributes->get('account') ?? current_account();
            if (!$account) {
                \Log::channel('whatsapp')->warning('Conversation binding: no account resolved', ['path' => request()->path(), 'value' => $value]);
                abort(404, 'Account not found');
            }
            $id = is_numeric($value) ? (int) $value : null;
            if ($id === null || $id < 1) {
                \Log::channel('whatsapp')->warning('Conversation binding: invalid id', ['path' => request()->path(), 'value' => $value]);
                abort(404, 'Conversation not found');
            }
            $accountId = (int) $account->id;
            $conversation = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('id', $id)
                ->where('account_id', $accountId)
                ->first();
            if (!$conversation) {
                $existsOtherAccount = \App\Modules\WhatsApp\Models\WhatsAppConversation::where('id', $id)->exists();
                \Log::channel('whatsapp')->info('Conversation binding: not found for account', [
                    'conversation_id' => $id,
                    'account_id' => $accountId,
                    'path' => request()->path(),
                    'exists_other_account' => $existsOtherAccount,
                ]);
                abort(404, 'Conversation not found');
            }
            return $conversation;
        });
    }
}
