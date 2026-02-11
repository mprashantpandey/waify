import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Badge } from '@/Components/UI/Badge';
import { ArrowLeft, Send, User, MessageSquare, Phone, Sparkles, Eye } from 'lucide-react';
import { Link, Head } from '@inertiajs/react';

interface Template {
    id: number;
    slug: string;
    name: string;
    language: string;
    body_text: string | null;
    header_text: string | null;
    footer_text: string | null;
    buttons: Array<{
        type: string;
        text: string;
        url?: string;
        phone_number?: string;
    }>;
    variable_count: number;
    has_buttons: boolean;
    required_variables: {
        header: number[];
        body: number[];
        button: number;
        header_count: number;
        body_count: number;
        button_count: number;
        total: number;
    };
}

interface Contact {
    id: number;
    wa_id: string;
    name: string | null;
}

interface Conversation {
    id: number;
    contact: {
        wa_id: string;
        name: string;
    };
}

export default function TemplatesSend({
    account,
    template,
    contacts,
    conversations}: {
    account: any;
    template: Template;
    contacts: Contact[];
    conversations: Conversation[];
}) {
    const [recipientType, setRecipientType] = useState<'contact' | 'conversation' | 'manual'>('conversation');
    const [selectedContact, setSelectedContact] = useState<string>('');
    const [selectedConversation, setSelectedConversation] = useState<string>('');

    const { data, setData, post, processing, errors } = useForm({
        to_wa_id: '',
        variables: Array(template.required_variables.total).fill('')});

    const handleRecipientChange = (type: 'contact' | 'conversation' | 'manual') => {
        setRecipientType(type);
        setData('to_wa_id', '');
        setSelectedContact('');
        setSelectedConversation('');
    };

    const handleContactSelect = (waId: string) => {
        setSelectedContact(waId);
        setData('to_wa_id', waId);
    };

    const handleConversationSelect = (waId: string) => {
        setSelectedConversation(waId);
        setData('to_wa_id', waId);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('app.whatsapp.templates.send.store', {
            template: template.slug}));
    };

    // Render preview
    const renderPreview = () => {
        const preview: string[] = [];

        if (template.header_text) {
            let headerText = template.header_text;
            template.required_variables.header.forEach((varIndex) => {
                const varValue = data.variables[varIndex - 1] || `{{${varIndex}}}`;
                headerText = headerText.replace(`{{${varIndex}}}`, varValue);
            });
            preview.push(`📌 ${headerText}`);
        }

        if (template.body_text) {
            let bodyText = template.body_text;
            template.required_variables.body.forEach((varIndex) => {
                const varValue = data.variables[varIndex - 1] || `{{${varIndex}}}`;
                bodyText = bodyText.replace(`{{${varIndex}}}`, varValue);
            });
            preview.push(bodyText);
        }

        if (template.footer_text) {
            preview.push(`\n${template.footer_text}`);
        }

        return preview.join('\n\n');
    };

    return (
        <AppShell>
            <Head title={`Send ${template.name} - Template`} />
            <div className="space-y-8">
                <div>
                        <Link
                            href={route('app.whatsapp.templates.show', {
                                template: template.slug})}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Template
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                            Send Template
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {template.name} ({template.language})
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-500 rounded-xl">
                                    <Send className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Recipient & Variables</CardTitle>
                                    <CardDescription>Select recipient and fill template variables</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Recipient Selection */}
                                <div>
                                    <InputLabel value="Recipient" className="text-sm font-semibold mb-3" />
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="radio"
                                                    checked={recipientType === 'conversation'}
                                                    onChange={() => handleRecipientChange('conversation')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <MessageSquare className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">From Conversation</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="radio"
                                                    checked={recipientType === 'contact'}
                                                    onChange={() => handleRecipientChange('contact')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">From Contact</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="radio"
                                                    checked={recipientType === 'manual'}
                                                    onChange={() => handleRecipientChange('manual')}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm font-medium">Manual Entry</span>
                                            </label>
                                        </div>

                                        {recipientType === 'conversation' && (
                                            <select
                                                value={selectedConversation}
                                                onChange={(e) => handleConversationSelect(e.target.value)}
                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                required
                                            >
                                                <option value="">Select conversation...</option>
                                                {conversations.map((conv) => (
                                                    <option key={conv.id} value={conv.contact.wa_id}>
                                                        {conv.contact.name} ({conv.contact.wa_id})
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {recipientType === 'contact' && (
                                            <select
                                                value={selectedContact}
                                                onChange={(e) => handleContactSelect(e.target.value)}
                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 px-4 py-2.5"
                                                required
                                            >
                                                <option value="">Select contact...</option>
                                                {contacts.map((contact) => (
                                                    <option key={contact.id} value={contact.wa_id}>
                                                        {contact.name || contact.wa_id} ({contact.wa_id})
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {recipientType === 'manual' && (
                                            <TextInput
                                                type="text"
                                                value={data.to_wa_id}
                                                onChange={(e) => setData('to_wa_id', e.target.value)}
                                                placeholder="Enter WhatsApp ID (e.g., 1234567890)"
                                                className="rounded-xl"
                                                required
                                            />
                                        )}
                                    </div>
                                    <InputError message={errors.to_wa_id} className="mt-2" />
                                </div>

                                {/* Variables */}
                                {template.required_variables.total > 0 && (
                                    <div>
                                        <InputLabel value={`Template Variables (${template.required_variables.total} required)`} className="text-sm font-semibold mb-3" />
                                        <div className="space-y-3">
                                            {Array.from({ length: template.required_variables.total }, (_, index) => {
                                                const varIndex = index + 1;
                                                const isHeader = template.required_variables.header.includes(varIndex);
                                                const isBody = template.required_variables.body.includes(varIndex);
                                                const label = isHeader
                                                    ? `Header Variable {{${varIndex}}}`
                                                    : isBody
                                                    ? `Body Variable {{${varIndex}}}`
                                                    : `Button Variable {{${varIndex}}}`;

                                                return (
                                                    <div key={index}>
                                                        <TextInput
                                                            type="text"
                                                            value={data.variables[index] || ''}
                                                            onChange={(e) => {
                                                                const newVars = [...data.variables];
                                                                newVars[index] = e.target.value;
                                                                setData('variables', newVars);
                                                            }}
                                                            placeholder={label}
                                                            className="rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <InputError message={errors.variables} className="mt-2" />
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <Link
                                            href={route('app.whatsapp.templates.show', {
                                                template: template.slug})}
                                    >
                                        <Button type="button" variant="secondary" className="rounded-xl">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button 
                                        type="submit" 
                                        disabled={processing}
                                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/50 rounded-xl"
                                    >
                                        {processing ? 'Sending...' : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Template
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Preview */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 rounded-xl">
                                    <Eye className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold">Preview</CardTitle>
                                    <CardDescription>How your message will appear</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Template: {template.name}
                                        </span>
                                    </div>
                                    <div className="bg-white dark:bg-gray-950 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <pre className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                                            {renderPreview()}
                                        </pre>
                                    </div>
                                </div>
                                {template.has_buttons && template.buttons.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Buttons</p>
                                        {template.buttons.map((button, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{button.text}</span>
                                                    <Badge variant="info" className="px-3 py-1">
                                                        {button.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
