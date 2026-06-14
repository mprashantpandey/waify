import { Head, useForm } from '@inertiajs/react';
import { CheckCircle2, Send } from 'lucide-react';
import { Button, Card, MarketingLayout } from '@/Components/Public/Marketing';
import { Input } from '@/Components/UI/Input';
import { Label } from '@/Components/UI/Label';

type Survey = {
    id: number;
    name: string;
    type: string;
    trigger?: string | null;
    questions: string[];
    successMessage?: string | null;
};

export default function SurveyForm({ survey, workspace }: { survey: Survey; workspace: { name?: string | null } }) {
    const form = useForm({
        respondent_name: '',
        respondent_phone: '',
        respondent_email: '',
        score: '',
        answers: Object.fromEntries((survey.questions || []).map((_, index) => [String(index), ''])),
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('public.surveys.submit', survey.id), { preserveScroll: true });
    };

    return (
        <MarketingLayout page="survey" wide>
            <Head title={survey.name} />
            <div className="mx-auto max-w-3xl">
                <Card className="p-6">
                    {form.recentlySuccessful ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
                            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-300" />
                            <h1 className="mt-3 text-xl font-bold text-waify-text dark:text-waify-dark-text">Response submitted</h1>
                            <p className="mt-2 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{survey.successMessage || `Thank you for sharing your feedback with ${workspace.name || 'this workspace'}.`}</p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-waify-green-dark dark:text-emerald-300">{workspace.name || 'Zyptos workspace'}</p>
                                <h1 className="mt-2 text-2xl font-bold text-waify-text dark:text-waify-dark-text">{survey.name}</h1>
                                <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{survey.type}{survey.trigger ? ` · ${survey.trigger}` : ''}</p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Name"><Input value={form.data.respondent_name} onChange={(e) => form.setData('respondent_name', e.target.value)} /></Field>
                                <Field label="Phone"><Input value={form.data.respondent_phone} onChange={(e) => form.setData('respondent_phone', e.target.value)} /></Field>
                                <Field label="Email"><Input type="email" value={form.data.respondent_email} onChange={(e) => form.setData('respondent_email', e.target.value)} /></Field>
                                <Field label="Score">
                                    <select className="waify-input" value={form.data.score} onChange={(e) => form.setData('score', e.target.value)}>
                                        <option value="">No score</option>
                                        {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}
                                    </select>
                                </Field>
                            </div>
                            {(survey.questions || []).map((question, index) => (
                                <Field key={`${question}-${index}`} label={question}>
                                    <textarea
                                        className="waify-input min-h-24"
                                        value={(form.data.answers as Record<string, string>)[String(index)] || ''}
                                        onChange={(e) => form.setData('answers', { ...(form.data.answers as Record<string, string>), [String(index)]: e.target.value })}
                                    />
                                </Field>
                            ))}
                            <Button type="submit" disabled={form.processing} className="w-full">
                                {form.processing ? 'Submitting...' : <><Send className="h-4 w-4" />Submit response</>}
                            </Button>
                        </form>
                    )}
                </Card>
            </div>
        </MarketingLayout>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <Label className="mb-2 block text-sm font-semibold">{label}</Label>
            {children}
        </label>
    );
}
