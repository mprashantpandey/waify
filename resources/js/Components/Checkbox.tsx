import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-waify-green shadow-sm focus:ring-waify-green/30 dark:border-waify-dark-border dark:bg-waify-dark-surface ' +
                className
            }
        />
    );
}
