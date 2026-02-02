import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Shield, Lock, ArrowRight } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 mb-4">
                    <Shield className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Confirm Password
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    This is a secure area of the application. Please confirm your password before continuing.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-sm font-semibold mb-2" />

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pl-10 rounded-xl"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <Button 
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/50 rounded-xl"
                >
                    {processing ? 'Confirming...' : (
                        <>
                            Confirm Password
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </form>
        </GuestLayout>
    );
}
