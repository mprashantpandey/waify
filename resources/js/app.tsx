import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RealtimeProvider } from './Providers/RealtimeProvider';
import { BrandingProvider } from './Components/Branding/BrandingProvider';
import { ConfirmProvider } from './Components/Notifications/ConfirmProvider';
import { Toaster } from './Components/UI/Toaster';
import { ThemeProvider } from './Providers/ThemeProvider';

createInertiaApp({
    title: (title) => {
        // Try to get branding from the current page props
        // Since title callback only receives the title string, we need to access branding differently
        // BrandingWrapper will update the title dynamically, so this is just a fallback
        const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
        
        // Try to get branding from window if available (set by BrandingWrapper)
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
                <ThemeProvider>
                    <ConfirmProvider>
                        <App {...props} />
                        <Toaster />
                    </ConfirmProvider>
                </ThemeProvider>
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
