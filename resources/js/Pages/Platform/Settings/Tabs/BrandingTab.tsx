import { ChangeEvent } from 'react';
import { Image, MonitorSmartphone, Moon, Sun, Trash2, Upload, type LucideIcon } from 'lucide-react';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { cn } from '@/lib/utils';

type AssetField = 'logo' | 'logo_dark' | 'sidebar_icon' | 'sidebar_icon_dark' | 'favicon' | 'favicon_dark';

interface BrandingTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, string>;
}

interface AssetCardProps {
    id: AssetField;
    title: string;
    description: string;
    url?: string | null;
    removeKey: string;
    removed?: boolean;
    accept: string;
    icon: LucideIcon;
    compact?: boolean;
    darkPreview?: boolean;
    errors: Record<string, string>;
    onUpload: (field: AssetField, event: ChangeEvent<HTMLInputElement>) => void;
    onRemove: (removeKey: string, field: AssetField) => void;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>;
}

function AssetCard({
    id,
    title,
    description,
    url,
    removeKey,
    removed,
    accept,
    icon: Icon,
    compact = false,
    darkPreview = false,
    errors,
    onUpload,
    onRemove,
}: AssetCardProps) {
    const hasAsset = Boolean(url && !removed);

    return (
        <div className="overflow-hidden rounded-card border border-gray-100 bg-white dark:border-waify-dark-border dark:bg-waify-dark-surface">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-4 dark:border-waify-dark-border">
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/15 dark:text-emerald-200">
                        <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                        <Label htmlFor={id}>{title}</Label>
                        <p className="mt-1 text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">{description}</p>
                    </div>
                </div>
                {hasAsset && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(removeKey, id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="space-y-3 p-4">
                <div
                    className={cn(
                        'flex h-24 items-center justify-center rounded-card border border-dashed px-4',
                        darkPreview
                            ? 'border-white/10 bg-waify-sidebar text-white/70'
                            : 'border-gray-200 bg-gray-50 text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted'
                    )}
                >
                    {hasAsset ? (
                        <img src={url as string} alt={title} className={compact ? 'h-11 w-11 object-contain' : 'max-h-14 max-w-full object-contain'} />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-xs">
                            <Upload className="h-4 w-4" />
                            <span>{removed ? 'Removed after save' : 'No file uploaded'}</span>
                        </div>
                    )}
                </div>

                <Input id={id} type="file" accept={accept} onChange={(event) => onUpload(id, event)} />
                <FieldError message={errors[id]} />
            </div>
        </div>
    );
}

export default function BrandingTab({ data, setData, errors }: BrandingTabProps) {
    const branding = data.branding || {};

    const updateBranding = (key: string, value: any) => {
        setData('branding', { ...branding, [key]: value });
    };

    const handleFileChange = (field: AssetField, event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setData(field, file);
        updateBranding(`remove_${field}`, false);
    };

    const markForRemoval = (removeKey: string, field: AssetField) => {
        updateBranding(removeKey, true);
        setData(field, null);
    };

    const primaryColor = branding.primary_color || '#22c55e';
    const rasterLogoAccept = 'image/jpeg,image/png,image/gif,image/svg+xml';
    const faviconAccept = 'image/x-icon,image/png';

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5" />
                        Brand Identity
                    </CardTitle>
                    <CardDescription>Core name and visual assets used across app shells, auth screens, public pages, and favicons.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                    <div>
                        <Label htmlFor="branding.platform_name">Platform Name</Label>
                        <Input
                            id="branding.platform_name"
                            value={branding.platform_name || ''}
                            onChange={(event) => updateBranding('platform_name', event.target.value)}
                            placeholder="Zyptos"
                        />
                        <FieldError message={errors['branding.platform_name']} />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border">
                            <div className="flex h-16 items-center gap-3 bg-white px-4 text-waify-text">
                                {branding.logo_url && !branding.remove_logo ? (
                                    <img src={branding.logo_url} alt="" className="max-h-9 w-auto" />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-card text-white" style={{ backgroundColor: primaryColor }}>
                                        <Upload className="h-4 w-4" />
                                    </div>
                                )}
                                <div className="truncate text-sm font-semibold">{branding.platform_name || 'Zyptos'}</div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-card border border-gray-100 dark:border-waify-dark-border">
                            <div className="flex h-16 items-center gap-3 bg-waify-sidebar px-4 text-white">
                                {branding.logo_dark_url && !branding.remove_logo_dark ? (
                                    <img src={branding.logo_dark_url} alt="" className="max-h-9 w-auto" />
                                ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-card" style={{ backgroundColor: primaryColor }}>
                                        <Upload className="h-4 w-4" />
                                    </div>
                                )}
                                <div className="truncate text-sm font-semibold">{branding.platform_name || 'Zyptos'}</div>
                            </div>
                        </div>

                        <div className="flex h-16 items-center gap-3 rounded-card bg-waify-sidebar px-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-card bg-white/5">
                                {branding.sidebar_icon_dark_url && !branding.remove_sidebar_icon_dark ? (
                                    <img src={branding.sidebar_icon_dark_url} alt="" className="h-7 w-7 object-contain" />
                                ) : (
                                    <Upload className="h-4 w-4 text-white/70" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-3 w-24 rounded-full bg-white/20" />
                                <div className="h-3 w-16 rounded-full bg-white/10" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Logo Assets</h3>
                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Use horizontal logos for headers, public pages, and auth layouts.</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                    <AssetCard
                        id="logo"
                        title="Light Logo"
                        description="PNG, JPG, GIF, or SVG up to 2MB."
                        url={branding.logo_url}
                        removeKey="remove_logo"
                        removed={branding.remove_logo}
                        accept={rasterLogoAccept}
                        icon={Sun}
                        errors={errors}
                        onUpload={handleFileChange}
                        onRemove={markForRemoval}
                    />
                    <AssetCard
                        id="logo_dark"
                        title="Dark Logo"
                        description="For dark headers, dark mode, and dark public sections."
                        url={branding.logo_dark_url}
                        removeKey="remove_logo_dark"
                        removed={branding.remove_logo_dark}
                        accept={rasterLogoAccept}
                        icon={Moon}
                        darkPreview
                        errors={errors}
                        onUpload={handleFileChange}
                        onRemove={markForRemoval}
                    />
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Sidebar Icons</h3>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Compact marks for collapsed navigation and dense app surfaces.</p>
                    </div>
                    <div className="grid gap-4">
                        <AssetCard
                            id="sidebar_icon"
                            title="Light Sidebar Icon"
                            description="Square icon for light shell."
                            url={branding.sidebar_icon_url}
                            removeKey="remove_sidebar_icon"
                            removed={branding.remove_sidebar_icon}
                            accept={rasterLogoAccept}
                            icon={MonitorSmartphone}
                            compact
                            errors={errors}
                            onUpload={handleFileChange}
                            onRemove={markForRemoval}
                        />
                        <AssetCard
                            id="sidebar_icon_dark"
                            title="Dark Sidebar Icon"
                            description="Square icon for dark shell."
                            url={branding.sidebar_icon_dark_url}
                            removeKey="remove_sidebar_icon_dark"
                            removed={branding.remove_sidebar_icon_dark}
                            accept={rasterLogoAccept}
                            icon={MonitorSmartphone}
                            compact
                            darkPreview
                            errors={errors}
                            onUpload={handleFileChange}
                            onRemove={markForRemoval}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Favicons</h3>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Browser tab icons for light and dark browser themes.</p>
                    </div>
                    <div className="grid gap-4">
                        <AssetCard
                            id="favicon"
                            title="Light Favicon"
                            description="ICO or PNG up to 512KB."
                            url={branding.favicon_url}
                            removeKey="remove_favicon"
                            removed={branding.remove_favicon}
                            accept={faviconAccept}
                            icon={Sun}
                            compact
                            errors={errors}
                            onUpload={handleFileChange}
                            onRemove={markForRemoval}
                        />
                        <AssetCard
                            id="favicon_dark"
                            title="Dark Favicon"
                            description="ICO or PNG up to 512KB."
                            url={branding.favicon_dark_url}
                            removeKey="remove_favicon_dark"
                            removed={branding.remove_favicon_dark}
                            accept={faviconAccept}
                            icon={Moon}
                            compact
                            darkPreview
                            errors={errors}
                            onUpload={handleFileChange}
                            onRemove={markForRemoval}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
