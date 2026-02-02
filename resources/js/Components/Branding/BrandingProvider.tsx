import { useEffect } from 'react';

interface BrandingData {
    platform_name?: string;
    logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string;
    secondary_color?: string;
    support_email?: string | null;
    support_phone?: string | null;
    footer_text?: string | null;
    show_powered_by?: boolean;
}

/**
 * BrandingProvider Component
 * 
 * Applies branding (favicon, colors) to the page dynamically
 */
export function BrandingProvider({ 
    children, 
    branding 
}: { 
    children: React.ReactNode;
    branding?: BrandingData;
}) {
    useEffect(() => {
        if (!branding) return;

        // Update document title if platform name is set
        if (branding.platform_name) {
            const currentTitle = document.title;
            // Only update if title is still the default or doesn't include the platform name
            if (!currentTitle || currentTitle === 'Laravel' || !currentTitle.includes(branding.platform_name)) {
                // Check if there's a page title (from Head component)
                const pageTitle = document.querySelector('title')?.textContent;
                if (pageTitle && pageTitle !== 'Laravel') {
                    // Page has a title, update it to include platform name
                    const titleParts = pageTitle.split(' - ');
                    if (titleParts.length > 1) {
                        // Replace the app name part
                        document.title = `${titleParts[0]} - ${branding.platform_name}`;
                    } else {
                        // Just append platform name
                        document.title = `${pageTitle} - ${branding.platform_name}`;
                    }
                } else {
                    // No page title, use platform name
                    document.title = branding.platform_name;
                }
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

