<?php

namespace App\Modules\Floaters\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Floaters\Models\FloaterWidget;
use App\Modules\Floaters\Models\FloaterWidgetEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PublicWidgetController extends Controller
{
    public function script(Request $request, string $widget)
    {
        $widgetModel = FloaterWidget::where('public_id', $widget)->where('is_active', true)->first();
        if (!$widgetModel) {
            return response('// widget disabled', 200, ['Content-Type' => 'application/javascript']);
        }

        $config = [
            'id' => $widgetModel->public_id,
            'name' => $widgetModel->name,
            'position' => $widgetModel->position,
            'welcome_message' => $widgetModel->welcome_message ?? 'Hello! How can we help?',
            'whatsapp_phone' => $widgetModel->whatsapp_phone,
            'theme' => $widgetModel->theme ?? ['primary' => '#25D366', 'background' => '#075E54'],
            'show_on' => $widgetModel->show_on ?? ['include' => [], 'exclude' => []],
            'endpoint' => rtrim(config('app.url'), '/')."/widgets/{$widgetModel->public_id}/event"];

        $js = $this->buildScript($config);

        return response($js, 200, [
            'Content-Type' => 'application/javascript',
            'Access-Control-Allow-Origin' => '*']);
    }

    public function event(Request $request, string $widget)
    {
        $widgetModel = FloaterWidget::where('public_id', $widget)->first();
        if (!$widgetModel) {
            return response()->json(['ok' => false], 404, ['Access-Control-Allow-Origin' => '*']);
        }

        $payload = $request->validate([
            'event_type' => 'required|string|in:impression,click,lead',
            'path' => 'nullable|string|max:255',
            'referrer' => 'nullable|string|max:255',
            'metadata' => 'nullable|array']);

        try {
            FloaterWidgetEvent::create([
                'floater_widget_id' => $widgetModel->id,
                'account_id' => $widgetModel->account_id,
                'event_type' => $payload['event_type'],
                'path' => $payload['path'] ?? null,
                'referrer' => $payload['referrer'] ?? null,
                'user_agent' => $request->userAgent(),
                'ip_hash' => $this->hashIp($request->ip()),
                'metadata' => $payload['metadata'] ?? null]);
        } catch (\Throwable $e) {
            Log::warning('Floater widget event failed', [
                'widget' => $widget,
                'error' => $e->getMessage()]);
        }

        return response()->json(['ok' => true], 200, [
            'Access-Control-Allow-Origin' => '*']);
    }

    protected function hashIp(?string $ip): ?string
    {
        if (!$ip) {
            return null;
        }

        return hash('sha256', $ip.'|'.config('app.key'));
    }

    protected function buildScript(array $config): string
    {
        $json = json_encode($config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $template = <<<'JS'
(function() {
  var config = __CONFIG__;
  if (!config || !config.whatsapp_phone) { return; }

  var normalize = function(pattern) {
    return pattern.replace(/[.+^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\\*/g, '.*');
  };

  var matches = function(patterns, path) {
    if (!patterns || !patterns.length) { return false; }
    for (var i = 0; i < patterns.length; i++) {
      var re = new RegExp('^' + normalize(patterns[i]) + '$', 'i');
      if (re.test(path)) { return true; }
    }
    return false;
  };

  var path = window.location.pathname || '/';
  var include = (config.show_on && config.show_on.include) || [];
  var exclude = (config.show_on && config.show_on.exclude) || [];

  if (include.length && !matches(include, path)) { return; }
  if (exclude.length && matches(exclude, path)) { return; }

  var sendEvent = function(type, meta) {
    try {
      fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: type,
          path: window.location.pathname,
          referrer: document.referrer || null,
          metadata: meta || null
        })
      });
    } catch (e) {}
  };

  var css = document.createElement('style');
  css.innerHTML =
    '.waify-widget{position:fixed;z-index:2147483647;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto}' +
    '.waify-widget__btn{width:56px;height:56px;border-radius:999px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:' + config.theme.primary + ';box-shadow:0 10px 25px rgba(0,0,0,0.2)}' +
    '.waify-widget__panel{position:absolute;bottom:72px;right:0;background:#fff;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.18);width:280px;overflow:hidden;display:none}' +
    '.waify-widget__header{background:' + config.theme.background + ';color:#fff;padding:14px 16px;font-weight:600}' +
    '.waify-widget__body{padding:14px 16px;color:#111827;font-size:14px;line-height:1.4}' +
    '.waify-widget__cta{margin-top:12px;display:inline-flex;align-items:center;gap:8px;background:' + config.theme.primary + ';color:#fff;text-decoration:none;padding:10px 12px;border-radius:999px;font-size:13px}' +
    '.waify-widget__close{position:absolute;top:10px;right:10px;background:rgba(255,255,255,.2);border:none;border-radius:999px;width:28px;height:28px;color:#fff;cursor:pointer}';
  document.head.appendChild(css);

  var container = document.createElement('div');
  container.className = 'waify-widget';
  if (config.position === 'bottom-left') {
    container.style.left = '24px';
    container.style.bottom = '24px';
  } else {
    container.style.right = '24px';
    container.style.bottom = '24px';
  }

  var btn = document.createElement('button');
  btn.className = 'waify-widget__btn';
  btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20.5 11.5c0 4.7-3.8 8.5-8.5 8.5-1.5 0-3-.4-4.2-1.1L4 20l1.2-3.5c-.9-1.3-1.4-2.9-1.4-4.5C3.8 7.3 7.6 3.5 12.3 3.5c4.7 0 8.2 3.5 8.2 8z" stroke="white" stroke-width="1.5"/></svg>';

  var panel = document.createElement('div');
  panel.className = 'waify-widget__panel';
  panel.innerHTML = '<div class="waify-widget__header">WhatsApp Support<button class="waify-widget__close">×</button></div>' +
    '<div class="waify-widget__body">' + config.welcome_message +
    '<br/><a class="waify-widget__cta" target="_blank" rel="noopener" href="https://wa.me/' + encodeURIComponent(config.whatsapp_phone) + '">Chat on WhatsApp</a>' +
    '</div>';

  container.appendChild(panel);
  container.appendChild(btn);
  document.body.appendChild(container);

  var open = false;
  btn.addEventListener('click', function() {
    open = !open;
    panel.style.display = open ? 'block' : 'none';
    if (open) { sendEvent('click'); }
  });

  panel.querySelector('.waify-widget__close').addEventListener('click', function() {
    open = false;
    panel.style.display = 'none';
  });

  panel.querySelector('.waify-widget__cta').addEventListener('click', function() {
    sendEvent('lead');
  });

  sendEvent('impression');
})();
JS;
        return str_replace('__CONFIG__', $json, $template);
    }
}
