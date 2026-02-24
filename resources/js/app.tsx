import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RealtimeProvider } from './Providers/RealtimeProvider';
import { BrandingProvider } from './Components/Branding/BrandingProvider';
import { ConfirmProvider } from './Components/Notifications/ConfirmProvider';
import { GlobalFlashHandler } from './Components/Notifications/GlobalFlashHandler';

createInertiaApp({
    title: (title) => {
        // Fallback app name (must match DEFAULT_PLATFORM_NAME in lib/branding.ts)
        const appName = import.meta.env.VITE_APP_NAME || 'Waify';
        const brandingName = (window as any).__brandingName;
        const finalAppName = brandingName || appName;
        return title ? `${title} - ${finalAppName}` : finalAppName;
    },
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const pusherConfig = (props.initialPage?.props as any)?.pusherConfig;
        
        const WrappedApp = (
            <RealtimeProvider pusherConfig={pusherConfig}>
                <ConfirmProvider>
                    <App {...props} />
                </ConfirmProvider>
            </RealtimeProvider>
        );

        if (import.meta.env.SSR) {
            hydrateRoot(el, WrappedApp);
            return;
        }

        createRoot(el).render(WrappedApp);
    },
    progress: {
        color: '#4B5563',
    },
});
