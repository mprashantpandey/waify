import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Head } from '@inertiajs/react';
import { ArrowLeft, MessageSquare, Search, Loader2 } from 'lucide-react';
import Button from '@/Components/UI/Button';
import TextInput from '@/Components/TextInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';

interface ContactOption {
    id: number;
    slug: string;
    wa_id: string;
    name: string;
}

export default function NewConversation({
    account,
    contacts,
    connections,
}: {
    account: any;
    contacts: ContactOption[];
    connections: Array<{ id: number; name: string }>;
}) {
    const [search, setSearch] = useState('');
    const [selectedContact, setSelectedContact] = useState<ContactOption | null>(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState<number | ''>(connections.length === 1 ? connections[0].id : '');
    const [navigating, setNavigating] = useState(false);

    const filtered = contacts.filter(
        (c) =>
            !search.trim() ||
            (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.wa_id || '').includes(search)
    );

    const openChat = () => {
        if (!selectedContact) return;
        setNavigating(true);
        const url =
            connections.length > 1 && selectedConnectionId
                ? route('app.whatsapp.conversations.by-contact', {
                      contact: selectedContact.slug || selectedContact.id,
                  }) + `?connection_id=${selectedConnectionId}`
                : route('app.whatsapp.conversations.by-contact', {
                      contact: selectedContact.slug || selectedContact.id,
                  });
        router.visit(url, { onFinish: () => setNavigating(false) });
    };

    return (
        <AppShell>
            <Head title="New conversation" />
            <div className="space-y-6">
                <Link
                    href={route('app.whatsapp.conversations.index')}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inbox
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">New conversation</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Choose a contact to open or start a chat
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Select contact</CardTitle>
                        <CardDescription>Search and pick a contact to open the conversation in Inbox</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
                            <TextInput
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search contacts by name or number..."
                                className="pl-9"
                                aria-label="Search contacts"
                            />
                        </div>

                        {connections.length > 1 && (
                            <div>
                                <label htmlFor="connection" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    WhatsApp number
                                </label>
                                <select
                                    id="connection"
                                    value={selectedConnectionId}
                                    onChange={(e) => setSelectedConnectionId(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#25D366] focus:ring-[#25D366] dark:bg-gray-800 dark:border-gray-700"
                                >
                                    <option value="">Select a number</option>
                                    {connections.map((conn) => (
                                        <option key={conn.id} value={conn.id}>
                                            {conn.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            {filtered.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {contacts.length === 0
                                        ? 'No contacts yet. Add contacts from the Contacts section.'
                                        : 'No contacts match your search.'}
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filtered.map((contact) => (
                                        <li key={contact.id}>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedContact(contact)}
                                                className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                                                    selectedContact?.id === contact.id
                                                        ? 'bg-[#25D366]/10 text-[#25D366] dark:bg-[#25D366]/20'
                                                        : ''
                                                }`}
                                            >
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {contact.name || contact.wa_id}
                                                </span>
                                                {contact.wa_id && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{contact.wa_id}</span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                onClick={openChat}
                                disabled={!selectedContact || navigating || (connections.length > 1 && !selectedConnectionId)}
                                className="bg-[#25D366] hover:bg-[#1DAA57] text-white"
                                aria-label="Open chat"
                            >
                                {navigating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden />
                                ) : (
                                    <MessageSquare className="h-4 w-4 mr-2" aria-hidden />
                                )}
                                Open chat
                            </Button>
                            {selectedContact && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    with {selectedContact.name || selectedContact.wa_id}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}
