import { ReactNode } from 'react';

export default function PublicPageHero({
    eyebrow,
    icon,
    title,
    description,
    actions,
    children,
}: {
    eyebrow?: string;
    icon?: ReactNode;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <section className="relative mb-12 overflow-hidden rounded-[2rem] border border-black/10 bg-white/80 px-6 py-8 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(180,83,9,0.10),_transparent_34%)]" />
            <div className="relative">
                {eyebrow ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
                        {icon}
                        <span>{eyebrow}</span>
                    </div>
                ) : null}
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    {title}
                </h1>
                {description ? (
                    <div className="mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                        {description}
                    </div>
                ) : null}
                {actions ? <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div> : null}
                {children ? <div className="mt-7">{children}</div> : null}
            </div>
        </section>
    );
}
