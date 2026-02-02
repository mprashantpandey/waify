import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextType {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    children: ReactNode;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    className?: string;
}

export function Tabs({ children, defaultValue, value: controlledValue, onValueChange, className }: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleValueChange = (newValue: string) => {
        if (!isControlled) {
            setInternalValue(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
            <div className={cn('w-full', className)}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1 text-gray-500 dark:text-gray-400',
                className
            )}
            role="tablist"
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsTrigger must be used within Tabs');
    }

    const isActive = context.value === value;

    return (
        <button
            type="button"
            onClick={() => context.onValueChange(value)}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950',
                isActive
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error('TabsContent must be used within Tabs');
    }

    if (context.value !== value) {
        return null;
    }

    return (
        <div
            className={cn(
                'mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:ring-offset-gray-950',
                className
            )}
        >
            {children}
        </div>
    );
}

// Helper hook for using tabs
export function useTabs(defaultValue: string) {
    const [value, setValue] = useState(defaultValue);
    return { value, setValue };
}

