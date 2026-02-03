<?php

namespace App\Modules\Floaters\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Floaters\Models\FloaterWidget;
use App\Modules\Floaters\Models\FloaterWidgetEvent;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WidgetController extends Controller
{
    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();

        $widgets = FloaterWidget::where('account_id', $account->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (FloaterWidget $widget) {
                if (!$widget->slug || trim((string) $widget->slug) === '') {
                    $widget->slug = FloaterWidget::generateSlug($widget);
                    $widget->saveQuietly();
                }
                return [
                    'id' => $widget->id,
                    'slug' => $widget->slug,
                    'name' => $widget->name,
                    'is_active' => $widget->is_active,
                    'position' => $widget->position,
                    'public_id' => $widget->public_id,
                    'welcome_message' => $widget->welcome_message,
                    'whatsapp_phone' => $widget->whatsapp_phone,
                    'created_at' => $widget->created_at->toIso8601String()];
            });

        $stats = $this->summaryStats($account->id);

        return Inertia::render('Floaters/Index', [
            'account' => $account,
            'widgets' => $widgets,
            'stats' => $stats]);
    }

    public function create(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        Gate::authorize('create', FloaterWidget::class);

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->orderBy('name')
            ->get(['id', 'name', 'business_phone']);

        return Inertia::render('Floaters/Create', [
            'account' => $account,
            'connections' => $connections]);
    }

    public function store(Request $request)
    {
        $account = $request->attributes->get('account') ?? current_account();
        Gate::authorize('create', FloaterWidget::class);

        $validated = $this->validateWidget($request);
        $validated['account_id'] = $account->id;
        $validated['show_on'] = $this->normalizeShowOn($validated['show_on'] ?? []);
        $validated['theme'] = $this->normalizeTheme($validated['theme'] ?? []);

        $widget = FloaterWidget::create($validated);

        return redirect()->route('app.floaters.edit', [
            'widget' => $widget->slug])->with('success', 'Widget created successfully.');
    }

    public function edit(Request $request, $widget): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $widget = $this->resolveWidget($widget, $account->id);

        Gate::authorize('update', $widget);

        $connections = WhatsAppConnection::where('account_id', $account->id)
            ->orderBy('name')
            ->get(['id', 'name', 'business_phone']);

        $stats = $this->widgetStats($widget->id);

        return Inertia::render('Floaters/Edit', [
            'account' => $account,
            'widget' => [
                'id' => $widget->id,
                'slug' => $widget->slug,
                'name' => $widget->name,
                'is_active' => $widget->is_active,
                'position' => $widget->position,
                'theme' => $widget->theme ?? [],
                'show_on' => $widget->show_on ?? ['include' => [], 'exclude' => []],
                'welcome_message' => $widget->welcome_message,
                'whatsapp_phone' => $widget->whatsapp_phone,
                'whatsapp_connection_id' => $widget->whatsapp_connection_id,
                'public_id' => $widget->public_id,
                'created_at' => $widget->created_at->toIso8601String()],
            'connections' => $connections,
            'stats' => $stats,
            'embed' => [
                'script' => $this->embedScript($widget->public_id),
                'snippet' => $this->embedSnippet($widget->public_id)]]);
    }

    public function update(Request $request, $widget)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $widget = $this->resolveWidget($widget, $account->id);
        Gate::authorize('update', $widget);

        $validated = $this->validateWidget($request);
        $validated['show_on'] = $this->normalizeShowOn($validated['show_on'] ?? []);
        $validated['theme'] = $this->normalizeTheme($validated['theme'] ?? []);

        $widget->update($validated);

        return redirect()->route('app.floaters.edit', [
            'widget' => $widget->slug])->with('success', 'Widget updated successfully.');
    }

    public function toggle(Request $request, $widget)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $widget = $this->resolveWidget($widget, $account->id);
        Gate::authorize('update', $widget);

        $widget->update([
            'is_active' => !$widget->is_active]);

        return redirect()->back()->with('success', $widget->is_active ? 'Widget enabled.' : 'Widget disabled.');
    }

    public function destroy(Request $request, $widget)
    {
        $account = $request->attributes->get('account') ?? current_account();
        $widget = $this->resolveWidget($widget, $account->id);
        Gate::authorize('delete', $widget);

        $widget->delete();

        return redirect()->route('app.floaters')->with('success', 'Widget deleted successfully.');
    }

    protected function validateWidget(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:120',
            'whatsapp_connection_id' => 'nullable|integer|exists:whatsapp_connections,id',
            'whatsapp_phone' => 'required|string|max:32',
            'position' => 'required|string|in:bottom-right,bottom-left',
            'welcome_message' => 'nullable|string|max:200',
            'is_active' => 'nullable|boolean',
            'theme' => 'nullable|array',
            'theme.primary' => 'nullable|string|max:20',
            'theme.background' => 'nullable|string|max:20',
            'show_on' => 'nullable',
            'show_on.include' => 'nullable',
            'show_on.exclude' => 'nullable']);
    }

    protected function resolveWidget($value, int $accountId): FloaterWidget
    {
        if ($value instanceof FloaterWidget) {
            return $value;
        }

        $query = FloaterWidget::where('account_id', $accountId);
        if (is_numeric($value)) {
            $query->where('id', $value);
        } else {
            $query->where('slug', $value)->orWhere('id', $value)->orWhere('public_id', $value);
        }
        $widget = $query->first();
        if (!$widget) {
            \Log::warning('Floater widget not found', [
                'value' => $value,
                'account_id' => $accountId,
                'path' => request()->path(),
                'route_params' => request()->route()?->parameters() ?? []]);
            abort(404, 'Widget not found');
        }

        return $widget;
    }

    protected function normalizeShowOn(array $showOn): array
    {
        $includeRaw = $showOn['include'] ?? [];
        $excludeRaw = $showOn['exclude'] ?? [];

        $include = is_string($includeRaw) ? preg_split('/\r?\n/', $includeRaw) : (array) $includeRaw;
        $exclude = is_string($excludeRaw) ? preg_split('/\r?\n/', $excludeRaw) : (array) $excludeRaw;

        $include = array_values(array_filter($include, fn ($value) => trim((string) $value) !== ''));
        $exclude = array_values(array_filter($exclude, fn ($value) => trim((string) $value) !== ''));

        return [
            'include' => $include,
            'exclude' => $exclude];
    }

    protected function normalizeTheme(array $theme): array
    {
        return [
            'primary' => $theme['primary'] ?? '#25D366',
            'background' => $theme['background'] ?? '#075E54'];
    }

    protected function summaryStats(int $accountId): array
    {
        $rangeStart = now()->subDays(30);

        $stats = FloaterWidgetEvent::where('account_id', $accountId)
            ->where('created_at', '>=', $rangeStart)
            ->select('event_type', DB::raw('COUNT(*) as count'))
            ->groupBy('event_type')
            ->pluck('count', 'event_type');

        return [
            'impressions' => (int) ($stats['impression'] ?? 0),
            'clicks' => (int) ($stats['click'] ?? 0),
            'leads' => (int) ($stats['lead'] ?? 0)];
    }

    protected function widgetStats(int $widgetId): array
    {
        $rangeStart = now()->subDays(30);

        $stats = FloaterWidgetEvent::where('floater_widget_id', $widgetId)
            ->where('created_at', '>=', $rangeStart)
            ->select('event_type', DB::raw('COUNT(*) as count'))
            ->groupBy('event_type')
            ->pluck('count', 'event_type');

        $series = FloaterWidgetEvent::where('floater_widget_id', $widgetId)
            ->where('created_at', '>=', now()->subDays(14))
            ->select(DB::raw('DATE(created_at) as date'), 'event_type', DB::raw('COUNT(*) as count'))
            ->groupBy('date', 'event_type')
            ->orderBy('date')
            ->get()
            ->groupBy('date')
            ->map(function ($items) {
                $map = $items->pluck('count', 'event_type');
                return [
                    'impressions' => (int) ($map['impression'] ?? 0),
                    'clicks' => (int) ($map['click'] ?? 0),
                    'leads' => (int) ($map['lead'] ?? 0)];
            });

        return [
            'impressions' => (int) ($stats['impression'] ?? 0),
            'clicks' => (int) ($stats['click'] ?? 0),
            'leads' => (int) ($stats['lead'] ?? 0),
            'series' => $series];
    }

    protected function embedScript(string $publicId): string
    {
        return rtrim(config('app.url'), '/')."/widgets/{$publicId}.js";
    }

    protected function embedSnippet(string $publicId): string
    {
        $src = $this->embedScript($publicId);
        return "<script src=\"{$src}\" defer></script>";
    }
}
