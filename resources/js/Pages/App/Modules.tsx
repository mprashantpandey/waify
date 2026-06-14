import AppShell from '@/Layouts/AppShell';
import { Card } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Copy, Download, ExternalLink, FileSpreadsheet, Link2, MessageCircle, Phone, QrCode, Scissors, Sparkles, Type, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import CountryPhoneInput, { splitPhoneNumber } from '@/Components/Profile/CountryPhoneInput';

const toolCards = [
    { id: 'qr', name: 'WhatsApp QR', icon: QrCode, desc: 'Create scan-to-chat QR codes for counters, posters, and websites', status: 'Ready' },
    { id: 'link', name: 'Click-to-chat link', icon: Link2, desc: 'Generate wa.me links with a pre-filled opening message', status: 'Ready' },
    { id: 'validator', name: 'Number checker', icon: Phone, desc: 'Check phone number format before importing or messaging', status: 'Local check' },
    { id: 'formatter', name: 'Message formatter', icon: Type, desc: 'Prepare WhatsApp bold, italic, and strike-through text', status: 'Ready' },
    { id: 'shortener', name: 'Campaign link', icon: Scissors, desc: 'Create a clean campaign link from a WhatsApp destination', status: 'Ready' },
    { id: 'bulk', name: 'CSV checker', icon: FileSpreadsheet, desc: 'Validate contact CSV rows before bulk import', status: 'Ready' },
];

function hashQrCell(value: string, row: number, col: number, size: number) {
    let hash = 0;
    const text = `${value}|${row}|${col}|${size}`;
    for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i);
    return Math.abs(hash) % 3 !== 0;
}

function QrPreview({ value, size = 21 }: { value: string; size?: number }) {
    const cells = buildQrCells(value, size);

    return (
        <div className="inline-grid h-[220px] w-[220px] gap-0 rounded-lg bg-white p-3 ring-1 ring-gray-200" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
            {cells.map((active, index) => (
                <span key={index} className="aspect-square" style={{ background: active ? '#111827' : '#fff' }} />
            ))}
        </div>
    );
}

function buildQrCells(value: string, size = 21) {
    const cells: boolean[] = [];
    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            const finder = (row < 7 && col < 7) || (row < 7 && col >= size - 7) || (row >= size - 7 && col < 7);
            cells.push(finder ? row === 0 || row === 6 || col === 0 || col === 6 || (row >= 2 && row <= 4 && col >= 2 && col <= 4) : hashQrCell(value || 'waify', row, col, size));
        }
    }
    return cells;
}

export default function Modules({ default_phone }: { default_phone?: string | null }) {
    const { toast } = useToast();
    const parsedPhone = splitPhoneNumber(default_phone || '+919988776655');
    const [activeTool, setActiveTool] = useState('qr');
    const [countryCode, setCountryCode] = useState(parsedPhone.countryCode);
    const [localPhone, setLocalPhone] = useState(parsedPhone.localPhone);
    const [message, setMessage] = useState('Hi! I found you on your website.');
    const [brandColor, setBrandColor] = useState('#00A548');
    const [qrName, setQrName] = useState('Website - Home');
    const [formatText, setFormatText] = useState('Your order is ready for pickup.');
    const [csvResult, setCsvResult] = useState<{ total: number; valid: number; invalid: number } | null>(null);

    const active = useMemo(() => toolCards.find((tool) => tool.id === activeTool) || toolCards[0], [activeTool]);
    const phone = `${countryCode}${localPhone}`.replace(/\D/g, '');
    const waLink = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;

    const copyLink = () => {
        void navigator.clipboard.writeText(waLink);
        toast.success('Link copied');
    };

    const downloadQr = () => {
        const size = 21;
        const cell = 10;
        const padding = 30;
        const cells = buildQrCells(`${phone}|${message}`, size);
        const rects = cells
            .map((active, index) => active ? `<rect x="${padding + (index % size) * cell}" y="${padding + Math.floor(index / size) * cell}" width="${cell}" height="${cell}" fill="#111827"/>` : '')
            .join('');
        const iconX = padding + (size * cell) - 46;
        const iconY = padding + (size * cell) - 46;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="270" height="300" viewBox="0 0 270 300"><rect width="270" height="300" rx="18" fill="#fff"/><rect x="24" y="24" width="222" height="222" rx="10" fill="#fff" stroke="#e5e7eb"/><g>${rects}</g><rect x="${iconX}" y="${iconY}" width="34" height="34" rx="8" fill="${brandColor}"/><text x="135" y="278" font-family="Arial, sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">${qrName.replace(/[<>&"]/g, '')}</text></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${qrName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'waify-qr'}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('QR downloaded');
    };

    const validateNumber = () => {
        const normalized = phone.replace(/\D/g, '');
        if (normalized.length < 8 || normalized.length > 15) {
            toast.error('Invalid phone number', 'Use country code and 8-15 digits.');
            return;
        }
        toast.success('Number format looks valid', `WhatsApp link: ${waLink}`);
    };

    const handleCsv = (file?: File) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const lines = String(reader.result || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
            const valid = lines.filter((line) => {
                const digits = line.split(',')[0]?.replace(/\D/g, '') || '';
                return digits.length >= 8 && digits.length <= 15;
            }).length;
            setCsvResult({ total: lines.length, valid, invalid: lines.length - valid });
            toast.success('CSV checked', `${valid} valid rows, ${lines.length - valid} need review.`);
        };
        reader.readAsText(file);
    };

    const formattedMessage = `*${formatText}*\n_${formatText}_\n~${formatText}~`;
    const qrValue = `${phone}|${message}`;
    const ActiveIcon = active.icon;

    return (
        <AppShell>
            <Head title="Tools" />
            <div className="mx-auto max-w-[1360px] space-y-5">
                <div className="flex flex-col gap-4 rounded-card border border-gray-200 bg-white p-5 shadow-sm dark:border-waify-dark-border dark:bg-waify-dark-surface md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-waify-green/12 text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-300">
                            <Wrench className="h-6 w-6" />
                        </span>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-semibold text-waify-text dark:text-waify-dark-text md:text-3xl">Tools</h1>
                                <span className="rounded-full bg-waify-green/10 px-2.5 py-1 text-xs font-semibold text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-300">/app/tools</span>
                            </div>
                            <p className="mt-1 max-w-2xl text-sm text-waify-text-muted dark:text-waify-dark-text-muted">Operational utilities for WhatsApp links, QR campaigns, message formatting, and contact import cleanup.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[300px]">
                        {[
                            ['Tools', toolCards.length],
                            ['Ready', toolCards.filter((tool) => tool.status === 'Ready').length],
                            ['Phone', default_phone ? 'Set' : 'Default'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-btn border border-gray-200 px-3 py-2 dark:border-waify-dark-border">
                                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">{value}</p>
                                <p className="text-[11px] uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
                    <Card className="overflow-hidden p-0">
                        <div className="border-b border-gray-200 px-4 py-3 dark:border-waify-dark-border">
                            <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Available tools</p>
                            <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">Pick a utility to configure and preview.</p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-waify-dark-border">
                            {toolCards.map((tool) => {
                                const Icon = tool.icon;
                                const selected = activeTool === tool.id;
                                return (
                                    <button
                                        key={tool.id}
                                        type="button"
                                        onClick={() => setActiveTool(tool.id)}
                                        className={cn(
                                            'flex w-full items-start gap-3 px-4 py-3 text-left transition',
                                            selected
                                                ? 'bg-waify-green/8 dark:bg-waify-green/12'
                                                : 'hover:bg-gray-50 dark:hover:bg-waify-dark-surface-2'
                                        )}
                                    >
                                        <span className={cn(
                                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-btn',
                                            selected ? 'bg-waify-green text-waify-ink' : 'bg-gray-100 text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted'
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="truncate text-sm font-semibold text-waify-text dark:text-waify-dark-text">{tool.name}</span>
                                                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-waify-text-muted dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">{tool.status}</span>
                                            </span>
                                            <span className="mt-0.5 block text-xs leading-5 text-waify-text-muted dark:text-waify-dark-text-muted">{tool.desc}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <Card className="p-5">
                            <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-waify-dark-border sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-waify-green/12 text-waify-green-dark dark:bg-waify-green/15 dark:text-emerald-300">
                                        {ActiveIcon && <ActiveIcon className="h-5 w-5" />}
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-lg font-semibold text-waify-text dark:text-waify-dark-text">{active.name}</h2>
                                        <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{active.desc}</p>
                                    </div>
                                </div>
                                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> {active.status}
                                </span>
                            </div>

                            {activeTool === 'qr' && (
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">QR label</label>
                                        <TextInput value={qrName} onChange={(event) => setQrName(event.target.value)} placeholder="e.g. Storefront counter" className="w-full" />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Brand color</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={brandColor} onChange={(event) => setBrandColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" />
                                            <TextInput value={brandColor} onChange={(event) => setBrandColor(event.target.value)} className="w-full" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <CountryPhoneInput
                                            countryCode={countryCode}
                                            phone={localPhone}
                                            onCountryCodeChange={setCountryCode}
                                            onPhoneChange={setLocalPhone}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Pre-filled message</label>
                                        <textarea
                                            value={message}
                                            onChange={(event) => setMessage(event.target.value)}
                                            rows={4}
                                            className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2 md:col-span-2">
                                        <Button onClick={downloadQr}><Download className="h-4 w-4" />Download SVG</Button>
                                        <Button variant="secondary" onClick={copyLink}><Copy className="h-4 w-4" />Copy link</Button>
                                        <a href={waLink} target="_blank" rel="noreferrer"><Button type="button" variant="secondary"><ExternalLink className="h-4 w-4" />Open</Button></a>
                                    </div>
                                </div>
                            )}

                            {(activeTool === 'link' || activeTool === 'validator' || activeTool === 'shortener') && (
                                <div className="space-y-4">
                                    <CountryPhoneInput
                                        countryCode={countryCode}
                                        phone={localPhone}
                                        onCountryCodeChange={setCountryCode}
                                        onPhoneChange={setLocalPhone}
                                    />
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Pre-filled message</label>
                                        <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={4} className="w-full rounded-btn border border-gray-200 bg-white px-3 py-2 text-sm text-waify-text outline-none focus:border-waify-green focus:ring-2 focus:ring-waify-green/20 dark:border-waify-dark-border dark:bg-waify-dark-surface dark:text-waify-dark-text" />
                                    </div>
                                    <div className="rounded-btn border border-gray-200 bg-gray-50 p-3 text-xs text-waify-text-muted dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text-muted">{waLink}</div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button onClick={activeTool === 'validator' ? validateNumber : copyLink}><Copy className="h-4 w-4" />{activeTool === 'validator' ? 'Validate' : 'Copy link'}</Button>
                                        <a href={waLink} target="_blank" rel="noreferrer"><Button type="button" variant="secondary"><ExternalLink className="h-4 w-4" />Open link</Button></a>
                                    </div>
                                </div>
                            )}

                            {activeTool === 'formatter' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-waify-text dark:text-waify-dark-text">Message text</label>
                                        <TextInput value={formatText} onChange={(event) => setFormatText(event.target.value)} className="w-full" />
                                    </div>
                                    <textarea readOnly value={formattedMessage} rows={5} className="w-full rounded-btn border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-waify-text dark:border-waify-dark-border dark:bg-waify-dark-surface-2 dark:text-waify-dark-text" />
                                    <Button onClick={() => { void navigator.clipboard.writeText(formattedMessage); toast.success('Formatted message copied'); }}><Copy className="h-4 w-4" />Copy formatted text</Button>
                                </div>
                            )}

                            {activeTool === 'bulk' && (
                                <div className="space-y-4">
                                    <div className="rounded-card border border-dashed border-gray-300 bg-gray-50 p-5 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                        <input type="file" accept=".csv,text/csv,text/plain" onChange={(event) => handleCsv(event.target.files?.[0])} className="block w-full text-sm text-waify-text-muted file:mr-3 file:rounded-btn file:border-0 file:bg-waify-green file:px-3 file:py-2 file:text-sm file:font-medium file:text-waify-ink dark:text-waify-dark-text-muted" />
                                        <p className="mt-2 text-xs text-waify-text-muted dark:text-waify-dark-text-muted">First column should contain phone numbers. This checks format only before import.</p>
                                    </div>
                                    {csvResult && (
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            {[
                                                ['Rows', csvResult.total],
                                                ['Valid', csvResult.valid],
                                                ['Review', csvResult.invalid],
                                            ].map(([label, value]) => (
                                                <div key={label} className="rounded-card border border-gray-200 p-3 dark:border-waify-dark-border">
                                                    <p className="text-lg font-semibold text-waify-text dark:text-waify-dark-text">{value}</p>
                                                    <p className="text-xs text-waify-text-muted dark:text-waify-dark-text-muted">{label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>

                        <Card className="p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-semibold text-waify-text dark:text-waify-dark-text">Live preview</p>
                                <Sparkles className="h-4 w-4 text-waify-green-dark dark:text-emerald-300" />
                            </div>
                            {activeTool === 'qr' ? (
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <QrPreview value={qrValue} />
                                        <span className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-lg shadow-md" style={{ background: brandColor }}>
                                            <MessageCircle className="h-5 w-5 text-white" />
                                        </span>
                                    </div>
                                    <p className="mt-4 max-w-xs text-center text-sm font-semibold text-waify-text dark:text-waify-dark-text">{qrName}</p>
                                </div>
                            ) : (
                                <div className="rounded-card border border-gray-200 bg-gray-50 p-4 dark:border-waify-dark-border dark:bg-waify-dark-surface-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-waify-text-muted dark:text-waify-dark-text-muted">Output</p>
                                    <pre className="mt-3 whitespace-pre-wrap break-words text-xs leading-5 text-waify-text dark:text-waify-dark-text">{activeTool === 'formatter' ? formattedMessage : waLink}</pre>
                                </div>
                            )}
                            <div className="mt-4 rounded-btn bg-waify-green/8 p-3 text-xs leading-5 text-waify-green-dark dark:bg-waify-green/12 dark:text-emerald-200">
                                These tools run inside the browser and do not change contacts, campaigns, or billing data.
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
