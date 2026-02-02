import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';
import { useToast } from '@/hooks/useToast';

interface Connection {
    id: number;
    name: string;
    phone_number_id: string;
}

interface Template {
    id: number;
    name: string;
    language: string;
    category: string;
    body_text: string | null;
    connection_id: number;
}

export default function BroadcastsCreate({
    workspace,
    connections,
    templates,
    contactsCount,
}: {
    workspace: any;
    connections: Connection[];
    templates: Template[];
    contactsCount: number;
}) {
    const { toast } = useToast();
    const [campaignType, setCampaignType] = useState<'template' | 'text' | 'media'>('template');
    const [recipientType, setRecipientType] = useState<'contacts' | 'custom'>('contacts');
    const [selectedConnection, setSelectedConnection] = useState<number | ''>('');
    const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        type: 'template' as 'template' | 'text' | 'media',
        whatsapp_connection_id: '',
        whatsapp_template_id: '',
        template_params: [] as string[],
        message_text: '',
        media_url: '',
        media_type: 'image' as 'image' | 'video' | 'document' | 'audio',
        recipient_type: 'contacts' as 'contacts' | 'custom' | 'segment',
        recipient_filters: {},
        custom_recipients: [] as Array<{ phone: string; name?: string }>,
        scheduled_at: '',
        send_delay_seconds: 0,
        respect_opt_out: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('app.broadcasts.store', { workspace: workspace.slug }), {
            onSuccess: () => {
                toast.success('Campaign created successfully');
            },
            onError: () => {
                toast.error('Failed to create campaign');
            },
        });
    };

    const addCustomRecipient = () => {
        setData('custom_recipients', [...data.custom_recipients, { phone: '', name: '' }]);
    };

    const removeCustomRecipient = (index: number) => {
        setData(
            'custom_recipients',
            data.custom_recipients.filter((_, i) => i !== index)
        );
    };

    const updateCustomRecipient = (index: number, field: 'phone' | 'name', value: string) => {
        const updated = [...data.custom_recipients];
        updated[index] = { ...updated[index], [field]: value };
        setData('custom_recipients', updated);
    };

    // Filter templates by selected connection
    const availableTemplates = selectedConnection
        ? templates.filter((t) => t.connection_id === selectedConnection)
        : templates;

    return (
        <AppShell>
            <Head title="Create Campaign" />
            <div className="space-y-6">
                <div>
                    <Link
                        href={route('app.broadcasts.index', { workspace: workspace.slug })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Campaigns
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                        Create Campaign
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Campaign Details</CardTitle>
                            <CardDescription>Basic information about your campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Campaign Name *" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                    rows={3}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="connection" value="WhatsApp Connection *" />
                                <select
                                    id="connection"
                                    value={selectedConnection}
                                    onChange={(e) => {
                                        setSelectedConnection(e.target.value ? Number(e.target.value) : '');
                                        setData('whatsapp_connection_id', e.target.value);
                                        setSelectedTemplate('');
                                        setData('whatsapp_template_id', '');
                                    }}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                    required
                                >
                                    <option value="">Select a connection</option>
                                    {connections.map((conn) => (
                                        <option key={conn.id} value={conn.id}>
                                            {conn.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.whatsapp_connection_id} className="mt-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Message Type</CardTitle>
                            <CardDescription>Choose how to send your campaign</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="template"
                                        checked={campaignType === 'template'}
                                        onChange={(e) => {
                                            setCampaignType('template');
                                            setData('type', 'template');
                                        }}
                                        className="mr-2"
                                    />
                                    Template Message
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="text"
                                        checked={campaignType === 'text'}
                                        onChange={(e) => {
                                            setCampaignType('text');
                                            setData('type', 'text');
                                        }}
                                        className="mr-2"
                                    />
                                    Text Message
                                </label>
                            </div>

                            {campaignType === 'template' && (
                                <div>
                                    <InputLabel htmlFor="template" value="Template *" />
                                    <select
                                        id="template"
                                        value={selectedTemplate}
                                        onChange={(e) => {
                                            setSelectedTemplate(e.target.value ? Number(e.target.value) : '');
                                            setData('whatsapp_template_id', e.target.value);
                                        }}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                        required
                                        disabled={!selectedConnection}
                                    >
                                        <option value="">Select a template</option>
                                        {availableTemplates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name} ({template.language})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.whatsapp_template_id} className="mt-2" />
                                </div>
                            )}

                            {campaignType === 'text' && (
                                <div>
                                    <InputLabel htmlFor="message_text" value="Message Text *" />
                                    <textarea
                                        id="message_text"
                                        value={data.message_text}
                                        onChange={(e) => setData('message_text', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                        rows={5}
                                        required
                                    />
                                    <InputError message={errors.message_text} className="mt-2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recipients</CardTitle>
                            <CardDescription>Who should receive this campaign?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="contacts"
                                        checked={recipientType === 'contacts'}
                                        onChange={(e) => {
                                            setRecipientType('contacts');
                                            setData('recipient_type', 'contacts');
                                        }}
                                        className="mr-2"
                                    />
                                    All Contacts ({contactsCount})
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        value="custom"
                                        checked={recipientType === 'custom'}
                                        onChange={(e) => {
                                            setRecipientType('custom');
                                            setData('recipient_type', 'custom');
                                        }}
                                        className="mr-2"
                                    />
                                    Custom List
                                </label>
                            </div>

                            {recipientType === 'custom' && (
                                <div className="space-y-2">
                                    {data.custom_recipients.map((recipient, index) => (
                                        <div key={index} className="flex gap-2">
                                            <TextInput
                                                type="text"
                                                placeholder="Phone number (with country code)"
                                                value={recipient.phone}
                                                onChange={(e) => updateCustomRecipient(index, 'phone', e.target.value)}
                                                className="flex-1"
                                            />
                                            <TextInput
                                                type="text"
                                                placeholder="Name (optional)"
                                                value={recipient.name || ''}
                                                onChange={(e) => updateCustomRecipient(index, 'name', e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => removeCustomRecipient(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="secondary" onClick={addCustomRecipient}>
                                        Add Recipient
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>When should this campaign be sent?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <InputLabel htmlFor="scheduled_at" value="Schedule (optional)" />
                                <TextInput
                                    id="scheduled_at"
                                    type="datetime-local"
                                    value={data.scheduled_at}
                                    onChange={(e) => setData('scheduled_at', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.scheduled_at} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="send_delay_seconds" value="Delay Between Messages (seconds)" />
                                <TextInput
                                    id="send_delay_seconds"
                                    type="number"
                                    min="0"
                                    max="3600"
                                    value={data.send_delay_seconds}
                                    onChange={(e) => setData('send_delay_seconds', Number(e.target.value))}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.send_delay_seconds} className="mt-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Link href={route('app.broadcasts.index', { workspace: workspace.slug })}>
                            <Button type="button" variant="secondary">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {data.scheduled_at ? 'Schedule Campaign' : 'Create Campaign'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
