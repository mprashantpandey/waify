import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { HardDrive, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface StorageTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function StorageTab({ data, setData, errors }: StorageTabProps) {
    const [showSecret, setShowSecret] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5" />
                    Storage Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="storage.default" value="Default Driver" />
                        <select
                            id="storage.default"
                            value={data.storage?.default || 'local'}
                            onChange={(e) => setData('storage.default', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                            <option value="local">Local</option>
                            <option value="public">Public</option>
                            <option value="s3">Amazon S3</option>
                        </select>
                        <InputError message={errors['storage.default']} />
                    </div>
                </div>
                {data.storage?.default === 's3' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <InputLabel htmlFor="storage.s3_key" value="S3 Access Key" />
                            <TextInput
                                id="storage.s3_key"
                                type="text"
                                value={data.storage?.s3_key || ''}
                                onChange={(e) => setData('storage.s3_key', e.target.value)}
                                className="mt-1"
                            />
                            <InputError message={errors['storage.s3_key']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="storage.s3_secret" value="S3 Secret Key" />
                            <div className="relative mt-1">
                                <TextInput
                                    id="storage.s3_secret"
                                    type={showSecret ? 'text' : 'password'}
                                    value={data.storage?.s3_secret || ''}
                                    onChange={(e) => setData('storage.s3_secret', e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <InputError message={errors['storage.s3_secret']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="storage.s3_region" value="S3 Region" />
                            <TextInput
                                id="storage.s3_region"
                                type="text"
                                value={data.storage?.s3_region || ''}
                                onChange={(e) => setData('storage.s3_region', e.target.value)}
                                className="mt-1"
                                placeholder="us-east-1"
                            />
                            <InputError message={errors['storage.s3_region']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="storage.s3_bucket" value="S3 Bucket" />
                            <TextInput
                                id="storage.s3_bucket"
                                type="text"
                                value={data.storage?.s3_bucket || ''}
                                onChange={(e) => setData('storage.s3_bucket', e.target.value)}
                                className="mt-1"
                            />
                            <InputError message={errors['storage.s3_bucket']} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

