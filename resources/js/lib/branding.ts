/**
 * Central branding helpers. All display names and copy should use these
 * so the platform stays consistent with Platform Settings → Branding.
 */

export interface BrandingProps {
    platform_name?: string | null;
    logo_url?: string | null;
    favicon_url?: string | null;
    primary_color?: string | null;
    secondary_color?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
    footer_text?: string | null;
    show_powered_by?: boolean;
}

/** Fallback when platform name is not set in settings (must match backend BrandingService default). */
export const DEFAULT_PLATFORM_NAME = 'Waify';

/**
 * Platform display name from shared branding props.
 */
export function getPlatformName(branding: BrandingProps | undefined | null): string {
    return branding?.platform_name?.trim() || DEFAULT_PLATFORM_NAME;
}

/**
 * Logo URL or null if not set.
 */
export function getLogoUrl(branding: BrandingProps | undefined | null): string | null {
    return branding?.logo_url?.trim() || null;
}

/**
 * Footer tagline. Uses branding.footer_text when set, otherwise a default description.
 */
export function getFooterText(branding: BrandingProps | undefined | null): string {
    const custom = branding?.footer_text?.trim();
    if (custom) return custom;
    return `${getPlatformName(branding)} is a WhatsApp Cloud Platform for modern businesses. Official Meta Tech Provider.`;
}
