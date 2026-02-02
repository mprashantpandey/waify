import AppShell from '@/Layouts/AppShell';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, Trash2 } from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AppShell>
            <Head title="Profile" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Profile Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Manage your account information and security settings
                    </p>
                </div>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-xl">
                                <User className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
                                <CardDescription>Update your account's profile information and email address</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Update Password</CardTitle>
                                <CardDescription>Ensure your account is using a long, random password to stay secure</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <UpdatePasswordForm />
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg border-red-200 dark:border-red-800">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-xl">
                                <Trash2 className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-red-900 dark:text-red-100">Delete Account</CardTitle>
                                <CardDescription className="text-red-700 dark:text-red-300">
                                    Once your account is deleted, all of its resources and data will be permanently deleted
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <DeleteUserForm />
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
