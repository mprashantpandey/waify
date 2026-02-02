import { Card, CardContent, CardHeader, CardTitle } from '@/Components/UI/Card';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Zap, Database, Layers } from 'lucide-react';

interface PerformanceTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function PerformanceTab({ data, setData, errors }: PerformanceTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Cache Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <InputLabel htmlFor="performance.cache_driver" value="Cache Driver" />
                        <select
                            id="performance.cache_driver"
                            value={data.performance?.cache_driver || 'file'}
                            onChange={(e) => setData('performance.cache_driver', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                            <option value="file">File</option>
                            <option value="redis">Redis</option>
                            <option value="memcached">Memcached</option>
                            <option value="database">Database</option>
                        </select>
                        <InputError message={errors['performance.cache_driver']} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="performance.cache_ttl" value="Default Cache TTL (Seconds)" />
                            <TextInput
                                id="performance.cache_ttl"
                                type="number"
                                value={data.performance?.cache_ttl || 3600}
                                onChange={(e) => setData('performance.cache_ttl', parseInt(e.target.value) || 3600)}
                                className="mt-1"
                                min="60"
                            />
                            <InputError message={errors['performance.cache_ttl']} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <InputLabel value="Enable Cache" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">Use caching for improved performance</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.performance?.cache_enabled || false}
                                    onChange={(e) => setData('performance.cache_enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Queue Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <InputLabel htmlFor="performance.queue_connection" value="Queue Connection" />
                        <select
                            id="performance.queue_connection"
                            value={data.performance?.queue_connection || 'database'}
                            onChange={(e) => setData('performance.queue_connection', e.target.value)}
                            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        >
                            <option value="database">Database</option>
                            <option value="redis">Redis</option>
                            <option value="sqs">Amazon SQS</option>
                            <option value="beanstalkd">Beanstalkd</option>
                        </select>
                        <InputError message={errors['performance.queue_connection']} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="performance.queue_max_attempts" value="Max Attempts" />
                            <TextInput
                                id="performance.queue_max_attempts"
                                type="number"
                                value={data.performance?.queue_max_attempts || 3}
                                onChange={(e) => setData('performance.queue_max_attempts', parseInt(e.target.value) || 3)}
                                className="mt-1"
                                min="1"
                                max="10"
                            />
                            <InputError message={errors['performance.queue_max_attempts']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="performance.queue_timeout" value="Timeout (Seconds)" />
                            <TextInput
                                id="performance.queue_timeout"
                                type="number"
                                value={data.performance?.queue_timeout || 90}
                                onChange={(e) => setData('performance.queue_timeout', parseInt(e.target.value) || 90)}
                                className="mt-1"
                                min="30"
                            />
                            <InputError message={errors['performance.queue_timeout']} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Optimization
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="performance.db_connection_pool" value="Connection Pool Size" />
                            <TextInput
                                id="performance.db_connection_pool"
                                type="number"
                                value={data.performance?.db_connection_pool || 10}
                                onChange={(e) => setData('performance.db_connection_pool', parseInt(e.target.value) || 10)}
                                className="mt-1"
                                min="5"
                                max="100"
                            />
                            <InputError message={errors['performance.db_connection_pool']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="performance.query_timeout" value="Query Timeout (Seconds)" />
                            <TextInput
                                id="performance.query_timeout"
                                type="number"
                                value={data.performance?.query_timeout || 30}
                                onChange={(e) => setData('performance.query_timeout', parseInt(e.target.value) || 30)}
                                className="mt-1"
                                min="5"
                            />
                            <InputError message={errors['performance.query_timeout']} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <InputLabel value="Enable Query Logging" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Log all database queries (development only)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.performance?.query_logging_enabled || false}
                                onChange={(e) => setData('performance.query_logging_enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        File Upload Limits
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="performance.max_upload_size" value="Max Upload Size (MB)" />
                            <TextInput
                                id="performance.max_upload_size"
                                type="number"
                                value={data.performance?.max_upload_size || 10}
                                onChange={(e) => setData('performance.max_upload_size', parseInt(e.target.value) || 10)}
                                className="mt-1"
                                min="1"
                                max="100"
                            />
                            <InputError message={errors['performance.max_upload_size']} />
                        </div>
                        <div>
                            <InputLabel htmlFor="performance.allowed_file_types" value="Allowed File Types" />
                            <TextInput
                                id="performance.allowed_file_types"
                                type="text"
                                value={data.performance?.allowed_file_types || 'jpg,jpeg,png,pdf,doc,docx'}
                                onChange={(e) => setData('performance.allowed_file_types', e.target.value)}
                                className="mt-1"
                                placeholder="jpg,jpeg,png,pdf"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma-separated list</p>
                            <InputError message={errors['performance.allowed_file_types']} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

