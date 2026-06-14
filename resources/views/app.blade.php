<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            $brandingService = app(\App\Services\BrandingService::class);
            $platformName = $brandingService->getPlatformName() ?: config('app.name', 'Laravel');
            $googleAnalyticsEnabled = (bool) \App\Models\PlatformSetting::get('analytics.google_analytics_enabled', false);
            $googleAnalyticsId = trim((string) \App\Models\PlatformSetting::get('analytics.google_analytics_id', ''));
            $seoRouteMap = [
                'landing' => 'landing',
                'pricing' => 'pricing',
                'privacy' => 'privacy',
                'terms' => 'terms',
                'refund.policy' => 'refund',
                'acceptable.use' => 'acceptableUse',
                'qr.disclaimer' => 'qrDisclaimer',
                'gdpr' => 'gdpr',
                'cookies' => 'cookies',
                'security' => 'security',
                'help' => 'help',
                'faqs' => 'faqs',
                'knowledgebase' => 'knowledgebase',
                'roadmap' => 'roadmap',
                'docs' => 'docs',
                'about' => 'about',
                'contact' => 'contact',
            ];
            $seoPayload = null;
            $seoKey = $seoRouteMap[\Illuminate\Support\Facades\Route::currentRouteName()] ?? null;
            if ($seoKey) {
                try {
                    $seoPayload = app(\App\Services\SeoService::class)->page($seoKey);
                } catch (\Throwable $e) {
                    $seoPayload = null;
                }
            }
        @endphp
        <title inertia>{{ $seoPayload['title'] ?? $platformName }}</title>

        @if($seoPayload)
            <meta name="description" content="{{ $seoPayload['description'] }}">
            @if(! empty($seoPayload['keywords']))
                <meta name="keywords" content="{{ $seoPayload['keywords'] }}">
            @endif
            <meta name="robots" content="{{ $seoPayload['robots'] }}">
            <link rel="canonical" href="{{ $seoPayload['canonical'] }}">
            <meta property="og:type" content="{{ $seoPayload['type'] ?? 'website' }}">
            <meta property="og:title" content="{{ $seoPayload['title'] }}">
            <meta property="og:description" content="{{ $seoPayload['description'] }}">
            <meta property="og:url" content="{{ $seoPayload['url'] }}">
            <meta property="og:site_name" content="{{ $seoPayload['site_name'] }}">
            <meta property="og:locale" content="{{ $seoPayload['locale'] }}">
            <meta property="og:image" content="{{ $seoPayload['image'] }}">
            <meta property="og:image:alt" content="{{ $seoPayload['site_name'] }} product preview">
            <meta name="twitter:card" content="{{ $seoPayload['twitter_card'] ?? 'summary_large_image' }}">
            <meta name="twitter:title" content="{{ $seoPayload['title'] }}">
            <meta name="twitter:description" content="{{ $seoPayload['description'] }}">
            <meta name="twitter:image" content="{{ $seoPayload['image'] }}">
            @foreach($seoPayload['schemas'] ?? [] as $index => $schema)
                <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
            @endforeach
        @endif

        @if($googleAnalyticsEnabled && $googleAnalyticsId !== '')
            <!-- Google tag (gtag.js) -->
            <script id="ga-script" async src="https://www.googletagmanager.com/gtag/js?id={{ $googleAnalyticsId }}"></script>
            <script id="ga-inline">
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', @json($googleAnalyticsId));
            </script>
        @endif

        <!-- Favicon (will be overridden by BrandingProvider if custom favicon is set) -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="manifest" href="/manifest.json">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

        <script>
            (function () {
                try {
                    var storedTheme = window.localStorage.getItem('zyptos-theme') || window.localStorage.getItem('waify-theme');
                    var legacyDarkMode = window.localStorage.getItem('darkMode');
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var resolvedTheme = storedTheme === 'dark' || (!storedTheme && legacyDarkMode === 'true') || ((!storedTheme || storedTheme === 'system') && legacyDarkMode === null && prefersDark)
                        ? 'dark'
                        : 'light';

                    if (resolvedTheme === 'dark') {
                        document.documentElement.classList.add('dark');
                    }
                    document.documentElement.style.colorScheme = resolvedTheme;
                } catch (e) {
                    // noop
                }
            })();
        </script>

        <script>
            (function () {
                const appUrl = @json(config('app.url'));
                if (!appUrl) {
                    return;
                }
                try {
                    const target = new URL(appUrl);
                    const current = new URL(window.location.href);
                    const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
                    // Avoid redirect loops and misconfigured APP_URL values (common on shared hosting).
                    if (localHosts.has(target.hostname)) {
                        return;
                    }
                    if (target.origin !== current.origin) {
                        window.location.replace(target.origin + current.pathname + current.search + current.hash);
                    }
                } catch (e) {
                    // noop
                }
            })();
        </script>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
        @inertiaHead
    </head>
    <body class="bg-waify-bg font-sans text-waify-text antialiased dark:bg-waify-dark-bg dark:text-waify-dark-text">
        @inertia
    </body>
</html>
