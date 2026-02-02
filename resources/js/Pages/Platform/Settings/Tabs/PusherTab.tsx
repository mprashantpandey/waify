import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Radio, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface PusherTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function PusherTab({ data, setData, errors }: PusherTabProps) {
    const [showSecret, setShowSecret] = useState(false);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    Pusher Configuration
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="pusher.app_id" value="App ID" />
                        <TextInput
                            id="pusher.app_id"
                            type="text"
                            value={data.pusher?.app_id || ''}
                            onChange={(e) => setData('pusher.app_id', e.target.value)}
                            className="mt-1"
                        />
                        <InputError message={errors['pusher.app_id']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="pusher.key" value="Key" />
                        <TextInput
                            id="pusher.key"
                            type="text"
                            value={data.pusher?.key || ''}
                            onChange={(e) => setData('pusher.key', e.target.value)}
                            className="mt-1"
                        />
                        <InputError message={errors['pusher.key']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="pusher.secret" value="Secret" />
                        <div className="relative mt-1">
                            <TextInput
                                id="pusher.secret"
                                type={showSecret ? 'text' : 'password'}
                                value={data.pusher?.secret || ''}
                                onChange={(e) => setData('pusher.secret', e.target.value)}
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
                        <InputError message={errors['pusher.secret']} />
                    </div>
                    <div>
                        <InputLabel htmlFor="pusher.cluster" value="Cluster" />
                        <TextInput
                            id="pusher.cluster"
                            type="text"
                            value={data.pusher?.cluster || ''}
                            onChange={(e) => setData('pusher.cluster', e.target.value)}
                            className="mt-1"
                        />
                        <InputError message={errors['pusher.cluster']} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
