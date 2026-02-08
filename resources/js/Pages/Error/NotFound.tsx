import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Home, ArrowLeft, Inbox, Users } from 'lucide-react';
import Button from '@/Components/UI/Button';

export default function NotFound() {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isConversationNotFound = path.startsWith('/app/conversations/') && path !== '/app/conversations';
    const isContactNotFound = path.startsWith('/app/contacts/') && path !== '/app/contacts';

    const title = isConversationNotFound ? 'Conversation not found' : isContactNotFound ? 'Contact not found' : 'Page not found';
    const message = isConversationNotFound
        ? 'This conversation may have been deleted or you may not have access. Try opening the inbox again.'
        : isContactNotFound
            ? 'This contact may have been deleted or you may not have access. Try opening contacts again.'
            : 'The page you requested could not be found.';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <Head title="Page not found" />
            <div className="text-center">
                <p className="text-6xl font-bold text-gray-200 dark:text-gray-700">404</p>
                <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    {isConversationNotFound && typeof route !== 'undefined' && (
                        <Link href={route('app.whatsapp.conversations.index')}>
                            <Button>
                                <Inbox className="h-4 w-4 mr-2" />
                                Back to Inbox
                            </Button>
                        </Link>
                    )}
                    {isContactNotFound && typeof route !== 'undefined' && (
                        <Link href={route('app.contacts.index')}>
                            <Button>
                                <Users className="h-4 w-4 mr-2" />
                                Back to Contacts
                            </Button>
                        </Link>
                    )}
                    <Button onClick={() => window.history.back()} variant="secondary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go back
                    </Button>
                    <Link href={typeof route !== 'undefined' ? route('app.dashboard') : '/app/dashboard'}>
                        <Button variant={isConversationNotFound || isContactNotFound ? 'secondary' : 'primary'}>
                            <Home className="h-4 w-4 mr-2" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
