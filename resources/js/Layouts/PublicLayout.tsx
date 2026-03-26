import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import { getDarkLogoUrl, getFooterText, getLogoUrl, getPlatformName } from '@/lib/branding';
import { ArrowRight, ChevronRight, CreditCard, HelpCircle, Info, Mail, Menu, MessageSquare, Shield, X } from 'lucide-react';
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
    const currentPath = (page as any).url?.split('?')[0] || '';
    const canLogin = (window as any).route?.has?.('login') ?? true;
    const canRegister = (window as any).route?.has?.('register') ?? true;
    const termsUrl = compliance?.terms_url || route('terms');
    const privacyUrl = compliance?.privacy_url || route('privacy');
    const cookiePolicyUrl = compliance?.cookie_policy_url || route('cookie-policy');

    const navigation = useMemo(() => ([
        { name: 'Platform', href: route('landing') + '#platform', icon: MessageSquare },
        { name: 'Pricing', href: route('pricing'), icon: CreditCard },
        { name: 'Help', href: route('help'), icon: HelpCircle },
        { name: 'About', href: route('about'), icon: Info },
        { name: 'Contact', href: route('contact'), icon: Mail },
    ]), []);

    const footerLinks = {
        product: [
            { name: 'Platform', href: route('landing') + '#platform' },
            { name: 'Pricing', href: route('pricing') },
            { name: 'Help center', href: route('help') },
            { name: 'FAQs', href: route('faqs') },
        ],
        company: [
            { name: 'About', href: route('about') },
            { name: 'Contact', href: route('contact') },
            { name: 'Support', href: route('help') },
        ],
        legal: [
            { name: 'Privacy policy', href: privacyUrl },
            { name: 'Terms', href: termsUrl },
            { name: 'Refund policy', href: route('refund-policy') },
            ...(cookiePolicyUrl ? [{ name: 'Cookie policy', href: cookiePolicyUrl }] : []),
            { name: 'Sitemap', href: route('sitemap') },
        ],
    };

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [currentPath]);

    const authCta = auth?.user
        ? {
              href: Array.isArray(accounts) && accounts.length > 0 ? route('app.dashboard') : route('onboarding'),
              label: 'Open workspace',
          }
        : null;

    return (
        <BrandingWrapper>
            <AnalyticsScripts />
            <div className="min-h-screen bg-[#f7f3eb] text-slate-900">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,_rgba(10,132,103,0.12),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(180,83,9,0.10),_transparent_32%),linear-gradient(180deg,_rgba(255,255,255,0.72),_rgba(247,243,235,0.92))]" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
                </div>

                <div className="relative z-10 flex min-h-screen flex-col">
                    <nav className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f3eb]/88 backdrop-blur-xl">
                        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-10">
                                <Link href={route('landing')} className="flex items-center gap-3">
                                    {logoUrl ? (
                                        <>
                                            <img src={logoUrl} alt={platformName} className={`h-10 w-auto ${darkLogoUrl ? 'dark:hidden' : ''}`} />
                                            {darkLogoUrl ? <img src={darkLogoUrl} alt={platformName} className="hidden h-10 w-auto dark:block" /> : null}
                                        </>
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f766e] text-lg font-semibold text-white shadow-[0_18px_48px_-22px_rgba(15,118,110,0.7)]">
                                            {platformName.charAt(0)}
                                        </div>
                                    )}
                                    {!logoUrl ? <span className="text-lg font-semibold tracking-tight">{platformName}</span> : null}
                                </Link>

                                <div className="hidden items-center gap-1 md:flex">
                                    {navigation.map((item) => {
                                        const hrefPath = (() => {
                                            const url = item.href.startsWith('http') ? new URL(item.href) : new URL(item.href, 'http://localhost');
                                            return url.pathname || '/';
                                        })();
                                        const isActive = currentPath === hrefPath || (hrefPath !== '/' && currentPath.startsWith(hrefPath));

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                                    isActive
                                                        ? 'bg-slate-900 text-white shadow-sm'
                                                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                                }`}
                                            >
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="hidden items-center gap-3 md:flex">
                                {!auth?.user ? (
                                    <>
                                        {canLogin ? (
                                            <Link href={route('login')}>
                                                <Button variant="ghost" size="sm" className="rounded-full border border-black/10 bg-white/70 px-5">
                                                    Sign in
                                                </Button>
                                            </Link>
                                        ) : null}
                                        {canRegister ? (
                                            <Link href={route('register')}>
                                                <Button size="sm" className="rounded-full bg-[#0f766e] px-5 hover:bg-[#115e59]">
                                                    Start free
                                                </Button>
                                            </Link>
                                        ) : null}
                                    </>
                                ) : authCta ? (
                                    <Link href={authCta.href}>
                                        <Button size="sm" className="rounded-full bg-[#0f766e] px-5 hover:bg-[#115e59]">
                                            {authCta.label}
                                        </Button>
                                    </Link>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/10 bg-white text-slate-700 md:hidden"
                                onClick={() => setMobileMenuOpen((value) => !value)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>

                        {mobileMenuOpen ? (
                            <div className="border-t border-black/5 bg-[#f7f3eb] px-4 py-4 md:hidden">
                                <div className="space-y-2">
                                    {navigation.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                                        >
                                            <span>{item.name}</span>
                                            <ChevronRight className="h-4 w-4 text-slate-400" />
                                        </Link>
                                    ))}
                                </div>
                                <div className="mt-4 grid gap-2">
                                    {!auth?.user ? (
                                        <>
                                            {canLogin ? (
                                                <Link href={route('login')} className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-center text-sm font-medium text-slate-700">
                                                    Sign in
                                                </Link>
                                            ) : null}
                                            {canRegister ? (
                                                <Link href={route('register')} className="rounded-2xl bg-[#0f766e] px-4 py-3 text-center text-sm font-medium text-white">
                                                    Start free
                                                </Link>
                                            ) : null}
                                        </>
                                    ) : authCta ? (
                                        <Link href={authCta.href} className="rounded-2xl bg-[#0f766e] px-4 py-3 text-center text-sm font-medium text-white">
                                            {authCta.label}
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </nav>

                    <main className="flex-1">{children}</main>

                    <section className="border-t border-black/5 px-4 py-12 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl rounded-[2rem] border border-black/10 bg-[#0f172a] px-6 py-10 text-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.9)] sm:px-8 lg:px-10">
                            <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr] lg:items-center">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                                        <Shield className="h-3.5 w-3.5" />
                                        Official Meta tech provider
                                    </div>
                                    <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                                        Run WhatsApp operations from one clean workspace.
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                                        Connect numbers, manage templates, assign conversations, automate replies, and keep billing predictable without stitching tools together.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                                    {canRegister ? (
                                        <Link href={route('register')}>
                                            <Button size="lg" className="w-full rounded-full bg-[#14b8a6] text-slate-950 hover:bg-[#2dd4bf] sm:w-auto">
                                                Start free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : null}
                                    <Link href={route('pricing')}>
                                        <Button size="lg" variant="ghost" className="w-full rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto">
                                            See pricing
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    <footer className="border-t border-black/5 px-4 py-10 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-7xl">
                            <div className="grid gap-10 lg:grid-cols-[1.3fr,1fr,1fr,1fr]">
                                <div>
                                    <div className="flex items-center gap-3">
                                        {logoUrl ? (
                                            <>
                                                <img src={logoUrl} alt={platformName} className={`h-10 w-auto ${darkLogoUrl ? 'dark:hidden' : ''}`} />
                                                {darkLogoUrl ? <img src={darkLogoUrl} alt={platformName} className="hidden h-10 w-auto dark:block" /> : null}
                                            </>
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0f766e] text-lg font-semibold text-white">
                                                {platformName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
                                        WhatsApp operations for teams that want one platform for setup, conversations, automation, and billing.
                                    </p>
                                    <p className="mt-5 text-xs text-slate-500">{footerText || `© ${new Date().getFullYear()} ${platformName}. All rights reserved.`}</p>
                                </div>

                                <FooterColumn title="Product" links={footerLinks.product} />
                                <FooterColumn title="Company" links={footerLinks.company} />
                                <FooterColumn title="Legal" links={footerLinks.legal} />
                            </div>
                        </div>
                    </footer>
                </div>

                <CookieConsentBanner />
            </div>
        </BrandingWrapper>
    );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ name: string; href: string }> }) {
    return (
        <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {links.map((link) => (
                    <li key={link.name}>
                        <Link href={link.href} className="transition-colors hover:text-slate-950">
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
