import { ReactNode } from 'react';

type PublicPageHeroProps = {
    eyebrow?: string;
    icon?: ReactNode;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
};

export default function PublicPageHero({
    eyebrow,
    icon,
    title,
    description,
    actions,
    children,
}: PublicPageHeroProps) {
    return (
        <div className="relative mb-10 sm:mb-14">
            <div className="absolute inset-x-0 -top-6 h-44 rounded-3xl bg-gradient-to-r from-blue-100/70 via-indigo-100/60 to-cyan-100/70 blur-3xl dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20 pointer-events-none" />
            <div className="relative rounded-2xl border border-white/70 dark:border-gray-800 bg-white/85 dark:bg-gray-900/70 backdrop-blur shadow-sm px-5 py-7 sm:px-8 sm:py-10">
                {eyebrow && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {icon}
                        <span>{eyebrow}</span>
                    </div>
                )}
                <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {title}
                </h1>
                {description && (
                    <div className="mt-3 max-w-3xl text-sm sm:text-base lg:text-lg leading-7 text-gray-600 dark:text-gray-300">
                        {description}
                    </div>
                )}
                {actions && <div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>}
                {children && <div className="mt-6">{children}</div>}
            </div>
        </div>
    );
}
