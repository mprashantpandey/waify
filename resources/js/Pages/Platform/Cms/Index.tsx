import { Head, useForm, usePage } from '@inertiajs/react';
import PlatformShell from '@/Layouts/PlatformShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import Button from '@/Components/UI/Button';
import InputError from '@/Components/InputError';

interface CmsFormData {
    terms_content: string;
    privacy_content: string;
    cookie_content: string;
    refund_content: string;
}

export default function CmsPagesIndex({
    pages,
}: {
    pages: Partial<CmsFormData>;
}) {
    const { auth } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm<CmsFormData>({
        terms_content: pages?.terms_content || '',
        privacy_content: pages?.privacy_content || '',
        cookie_content: pages?.cookie_content || '',
        refund_content: pages?.refund_content || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('platform.cms.update'));
    };

    return (
        <PlatformShell auth={auth}>
            <Head title="CMS Pages" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CMS Pages</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Edit policy pages shown on public site.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Terms of Service</CardTitle>
                            <CardDescription>Displayed on `/terms`</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="terms_content">Content</Label>
                            <textarea
                                id="terms_content"
                                value={data.terms_content}
                                onChange={(e) => setData('terms_content', e.target.value)}
                                rows={14}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                placeholder="Enter terms content..."
                            />
                            <InputError message={errors.terms_content} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Privacy Policy</CardTitle>
                            <CardDescription>Displayed on `/privacy`</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="privacy_content">Content</Label>
                            <textarea
                                id="privacy_content"
                                value={data.privacy_content}
                                onChange={(e) => setData('privacy_content', e.target.value)}
                                rows={14}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                placeholder="Enter privacy content..."
                            />
                            <InputError message={errors.privacy_content} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Refund Policy</CardTitle>
                            <CardDescription>Displayed on `/refund-policy`</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="refund_content">Content</Label>
                            <textarea
                                id="refund_content"
                                value={data.refund_content}
                                onChange={(e) => setData('refund_content', e.target.value)}
                                rows={12}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                placeholder="Enter refund policy content..."
                            />
                            <InputError message={errors.refund_content} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cookie Policy</CardTitle>
                            <CardDescription>Displayed on `/cookie-policy`</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label htmlFor="cookie_content">Content</Label>
                            <textarea
                                id="cookie_content"
                                value={data.cookie_content}
                                onChange={(e) => setData('cookie_content', e.target.value)}
                                rows={12}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                placeholder="Enter cookie policy content..."
                            />
                            <InputError message={errors.cookie_content} className="mt-2" />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save CMS Pages'}
                        </Button>
                    </div>
                </form>
            </div>
        </PlatformShell>
    );
}
