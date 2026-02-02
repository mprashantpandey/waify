import { useForm } from '@inertiajs/react';
import { FormEventHandler, ChangeEvent } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Onboarding() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    return (
        <GuestLayout>
            <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                            Create Your Workspace
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Get started by creating your first workspace
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={submit}>
                        <div>
                            <InputLabel htmlFor="name" value="Workspace Name" />
                            <TextInput
                                id="name"
                                type="text"
                                value={data.name}
                                className="mt-1 block w-full"
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)}
                                required
                                autoFocus
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        <div>
                            <Button type="submit" className="w-full" disabled={processing}>
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}

