import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any> | null;
    }
}

let echoInstance: Echo<any> | null = null;
const realtimeDebug = import.meta.env.VITE_REALTIME_DEBUG === 'true';

export function initializeEcho(config: {
    pusherKey: string;
    pusherCluster: string;
    authEndpoint: string;
}): Echo<any> {
    if (echoInstance) {
        return echoInstance;
    }

    // Make Pusher available globally
    window.Pusher = Pusher;

    // Helper function to get current CSRF token (reads from meta tag which is updated by bootstrap.ts)
    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const getXsrfToken = () => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '';
    };

    const cluster = config.pusherCluster?.trim();
    if (!cluster || cluster === '') {
        throw new Error('Pusher cluster is missing. Set a cluster or provide a custom host.');
    }

    const options: any = {
        broadcaster: 'pusher',
        key: config.pusherKey,
        authEndpoint: config.authEndpoint,
        cluster,
        auth: {
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-XSRF-TOKEN': getXsrfToken() ? decodeURIComponent(getXsrfToken()) : '',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'}},
        enabledTransports: ['ws', 'wss'],
        forceTLS: true,
        authorizer: (channel: any) => ({
            authorize: (socketId: string, callback: (error: any, data: any) => void) => {
                // Get fresh tokens for each authorization request
                const currentCsrfToken = getCsrfToken();
                const currentXsrfToken = getXsrfToken();
                
                axios
                    .post(
                        config.authEndpoint,
                        {
                            socket_id: socketId,
                            channel_name: channel.name},
                        {
                            headers: {
                                'X-CSRF-TOKEN': currentCsrfToken,
                                'X-XSRF-TOKEN': currentXsrfToken ? decodeURIComponent(currentXsrfToken) : '',
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json'},
                            withCredentials: true}
                    )
                    .then((response) => callback(null, response.data))
                    .catch((error) => {
                        if (realtimeDebug) {
                            console.error('[Echo] Channel authorization failed', {
                                channel: channel.name,
                                status: error.response?.status,
                                statusText: error.response?.statusText,
                                data: error.response?.data,
                                message: error.message,
                                hasCsrfToken: !!currentCsrfToken,
                                hasXsrfToken: !!currentXsrfToken,
                            });
                        }
                        
                        // Return error to Pusher
                        callback(error, null);
                    });
            }})};

    echoInstance = new Echo(options);

    // Handle connection events
    echoInstance.connector.pusher.connection.bind('connected', () => {
        if (realtimeDebug) {
            console.log('[Echo] Connected to Pusher');
        }
    });

    echoInstance.connector.pusher.connection.bind('disconnected', () => {
        if (realtimeDebug) {
            console.log('[Echo] Disconnected from Pusher');
        }
    });

    echoInstance.connector.pusher.connection.bind('error', (err: any) => {
        if (!realtimeDebug) return;
        const detail = err?.error?.data || err?.error || err;
        console.error('[Echo] Connection error:', detail);
    });

    window.Echo = echoInstance;

    return echoInstance;
}

export function getEcho(): Echo<any> | null {
    return echoInstance || window.Echo || null;
}

export function disconnectEcho(): void {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
        window.Echo = null;
    }
}
