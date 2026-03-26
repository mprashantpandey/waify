import PublicLayout from '@/Layouts/PublicLayout';
import { PropsWithChildren, ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

type LegalDocumentPageProps = PropsWithChildren<{
    title: string;
    eyebrow?: string;
    icon?: ReactNode;
    lastUpdated?: string;
    content?: string;
}>;

export default function LegalDocumentPage({
    title,
    eyebrow = 'Legal',
    icon,
    lastUpdated,
    content,
    children,
}: LegalDocumentPageProps) {
    const hasCustomContent = Boolean(content && content.trim() !== '');

    return (
        <PublicLayout>
            <Head title={title} />
            <div className="relative">
                <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-blue-50 via-indigo-50 to-transparent dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-transparent pointer-events-none" />
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
                    <div className="mb-8 rounded-2xl border border-white/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur shadow-sm p-6 sm:p-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                                    {icon}
                                    <span>{eyebrow}</span>
                                </div>
                                <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                    {title}
                                </h1>
                                {lastUpdated && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Last updated: {lastUpdated}
                                    </p>
                                )}
                            </div>
                            <div className="text-sm">
                                <Link href={route('contact')} className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
                                    Need clarification? Contact support
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />
                        <div className="p-6 sm:p-8">
                            {hasCustomContent ? (
                                <div className="whitespace-pre-wrap text-sm sm:text-base leading-7 text-gray-700 dark:text-gray-300">
                                    {content}
                                </div>
                            ) : (
                                <div className="space-y-6 text-sm sm:text-base leading-7 text-gray-700 dark:text-gray-300">
                                    {children}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
