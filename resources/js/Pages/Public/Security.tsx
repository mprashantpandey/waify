import { Head } from '@inertiajs/react';
import { Card, MarketingIcon, MarketingLayout } from '@/Components/Public/Marketing';

export default function Security() {
    return (
        <MarketingLayout page="security" wide>
            <Head title="Security" />
            <div className="grid gap-4 sm:grid-cols-2">
                {[
                    ['shield', 'Encryption', 'TLS in transit and encrypted storage for sensitive credentials.'],
                    ['key', 'Access control', 'Workspace roles, admin separation, impersonation logs, and permission checks.'],
                    ['server', 'Infrastructure', 'Operational monitoring for app, queues, cron, storage, pusher, and delivery systems.'],
                    ['bell', 'Incident response', 'Webhook verification, audit trails, and escalation workflow for confirmed incidents.'],
                ].map(([icon, title, body]) => (
                    <Card key={title} className="mkt-card-lift p-5">
                        <MarketingIcon name={icon} size={22} className="mb-3 text-waify-green-dark" />
                        <h2 className="font-semibold">{title}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body}</p>
                    </Card>
                ))}
            </div>
            <Card className="mt-6 p-6">
                <h2 className="font-semibold">Report a vulnerability</h2>
                <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                    Email <a href="mailto:security@zyptos.com" className="text-waify-green-dark hover:underline">security@zyptos.com</a> with reproducible details. Please avoid accessing customer data while validating reports.
                </p>
            </Card>
        </MarketingLayout>
    );
}
