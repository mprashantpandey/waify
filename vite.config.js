import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    build: {
        chunkSizeWarningLimit: 800,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;
                    const reactPkgs = [
                        '/node_modules/react/',
                        '/node_modules/react-dom/',
                        '/node_modules/scheduler/',
                        '/node_modules/react-is/',
                        '/node_modules/use-sync-external-store/',
                    ];
                    if (reactPkgs.some((pkg) => id.includes(pkg))) {
                        return 'react';
                    }
                    return 'vendor';
                },
            },
        },
    },
});
