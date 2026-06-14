import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import AppShell from '@/Layouts/AppShell';
import Button from '@/Components/UI/Button';
import { Card, CardContent } from '@/Components/UI/Card';
import { EmptyPanel, AddonPage, PaginationMeta, ServerListControls, StatGrid } from './Shared';
import { Modal, StatusBadge, Toolbar, ThemedIconTile } from '@/Components/UI/Elements';
import { FileText, Image, Upload, Video, Music2, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useConfirm } from '@/hooks/useConfirm';

type MediaItem = { id: string; numericId: number; name: string; type: 'image' | 'video' | 'audio' | 'document'; size: string; usedIn: string; uploaded: string | null; url?: string | null; deletable?: boolean };

export default function MediaLibrary({ items = [], stats, filters = {}, pagination = null }: { items: MediaItem[]; stats: { total: number; images: number; videos: number; documents: number }; filters?: Record<string, any>; pagination?: PaginationMeta | null }) {
    const { toast } = useToast();
    const confirm = useConfirm();
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState<MediaItem | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const uploadForm = useForm<{ file: File | null; name: string }>({ file: null, name: '' });
    const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [items, search]);

    const iconFor = (type: string) => type === 'image' ? Image : type === 'video' ? Video : FileText;
    const upload = (file: File) => {
        uploadForm.setData({ file, name: file.name });
        uploadForm.post(route('app.media-library.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                uploadForm.reset();
                if (fileRef.current) fileRef.current.value = '';
            },
        });
    };
    const remove = async (item: MediaItem) => {
        if (!item.deletable) return;
        const confirmed = await confirm({
            title: 'Delete media',
            message: `Delete "${item.name}" from this workspace media library?`,
            confirmText: 'Delete media',
            variant: 'danger',
        });
        if (confirmed) router.delete(route('app.media-library.destroy', item.numericId), { preserveScroll: true, onSuccess: () => setSelected(null) });
    };

    return (
        <AppShell>
            <Head title="Media Library" />
            <AddonPage
                title="Media Library"
                description="Reusable WhatsApp media pulled from inbox messages and outbound assets."
                actions={<><input ref={fileRef} type="file" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file); }} /><Button onClick={() => fileRef.current?.click()} disabled={uploadForm.processing}><Upload className="mr-2 h-4 w-4" />{uploadForm.processing ? 'Uploading...' : 'Upload media'}</Button></>}
            >
                <StatGrid stats={[
                    { label: 'Total assets', value: stats.total, icon: Image, tone: 'green' },
                    { label: 'Images', value: stats.images, icon: Image, tone: 'blue' },
                    { label: 'Videos', value: stats.videos, icon: Video, tone: 'purple' },
                    { label: 'Documents & audio', value: stats.documents, icon: Music2, tone: 'amber' },
                ]} />

                <ServerListControls routeName="app.media-library.index" filters={filters} pagination={pagination} searchPlaceholder="Search media library" />
                <Toolbar search={{ value: search, onChange: setSearch, placeholder: 'Filter current page' }} />

                {filtered.length === 0 ? (
                    <EmptyPanel title="No media found" description="Images, videos, documents, and audio from WhatsApp conversations will appear here once messages contain attachments." />
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((item) => {
                            const Icon = iconFor(item.type);
                            return (
                                <button key={item.id} type="button" onClick={() => setSelected(item)} className="text-left">
                                    <Card className="h-full transition hover:border-waify-green/50 hover:shadow-pop dark:hover:border-emerald-400/40">
                                        <CardContent className="p-5">
                                            <div className="flex items-start gap-4">
                                                <ThemedIconTile tone={item.type === 'image' ? 'blue' : item.type === 'video' ? 'purple' : 'amber'} size="lg">
                                                    <Icon className="h-5 w-5" />
                                                </ThemedIconTile>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate font-semibold text-waify-text dark:text-waify-dark-text">{item.name}</h3>
                                                    <p className="mt-1 text-sm text-waify-text-muted dark:text-waify-dark-text-muted">{item.size}</p>
                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <StatusBadge tone="info">{item.type}</StatusBadge>
                                                        <StatusBadge tone="muted">{item.usedIn}</StatusBadge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </button>
                            );
                        })}
                    </div>
                )}

                <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Media'} description="Workspace media asset">
                    <div className="space-y-4">
                        <div className="flex h-44 items-center justify-center rounded-card bg-gray-50 dark:bg-waify-dark-surface-2">
                            {selected?.type === 'image' && selected.url ? <img src={selected.url} alt={selected.name} className="h-full w-full rounded-card object-contain" /> : selected && <ThemedIconTile tone="blue" size="lg">{(() => { const Icon = iconFor(selected.type); return <Icon className="h-6 w-6" />; })()}</ThemedIconTile>}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Type</span><p className="font-semibold capitalize">{selected?.type}</p></div>
                            <div><span className="text-waify-text-muted dark:text-waify-dark-text-muted">Source</span><p className="font-semibold">{selected?.usedIn}</p></div>
                        </div>
                        <Button variant="secondary" className="w-full" onClick={() => { navigator.clipboard?.writeText(selected?.url || String(selected?.id || '')); toast.success('Media reference copied'); }}>
                            <Copy className="mr-2 h-4 w-4" />Copy reference
                        </Button>
                        {selected?.deletable && <Button variant="danger" className="w-full" onClick={() => remove(selected)}><Trash2 className="mr-2 h-4 w-4" />Delete media</Button>}
                    </div>
                </Modal>
            </AddonPage>
        </AppShell>
    );
}
