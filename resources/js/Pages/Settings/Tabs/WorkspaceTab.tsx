import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import { Building2, Users, Package, ArrowRight } from 'lucide-react';

export default function WorkspaceTab({ workspace }: { workspace: any }) {
    if (!workspace) {
        return (
            <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No workspace selected</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-xl">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Workspace Information</CardTitle>
                            <CardDescription>View your workspace details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Workspace Name
                        </label>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{workspace.name}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                            Workspace Slug
                        </label>
                        <p className="text-sm font-mono text-gray-900 dark:text-gray-100">{workspace.slug}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Team Members</CardTitle>
                            <CardDescription>Manage workspace members and their roles</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Invite team members, assign roles, and manage permissions for your workspace.
                    </p>
                    <Link href={route('app.team.index', { workspace: workspace.slug })}>
                        <Button variant="secondary" className="rounded-xl group">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Members
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Modules</CardTitle>
                            <CardDescription>Enable or disable modules for this workspace</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Control which features and modules are available in your workspace.
                    </p>
                    <Link href={route('app.modules', { workspace: workspace.slug })}>
                        <Button variant="secondary" className="rounded-xl group">
                            <Package className="h-4 w-4 mr-2" />
                            Manage Modules
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
