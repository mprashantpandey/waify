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

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const xsrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

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
                'X-CSRF-TOKEN': csrfToken,
                'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            },
        },
        enabledTransports: ['ws', 'wss'],
        forceTLS: true,
        authorizer: (channel: any) => ({
            authorize: (socketId: string, callback: (error: any, data: any) => void) => {
                axios
                    .post(
                        config.authEndpoint,
                        {
                            socket_id: socketId,
                            channel_name: channel.name,
                        },
                        {
                            headers: {
                                'X-CSRF-TOKEN': csrfToken,
                                'X-XSRF-TOKEN': xsrfToken ? decodeURIComponent(xsrfToken) : '',
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json',
                            },
                            withCredentials: true,
                        }
                    )
                    .then((response) => callback(null, response.data))
                    .catch((error) => callback(error, null));
            },
        }),
    };

    echoInstance = new Echo(options);

    // Handle connection events
    echoInstance.connector.pusher.connection.bind('connected', () => {
        console.log('[Echo] Connected to Pusher');
    });

    echoInstance.connector.pusher.connection.bind('disconnected', () => {
        console.log('[Echo] Disconnected from Pusher');
    });

    echoInstance.connector.pusher.connection.bind('error', (err: any) => {
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
