import PublicLayout from '@/Layouts/PublicLayout';
import { PropsWithChildren, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

export default function LegalDocumentPage({
    title,
    eyebrow = 'Legal',
    icon,
    lastUpdated,
    content,
    children,
}: PropsWithChildren<{
    title: string;
    eyebrow?: string;
    icon?: ReactNode;
    lastUpdated?: string;
    content?: string;
}>) {
    const hasCustomContent = Boolean(content && content.trim() !== '');

    return (
        <PublicLayout>
            <Head title={title} />
            <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <section className="rounded-[2rem] border border-black/10 bg-white/85 p-6 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
                                {icon}
                                <span>{eyebrow}</span>
                            </div>
                            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
                            {lastUpdated ? <p className="mt-3 text-sm text-slate-500">Last updated: {lastUpdated}</p> : null}
                        </div>
                        <Link href={route('contact')} className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-950">
                            Need clarification?
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <section className="mt-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_-52px_rgba(15,23,42,0.45)] sm:p-8 lg:p-10">
                    {hasCustomContent ? (
                        <div className="whitespace-pre-wrap text-sm leading-8 text-slate-700 sm:text-base">{content}</div>
                    ) : (
                        <div className="space-y-6 text-sm leading-8 text-slate-700 sm:text-base">{children}</div>
                    )}
                </section>
            </div>
        </PublicLayout>
    );
}
