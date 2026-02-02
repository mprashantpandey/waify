import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Shield, Save, Trash2, Lock, CheckCircle2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useNotifications } from '@/hooks/useNotifications';
import { Transition } from '@headlessui/react';

export default function SecurityTab() {
    const { confirm, toast } = useNotifications();
    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Password updated successfully');
                reset();
            },
            onError: () => {
                toast.error('Failed to update password');
            },
        });
    };

    const deleteAccount = async () => {
        const confirmed = await confirm({
            title: 'Delete Account',
            message: 'Are you sure you want to delete your account? This action cannot be undone. All of your data will be permanently deleted.',
            variant: 'danger',
            confirmText: 'Delete Account',
        });

        if (!confirmed) return;

        const password = prompt('Please enter your password to confirm:');
        if (!password) return;

        router.delete(route('profile.destroy'), {
            data: { password },
            onSuccess: () => {
                toast.success('Account deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete account');
            },
        });
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-xl">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Update Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="current_password" value="Current Password" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                    placeholder="Enter current password"
                                />
                            </div>
                            <InputError message={errors.current_password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="New Password" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                    placeholder="Enter new password"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-sm font-semibold mb-2" />
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className="mt-1 block w-full pl-10 rounded-xl"
                                    required
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl"
                            >
                                {processing ? 'Updating...' : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Password
                                    </>
                                )}
                            </Button>
                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Password updated
                                </div>
                            </Transition>
                        </div>
                    </form>
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
                                Permanently delete your account and all associated data
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                            Once your account is deleted, all of its resources and data will be permanently deleted. 
                            Before deleting your account, please download any data or information that you wish to retain.
                        </p>
                    </div>
                    <Button 
                        variant="danger" 
                        onClick={deleteAccount}
                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50 rounded-xl"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
