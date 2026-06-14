import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/Providers/ThemeProvider';
import ZyptosLogo from '@/Components/Branding/ZyptosLogo';
import { cn } from '@/lib/utils';

type BrandVariant = 'auto' | 'light' | 'dark';

interface BrandLogoProps {
    variant?: BrandVariant;
    compact?: boolean;
    className?: string;
    imageClassName?: string;
    fallbackTextClassName?: string;
}

export default function BrandLogo({
    variant = 'auto',
    compact = false,
    className,
    imageClassName,
    fallbackTextClassName = 'text-waify-text dark:text-waify-dark-text',
}: BrandLogoProps) {
    const { branding } = usePage().props as any;
    const { resolvedTheme } = useTheme();
    const mode = variant === 'auto' ? resolvedTheme : variant;
    const platformName = branding?.platform_name || 'Zyptos';
    const [failedLogoUrls, setFailedLogoUrls] = useState<string[]>([]);
    const bundledLogoUrl = compact
        ? mode === 'dark'
            ? '/images/brand/zyptos-icon-white.png'
            : '/images/brand/zyptos-icon-dark.png'
        : mode === 'dark'
        ? '/images/brand/zyptos-logo-white.png'
        : '/images/brand/zyptos-logo-dark.png';

    const logoUrl = compact
        ? mode === 'dark'
            ? (branding?.sidebar_icon_dark_url || branding?.logo_dark_url || bundledLogoUrl)
            : (branding?.sidebar_icon_url || branding?.logo_url || bundledLogoUrl)
        : mode === 'dark'
        ? (branding?.logo_dark_url || bundledLogoUrl)
        : (branding?.logo_url || bundledLogoUrl);
    const failedSet = new Set(failedLogoUrls);
    const effectiveLogoUrl = failedSet.has(logoUrl) ? bundledLogoUrl : logoUrl;
    const showImage = Boolean(effectiveLogoUrl && !failedSet.has(effectiveLogoUrl));

    useEffect(() => {
        setFailedLogoUrls([]);
    }, [logoUrl]);

    return (
        <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
            {showImage ? (
                <img
                    src={effectiveLogoUrl}
                    alt={platformName}
                    className={cn(compact ? 'h-8 w-8 object-contain' : 'h-8 w-auto max-w-full object-contain', imageClassName)}
                    loading="eager"
                    decoding="async"
                    onError={() => setFailedLogoUrls((current) => (
                        effectiveLogoUrl && !current.includes(effectiveLogoUrl) ? [...current, effectiveLogoUrl] : current
                    ))}
                />
            ) : (
                <ZyptosLogo withText={!compact} textClassName={fallbackTextClassName} />
            )}
        </span>
    );
}
