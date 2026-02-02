import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        value,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    // Convert null/undefined to empty string to avoid React warnings
    const safeValue = value === null || value === undefined ? '' : value;

    return (
        <input
            {...props}
            type={type}
            value={safeValue}
            className={
                'w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
                'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ' +
                'dark:focus:border-indigo-500 dark:focus:ring-indigo-500 ' +
                className
            }
            ref={localRef}
        />
    );
});
