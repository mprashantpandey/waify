import { Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Info, Lightbulb, Sparkles, X } from 'lucide-react';
import { getPageMeta } from '@/lib/navigationMeta';
import { Tooltip } from '@/Components/UI/Tooltip';

function resolveRoute(routeName: string): string | null {
    try {
        return route(routeName);
    } catch {
        try {
            if (routeName.endsWith('.index')) {
                return route(routeName.slice(0, -'.index'.length));
            }
            return route(`${routeName}.index`);
        } catch {
            return null;
        }
    }
}

export function ContextualGuide() {
    const page = usePage() as any;
    const componentName = page.component as string | undefined;
    const meta = getPageMeta(componentName);
    const [dismissed, setDismissed] = useState(false);

    const storageKey = useMemo(() => `zyptos:guide-hidden:${componentName ?? 'unknown'}`, [componentName]);

    useEffect(() => {
        if (!componentName) return;
        setDismissed(localStorage.getItem(storageKey) === '1');
    }, [componentName, storageKey]);

    if (!meta || dismissed) {
        return null;
    }

    const actions = (meta.quickActions ?? [])
        .map((action) => ({ ...action, href: resolveRoute(action.route) }))
        .filter((action) => action.href);

    return (
        <section className="border-b border-blue-100/80 bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:border-blue-900/40 dark:from-blue-950/40 dark:via-gray-900 dark:to-indigo-950/30">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-4 lg:px-8">
                <div className="rounded-2xl border border-blue-100/80 bg-white/85 p-4 shadow-sm ring-1 ring-blue-100/60 backdrop-blur dark:border-blue-900/40 dark:bg-gray-900/80 dark:ring-blue-900/30">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                {meta.section}
                            </div>
                            <div className="mt-1 flex items-start gap-2">
                                <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50">{meta.title}</h2>
                                <Tooltip content="These tips change based on the page you are on, so new users can move faster without guessing.">
                                    <button type="button" className="mt-0.5 text-gray-400 transition hover:text-blue-600 dark:hover:text-blue-300" aria-label="Page help">
                                        <Info className="h-4 w-4" />
                                    </button>
                                </Tooltip>
                            </div>
                            <p className="mt-1 max-w-3xl text-sm text-gray-600 dark:text-gray-300">{meta.description}</p>
                            {!!meta.tips?.length && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {meta.tips.map((tip) => (
                                        <span key={tip} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200">
                                            <Lightbulb className="h-3.5 w-3.5" />
                                            {tip}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap lg:max-w-sm lg:justify-end">
                            {actions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.href as string}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-700 hover:shadow-sm dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                                >
                                    {action.label}
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    localStorage.setItem(storageKey, '1');
                                    setDismissed(true);
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-3.5 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                                <X className="h-4 w-4" />
                                Hide tips
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
