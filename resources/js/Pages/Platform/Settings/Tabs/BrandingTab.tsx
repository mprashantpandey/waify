import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';

interface BrandingTabProps {
    data: any;
    setData: any;
    errors: any;
}

export default function BrandingTab({ data, setData, errors }: BrandingTabProps) {
    const handleFileChange = (field: 'logo' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData(field, file);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Platform Branding</CardTitle>
                    <CardDescription>
                        Customize your platform's appearance and branding
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="branding.platform_name">Platform Name</Label>
                        <Input
                            id="branding.platform_name"
                            value={data.branding?.platform_name || ''}
                            onChange={(e) => setData('branding', { ...data.branding, platform_name: e.target.value })}
                            placeholder="Waify"
                        />
                        {errors?.['branding.platform_name'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['branding.platform_name']}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="logo">Logo</Label>
                        {data.branding?.logo_url && (
                            <div className="mb-2">
                                <img 
                                    src={data.branding.logo_url} 
                                    alt="Current logo" 
                                    className="h-12 w-auto mb-2"
                                />
                            </div>
                        )}
                        <Input
                            id="logo"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange('logo', e)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Recommended: PNG or SVG, max 2MB. Will be displayed in sidebar and headers.
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="favicon">Favicon</Label>
                        {data.branding?.favicon_url && (
                            <div className="mb-2">
                                <img 
                                    src={data.branding.favicon_url} 
                                    alt="Current favicon" 
                                    className="h-8 w-8 mb-2"
                                />
                            </div>
                        )}
                        <Input
                            id="favicon"
                            type="file"
                            accept="image/x-icon,image/png"
                            onChange={(e) => handleFileChange('favicon', e)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Recommended: ICO or PNG, 32x32px, max 512KB.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="branding.primary_color">Primary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="branding.primary_color"
                                    type="color"
                                    value={data.branding?.primary_color || '#3B82F6'}
                                    onChange={(e) => setData('branding', { ...data.branding, primary_color: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={data.branding?.primary_color || '#3B82F6'}
                                    onChange={(e) => setData('branding', { ...data.branding, primary_color: e.target.value })}
                                    placeholder="#3B82F6"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                />
                            </div>
                            {errors?.['branding.primary_color'] && (
                                <p className="text-sm text-red-600 mt-1">{errors['branding.primary_color']}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="branding.secondary_color">Secondary Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="branding.secondary_color"
                                    type="color"
                                    value={data.branding?.secondary_color || '#8B5CF6'}
                                    onChange={(e) => setData('branding', { ...data.branding, secondary_color: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    value={data.branding?.secondary_color || '#8B5CF6'}
                                    onChange={(e) => setData('branding', { ...data.branding, secondary_color: e.target.value })}
                                    placeholder="#8B5CF6"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                />
                            </div>
                            {errors?.['branding.secondary_color'] && (
                                <p className="text-sm text-red-600 mt-1">{errors['branding.secondary_color']}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Support Information</CardTitle>
                    <CardDescription>
                        Contact information displayed to users
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="branding.support_email">Support Email</Label>
                        <Input
                            id="branding.support_email"
                            type="email"
                            value={data.branding?.support_email || ''}
                            onChange={(e) => setData('branding', { ...data.branding, support_email: e.target.value })}
                            placeholder="support@example.com"
                        />
                        {errors?.['branding.support_email'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['branding.support_email']}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="branding.support_phone">Support Phone</Label>
                        <Input
                            id="branding.support_phone"
                            value={data.branding?.support_phone || ''}
                            onChange={(e) => setData('branding', { ...data.branding, support_phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                        />
                        {errors?.['branding.support_phone'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['branding.support_phone']}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="branding.footer_text">Footer Text</Label>
                        <Input
                            id="branding.footer_text"
                            value={data.branding?.footer_text || ''}
                            onChange={(e) => setData('branding', { ...data.branding, footer_text: e.target.value })}
                            placeholder="© 2024 Your Company. All rights reserved."
                        />
                        {errors?.['branding.footer_text'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['branding.footer_text']}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="branding.show_powered_by">Show "Powered By"</Label>
                            <p className="text-sm text-gray-500">
                                Display "Powered by [Platform Name]" in the footer
                            </p>
                        </div>
                        <Switch
                            id="branding.show_powered_by"
                            checked={data.branding?.show_powered_by || false}
                            onCheckedChange={(checked) => setData('branding', { ...data.branding, show_powered_by: checked })}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

