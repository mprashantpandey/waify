export default function ZyptosLogo({
    size = 30,
    withText = true,
    textClassName = 'text-waify-text',
}: {
    size?: number;
    withText?: boolean;
    textClassName?: string;
}) {
    return (
        <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
                <defs>
                    <linearGradient id={`zyptosLogo${size}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00A548" />
                        <stop offset="100%" stopColor="#128C7E" />
                    </linearGradient>
                </defs>
                <path
                    d="M20 3 C29.4 3 37 9.8 37 18.2 C37 26.6 29.4 33.4 20 33.4 C18.2 33.4 16.4 33.1 14.7 32.6 L5 35 L7.5 26.6 C5.9 24.1 5 21.2 5 18.2 C5 9.8 12.6 3 20 3 Z"
                    fill={`url(#zyptosLogo${size})`}
                />
                <path
                    d="M11.5 13 L14.5 25 L17.5 17 L20.5 25 L23.5 17 L26.5 25 L29.5 13"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </svg>
            {withText && <span className={`text-lg font-bold tracking-tight ${textClassName}`}>Zyptos</span>}
        </span>
    );
}
