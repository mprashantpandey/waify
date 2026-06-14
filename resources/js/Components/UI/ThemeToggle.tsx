import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/Providers/ThemeProvider';

interface ThemeToggleProps {
    className?: string;
    showSystem?: boolean;
}

export function ThemeToggle({ className, showSystem = false }: ThemeToggleProps) {
    const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
    const Icon = resolvedTheme === 'dark' ? Sun : Moon;

    if (showSystem) {
        const options = [
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
            { value: 'system' as const, icon: Monitor, label: 'System' },
        ];

        return (
            <div className={cn('inline-flex rounded-btn border border-gray-200 bg-white p-1 dark:border-waify-dark-border dark:bg-waify-dark-surface', className)}>
                {options.map((option) => {
                    const OptionIcon = option.icon;
                    const active = theme === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setTheme(option.value)}
                            className={cn(
                                'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition',
                                active
                                    ? 'bg-waify-green text-waify-ink shadow-sm'
                                    : 'text-waify-text-muted hover:bg-gray-100 hover:text-waify-text dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text',
                            )}
                            aria-pressed={active}
                            title={option.label}
                        >
                            <OptionIcon className="h-3.5 w-3.5" aria-hidden />
                            <span className="hidden sm:inline">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-btn text-waify-text-muted transition hover:bg-gray-100 hover:text-waify-text focus:outline-none focus:ring-2 focus:ring-waify-green/25 dark:text-waify-dark-text-muted dark:hover:bg-waify-dark-surface-2 dark:hover:text-waify-dark-text',
                className,
            )}
            aria-label={resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={resolvedTheme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
            <Icon className="h-5 w-5" aria-hidden />
        </button>
    );
}
