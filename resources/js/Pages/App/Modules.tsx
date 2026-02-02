import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { Puzzle, CheckCircle2, XCircle, Sparkles, Zap, ToggleLeft, ToggleRight, Crown } from 'lucide-react';
import { Head, router, usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

export default function Modules({ modules, workspace, current_plan }: { modules: any[]; workspace: any; current_plan?: { key: string; name: string } }) {
    const { addToast } = useToast();
    const confirm = useConfirm();
    const page = usePage();
    const { flash } = page.props as any;
    
    // Get workspace from page props if not provided (fallback)
    const currentWorkspace = workspace || (page.props as any).workspace;

    const handleToggleModule = async (module: any) => {
        if (!module.can_toggle) {
            addToast({
                title: 'Cannot toggle module',
                description: 'This module is not available on your current plan.',
                variant: 'error',
            });
            return;
        }

        const action = module.enabled ? 'disable' : 'enable';
        const confirmed = await confirm({
            title: `${action === 'enable' ? 'Enable' : 'Disable'} Module`,
            message: `Are you sure you want to ${action} ${module.name}?`,
            variant: action === 'enable' ? 'info' : 'warning',
        });

        if (!confirmed) return;

        if (!currentWorkspace?.slug) {
            console.error('Workspace slug missing:', currentWorkspace);
            addToast({
                title: 'Error',
                description: 'Workspace information is missing.',
                variant: 'error',
            });
            return;
        }

        if (!module?.key) {
            console.error('Module key missing:', module);
            addToast({
                title: 'Error',
                description: 'Module information is missing.',
                variant: 'error',
            });
            return;
        }

        // Use direct URL to avoid route helper issues
        const directUrl = `/app/${currentWorkspace.slug}/modules/${module.key}/toggle`;
        console.log('Toggling module:', { workspace: currentWorkspace.slug, moduleKey: module.key, url: directUrl });
        
        router.post(
            directUrl,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    addToast({
                        title: 'Module updated',
                        description: `${module.name} has been ${module.enabled ? 'disabled' : 'enabled'}.`,
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
    return (
        <AppShell>
            <Head title="Modules" />
            <div className="space-y-8">
                <div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Modules
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {current_plan ? (
                                    <>Manage modules available on your <span className="font-semibold">{current_plan.name}</span> plan</>
                                ) : (
                                    'Manage your workspace modules and features'
                                )}
                            </p>
                        </div>
                    </div>
                </div>
                {modules.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-12 text-center">
                            <Puzzle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                No Modules Available
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                No modules are available on your current plan. Please upgrade to access more features.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {modules.map((module) => (
                            <Card key={module.id} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden ${module.enabled ? 'ring-2 ring-green-500/20' : ''}`}>
                                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`p-3 rounded-xl ${module.enabled ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'} group-hover:scale-110 transition-transform duration-200`}>
                                                <Puzzle className="h-5 w-5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                        {module.name}
                                                    </CardTitle>
                                                    {module.is_in_plan && !module.is_core && (
                                                        <span title="Included in your plan">
                                                            <Crown className="h-4 w-4 text-yellow-500" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {module.is_core && (
                                                        <Badge variant="info" className="text-xs">
                                                            <Zap className="h-3 w-3 mr-1" />
                                                            Core
                                                        </Badge>
                                                    )}
                                                    {module.is_in_plan && !module.is_core && (
                                                        <Badge variant="success" className="text-xs">
                                                            <Crown className="h-3 w-3 mr-1" />
                                                            In Plan
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {module.description || 'No description available'}
                                    </p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Badge 
                                                variant={module.enabled ? 'success' : 'default'} 
                                                className="flex items-center gap-1.5 px-3 py-1"
                                            >
                                                {module.enabled ? (
                                                    <>
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        Enabled
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        Disabled
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                        
                                        {module.can_toggle && (
                                            <Button
                                                variant={module.enabled ? 'secondary' : 'primary'}
                                                size="sm"
                                                onClick={() => handleToggleModule(module)}
                                                className="flex items-center gap-2"
                                            >
                                                {module.enabled ? (
                                                    <>
                                                        <ToggleRight className="h-4 w-4" />
                                                        Disable
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="h-4 w-4" />
                                                        Enable
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
