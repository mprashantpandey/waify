import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import { Switch } from '@/Components/UI/Switch';

interface SupportTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, any>;
}

interface FaqItem {
    question: string;
    answer: string;
}

export default function SupportTab({ data, setData, errors }: SupportTabProps) {
    const faqs: FaqItem[] = data.support?.faqs || [];

    const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
        const next = [...faqs];
        next[index] = { ...next[index], [field]: value };
        setData('support', { ...data.support, faqs: next });
    };

    const addFaq = () => {
        setData('support', {
            ...data.support,
            faqs: [...faqs, { question: '', answer: '' }],
        });
    };

    const removeFaq = (index: number) => {
        const next = faqs.filter((_, idx) => idx !== index);
        setData('support', { ...data.support, faqs: next });
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                <CardTitle className="text-xl font-bold">Support FAQs</CardTitle>
                <CardDescription>Manage common questions shown in the Support Hub</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-semibold">Email Notifications</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Enable or disable all support emails.
                                </p>
                            </div>
                            <Switch
                                checked={data.support?.email_notifications_enabled ?? true}
                                onCheckedChange={(value) =>
                                    setData('support', { ...data.support, email_notifications_enabled: value })
                                }
                            />
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-semibold">Notify Admins</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Email platform admins on new tickets and replies.
                                </p>
                            </div>
                            <Switch
                                checked={data.support?.notify_admins ?? true}
                                onCheckedChange={(value) =>
                                    setData('support', { ...data.support, notify_admins: value })
                                }
                            />
                        </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-semibold">Notify Customers</Label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Email tenants when agents reply.
                                </p>
                            </div>
                            <Switch
                                checked={data.support?.notify_customers ?? true}
                                onCheckedChange={(value) =>
                                    setData('support', { ...data.support, notify_customers: value })
                                }
                            />
                        </div>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="support.sla_hours">SLA Hours</Label>
                        <TextInput
                            id="support.sla_hours"
                            type="number"
                            min="1"
                            value={data.support?.sla_hours ?? 48}
                            onChange={(e) => setData('support', { ...data.support, sla_hours: Number(e.target.value) })}
                            className="mt-1 block w-full"
                        />
                        {errors?.['support.sla_hours'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['support.sla_hours']}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="support.first_response_hours">First Response SLA (hours)</Label>
                        <TextInput
                            id="support.first_response_hours"
                            type="number"
                            min="1"
                            value={data.support?.first_response_hours ?? 4}
                            onChange={(e) =>
                                setData('support', { ...data.support, first_response_hours: Number(e.target.value) })
                            }
                            className="mt-1 block w-full"
                        />
                        {errors?.['support.first_response_hours'] && (
                            <p className="text-sm text-red-600 mt-1">{errors['support.first_response_hours']}</p>
                        )}
                    </div>
                </div>
                {faqs.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        No FAQs yet. Add your first one.
                    </div>
                )}

                {faqs.map((faq, index) => (
                    <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3">
                        <div>
                            <Label htmlFor={`support.faqs.${index}.question`}>Question</Label>
                            <TextInput
                                id={`support.faqs.${index}.question`}
                                type="text"
                                value={faq.question}
                                onChange={(e) => updateFaq(index, 'question', e.target.value)}
                                className="mt-1 block w-full"
                                placeholder="How do I connect WhatsApp?"
                            />
                            {errors?.[`support.faqs.${index}.question`] && (
                                <p className="text-sm text-red-600 mt-1">{errors[`support.faqs.${index}.question`]}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor={`support.faqs.${index}.answer`}>Answer</Label>
                            <textarea
                                id={`support.faqs.${index}.answer`}
                                value={faq.answer}
                                onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                rows={3}
                                placeholder="Go to Connections and follow the setup wizard."
                            />
                            {errors?.[`support.faqs.${index}.answer`] && (
                                <p className="text-sm text-red-600 mt-1">{errors[`support.faqs.${index}.answer`]}</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" variant="secondary" onClick={() => removeFaq(index)}>
                                Remove
                            </Button>
                        </div>
                    </div>
                ))}

                <div className="flex justify-end">
                    <Button type="button" onClick={addFaq}>
                        Add FAQ
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
