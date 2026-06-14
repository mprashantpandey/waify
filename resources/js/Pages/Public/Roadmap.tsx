import { Head } from '@inertiajs/react';
import { Badge, Card, MarketingLayout, roadmapItems } from '@/Components/Public/Marketing';

export default function Roadmap() {
    return (
        <MarketingLayout page="roadmap">
            <Head title="Roadmap" />
            <div className="space-y-4">
                {roadmapItems.map((item) => (
                    <Card key={item.title} className="mkt-card-lift p-5">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant={item.status === 'Shipped' ? 'success' : item.status === 'In progress' ? 'warning' : 'secondary'}>{item.status}</Badge>
                            <span className="text-xs text-waify-text-muted">{item.quarter}</span>
                        </div>
                        <h2 className="font-semibold">{item.title}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{item.desc}</p>
                    </Card>
                ))}
            </div>
        </MarketingLayout>
    );
}
