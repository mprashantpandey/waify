import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { getPlatformName } from '@/lib/branding';

const getFaviconType = (url: string) => {
    const lower = url.toLowerCase();
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.ico')) return 'image/x-icon';
    return 'image/png';
};

const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
    const normalized = hex.replace('#', '');
    if (normalized.length !== 6) return null;
    const value = parseInt(normalized, 16);
    if (Number.isNaN(value)) return null;

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
};

const rgbToHex = (r: number, g: number, b: number) =>
    `#${[r, g, b].map((channel) => clamp(channel).toString(16).padStart(2, '0')).join('')}`;

const shiftColor = (hex: string, amount: number) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    return rgbToHex(rgb.r + amount, rgb.g + amount, rgb.b + amount);
};

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
            link.type = getFaviconType(branding.favicon_url);
            link.href = branding.favicon_url;
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        // Apply CSS variables for branding colors
        if (branding.primary_color) {
            document.documentElement.style.setProperty('--brand-primary', branding.primary_color);
            document.documentElement.style.setProperty('--brand-primary-dark', shiftColor(branding.primary_color, -18));
            document.documentElement.style.setProperty('--brand-primary-soft', shiftColor(branding.primary_color, 210));
            document.documentElement.style.setProperty('--brand-primary-soft-dark', shiftColor(branding.primary_color, -120));
        }
        if (branding.secondary_color) {
            document.documentElement.style.setProperty('--brand-secondary', branding.secondary_color);
            document.documentElement.style.setProperty('--brand-secondary-dark', shiftColor(branding.secondary_color, -18));
            document.documentElement.style.setProperty('--brand-secondary-soft', shiftColor(branding.secondary_color, 210));
            document.documentElement.style.setProperty('--brand-secondary-soft-dark', shiftColor(branding.secondary_color, -120));
        }
    }, [branding, platformName]);

    return <>{children}</>;
}
