import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * BrandingWrapper Component
 * 
 * Wraps the app and applies branding (favicon, colors) dynamically.
 * This component is used inside the Inertia app tree so it can use usePage().
 */
export function BrandingWrapper({ children }: { children: React.ReactNode }) {
    const { branding } = usePage().props as any;

    useEffect(() => {
        if (!branding) {
            return;
        }

        // Store branding name globally for title callback access
        if (branding.platform_name) {
            (window as any).__brandingName = branding.platform_name;
        }

        // Update document title
        if (branding.platform_name) {
            const currentTitle = document.title;
            // Always update to ensure branding is reflected
            if (currentTitle) {
                // Check if there's a page title (from Head component)
                const titleParts = currentTitle.split(' - ');
                if (titleParts.length > 1 && titleParts[titleParts.length - 1] !== branding.platform_name) {
                    // Replace the app name part with branding
                    const pageTitle = titleParts.slice(0, -1).join(' - ');
                    document.title = `${pageTitle} - ${branding.platform_name}`;
                } else if (titleParts.length === 1 && currentTitle !== branding.platform_name) {
                    // Single part title, append platform name if not already there
                    if (!currentTitle.includes(branding.platform_name)) {
                        document.title = `${currentTitle} - ${branding.platform_name}`;
                    }
                } else if (currentTitle === 'Laravel' || currentTitle === import.meta.env.VITE_APP_NAME) {
                    // Default title, replace with platform name
                    document.title = branding.platform_name;
                }
            } else {
                // No title, use platform name
                document.title = branding.platform_name;
            }
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
    }, [branding]);

    return <>{children}</>;
}

