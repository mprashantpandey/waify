import { Code2, LineChart, LockKeyhole, UserPlus, Users, Webhook } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Switch } from '@/Components/UI/Switch';

interface FeaturesTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

const featureGroups = [
    {
        title: 'Access',
        description: 'Control how users enter and create workspaces.',
        items: [
            {
                key: 'user_registration',
                label: 'Public registration',
                description: 'Allow new users to create an account from auth pages.',
                icon: UserPlus,
            },
            {
                key: 'email_verification',
                label: 'Email verification',
                description: 'Require users to verify email addresses after signup.',
                icon: LockKeyhole,
            },
            {
                key: 'account_creation',
                label: 'Workspace creation',
                description: 'Allow non-admin users to create additional workspaces.',
                icon: Users,
            },
        ],
    },
    {
        title: 'Developer Surface',
        description: 'Expose programmable surfaces only when the platform is ready for them.',
        items: [
            {
                key: 'public_api',
                label: 'Public API',
                description: 'Enable workspace API key usage and developer API access.',
                icon: Code2,
            },
            {
                key: 'webhooks',
                label: 'Workspace webhooks',
                description: 'Allow workspaces to configure outbound webhook endpoints.',
                icon: Webhook,
            },
            {
                key: 'analytics',
                label: 'Workspace analytics',
                description: 'Show analytics reports inside user workspaces.',
                icon: LineChart,
            },
        ],
    },
];

export default function FeaturesTab({ data, setData }: FeaturesTabProps) {
    const features = data.features || {};

    return (
        <div className="space-y-6">
            {featureGroups.map((group) => (
                <Card key={group.title}>
                    <CardHeader>
                        <CardTitle>{group.title}</CardTitle>
                        <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3 xl:grid-cols-2">
                        {group.items.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <div
                                    key={feature.key}
                                    className="flex items-center justify-between gap-4 rounded-card border border-gray-100 bg-white p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-emerald-500/15 dark:text-emerald-200">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{feature.label}</p>
                                            <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{feature.description}</p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={features[feature.key] || false}
                                        onCheckedChange={(checked) => setData(`features.${feature.key}`, checked)}
                                    />
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
