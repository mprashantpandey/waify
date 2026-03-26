import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect } from 'react';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import { getDarkLogoUrl, getPlatformName, getLogoUrl, getFooterText } from '@/lib/branding';
import { 
    House,
    HelpCircle, 
    Mail, 
    Info, 
    CreditCard,
    MessageSquare,
    Menu,
    X,
    ArrowRight
} from 'lucide-react';
import { useState } from 'react';
import Button from '@/Components/UI/Button';
import CookieConsentBanner from '@/Components/Compliance/CookieConsentBanner';
import AnalyticsScripts from '@/Components/Analytics/AnalyticsScripts';

export default function PublicLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const { branding, auth, accounts, compliance } = page.props as any;
    const platformName = getPlatformName(branding);
    const logoUrl = getLogoUrl(branding);
    const darkLogoUrl = getDarkLogoUrl(branding);
    const footerText = getFooterText(branding);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentHash, setCurrentHash] = useState('');
    const currentPath = (page as any).url?.split('?')[0] || '';
    const canLogin = (window as any).route?.has?.('login') ?? true;
    const canRegister = (window as any).route?.has?.('register') ?? true;
    const termsUrl = compliance?.terms_url || route('terms');
    const privacyUrl = compliance?.privacy_url || route('privacy');
    const cookiePolicyUrl = compliance?.cookie_policy_url || route('cookie-policy');

    const navigation = [
        { name: 'Home', href: route('landing'), icon: House },
        { name: 'Pricing', href: route('pricing'), icon: CreditCard },
        { name: 'Features', href: route('landing') + '#features', icon: MessageSquare },
        { name: 'Help', href: route('help'), icon: HelpCircle },
        { name: 'FAQs', href: route('faqs'), icon: Info },
        { name: 'About', href: route('about'), icon: Info },
        { name: 'Contact', href: route('contact'), icon: Mail },
    ];

    const isExternal = (href: string) => href.startsWith('http');

    const footerLinks = {
        product: [
            { name: 'Features', href: route('landing') + '#features' },
            { name: 'Pricing', href: route('pricing') },
            { name: 'Help Center', href: route('help') },
            { name: 'FAQs', href: route('faqs') },
        ],
        company: [
            { name: 'About Us', href: route('about') },
            { name: 'Contact', href: route('contact') },
            { name: 'Support', href: route('help') },
        ],
        legal: [
            { name: 'Privacy Policy', href: privacyUrl },
            { name: 'Terms of Service', href: termsUrl },
            { name: 'Refund Policy', href: route('refund-policy') },
            ...(cookiePolicyUrl ? [{ name: 'Cookie Policy', href: cookiePolicyUrl }] : []),
            { name: 'Sitemap', href: route('sitemap') },
        ]};

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [currentPath]);

    useEffect(() => {
        const updateHash = () => setCurrentHash(window.location.hash || '');
        updateHash();
        window.addEventListener('hashchange', updateHash);

        return () => {
            window.removeEventListener('hashchange', updateHash);
        };
    }, [currentPath]);

    return (
        <BrandingWrapper>
            <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-center text-xs font-medium text-blue-50">
                    Official Meta WhatsApp Cloud partner for growing teams
                </div>
                {/* Navigation */}
                <nav className="border-b border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href={route('landing')} className="flex items-center space-x-3">
                                    {logoUrl ? (
                                        <>
                                            <img src={logoUrl} alt={platformName} className={`h-10 w-auto ${darkLogoUrl ? 'dark:hidden' : ''}`} />
                                            {darkLogoUrl ? <img src={darkLogoUrl} alt={platformName} className="hidden h-10 w-auto dark:block" /> : null}
                                        </>
                                    ) : (
                                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-md">
                                            <span className="text-lg font-bold text-white">{platformName.charAt(0)}</span>
                                        </div>
                                    )}
                                    {!logoUrl && (
                                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            {platformName}
                                        </span>
                                    )}
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-1 rounded-full border border-gray-200/80 dark:border-gray-800 px-1 py-1 bg-white/85 dark:bg-gray-900/80 shadow-sm">
                                {navigation.map((item) => {
                                    try {
                                        const hrefPath = (() => {
                                            const u = item.href.startsWith('http') ? new URL(item.href) : new URL(item.href, 'http://localhost');
                                            return u.pathname || '/';
                                        })();
                                        const hrefHash = (() => {
                                            const u = item.href.startsWith('http') ? new URL(item.href) : new URL(item.href, 'http://localhost');
                                            return u.hash || '';
                                        })();
                                        const isActive = hrefHash
                                            ? currentPath === hrefPath && currentHash === hrefHash
                                            : currentPath === hrefPath && currentHash !== '#features';
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                                            >
                                                {item.icon ? <item.icon className="h-4 w-4" /> : null}
                                                {item.name}
                                            </Link>
                                        );
                                    } catch {
                                        return (
                                            <Link key={item.name} href={item.href} className="nav-link">
                                                {item.icon ? <item.icon className="h-4 w-4" /> : null}
                                                {item.name}
                                            </Link>
                                        );
                                    }
                                })}
                            </div>

                            {/* Auth Buttons */}
                            <div className="hidden md:flex items-center gap-3">
                                {!auth?.user && (
                                    <>
                                        {canLogin && (
                                            <Link href={route('login')}>
                                                <Button variant="ghost" size="sm">Sign In</Button>
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link href={route('register')}>
                                                <Button size="sm">
                                                    Get Started
                                                    <ArrowRight className="h-4 w-4 ml-1" />
                                                </Button>
                                            </Link>
                                        )}
                                    </>
                                )}
                                {auth?.user && (
                                    <Link
                                        href={
                                            Array.isArray(accounts) && accounts.length > 0
                                                ? route('app.dashboard', { })
                                                : route('onboarding')
                                        }
                                    >
                                        <Button size="sm">Dashboard</Button>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {navigation.map((item) => {
                                    try {
                                        const hrefPath = (() => {
                                            const u = item.href.startsWith('http') ? new URL(item.href) : new URL(item.href, 'http://localhost');
                                            return u.pathname || '/';
                                        })();
                                        const hrefHash = (() => {
                                            const u = item.href.startsWith('http') ? new URL(item.href) : new URL(item.href, 'http://localhost');
                                            return u.hash || '';
                                        })();
                                        const isActive = hrefHash
                                            ? currentPath === hrefPath && currentHash === hrefHash
                                            : currentPath === hrefPath && currentHash !== '#features';
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`block px-3 py-2.5 text-base font-medium rounded-lg ${isActive ? 'nav-link-active' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    } catch {
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="block px-3 py-2.5 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    {item.icon ? <item.icon className="h-4 w-4" /> : null}
                                                    {item.name}
                                                </span>
                                            </Link>
                                        );
                                    }
                                })}
                                {!auth?.user && (
                                    <div className="pt-4 space-y-2">
                                        {canLogin && (
                                            <Link
                                                href={route('login')}
                                                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Sign In
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="block px-3 py-2 text-base font-medium bg-blue-600 text-white rounded-md text-center"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>

                {/* Footer */}
                <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                        <div className="mb-10 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-900/70 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm uppercase tracking-wider text-gray-500">Start in minutes</p>
                                <h3 className="text-xl font-semibold text-white">Launch your WhatsApp operations stack today</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {canRegister && (
                                    <Link href={route('register')}>
                                        <Button size="sm">Create Free Account</Button>
                                    </Link>
                                )}
                                <Link href={route('pricing')}>
                                    <Button variant="secondary" size="sm">View Pricing</Button>
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                            {/* Brand */}
                            <div className="col-span-1 md:col-span-1">
                                <Link href={route('landing')} className="inline-flex items-center gap-2 mb-4 group">
                                    {logoUrl ? (
                                        <>
                                            <img src={logoUrl} alt={platformName} className={`h-9 w-auto ${darkLogoUrl ? 'dark:hidden' : ''}`} />
                                            {darkLogoUrl ? <img src={darkLogoUrl} alt={platformName} className="hidden h-9 w-auto dark:block" /> : null}
                                        </>
                                    ) : (
                                        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                                            <span className="text-sm font-bold text-white">{platformName.charAt(0)}</span>
                                        </div>
                                    )}
                                    {!logoUrl && <span className="text-lg font-bold text-white">{platformName}</span>}
                                </Link>
                                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                                    {footerText}
                                </p>
                            </div>

                            {/* Product */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Product</h3>
                                <ul className="space-y-3">
                                    {footerLinks.product.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Company */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Company</h3>
                                <ul className="space-y-3">
                                    {footerLinks.company.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Legal</h3>
                                <ul className="space-y-2">
                                    {footerLinks.legal.map((link) => (
                                        <li key={link.name}>
                                            {isExternal(link.href) ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm hover:text-white transition-colors"
                                                >
                                                    {link.name}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className="text-sm hover:text-white transition-colors"
                                                >
                                                    {link.name}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-800">
                            <p className="text-sm text-center text-gray-500">
                                © {new Date().getFullYear()} {platformName}. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
                <CookieConsentBanner />
                <AnalyticsScripts />
            </div>
        </BrandingWrapper>
    );
}
