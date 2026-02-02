<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>419 - Page Expired</title>
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="antialiased bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-md w-full text-center">
            <div class="mb-8">
                <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 mb-6">
                    <svg class="w-16 h-16 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h1 class="text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    419
                </h1>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Page Expired
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mb-8">
                    Your session has expired. Please refresh and try again.
                </p>
            </div>
            <div class="space-y-4">
                <button onclick="window.location.reload()" class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-200 hover:scale-105">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh Page
                </button>
                <a href="{{ url('/') }}" class="block w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    Go Home →
                </a>
            </div>
        </div>
    </div>
</body>
</html>

