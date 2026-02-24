import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import { getPlatformName, getLogoUrl } from '@/lib/branding';

export default function Guest({ children }: PropsWithChildren) {
    const { branding } = usePage().props as any;
    const platformName = getPlatformName(branding);
    const logoUrl = getLogoUrl(branding);

    return (
        <BrandingWrapper>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-block">
                            {logoUrl ? (
                                <img src={logoUrl} alt={platformName} className="h-16 w-auto mx-auto mb-4" />
                            ) : (
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
                                    <span className="text-2xl font-bold text-white">{platformName.charAt(0)}</span>
                                </div>
                            )}
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                {platformName}
                            </h1>
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        </div>
                        <div className="p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </BrandingWrapper>
    );
}
