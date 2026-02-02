import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { Trash2, AlertTriangle, Lock } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import ConfirmationDialog from '@/Components/UI/ConfirmationDialog';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const { confirm, toast } = useNotifications();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setShowConfirmDialog(true);
    };

    const deleteUser: FormEventHandler = async (e) => {
        e.preventDefault();

        const confirmed = await confirm({
            title: 'Delete Account',
            message: 'Are you sure you want to delete your account? This action cannot be undone. All of your data will be permanently deleted.',
            variant: 'danger',
            confirmText: 'Delete Account',
        });

        if (!confirmed) {
            return;
        }

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Account deleted successfully');
            },
            onError: () => {
                passwordInput.current?.focus();
                toast.error('Failed to delete account. Please check your password.');
            },
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setShowConfirmDialog(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                            Warning: This action is permanent
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Once your account is deleted, all of its resources and data will be permanently deleted. 
                            Before deleting your account, please download any data or information that you wish to retain.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={deleteUser} className="space-y-6">
                <div>
                    <InputLabel
                        htmlFor="password"
                        value="Confirm Password"
                        className="text-sm font-semibold mb-2"
                    />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="block w-full pl-10 rounded-xl"
                            placeholder="Enter your password to confirm"
                        />
                    </div>

                    <InputError
                        message={errors.password}
                        className="mt-2"
                    />
                </div>

                <Button
                    type="submit"
                    variant="danger"
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/50 rounded-xl"
                >
                    {processing ? (
                        'Deleting Account...'
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </>
                    )}
                </Button>
            </form>
        </section>
    );
}
