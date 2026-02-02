<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        @php
            $brandingService = app(\App\Services\BrandingService::class);
            $platformName = $brandingService->getPlatformName() ?: config('app.name', 'Laravel');
        @endphp
        <title inertia>{{ $platformName }}</title>

        <!-- Favicon (will be overridden by BrandingProvider if custom favicon is set) -->
        <link rel="icon" type="image/x-icon" href="/favicon.ico">
        <link rel="manifest" href="/manifest.json">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

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
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
