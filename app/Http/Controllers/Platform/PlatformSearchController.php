<?php

namespace App\Http\Controllers\Platform;

use App\Http\Controllers\Controller;
use App\Models\Account;
use App\Models\Module;
use App\Models\PaymentOrder;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Modules\Support\Models\SupportThread;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PlatformSearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));
        $limit = min(max((int) $request->query('limit', 8), 3), 12);

        $results = collect($this->navigationResults($query));

        if (mb_strlen($query) >= 2) {
            $results = $results
                ->merge($this->workspaceResults($query, $limit))
                ->merge($this->userResults($query, $limit))
                ->merge($this->planResults($query, $limit))
                ->merge($this->subscriptionResults($query, $limit))
                ->merge($this->transactionResults($query, $limit))
                ->merge($this->templateResults($query, $limit))
                ->merge($this->supportResults($query, $limit))
                ->merge($this->moduleResults($query, $limit));
        }

        return response()->json([
            'query' => $query,
            'results' => $results
                ->filter(fn ($item) => ! empty($item['href']))
                ->unique(fn ($item) => $item['type'].'|'.$item['id'])
                ->take(24)
                ->values(),
        ]);
    }

    protected function navigationResults(string $query): array
    {
        $items = [
            ['id' => 'overview', 'type' => 'page', 'label' => 'Overview', 'description' => 'Platform health, growth, and operations', 'route' => 'platform.dashboard'],
            ['id' => 'workspaces', 'type' => 'page', 'label' => 'Workspaces', 'description' => 'Tenant accounts and access', 'route' => 'platform.accounts.index'],
            ['id' => 'users', 'type' => 'page', 'label' => 'Users', 'description' => 'Platform users and roles', 'route' => 'platform.users.index'],
            ['id' => 'plans', 'type' => 'page', 'label' => 'Plans', 'description' => 'Plan catalog, pricing, and limits', 'route' => 'platform.plans.index'],
            ['id' => 'modules', 'type' => 'page', 'label' => 'Modules', 'description' => 'Feature module availability', 'route' => 'platform.modules.index'],
            ['id' => 'subscriptions', 'type' => 'page', 'label' => 'Subscriptions', 'description' => 'Customer subscriptions and renewals', 'route' => 'platform.subscriptions.index'],
            ['id' => 'discounts', 'type' => 'page', 'label' => 'Discounts', 'description' => 'Promo codes and offers', 'route' => 'platform.discounts.index'],
            ['id' => 'email-campaigns', 'type' => 'page', 'label' => 'Email campaigns', 'description' => 'Newsletter, promotion, and offer emails', 'route' => 'platform.email-campaigns.index'],
            ['id' => 'transactions', 'type' => 'page', 'label' => 'Transactions', 'description' => 'Payments, wallet ledger, and orders', 'route' => 'platform.transactions.index'],
            ['id' => 'support', 'type' => 'page', 'label' => 'Support', 'description' => 'Customer support tickets', 'route' => 'platform.support.index'],
            ['id' => 'templates', 'type' => 'page', 'label' => 'Templates', 'description' => 'Meta template oversight', 'route' => 'platform.templates.index'],
            ['id' => 'audit', 'type' => 'page', 'label' => 'Audit logs', 'description' => 'System events and admin activity', 'route' => 'platform.activity-logs'],
            ['id' => 'system-health', 'type' => 'page', 'label' => 'System health', 'description' => 'Infrastructure and integration readiness', 'route' => 'platform.system-health'],
            ['id' => 'settings', 'type' => 'page', 'label' => 'Settings', 'description' => 'Branding, payments, mail, and infrastructure', 'route' => 'platform.settings'],
        ];

        $needle = Str::lower($query);

        return collect($items)
            ->filter(fn ($item) => $needle === '' || Str::contains(Str::lower($item['label'].' '.$item['description']), $needle))
            ->take($needle === '' ? 6 : 10)
            ->map(fn ($item) => [
                'id' => $item['id'],
                'type' => $item['type'],
                'label' => $item['label'],
                'description' => $item['description'],
                'href' => $this->href($item['route']),
            ])
            ->all();
    }

    protected function workspaceResults(string $query, int $limit)
    {
        return Account::query()
            ->with('owner:id,name,email')
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['name', 'slug', 'industry', 'status']);
                $builder->orWhereHas('owner', fn (Builder $owner) => $this->likeAny($owner, $query, ['name', 'email']));
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Account $account) => [
                'id' => 'account-'.$account->id,
                'type' => 'workspace',
                'label' => $account->name,
                'description' => trim(collect([$account->slug, $account->owner?->email, $account->status])->filter()->join(' · ')),
                'href' => $this->href('platform.accounts.show', ['account' => $account->id]),
            ]);
    }

    protected function userResults(string $query, int $limit)
    {
        return User::query()
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['name', 'email', 'phone', 'job_title']);
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (User $user) => [
                'id' => 'user-'.$user->id,
                'type' => 'user',
                'label' => $user->name,
                'description' => trim(collect([$user->email, $user->is_platform_admin ? 'Platform admin' : null])->filter()->join(' · ')),
                'href' => $this->href('platform.users.index', ['search' => $user->email]),
            ]);
    }

    protected function planResults(string $query, int $limit)
    {
        return Plan::query()
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['name', 'key', 'description', 'currency']);
            })
            ->orderBy('sort_order')
            ->limit($limit)
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => 'plan-'.$plan->id,
                'type' => 'plan',
                'label' => $plan->name,
                'description' => trim(collect([$plan->key, $plan->currency, $plan->is_active ? 'active' : 'inactive'])->filter()->join(' · ')),
                'href' => $this->href('platform.plans.index', ['search' => $plan->key]),
            ]);
    }

    protected function subscriptionResults(string $query, int $limit)
    {
        return Subscription::query()
            ->with(['account:id,name,slug', 'plan:id,name,key'])
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['status', 'provider', 'provider_ref', 'provider_customer_ref', 'discount_code']);
                $builder->orWhereHas('account', fn (Builder $account) => $this->likeAny($account, $query, ['name', 'slug']))
                    ->orWhereHas('plan', fn (Builder $plan) => $this->likeAny($plan, $query, ['name', 'key']));
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (Subscription $subscription) => [
                'id' => 'subscription-'.$subscription->id,
                'type' => 'subscription',
                'label' => $subscription->account?->name ?: 'Subscription '.$subscription->id,
                'description' => trim(collect([$subscription->plan?->name, $subscription->status, $subscription->provider_ref])->filter()->join(' · ')),
                'href' => $this->href('platform.subscriptions.index', ['search' => $subscription->account?->name]),
            ]);
    }

    protected function transactionResults(string $query, int $limit)
    {
        return PaymentOrder::query()
            ->with('account:id,name,slug')
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['provider', 'provider_order_id', 'provider_payment_id', 'provider_subscription_id', 'status', 'currency', 'discount_code']);
                $builder->orWhereHas('account', fn (Builder $account) => $this->likeAny($account, $query, ['name', 'slug']));
            })
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (PaymentOrder $order) => [
                'id' => 'payment-'.$order->id,
                'type' => 'transaction',
                'label' => $order->provider_order_id ?: 'Payment order '.$order->id,
                'description' => trim(collect([$order->account?->name, $order->status, $order->currency.' '.number_format(((int) $order->amount) / 100, 2)])->filter()->join(' · ')),
                'href' => $this->href('platform.transactions.index', ['search' => $order->provider_order_id]),
            ]);
    }

    protected function templateResults(string $query, int $limit)
    {
        return WhatsAppTemplate::query()
            ->with('account:id,name,slug')
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['name', 'body_text', 'category', 'language', 'status']);
                $builder->orWhereHas('account', fn (Builder $account) => $this->likeAny($account, $query, ['name', 'slug']));
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (WhatsAppTemplate $template) => [
                'id' => 'template-'.$template->id,
                'type' => 'template',
                'label' => $template->name,
                'description' => trim(collect([$template->account?->name, $template->category, $template->status])->filter()->join(' · ')),
                'href' => $this->href('platform.templates.index', ['search' => $template->name]),
            ]);
    }

    protected function supportResults(string $query, int $limit)
    {
        return SupportThread::query()
            ->with('account:id,name,slug')
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['subject', 'status', 'priority', 'category']);
                $builder->orWhereHas('account', fn (Builder $account) => $this->likeAny($account, $query, ['name', 'slug']));
            })
            ->latest('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn (SupportThread $thread) => [
                'id' => 'support-'.$thread->id,
                'type' => 'support',
                'label' => $thread->subject,
                'description' => trim(collect([$thread->account?->name, $thread->status, $thread->priority])->filter()->join(' · ')),
                'href' => $this->href('platform.support.index', ['thread' => $thread->slug]),
            ]);
    }

    protected function moduleResults(string $query, int $limit)
    {
        return Module::query()
            ->where(function (Builder $builder) use ($query) {
                $this->likeAny($builder, $query, ['name', 'key', 'description']);
            })
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn (Module $module) => [
                'id' => 'module-'.$module->id,
                'type' => 'module',
                'label' => $module->name,
                'description' => trim(collect([$module->key, $module->is_enabled ? 'enabled' : 'disabled'])->filter()->join(' · ')),
                'href' => $this->href('platform.modules.index', ['search' => $module->key]),
            ]);
    }

    protected function likeAny(Builder $builder, string $query, array $columns): void
    {
        foreach ($columns as $index => $column) {
            $method = $index === 0 ? 'where' : 'orWhere';
            $builder->{$method}($column, 'like', "%{$query}%");
        }
    }

    protected function href(string $routeName, array $params = []): ?string
    {
        try {
            return route($routeName, $params);
        } catch (\Throwable) {
            return null;
        }
    }
}
