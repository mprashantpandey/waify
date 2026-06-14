import { Head, Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { AddonPage, MiniStatus, StatGrid } from './Shared';
import { ThemedIconTile } from '@/Components/UI/Elements';
import { Facebook, Instagram, MessageCircle, Plug, Radio, Smartphone, Webhook } from 'lucide-react';

type Channel = { id: string; name: string; color: string; connected: boolean; handle: string; metric: string; route: string };

const icons: Record<string, typeof MessageCircle> = {
    wa: MessageCircle,
    fb: Facebook,
    ig: Instagram,
    sms: Smartphone,
};

export default function Channels({ channels = [] }: { channels: Channel[] }) {
    return (
        <AppShell>
            <Head title="Channels" />
            <AddonPage title="Channels" description="One place to review customer messaging channels and connection readiness." actions={<Link href={route('app.integrations.index')}><Button variant="secondary"><Plug className="mr-2 h-4 w-4" />All integrations</Button></Link>}>
                <StatGrid stats={[
                    { label: 'Channels', value: channels.length, icon: Radio, tone: 'green' },
                    { label: 'Connected', value: channels.filter((item) => item.connected).length, icon: Plug, tone: 'blue' },
                    { label: 'Primary WABA', value: channels.find((item) => item.id === 'wa')?.connected ? 'Ready' : 'Missing', icon: MessageCircle, tone: 'green' },
                    { label: 'Webhook managed', value: 'Central', icon: Webhook, tone: 'purple' },
                ]} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {channels.map((channel) => {
                        const Icon = icons[channel.id] || Radio;
                        return (
                            <Card key={channel.id} className="h-full">
                                <CardContent className="flex h-full flex-col p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <ThemedIconTile tone={channel.connected ? 'green' : 'gray'}><Icon className="h-5 w-5" /></ThemedIconTile>
                                        <MiniStatus status={channel.connected ? 'connected' : 'draft'} />
                                    </div>
                                    <h3 className="mt-5 font-semibold text-waify-text dark:text-waify-dark-text">{channel.name}</h3>
                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{channel.handle}</p>
                                    <p className="mt-4 text-sm font-medium text-waify-text dark:text-waify-dark-text">{channel.metric}</p>
                                    <div className="mt-auto pt-5">
                                        <Link href={route(channel.route as 'app.whatsapp.connections.index' | 'app.integrations.index')}>
                                            <Button className="w-full" variant={channel.connected ? 'secondary' : 'primary'}>{channel.connected ? 'Manage' : 'Connect'}</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </AddonPage>
        </AppShell>
    );
}
