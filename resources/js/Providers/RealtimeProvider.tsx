import { createContext, useContext, useEffect, useMemo, useRef, useState, ReactNode, useCallback } from 'react';
import { initializeEcho, getEcho, disconnectEcho } from '@/realtime/echo';
import Echo from 'laravel-echo';

interface RealtimeConfig {
    pusherKey: string;
    pusherCluster: string;
}

interface RealtimeContextType {
    echo: Echo<any> | null;
    connected: boolean;
    subscribe: (channel: string, event: string, callback: (data: any) => void) => () => void;
    unsubscribe: (channel: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);
const realtimeDebug = import.meta.env.VITE_REALTIME_DEBUG === 'true';

interface RealtimeProviderProps {
    children: ReactNode;
    pusherConfig?: RealtimeConfig;
}

export function RealtimeProvider({ children, pusherConfig }: RealtimeProviderProps) {
    const [echo, setEcho] = useState<Echo<any> | null>(null);
    const [connected, setConnected] = useState(false);
    const subscribedChannels = useRef<Map<string, any>>(new Map());
    const pusherKey = pusherConfig?.pusherKey?.trim() || '';
    const pusherCluster = pusherConfig?.pusherCluster?.trim() || '';

    useEffect(() => {
        if (!pusherKey) {
            if (realtimeDebug) {
                console.warn('[RealtimeProvider] Pusher config not available, realtime disabled');
            }
            return;
        }

        let echoInstance: Echo<any> | null = null;

        try {
            if (!pusherCluster) {
                if (realtimeDebug) {
                    console.warn('[RealtimeProvider] Missing Pusher cluster. Set cluster in Platform Settings or provide a custom host.');
                }
                return;
            }
            echoInstance = initializeEcho({
                pusherKey,
                pusherCluster,
                authEndpoint: '/broadcasting/auth'});

            setEcho(echoInstance);
            (window as any).__echo = echoInstance;

            // Monitor connection state
            const pusher = echoInstance.connector.pusher;
            setConnected(pusher.connection.state === 'connected');

            pusher.connection.bind('connected', () => {
                if (realtimeDebug) {
                    console.log('[RealtimeProvider] Pusher connected');
                }
                setConnected(true);
            });

            pusher.connection.bind('disconnected', () => {
                setConnected(false);
            });

            pusher.connection.bind('error', () => {
                setConnected(false);
            });

            pusher.connection.bind('message', (event: any) => {
                if (realtimeDebug && event?.event === 'pusher:error') {
                    console.error('[Echo] Pusher error', event?.data);
                }
            });
        } catch (error) {
            if (realtimeDebug) {
                console.error('[RealtimeProvider] Failed to initialize Echo:', error);
            }
        }

        return () => {
            const channelsToLeave = new Set<string>();

            subscribedChannels.current.forEach((entry, subscriptionKey) => {
                if (entry?.echoChannel && entry?.event) {
                    entry.echoChannel.stopListening(entry.event);
                }
                channelsToLeave.add(subscriptionKey.split(':')[0]);
            });

            channelsToLeave.forEach((channel) => echoInstance?.leave(channel));
            subscribedChannels.current.clear();
            disconnectEcho();
        };
    }, [pusherKey, pusherCluster]);

    const subscribe = useCallback(
        (
        channel: string,
        event: string,
        callback: (data: any) => void
        ): (() => void) => {
            if (!echo) {
                if (realtimeDebug) {
                    console.warn('[RealtimeProvider] Echo not initialized, cannot subscribe to', channel);
                }
                return () => {};
            }

            try {
                const echoChannel = echo.private(channel);
                const subscriptionKey = `${channel}:${event}`;

                // Check if already subscribed to avoid duplicates
                if (subscribedChannels.current.has(subscriptionKey)) {
                    return () => {};
                }

                // Handle subscription errors
                echoChannel.error((error: any) => {
                    if (realtimeDebug) {
                        console.error('[RealtimeProvider] Channel subscription error', {
                            channel,
                            event,
                            error: error?.message || error,
                            status: error?.status,
                        });
                    }
                });

                // Set up event listener - Echo will handle subscription automatically
                // The listener will work once the channel is subscribed
                const eventHandler = (data: any) => {
                    if (realtimeDebug) {
                        console.log('[RealtimeProvider] Received event', { channel, event, data });
                    }
                    callback(data);
                };
                
                echoChannel.listen(event, eventHandler);
                
                // Log when channel is subscribed for debugging
                echoChannel.subscribed(() => {
                    if (realtimeDebug) {
                        console.log('[RealtimeProvider] Channel subscribed successfully', { channel, event });
                    }
                });
                
                subscribedChannels.current.set(subscriptionKey, { echoChannel, event });
                
                if (realtimeDebug) {
                    console.log('[RealtimeProvider] Successfully subscribed to channel', { channel, event });
                }

                return () => {
                    echoChannel.stopListening(event);
                    subscribedChannels.current.delete(subscriptionKey);

                    const stillListening = Array.from(subscribedChannels.current.keys())
                        .some((key) => key.startsWith(`${channel}:`));

                    if (!stillListening) {
                        echo.leave(channel);
                    }
                };
            } catch (error) {
                if (realtimeDebug) {
                    console.error('[RealtimeProvider] Failed to subscribe to', channel, event, error);
                }
                return () => {};
            }
        }
    , [echo]);

    const unsubscribe = useCallback((channel: string): void => {
        subscribedChannels.current.forEach((entry, subscriptionKey) => {
            if (!subscriptionKey.startsWith(`${channel}:`)) {
                return;
            }

            if (entry?.echoChannel && entry?.event) {
                entry.echoChannel.stopListening(entry.event);
            }

            subscribedChannels.current.delete(subscriptionKey);
        });

        echo?.leave(channel);
    }, [echo]);

    const contextValue = useMemo(
        () => ({ echo, connected, subscribe, unsubscribe }),
        [echo, connected, subscribe, unsubscribe]
    );

    return (
        <RealtimeContext.Provider value={contextValue}>
            {children}
        </RealtimeContext.Provider>
    );
}

export function useRealtime(): RealtimeContextType {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error('useRealtime must be used within RealtimeProvider');
    }
    return context;
}
