import { Head, router, usePage } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';
import { Puzzle, ToggleLeft, ToggleRight, Crown, Settings, Users } from 'lucide-react';

interface Module {
    id: number;
    key: string;
    name: string;
    description: string | null;
    is_core: boolean;
    is_enabled: boolean;
    workspace_count: number;
}

export default function PlatformModulesIndex({ modules }: { modules: Module[] }) {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const { flash } = usePage().props as any;

    const handleToggle = async (module: Module) => {
        if (module.is_core) {
            addToast({
                title: 'Cannot Disable',
                description: 'Core modules cannot be disabled at the platform level.',
                variant: 'error',
            });
            return;
        }

        const action = module.is_enabled ? 'disable' : 'enable';
        const confirmed = await confirm({
            title: `${action === 'enable' ? 'Enable' : 'Disable'} Module`,
            message: `Are you sure you want to ${action} ${module.name} at the platform level? This will affect all workspaces.`,
            variant: action === 'enable' ? 'info' : 'warning',
        });

        if (!confirmed) return;

        router.post(
            route('platform.modules.toggle', { module: module.id }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    addToast({
                        title: 'Module Updated',
                        description: `${module.name} has been ${action}d at the platform level.`,
                        variant: 'success',
                    });
                    router.reload({ only: ['modules'] });
                },
                onError: (errors) => {
                    addToast({
                        title: 'Error',
                        description: errors?.message || 'Failed to update module status.',
                        variant: 'error',
                    });
                },
            }
        );
    };

    const coreModules = modules.filter(m => m.is_core);
    const addonModules = modules.filter(m => !m.is_core);

    return (
        <PlatformShell>
            <Head title="Module Management" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Module Management</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enable or disable modules systemwide. Disabled modules will not be available to any workspace.
                    </p>
                </div>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
                        <p className="text-sm text-green-800 dark:text-green-200">{flash.success}</p>
                    </div>
                )}

                {flash?.error && (
                    <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">{flash.error}</p>
                    </div>
                )}

                {/* Core Modules */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-yellow-500" />
                                    Core Modules
                                </CardTitle>
                                <CardDescription>
                                    Essential modules that cannot be disabled
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {coreModules.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No core modules found.</p>
                            ) : (
                                coreModules.map((module) => (
                                    <div
                                        key={module.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Puzzle className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {module.name}
                                                    </h3>
                                                    {module.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {module.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={module.is_enabled ? 'success' : 'default'}>
                                                            {module.is_enabled ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                        <Badge variant="info">Core</Badge>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {module.workspace_count} workspace{module.workspace_count !== 1 ? 's' : ''} using
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="warning">Cannot Disable</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Addon Modules */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Puzzle className="h-5 w-5 text-blue-500" />
                                    Addon Modules
                                </CardTitle>
                                <CardDescription>
                                    Optional modules that can be enabled or disabled
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {addonModules.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No addon modules found.</p>
                            ) : (
                                addonModules.map((module) => (
                                    <div
                                        key={module.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Puzzle className="h-5 w-5 text-gray-400" />
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                                        {module.name}
                                                    </h3>
                                                    {module.description && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {module.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant={module.is_enabled ? 'success' : 'default'}>
                                                            {module.is_enabled ? 'Enabled' : 'Disabled'}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {module.workspace_count} workspace{module.workspace_count !== 1 ? 's' : ''} using
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={module.is_enabled ? 'danger' : 'primary'}
                                                size="sm"
                                                onClick={() => handleToggle(module)}
                                            >
                                                {module.is_enabled ? (
                                                    <>
                                                        <ToggleRight className="h-4 w-4 mr-1" />
                                                        Disable
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-4 w-4 mr-1" />
                                                        Enable
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PlatformShell>
    );
}
