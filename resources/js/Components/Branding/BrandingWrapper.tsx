import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { getPlatformName } from '@/lib/branding';

/**
 * BrandingWrapper Component
 *
 * Wraps the app and applies branding (favicon, colors) from platform settings.
 */
export function BrandingWrapper({ children }: { children: React.ReactNode }) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);

    useEffect(() => {
        if (!branding) {
            return;
        }

        // Store branding name globally for title callback access
        (window as any).__brandingName = platformName;

        // Update document title when it's still the default
        const currentTitle = document.title;
        if (currentTitle) {
            const titleParts = currentTitle.split(' - ');
            if (titleParts.length > 1 && titleParts[titleParts.length - 1] !== platformName) {
                const pageTitle = titleParts.slice(0, -1).join(' - ');
                document.title = `${pageTitle} - ${platformName}`;
            } else if (titleParts.length === 1 && !currentTitle.includes(platformName)) {
                document.title = currentTitle === 'Laravel' || currentTitle === (import.meta.env.VITE_APP_NAME || '') ? platformName : `${currentTitle} - ${platformName}`;
            }
        } else {
            document.title = platformName;
        }

        // Update favicon
        if (branding.favicon_url) {
            // Remove existing favicon links
            const existingLinks = document.querySelectorAll("link[rel*='icon']");
            existingLinks.forEach(link => link.remove());
            
            // Add new favicon
            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = branding.favicon_url.endsWith('.ico') ? 'image/x-icon' : 'image/png';
            link.href = branding.favicon_url;
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // Apply CSS variables for branding colors
        if (branding.primary_color) {
            document.documentElement.style.setProperty('--brand-primary', branding.primary_color);
        }
        if (branding.secondary_color) {
            document.documentElement.style.setProperty('--brand-secondary', branding.secondary_color);
        }
    }, [branding, platformName]);

    return <>{children}</>;
}

