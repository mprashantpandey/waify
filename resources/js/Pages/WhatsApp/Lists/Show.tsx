import { Link } from '@inertiajs/react';
import AppShell from '@/Layouts/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Badge } from '@/Components/UI/Badge';
import Button from '@/Components/UI/Button';
import { ArrowLeft, Edit, List as ListIcon } from 'lucide-react';
import { Head } from '@inertiajs/react';

interface ListData {
    id: number;
    name: string;
    button_text: string;
    description: string | null;
    footer_text: string | null;
    sections: Array<{
        title: string;
        rows: Array<{
            id: string;
            title: string;
            description?: string;
        }>;
    }>;
    is_active: boolean;
    connection: {
        id: number;
        name: string;
    };
    created_at: string;
}

export default function ListsShow({
    account,
    list}: {
    account: any;
    list: ListData;
}) {
    const totalRows = list.sections.reduce((sum, s) => sum + s.rows.length, 0);

    return (
        <AppShell>
            <Head title={`List: ${list.name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('app.whatsapp.lists.index', {})}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{list.name}</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Interactive list message configuration
                        </p>
                    </div>
                    <Link href={route('app.whatsapp.lists.edit', { list: list.id })}>
                        <Button>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Button Text</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                {list.button_text}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Sections</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                {list.sections.length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Total Rows</div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                                {totalRows}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>List Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Connection</div>
                            <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">{list.connection.name}</div>
                        </div>
                        {list.description && (
                            <div>
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">{list.description}</div>
                            </div>
                        )}
                        {list.footer_text && (
                            <div>
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Footer</div>
                                <div className="text-sm text-gray-900 dark:text-gray-100 mt-1">{list.footer_text}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</div>
                            <div className="mt-1">
                                {list.is_active ? (
                                    <Badge variant="success">Active</Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Sections & Rows</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {list.sections.map((section, sectionIndex) => (
                            <div
                                key={sectionIndex}
                                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {section.title || `Section ${sectionIndex + 1}`}
                                </h3>
                                <div className="space-y-2">
                                    {section.rows.map((row, rowIndex) => (
                                        <div
                                            key={rowIndex}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                                        >
                                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                                                {row.title}
                                            </div>
                                            {row.description && (
                                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {row.description}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                ID: {row.id}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

