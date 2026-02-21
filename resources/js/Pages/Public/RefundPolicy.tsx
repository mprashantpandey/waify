import PublicLayout from '@/Layouts/PublicLayout';

export default function RefundPolicy({ content = '' }: { content?: string }) {
    return (
        <PublicLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">Refund Policy</h1>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {content && content.trim() !== ''
                            ? content
                            : 'Refund requests are reviewed as per plan terms, billing cycle, and payment provider policies.'}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

