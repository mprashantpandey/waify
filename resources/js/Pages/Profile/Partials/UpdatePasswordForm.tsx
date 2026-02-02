import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';
import { Lock, Shield, CheckCircle2 } from 'lucide-react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                        className="text-sm font-semibold mb-2"
                    />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type="password"
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="current-password"
                            placeholder="Enter current password"
                        />
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                        className="text-sm font-semibold mb-2"
                    />

                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type="password"
                            className="mt-1 block w-full pl-10 rounded-xl"
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl"
                    >
                        {processing ? 'Updating...' : 'Update Password'}
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
        </section>
    );
}
