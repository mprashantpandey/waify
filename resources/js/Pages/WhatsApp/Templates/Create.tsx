import { router, useForm } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, FileText, Plus, Trash2, AlertCircle, Info, Sparkles, CheckCircle2, Upload, X, Image as ImageIcon, Video, File } from 'lucide-react';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import TextInput from '@/Components/TextInput';
import { Label } from '@/Components/UI/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/UI/Select';
import { Textarea } from '@/Components/UI/Textarea';
import { Alert } from '@/Components/UI/Alert';
import { useToast } from '@/hooks/useToast';
import axios from 'axios';

interface Button {
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    url_example?: string;
    phone_number?: string;
}

interface TemplateFormData {
    whatsapp_connection_id: string;
    name: string;
    language: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    header_type: 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    header_text?: string;
    header_media_url?: string;
    body_text: string;
    body_examples?: string[];
    footer_text?: string;
    buttons?: Button[];
}

const LANGUAGE_CODES = [
    { code: 'en_US', name: 'English (US)' },
    { code: 'en_GB', name: 'English (UK)' },
    { code: 'es_ES', name: 'Spanish (Spain)' },
    { code: 'es_MX', name: 'Spanish (Mexico)' },
    { code: 'pt_BR', name: 'Portuguese (Brazil)' },
    { code: 'fr_FR', name: 'French' },
    { code: 'de_DE', name: 'German' },
    { code: 'it_IT', name: 'Italian' },
    { code: 'hi_IN', name: 'Hindi' },
    { code: 'ja_JP', name: 'Japanese' },
    { code: 'ko_KR', name: 'Korean' },
    { code: 'zh_CN', name: 'Chinese (Simplified)' },
    { code: 'ar_SA', name: 'Arabic' },
    { code: 'tr_TR', name: 'Turkish' },
    { code: 'ru_RU', name: 'Russian' },
];

export default function TemplatesCreate({
    workspace,
    connections,
}: {
    workspace: any;
    connections: Array<{ id: number; name: string; waba_id: string | null }>;
}) {
    const { toast } = useToast();
    const [variableCount, setVariableCount] = useState(0);
    const [previewMode, setPreviewMode] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm<TemplateFormData>({
        whatsapp_connection_id: connections[0]?.id?.toString() || '',
        name: '',
        language: 'en_US',
        category: 'UTILITY',
        header_type: 'NONE',
        header_text: '',
        header_media_url: '',
        body_text: '',
        body_examples: [],
        footer_text: '',
        buttons: [],
    });

    // Calculate variables in body text
    const updateVariableCount = (text: string) => {
        const matches = text.match(/\{\{(\d+)\}\}/g);
        const numbers = matches ? matches.map(m => parseInt(m.match(/\d+/)?.[0] || '0')) : [];
        const maxVar = numbers.length > 0 ? Math.max(...numbers) : 0;
        setVariableCount(maxVar);
    };

    const handleBodyTextChange = (value: string) => {
        setData('body_text', value);
        updateVariableCount(value);
    };

    const addButton = () => {
        if ((data.buttons?.length || 0) >= 3) {
            toast.error('Maximum 3 buttons allowed');
            return;
        }
        setData('buttons', [
            ...(data.buttons || []),
            { type: 'QUICK_REPLY', text: '' },
        ]);
    };

    const removeButton = (index: number) => {
        const buttons = [...(data.buttons || [])];
        buttons.splice(index, 1);
        setData('buttons', buttons);
    };

    const updateButton = (index: number, field: keyof Button, value: any) => {
        const buttons = [...(data.buttons || [])];
        buttons[index] = { ...buttons[index], [field]: value };
        setData('buttons', buttons);
    };

    const handleMediaUpload = async (file: File) => {
        if (!file) return;

        setUploadingMedia(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', data.header_type);

            const response = await axios.post(
                route('app.whatsapp.templates.upload-media', { workspace: workspace.slug }),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                }
            );

            setData('header_media_url', response.data.url);
            setMediaPreview(response.data.url);
            toast.success('File uploaded', 'Media file uploaded successfully.');
        } catch (error: any) {
            toast.error('Upload failed', error.response?.data?.error || error.message || 'Failed to upload file.');
        } finally {
            setUploadingMedia(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleMediaUpload(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const addBodyExample = () => {
        const examples = [...(data.body_examples || [])];
        examples.push('');
        setData('body_examples', examples);
    };

    const updateBodyExample = (index: number, value: string) => {
        const examples = [...(data.body_examples || [])];
        examples[index] = value;
        setData('body_examples', examples);
    };

    const removeBodyExample = (index: number) => {
        const examples = [...(data.body_examples || [])];
        examples.splice(index, 1);
        setData('body_examples', examples);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clean up empty buttons
        const cleanedButtons = data.buttons?.filter(btn => btn.text.trim() !== '') || [];
        const cleanedExamples = data.body_examples?.filter(ex => ex.trim() !== '') || [];
        
        post(route('app.whatsapp.templates.store', { workspace: workspace.slug }), {
            onSuccess: () => {
                toast.success('Template created successfully! It will be reviewed by Meta.');
            },
            onError: (errors) => {
                if (errors.create) {
                    toast.error(errors.create);
                } else {
                    toast.error('Failed to create template. Please check the form for errors.');
                }
            },
        });
    };

    const renderPreview = () => {
        let bodyPreview = data.body_text || '';
        // Replace variables with example values
        for (let i = 1; i <= variableCount; i++) {
            const example = data.body_examples?.[i - 1] || `Example ${i}`;
            bodyPreview = bodyPreview.replace(new RegExp(`\\{\\{${i}\\}\\}`, 'g'), example);
        }

        return (
            <div className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700">
                {data.header_type !== 'NONE' && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">HEADER</div>
                        {data.header_type === 'TEXT' && data.header_text && (
                            <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {data.header_text}
                            </div>
                        )}
                        {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(data.header_type) && data.header_media_url && (
                            <div className="text-sm text-blue-600 dark:text-blue-400 break-all">
                                {data.header_media_url}
                            </div>
                        )}
                    </div>
                )}
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">BODY</div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {bodyPreview || 'Body text will appear here...'}
                    </div>
                </div>

                {data.footer_text && (
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">FOOTER</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {data.footer_text}
                        </div>
                    </div>
                )}

                {data.buttons && data.buttons.length > 0 && (
                    <div className="space-y-2">
                        {data.buttons.map((button, index) => (
                            button.text && (
                                <div
                                    key={index}
                                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center"
                                >
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        {button.text}
                                    </span>
                                </div>
                            )
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppShell>
            <Head title="Create Template" />
            <div className="space-y-8">
                <div>
                    <Link
                        href={route('app.whatsapp.templates.index', { workspace: workspace.slug })}
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Templates
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                Create Template
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Create a new WhatsApp message template following Meta's latest guidelines
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            {previewMode ? 'Edit Mode' : 'Preview Mode'}
                        </Button>
                    </div>
                </div>

                <Alert variant="info" className="border-blue-200 dark:border-blue-800">
                    <Info className="h-5 w-5" />
                    <div>
                        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Template Guidelines</h3>
                        <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                            <li>Template name: Alphanumeric and underscores only, max 512 characters</li>
                            <li>Body text: Max 1024 characters, use {'{{1}}'}, {'{{2}}'} for variables</li>
                            <li>Header: Max 60 characters (TEXT) or media URL (IMAGE/VIDEO/DOCUMENT)</li>
                            <li>Footer: Max 60 characters</li>
                            <li>Buttons: Maximum 3 buttons (QUICK_REPLY, URL, or PHONE_NUMBER)</li>
                            <li>Templates require Meta approval before use</li>
                        </ul>
                    </div>
                </Alert>

                <form onSubmit={submit} className="space-y-6">
                    {previewMode ? (
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle>Template Preview</CardTitle>
                                <CardDescription>How your template will appear to recipients</CardDescription>
                            </CardHeader>
                            <CardContent>{renderPreview()}</CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Basic Information */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div>
                                        <Label htmlFor="connection">WhatsApp Connection *</Label>
                                        <Select
                                            value={data.whatsapp_connection_id}
                                            onValueChange={(value) => setData('whatsapp_connection_id', value)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue>
                                                    {connections.find(c => c.id.toString() === data.whatsapp_connection_id)?.name || 'Select connection'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {connections.map((conn) => (
                                                    <SelectItem key={conn.id} value={conn.id.toString()}>
                                                        {conn.name} {!conn.waba_id && '(No WABA ID)'}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.whatsapp_connection_id && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {errors.whatsapp_connection_id}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Template Name *</Label>
                                            <TextInput
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="my_template_name"
                                                className="font-mono"
                                                maxLength={512}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Alphanumeric and underscores only
                                            </p>
                                            {errors.name && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="language">Language *</Label>
                                            <Select
                                                value={data.language}
                                                onValueChange={(value) => setData('language', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LANGUAGE_CODES.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code}>
                                                            {lang.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.language && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                    {errors.language}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value: any) => setData('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {data.category === 'MARKETING' ? 'Marketing' : 
                                                     data.category === 'UTILITY' ? 'Utility' : 
                                                     data.category === 'AUTHENTICATION' ? 'Authentication' : 
                                                     'Select category'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MARKETING">Marketing</SelectItem>
                                                <SelectItem value="UTILITY">Utility</SelectItem>
                                                <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Header */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                                    <CardTitle>Header (Optional)</CardTitle>
                                    <CardDescription>Add a header to your template</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div>
                                        <Label htmlFor="header_type">Header Type</Label>
                                        <Select
                                            value={data.header_type}
                                            onValueChange={(value: any) => {
                                                setData('header_type', value);
                                                // Clear media when header type changes
                                                if (value === 'NONE' || value === 'TEXT') {
                                                    setData('header_media_url', '');
                                                    setMediaPreview(null);
                                                }
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {data.header_type === 'NONE' ? 'None' : 
                                                     data.header_type === 'TEXT' ? 'Text' : 
                                                     data.header_type === 'IMAGE' ? 'Image' : 
                                                     data.header_type === 'VIDEO' ? 'Video' : 
                                                     data.header_type === 'DOCUMENT' ? 'Document' : 
                                                     'Select header type'}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NONE">None</SelectItem>
                                                <SelectItem value="TEXT">Text</SelectItem>
                                                <SelectItem value="IMAGE">Image</SelectItem>
                                                <SelectItem value="VIDEO">Video</SelectItem>
                                                <SelectItem value="DOCUMENT">Document</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {data.header_type === 'TEXT' && (
                                        <div>
                                            <Label htmlFor="header_text">Header Text *</Label>
                                            <TextInput
                                                id="header_text"
                                                value={data.header_text || ''}
                                                onChange={(e) => setData('header_text', e.target.value)}
                                                placeholder="Header text (max 60 characters)"
                                                maxLength={60}
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {((data.header_text || '').length)}/60 characters
                                            </p>
                                            {errors.header_text && (
                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                    {errors.header_text}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(data.header_type) && (
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="header_media_file">Upload Media *</Label>
                                                <div className="mt-2">
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        id="header_media_file"
                                                        accept={
                                                            data.header_type === 'IMAGE' 
                                                                ? 'image/jpeg,image/jpg,image/png,image/gif'
                                                                : data.header_type === 'VIDEO'
                                                                ? 'video/mp4,video/mov,video/avi'
                                                                : 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
                                                        }
                                                        onChange={handleFileChange}
                                                        className="hidden"
                                                        disabled={uploadingMedia}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={uploadingMedia}
                                                        className="w-full"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        {uploadingMedia ? 'Uploading...' : 'Choose File'}
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    {data.header_type === 'IMAGE' && 'Supported: JPEG, PNG, GIF (max 10MB)'}
                                                    {data.header_type === 'VIDEO' && 'Supported: MP4, MOV, AVI (max 10MB)'}
                                                    {data.header_type === 'DOCUMENT' && 'Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 10MB)'}
                                                </p>
                                                {errors.header_media_url && (
                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                        {errors.header_media_url}
                                                    </p>
                                                )}
                                            </div>

                                            {(mediaPreview || data.header_media_url) && (
                                                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {data.header_type === 'IMAGE' && <ImageIcon className="h-5 w-5 text-blue-600" />}
                                                            {data.header_type === 'VIDEO' && <Video className="h-5 w-5 text-blue-600" />}
                                                            {data.header_type === 'DOCUMENT' && <File className="h-5 w-5 text-blue-600" />}
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                Media uploaded
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setData('header_media_url', '');
                                                                setMediaPreview(null);
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    {data.header_type === 'IMAGE' && (mediaPreview || data.header_media_url) && (
                                                        <img
                                                            src={mediaPreview || data.header_media_url}
                                                            alt="Preview"
                                                            className="max-w-full h-auto max-h-48 rounded-lg"
                                                        />
                                                    )}
                                                    {(data.header_type === 'VIDEO' || data.header_type === 'DOCUMENT') && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 break-all">
                                                            {mediaPreview || data.header_media_url}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Body */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                                    <CardTitle>Body *</CardTitle>
                                    <CardDescription>Main message content with optional variables</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <div>
                                        <Label htmlFor="body_text">Body Text *</Label>
                                        <Textarea
                                            id="body_text"
                                            value={data.body_text}
                                            onChange={(e) => handleBodyTextChange(e.target.value)}
                                            placeholder={`Hello! Your order {{1}} is ready. Pickup time: {{2}}`}
                                            rows={6}
                                            maxLength={1024}
                                            className="font-mono"
                                        />
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {data.body_text.length}/1024 characters
                                            </p>
                                            {variableCount > 0 && (
                                                <Badge variant="info" className="text-xs">
                                                    {variableCount} variable{variableCount > 1 ? 's' : ''} detected
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Use {'{{1}}'}, {'{{2}}'}, etc. for variables
                                        </p>
                                        {errors.body_text && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {errors.body_text}
                                            </p>
                                        )}
                                    </div>

                                    {variableCount > 0 && (
                                        <div>
                                            <Label>Variable Examples (Optional)</Label>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                Provide example values for preview and testing
                                            </p>
                                            <div className="space-y-2">
                                                {Array.from({ length: variableCount }, (_, i) => i + 1).map((varNum) => (
                                                    <div key={varNum} className="flex items-center gap-2">
                                                        <TextInput
                                                            value={data.body_examples?.[varNum - 1] || ''}
                                                            onChange={(e) => updateBodyExample(varNum - 1, e.target.value)}
                                                            placeholder={`Example for variable {{${varNum}}}`}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Footer */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                                    <CardTitle>Footer (Optional)</CardTitle>
                                    <CardDescription>Add a footer to your template</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div>
                                        <Label htmlFor="footer_text">Footer Text</Label>
                                        <TextInput
                                            id="footer_text"
                                            value={data.footer_text || ''}
                                            onChange={(e) => setData('footer_text', e.target.value)}
                                            placeholder="Footer text (max 60 characters)"
                                            maxLength={60}
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {((data.footer_text || '').length)}/60 characters
                                        </p>
                                        {errors.footer_text && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                {errors.footer_text}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Buttons */}
                            <Card className="border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Buttons (Optional)</CardTitle>
                                            <CardDescription>Add up to 3 buttons to your template</CardDescription>
                                        </div>
                                        {(data.buttons?.length || 0) < 3 && (
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                size="sm"
                                                onClick={addButton}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Button
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    {data.buttons && data.buttons.length > 0 ? (
                                        data.buttons.map((button, index) => (
                                            <Card key={index} className="border border-gray-200 dark:border-gray-700">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <Label>Button {index + 1}</Label>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeButton(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </Button>
                                                    </div>
                                                    <div>
                                                        <Label>Button Type *</Label>
                                                        <Select
                                                            value={button.type}
                                                            onValueChange={(value: any) =>
                                                                updateButton(index, 'type', value)
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue>
                                                                    {button.type === 'QUICK_REPLY' ? 'Quick Reply' : 
                                                                     button.type === 'URL' ? 'URL' : 
                                                                     button.type === 'PHONE_NUMBER' ? 'Phone Number' : 
                                                                     'Select button type'}
                                                                </SelectValue>
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="QUICK_REPLY">Quick Reply</SelectItem>
                                                                <SelectItem value="URL">URL</SelectItem>
                                                                <SelectItem value="PHONE_NUMBER">Phone Number</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label>Button Text *</Label>
                                                        <TextInput
                                                            value={button.text}
                                                            onChange={(e) => updateButton(index, 'text', e.target.value)}
                                                            placeholder="Button text (max 20 characters)"
                                                            maxLength={20}
                                                        />
                                                        {(errors as any)[`buttons.${index}.text`] && (
                                                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                                {(errors as any)[`buttons.${index}.text`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {button.type === 'URL' && (
                                                        <>
                                                            <div>
                                                                <Label>URL *</Label>
                                                                <TextInput
                                                                    type="url"
                                                                    value={button.url || ''}
                                                                    onChange={(e) => updateButton(index, 'url', e.target.value)}
                                                                    placeholder="https://example.com"
                                                                />
                                                                {(errors as any)[`buttons.${index}.url`] && (
                                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                                        {(errors as any)[`buttons.${index}.url`]}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <Label>URL Example (Optional)</Label>
                                                                <TextInput
                                                                    value={button.url_example || ''}
                                                                    onChange={(e) => updateButton(index, 'url_example', e.target.value)}
                                                                    placeholder={`https://example.com/{{1}}`}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                    {button.type === 'PHONE_NUMBER' && (
                                                        <div>
                                                            <Label>Phone Number *</Label>
                                                            <TextInput
                                                                value={button.phone_number || ''}
                                                                onChange={(e) => updateButton(index, 'phone_number', e.target.value)}
                                                                placeholder="+1234567890"
                                                            />
                                                            {(errors as any)[`buttons.${index}.phone_number`] && (
                                                                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                                    {(errors as any)[`buttons.${index}.phone_number`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <p>No buttons added. Click "Add Button" to add one.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}

                    <div className="flex items-center justify-between pt-6">
                        <Link
                            href={route('app.whatsapp.templates.index', { workspace: workspace.slug })}
                        >
                            <Button variant="secondary">Cancel</Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/50"
                        >
                            {processing ? 'Creating...' : 'Create Template'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppShell>
    );
}
