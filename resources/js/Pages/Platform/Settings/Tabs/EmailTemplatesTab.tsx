import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import { Textarea } from '@/Components/UI/Textarea';
import InputError from '@/Components/InputError';
import { Plus, Trash2, FileText } from 'lucide-react';
import { useState } from 'react';

export interface EmailTemplateRow {
    key: string;
    name: string;
    subject: string;
    body_html: string;
    body_text: string;
    placeholders: string[];
}

interface EmailTemplatesTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, any>;
}

const DEFAULT_PLACEHOLDERS = ['{{name}}', '{{email}}', '{{reset_link}}', '{{support_email}}', '{{platform_name}}'];

export default function EmailTemplatesTab({ data, setData, errors }: EmailTemplatesTabProps) {
    const templates: EmailTemplateRow[] = Array.isArray(data.mail?.email_templates)
        ? data.mail.email_templates.map((t: any) => ({
            key: t.key ?? '',
            name: t.name ?? '',
            subject: t.subject ?? '',
            body_html: t.body_html ?? '',
            body_text: t.body_text ?? '',
            placeholders: Array.isArray(t.placeholders) ? t.placeholders : [],
        }))
        : [];
    const [expandedId, setExpandedId] = useState<number | null>(0);

    const updateTemplate = (index: number, field: keyof EmailTemplateRow, value: string | string[]) => {
        const next = [...templates];
        next[index] = { ...next[index], [field]: value };
        setData('mail', { ...data.mail, email_templates: next });
    };

    const addTemplate = () => {
        const next = [
            ...templates,
            {
                key: '',
                name: '',
                subject: '',
                body_html: '',
                body_text: '',
                placeholders: [] as string[],
            },
        ];
        setData('mail', { ...data.mail, email_templates: next });
        setExpandedId(next.length - 1);
    };

    const removeTemplate = (index: number) => {
        const next = templates.filter((_, i) => i !== index);
        setData('mail', { ...data.mail, email_templates: next });
        if (expandedId === index) setExpandedId(null);
        else if (expandedId !== null && expandedId > index) setExpandedId(expandedId - 1);
    };

    const addPlaceholder = (templateIndex: number, placeholder: string) => {
        const t = templates[templateIndex];
        const p = placeholder.trim().replace(/\{\{|\}\}/g, '') ? `{{${placeholder.trim().replace(/\{\{|\}\}/g, '')}}}` : placeholder.trim();
        if (!p || t.placeholders.includes(p)) return;
        updateTemplate(templateIndex, 'placeholders', [...t.placeholders, p]);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Email templates
                    </CardTitle>
                    <CardDescription>
                        Define reusable email templates for system emails (welcome, password reset, notifications, etc.). Use placeholders like {'{{name}}'}, {'{{reset_link}}'} in subject and body. Key must be unique (e.g. welcome, password_reset, support_notification).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {templates.map((template, index) => (
                        <div
                            key={index}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden"
                        >
                            <button
                                type="button"
                                className="w-full flex items-center justify-between gap-2 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
                                onClick={() => setExpandedId(expandedId === index ? null : index)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="font-mono text-sm text-gray-500 dark:text-gray-400">
                                        {template.key || '(new template)'}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {template.name || 'Untitled'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                        {template.subject || 'No subject'}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeTemplate(index);
                                        }}
                                        aria-label="Remove template"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </button>
                            {expandedId === index && (
                                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`tpl-key-${index}`}>Key (unique, e.g. welcome)</Label>
                                            <TextInput
                                                id={`tpl-key-${index}`}
                                                value={template.key}
                                                onChange={(e) => updateTemplate(index, 'key', e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '_'))}
                                                placeholder="welcome_email"
                                                className="mt-1 font-mono text-sm"
                                            />
                                            <InputError message={errors[`mail.email_templates.${index}.key`]} />
                                        </div>
                                        <div>
                                            <Label htmlFor={`tpl-name-${index}`}>Display name</Label>
                                            <TextInput
                                                id={`tpl-name-${index}`}
                                                value={template.name}
                                                onChange={(e) => updateTemplate(index, 'name', e.target.value)}
                                                placeholder="Welcome email"
                                                className="mt-1"
                                            />
                                            <InputError message={errors[`mail.email_templates.${index}.name`]} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor={`tpl-subject-${index}`}>Subject line</Label>
                                        <TextInput
                                            id={`tpl-subject-${index}`}
                                            value={template.subject}
                                            onChange={(e) => updateTemplate(index, 'subject', e.target.value)}
                                            placeholder="Welcome to {{platform_name}}"
                                            className="mt-1"
                                        />
                                        <InputError message={errors[`mail.email_templates.${index}.subject`]} />
                                    </div>
                                    <div>
                                        <Label htmlFor={`tpl-body-html-${index}`}>Body (HTML)</Label>
                                        <Textarea
                                            id={`tpl-body-html-${index}`}
                                            value={template.body_html}
                                            onChange={(e) => updateTemplate(index, 'body_html', e.target.value)}
                                            placeholder="<p>Hello {{name}},</p><p>Welcome...</p>"
                                            rows={6}
                                            className="mt-1 font-mono text-sm"
                                        />
                                        <InputError message={errors[`mail.email_templates.${index}.body_html`]} />
                                    </div>
                                    <div>
                                        <Label htmlFor={`tpl-body-text-${index}`}>Body (plain text, optional)</Label>
                                        <Textarea
                                            id={`tpl-body-text-${index}`}
                                            value={template.body_text}
                                            onChange={(e) => updateTemplate(index, 'body_text', e.target.value)}
                                            placeholder="Hello {{name}}, Welcome..."
                                            rows={3}
                                            className="mt-1 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label>Placeholders (optional)</Label>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 mb-2">
                                            Add placeholders that can be used in this template. Use {'{{placeholder}}'} in subject/body.
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {DEFAULT_PLACEHOLDERS.filter((p) => !template.placeholders.includes(p)).map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    onClick={() => addPlaceholder(index, p)}
                                                >
                                                    + {p}
                                                </button>
                                            ))}
                                            {template.placeholders.map((p) => (
                                                <span
                                                    key={p}
                                                    className="inline-flex items-center rounded-md bg-gray-200 dark:bg-gray-700 px-2 py-1 font-mono text-xs"
                                                >
                                                    {p}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-gray-500 hover:text-red-600"
                                                        onClick={() =>
                                                            updateTemplate(
                                                                index,
                                                                'placeholders',
                                                                template.placeholders.filter((x) => x !== p)
                                                            )
                                                        }
                                                        aria-label={`Remove ${p}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addTemplate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add template
                    </Button>
                    <InputError message={errors['mail.email_templates']} />
                </CardContent>
            </Card>
        </div>
    );
}
