import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { BrandingWrapper } from '@/Components/Branding/BrandingWrapper';
import BrandLogo from '@/Components/Branding/BrandLogo';
import { ThemeToggle } from '@/Components/UI/ThemeToggle';
import { Bot, CheckCircle2, CreditCard, MessageSquare, type LucideIcon } from 'lucide-react';

interface GuestProps extends PropsWithChildren {
    headerLabel?: string;
    headerLinkText?: string;
    headerLinkHref?: string;
    compactCard?: boolean;
}

export default function Guest({ children, headerLabel, headerLinkText, headerLinkHref, compactCard = false }: GuestProps) {
    const setupItems: Array<[LucideIcon, string]> = [
        [MessageSquare, 'Connect WhatsApp Cloud API or QR mode'],
        [Bot, 'Create sales, support, and handoff automations'],
        [CreditCard, 'Prepare Razorpay payment links and billing'],
        [CheckCircle2, 'Invite agents and verify notifications'],
    ];

    return (
        <BrandingWrapper>
            <div className="min-h-screen bg-white text-waify-text antialiased dark:bg-waify-dark-bg dark:text-waify-dark-text">
                <div className="min-h-screen flex">
                    <div className="flex-1 flex flex-col">
                        <header className="h-16 px-6 sm:px-10 flex items-center justify-between flex-shrink-0">
                            <Link href={route('landing')} className="flex items-center gap-2">
                                <BrandLogo variant="auto" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <ThemeToggle />
                                {headerLinkText && headerLinkHref ? (
                                    <div className="hidden text-sm text-waify-text-muted dark:text-waify-dark-text-muted sm:block">
                                        {headerLabel}{' '}
                                        <Link href={headerLinkHref} className="font-semibold text-waify-green-dark hover:underline dark:text-emerald-300">
                                            {headerLinkText}
                                        </Link>
                                    </div>
                                ) : (
                                    <Link
                                        href={route('landing')}
                                        className="hidden sm:inline-flex text-sm font-semibold text-waify-green-dark hover:underline dark:text-emerald-200"
                                    >
                                        Back to website
                                    </Link>
                                )}
                            </div>
                        </header>

                        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
                            <div className={compactCard ? 'w-full max-w-md' : 'w-full max-w-md'}>
                                {children}
                            </div>
                        </div>
                    </div>

                    <aside className="hidden lg:flex w-[480px] xl:w-[560px] flex-shrink-0 bg-waify-ink p-10 relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                                backgroundSize: '32px 32px',
                            }}
                        />

                        <div className="relative flex flex-col justify-between text-white w-full">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Zyptos workspace</p>
                                <h2 className="mt-3 text-3xl font-bold leading-tight">Launch your WhatsApp command center with the right setup.</h2>
                                <p className="mt-3 text-sm leading-6 text-white/65">
                                    Connect a WABA, invite agents, build automations, and keep billing ready before you start live campaigns.
                                </p>
                            </div>

                            <div className="relative my-10 flex justify-center">
                                <div className="rounded-[36px] bg-black p-2 shadow-pop w-72">
                                    <div className="rounded-[28px] overflow-hidden bg-white">
                                        <div className="bg-waify-green-darker px-4 py-3 flex items-center gap-3 text-white">
                                            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">Z</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm">Zyptos setup preview</div>
                                                <div className="text-[10px] text-white/70">ready for onboarding</div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-[#ECE5DD] min-h-[280px] flex flex-col gap-2">
                                            <div className="self-start bg-white max-w-[85%] px-3 py-2 rounded-tl-md rounded-2xl shadow-sm">
                                                <p className="text-[12px] text-waify-text">Welcome to Zyptos. Connect your WhatsApp number to start testing.</p>
                                                <div className="text-[9px] text-right text-gray-400 mt-1">10:24 AM</div>
                                            </div>
                                            <div className="self-end bg-[#DCF8C6] max-w-[80%] px-3 py-2 rounded-tr-md rounded-2xl shadow-sm">
                                                <p className="text-[12px] text-waify-text">I want to set up agents and automation first.</p>
                                                <div className="text-[9px] text-right text-gray-500 mt-1">10:31 AM</div>
                                            </div>
                                            <div className="self-center text-[10px] text-gray-600 bg-white/70 rounded px-2 py-0.5 font-medium mt-2">
                                                Bot handoff and team assignment ready
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-2 -right-2 bg-white rounded-xl shadow-pop px-3 py-2 text-waify-text">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] font-semibold">Workspace checklist</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                {setupItems.map(([Icon, label]) => (
                                    <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/80">
                                        <Icon className="h-4 w-4 text-emerald-300" />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </BrandingWrapper>
    );
}
