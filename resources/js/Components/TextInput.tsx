import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef} from 'react';

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
        focus: () => localRef.current?.focus()}));

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
                'flex h-10 w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text shadow-sm ' +
                'placeholder:text-gray-400 focus:border-waify-green focus:outline-none focus:ring-2 focus:ring-waify-green/20 disabled:cursor-not-allowed disabled:opacity-50 ' +
                'dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text dark:placeholder:text-waify-dark-text-muted dark:focus:ring-waify-green/30 ' +
                className
            }
            ref={localRef}
        />
    );
});
