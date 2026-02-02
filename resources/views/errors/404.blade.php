<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 - Page Not Found</title>
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="antialiased bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-md w-full text-center">
            <div class="mb-8">
                <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 mb-6">
                    <svg class="w-16 h-16 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h1 class="text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
                    404
                </h1>
                <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Page Not Found
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </div>
            <div class="space-y-4">
                <a href="{{ url('/') }}" class="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-200 hover:scale-105">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Go Home
                </a>
                <button onclick="window.history.back()" class="block w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                    ← Go Back
                </button>
            </div>
        </div>
    </div>
</body>
</html>

