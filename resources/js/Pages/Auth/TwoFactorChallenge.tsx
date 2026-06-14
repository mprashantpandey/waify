import { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function TwoFactorChallenge() {
    const form = useForm({ code: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(route('two-factor.verify'));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-waify-bg px-4 dark:bg-slate-950">
            <Head title="Two-factor verification" />
            <div className="w-full max-w-md rounded-card border border-gray-100 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-card bg-waify-green-soft text-waify-green-dark dark:bg-waify-green/10 dark:text-waify-green">
                        <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">Two-factor verification</h1>
                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Enter the 6-digit code from your authenticator app.</p>
                    </div>
                </div>
                <form onSubmit={submit} className="mt-6 space-y-4">
                    <div>
                        <TextInput
                            value={form.data.code}
                            onChange={(event) => form.setData('code', event.target.value)}
                            className="h-11 w-full text-center font-mono text-lg tracking-[0.4em]"
                            autoFocus
                            inputMode="numeric"
                            maxLength={12}
                        />
                        <InputError message={form.errors.code} className="mt-2 text-xs" />
                    </div>
                    <Button type="submit" className="w-full" disabled={form.processing || form.data.code.length < 6}>
                        Verify
                    </Button>
                </form>
            </div>
        </div>
    );
}
