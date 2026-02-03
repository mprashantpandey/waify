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

interface RealtimeProviderProps {
    children: ReactNode;
    pusherConfig?: RealtimeConfig;
}

export function RealtimeProvider({ children, pusherConfig }: RealtimeProviderProps) {
    const [echo, setEcho] = useState<Echo<any> | null>(null);
    const [connected, setConnected] = useState(false);
    const subscribedChannels = useRef<Map<string, any>>(new Map());

    useEffect(() => {
        const config = pusherConfig
            ? {
                  ...pusherConfig,
                  pusherCluster: pusherConfig.pusherCluster?.trim() || undefined}
            : undefined;

        if (!config || !config.pusherKey) {
            console.warn('[RealtimeProvider] Pusher config not available, realtime disabled');
            return;
        }

        try {
            if (!config.pusherCluster) {
                console.warn('[RealtimeProvider] Missing Pusher cluster. Set cluster in Platform Settings or provide a custom host.');
                return;
            }
            const echoInstance = initializeEcho({
                pusherKey: config.pusherKey,
                pusherCluster: config.pusherCluster,
                authEndpoint: '/broadcasting/auth'});

            setEcho(echoInstance);
            (window as any).__echo = echoInstance;

            // Monitor connection state
            const pusher = echoInstance.connector.pusher;
            setConnected(pusher.connection.state === 'connected');

            pusher.connection.bind('connected', () => {
                console.log('[RealtimeProvider] Pusher connected');
                setConnected(true);
            });

            pusher.connection.bind('disconnected', () => {
                setConnected(false);
            });

            pusher.connection.bind('error', () => {
                setConnected(false);
            });

            pusher.connection.bind('message', (event: any) => {
                if (event?.event === 'pusher:error') {
                    console.error('[Echo] Pusher error', event?.data);
                }
            });
        } catch (error) {
            console.error('[RealtimeProvider] Failed to initialize Echo:', error);
        }

        return () => {
            // Cleanup on unmount
            Array.from(subscribedChannels.current.values()).forEach((channel) => {
                if (channel && typeof channel.unsubscribe === 'function') {
                    channel.unsubscribe();
                }
            });
            subscribedChannels.current.clear();
            disconnectEcho();
        };
    }, [pusherConfig]);

    const subscribe = useCallback(
        (
        channel: string,
        event: string,
        callback: (data: any) => void
        ): (() => void) => {
            if (!echo) {
                console.warn('[RealtimeProvider] Echo not initialized, cannot subscribe to', channel);
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
                    console.error('[RealtimeProvider] Channel subscription error', {
                        channel,
                        event,
                        error: error?.message || error,
                        status: error?.status,
                    });
                });

                // Set up event listener - Echo will handle subscription automatically
                // The listener will work once the channel is subscribed
                const eventHandler = (data: any) => {
                    console.log('[RealtimeProvider] Received event', { channel, event, data });
                    callback(data);
                };
                
                echoChannel.listen(event, eventHandler);
                
                // Log when channel is subscribed for debugging
                echoChannel.subscribed(() => {
                    console.log('[RealtimeProvider] Channel subscribed successfully', { channel, event });
                });
                
                // Also listen to all events on this channel for debugging
                echoChannel.listen('.', (eventName: string, data: any) => {
                    console.log('[RealtimeProvider] Received any event on channel', { channel, eventName, data });
                });
                
                subscribedChannels.current.set(subscriptionKey, echoChannel);
                
                console.log('[RealtimeProvider] Successfully subscribed to channel', { channel, event });

                return () => {
                    echoChannel.stopListening(event);
                    subscribedChannels.current.delete(subscriptionKey);
                };
            } catch (error) {
                console.error('[RealtimeProvider] Failed to subscribe to', channel, event, error);
                return () => {};
            }
        }
    , [echo]);

    const unsubscribe = useCallback((channel: string): void => {
        const echoChannel = subscribedChannels.current.get(channel);
        if (echoChannel) {
            echoChannel.unsubscribe();
            subscribedChannels.current.delete(channel);
        }
    }, []);

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
