import { Head, useForm } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';
import { Switch } from '@/Components/UI/Switch';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';

interface Module {
    id: number;
    key: string;
    name: string;
}

export default function PlansCreate({ modules, default_currency = 'USD' }: { modules: Module[]; default_currency?: string }) {
    const { auth } = usePage().props as any;
    const { addToast } = useToast();

    const { data, setData, post, processing, errors } = useForm({
        key: '',
        name: '',
        description: '',
        price_monthly: null as number | null,
        price_yearly: null as number | null,
        is_active: true,
        is_public: true,
        trial_days: 0,
        sort_order: 0,
        limits: {
            agents: 1,
            whatsapp_connections: 1,
            messages_monthly: 500,
            template_sends_monthly: 0,
            ai_credits_monthly: 0,
            retention_days: 30},
        modules: [] as string[]});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('platform.plans.store'), {
            onSuccess: () => {
                addToast({
                    title: 'Plan Created',
                    description: 'The plan has been created successfully.',
                    variant: 'success'});
            },
            onError: (errors) => {
                addToast({
                    title: 'Error',
                    description: Object.values(errors)[0] as string || 'Failed to create plan. Please check the form.',
                    variant: 'error'});
            }});
    };

    const toggleModule = (moduleKey: string) => {
        const currentModules = data.modules || [];
        if (currentModules.includes(moduleKey)) {
            setData('modules', currentModules.filter((m: string) => m !== moduleKey));
        } else {
            setData('modules', [...currentModules, moduleKey]);
        }
    };

    const updateLimit = (key: string, value: string) => {
        const numValue = value === '' || value === '-1' ? -1 : parseInt(value) || 0;
        setData('limits', {
            ...data.limits,
            [key]: numValue});
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="Create Plan" />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('platform.plans.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Plans
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Plan</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Create a new subscription plan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Plan identification and basic details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="key">Plan Key *</Label>
                                    <Input
                                        id="key"
                                        value={data.key}
                                        onChange={(e) => setData('key', e.target.value)}
                                        placeholder="starter"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Unique identifier (lowercase, no spaces, e.g., "starter", "pro")
                                    </p>
                                    {errors.key && (
                                        <p className="text-sm text-red-600 mt-1">{errors.key}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="name">Plan Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Starter Plan"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                    placeholder="Perfect for small teams"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="sort_order">Sort Order</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Lower numbers appear first
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="trial_days">Trial Days</Label>
                                    <Input
                                        id="trial_days"
                                        type="number"
                                        value={data.trial_days}
                                        onChange={(e) => setData('trial_days', parseInt(e.target.value) || 0)}
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <Label>Currency</Label>
                                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Plans use the platform default currency: <span className="font-semibold text-gray-900 dark:text-gray-100">{default_currency}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            To change the currency, update it in Platform Settings → Payment
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_active">Active</Label>
                                    <p className="text-sm text-gray-500">
                                        Plan is available for selection
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="is_public">Public</Label>
                                    <p className="text-sm text-gray-500">
                                        Visible to tenant owners in plans page
                                    </p>
                                </div>
                                <Switch
                                    id="is_public"
                                    checked={data.is_public}
                                    onCheckedChange={(checked) => setData('is_public', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                            <CardDescription>
                                Set monthly and yearly pricing (in cents/paisa)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="price_monthly">Monthly Price (cents/paisa)</Label>
                                    <Input
                                        id="price_monthly"
                                        type="number"
                                        value={data.price_monthly || ''}
                                        onChange={(e) => setData('price_monthly', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="99900"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.price_monthly ? `₹${(data.price_monthly / 100).toFixed(2)}` : 'Free or custom pricing'}
                                    </p>
                                    {errors.price_monthly && (
                                        <p className="text-sm text-red-600 mt-1">{errors.price_monthly}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="price_yearly">Yearly Price (cents/paisa)</Label>
                                    <Input
                                        id="price_yearly"
                                        type="number"
                                        value={data.price_yearly || ''}
                                        onChange={(e) => setData('price_yearly', e.target.value ? parseInt(e.target.value) : null)}
                                        placeholder="999000"
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.price_yearly ? `₹${(data.price_yearly / 100).toFixed(2)}` : 'Free or custom pricing'}
                                    </p>
                                    {errors.price_yearly && (
                                        <p className="text-sm text-red-600 mt-1">{errors.price_yearly}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Limits</CardTitle>
                            <CardDescription>
                                Set resource limits for this plan (-1 for unlimited)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="limit_agents">Agents</Label>
                                    <Input
                                        id="limit_agents"
                                        type="number"
                                        value={data.limits.agents === -1 ? '' : data.limits.agents}
                                        onChange={(e) => updateLimit('agents', e.target.value)}
                                        placeholder="-1 for unlimited"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="limit_connections">WhatsApp Connections</Label>
                                    <Input
                                        id="limit_connections"
                                        type="number"
                                        value={data.limits.whatsapp_connections === -1 ? '' : data.limits.whatsapp_connections}
                                        onChange={(e) => updateLimit('whatsapp_connections', e.target.value)}
                                        placeholder="-1 for unlimited"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="limit_messages">Messages Monthly</Label>
                                    <Input
                                        id="limit_messages"
                                        type="number"
                                        value={data.limits.messages_monthly === -1 ? '' : data.limits.messages_monthly}
                                        onChange={(e) => updateLimit('messages_monthly', e.target.value)}
                                        placeholder="-1 for unlimited"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="limit_templates">Template Sends Monthly</Label>
                                    <Input
                                        id="limit_templates"
                                        type="number"
                                        value={data.limits.template_sends_monthly === -1 ? '' : data.limits.template_sends_monthly}
                                        onChange={(e) => updateLimit('template_sends_monthly', e.target.value)}
                                        placeholder="-1 for unlimited"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="limit_ai_credits">AI Credits Monthly</Label>
                                    <Input
                                        id="limit_ai_credits"
                                        type="number"
                                        value={data.limits.ai_credits_monthly === -1 ? '' : data.limits.ai_credits_monthly}
                                        onChange={(e) => updateLimit('ai_credits_monthly', e.target.value)}
                                        placeholder="-1 for unlimited"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="limit_retention">Data Retention (Days)</Label>
                                    <Input
                                        id="limit_retention"
                                        type="number"
                                        value={data.limits.retention_days === -1 ? '' : data.limits.retention_days}
                                        onChange={(e) => updateLimit('retention_days', e.target.value)}
                                        placeholder="-1 for unlimited"
                                    />
                                </div>
                            </div>
                            {errors.limits && (
                                <p className="text-sm text-red-600">{errors.limits}</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Modules</CardTitle>
                            <CardDescription>
                                Select which modules are included in this plan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {modules.map((module) => (
                                    <label
                                        key={module.id}
                                        className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.modules.includes(module.key)}
                                            onChange={() => toggleModule(module.key)}
                                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {module.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {errors.modules && (
                                <p className="text-sm text-red-600 mt-2">{errors.modules}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('platform.plans.index')}>
                            <Button variant="secondary" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Creating...' : 'Create Plan'}
                        </Button>
                    </div>
                </form>
            </div>
        </PlatformShell>
    );
}
