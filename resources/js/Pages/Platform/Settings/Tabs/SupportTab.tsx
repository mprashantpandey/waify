import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/UI/Card';
import { Label } from '@/Components/UI/Label';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import { Switch } from '@/Components/UI/Switch';
import { useState, useMemo } from 'react';
import { GripVertical, Plus, Trash2, Copy, ChevronDown, ChevronUp, Search, Tag, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { Badge } from '@/Components/UI/Badge';

interface SupportTabProps {
    data: any;
    setData: (key: string, value: any) => void;
    errors: Record<string, any>;
}

interface FaqItem {
    question: string;
    answer: string;
    category?: string;
    enabled?: boolean;
    order?: number;
    tags?: string[];
}

export default function SupportTab({ data, setData, errors }: SupportTabProps) {
    const faqs: FaqItem[] = data.support?.faqs || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [expandedFaqs, setExpandedFaqs] = useState<Set<number>>(new Set());

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set<string>();
        faqs.forEach(faq => {
            if (faq.category && faq.category.trim()) {
                cats.add(faq.category);
            }
        });
        return Array.from(cats).sort();
    }, [faqs]);

    // Filter FAQs
    const filteredFaqs = useMemo(() => {
        let filtered = [...faqs];
        
        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(faq => 
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query) ||
                faq.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(faq => faq.category === selectedCategory);
        }
        
        return filtered;
    }, [faqs, searchQuery, selectedCategory]);

    const updateFaq = (index: number, field: keyof FaqItem, value: any) => {
        const next = [...faqs];
        next[index] = { ...next[index], [field]: value };
        setData('support', { ...data.support, faqs: next });
    };

    const addFaq = () => {
        const newOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order || 0)) + 1 : 0;
        setData('support', {
            ...data.support,
            faqs: [...faqs, { 
                question: '', 
                answer: '',
                category: '',
                enabled: true,
                order: newOrder,
                tags: []
            }]});
    };

    const removeFaq = (index: number) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            const next = faqs.filter((_, idx) => idx !== index);
            setData('support', { ...data.support, faqs: next });
        }
    };

    const duplicateFaq = (index: number) => {
        const faqToDuplicate = faqs[index];
        const newOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order || 0)) + 1 : 0;
        setData('support', {
            ...data.support,
            faqs: [...faqs, {
                ...faqToDuplicate,
                question: `${faqToDuplicate.question} (Copy)`,
                order: newOrder
            }]});
    };

    const moveFaq = (index: number, direction: 'up' | 'down') => {
        const newFaqs = [...faqs];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex < 0 || newIndex >= newFaqs.length) return;
        
        // Swap orders
        const tempOrder = newFaqs[index].order || index;
        newFaqs[index].order = newFaqs[newIndex].order || newIndex;
        newFaqs[newIndex].order = tempOrder;
        
        // Swap items
        [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
        
        setData('support', { ...data.support, faqs: newFaqs });
    };

    const toggleFaqExpanded = (index: number) => {
        const newExpanded = new Set(expandedFaqs);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedFaqs(newExpanded);
    };

    const addTag = (index: number, tag: string) => {
        const faq = faqs[index];
        const tags = faq.tags || [];
        if (tag.trim() && !tags.includes(tag.trim())) {
            updateFaq(index, 'tags', [...tags, tag.trim()]);
        }
    };

    const removeTag = (index: number, tagIndex: number) => {
        const faq = faqs[index];
        const tags = faq.tags || [];
        updateFaq(index, 'tags', tags.filter((_, idx) => idx !== tagIndex));
    };

    // Sort FAQs by order
    const sortedFaqs = useMemo(() => {
        return [...faqs].sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [faqs]);

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardTitle className="text-xl font-bold">Support Types</CardTitle>
                    <CardDescription>Enable or disable support features for all users</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold">Live Chat Widget</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Enable the live chat widget for users. When disabled, users will not see the chat widget in their panel.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.support?.live_chat_enabled ?? true}
                                    onCheckedChange={(value) =>
                                        setData('support', { ...data.support, live_chat_enabled: value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold">Ticket Support</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Enable ticket support system. When disabled, users will not be able to create or view support tickets.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.support?.ticket_support_enabled ?? true}
                                    onCheckedChange={(value) =>
                                        setData('support', { ...data.support, ticket_support_enabled: value })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <HelpCircle className="h-5 w-5" />
                                Support FAQs
                            </CardTitle>
                            <CardDescription>Manage common questions shown in the Support Hub</CardDescription>
                        </div>
                        <Button type="button" onClick={addFaq} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add FAQ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    {/* Search and Filter */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <TextInput
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                placeholder="Search FAQs..."
                            />
                        </div>
                        <div>
                            <Label>Category Filter</Label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Total: {faqs.length}</span>
                        <span>Enabled: {faqs.filter(f => f.enabled !== false).length}</span>
                        <span>Disabled: {faqs.filter(f => f.enabled === false).length}</span>
                        {filteredFaqs.length !== faqs.length && (
                            <span className="text-blue-600 dark:text-blue-400">
                                Showing: {filteredFaqs.length}
                            </span>
                        )}
                    </div>

                    {/* FAQs List */}
                    {sortedFaqs.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No FAQs yet</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                Add your first FAQ to help users find answers quickly
                            </p>
                            <Button type="button" onClick={addFaq} variant="primary">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First FAQ
                            </Button>
                        </div>
                    ) : filteredFaqs.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">No FAQs match your search</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedFaqs.map((faq, index) => {
                                const originalIndex = faqs.findIndex(f => f === faq);
                                const isExpanded = expandedFaqs.has(originalIndex);
                                const isEnabled = faq.enabled !== false;
                                
                                return (
                                    <div 
                                        key={originalIndex} 
                                        className={`rounded-lg border-2 transition-all ${
                                            isEnabled 
                                                ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' 
                                                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-75'
                                        }`}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start gap-3">
                                                {/* Drag Handle */}
                                                <div className="flex flex-col gap-1 mt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveFaq(originalIndex, 'up')}
                                                        disabled={index === 0}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <GripVertical className="h-5 w-5 text-gray-400" />
                                                    <button
                                                        type="button"
                                                        onClick={() => moveFaq(originalIndex, 'down')}
                                                        disabled={index === sortedFaqs.length - 1}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                {!isEnabled && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        <EyeOff className="h-3 w-3 mr-1" />
                                                                        Disabled
                                                                    </Badge>
                                                                )}
                                                                {faq.category && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Tag className="h-3 w-3 mr-1" />
                                                                        {faq.category}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <Label htmlFor={`support.faqs.${originalIndex}.question`} className="text-sm font-semibold">
                                                                Question
                                                            </Label>
                                                            <TextInput
                                                                id={`support.faqs.${originalIndex}.question`}
                                                                type="text"
                                                                value={faq.question}
                                                                onChange={(e) => updateFaq(originalIndex, 'question', e.target.value)}
                                                                className="mt-1 block w-full"
                                                                placeholder="How do I connect WhatsApp?"
                                                            />
                                                            {errors?.[`support.faqs.${originalIndex}.question`] && (
                                                                <p className="text-sm text-red-600 mt-1">{errors[`support.faqs.${originalIndex}.question`]}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Switch
                                                                checked={isEnabled}
                                                                onCheckedChange={(value) => updateFaq(originalIndex, 'enabled', value)}
                                                                title={isEnabled ? 'Disable FAQ' : 'Enable FAQ'}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Answer */}
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <Label htmlFor={`support.faqs.${originalIndex}.answer`} className="text-sm font-semibold">
                                                                Answer
                                                            </Label>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {faq.answer?.length || 0} characters
                                                            </span>
                                                        </div>
                                                        <textarea
                                                            id={`support.faqs.${originalIndex}.answer`}
                                                            value={faq.answer}
                                                            onChange={(e) => updateFaq(originalIndex, 'answer', e.target.value)}
                                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                                                            rows={isExpanded ? 6 : 3}
                                                            placeholder="Go to Connections and follow the setup wizard."
                                                        />
                                                        {errors?.[`support.faqs.${originalIndex}.answer`] && (
                                                            <p className="text-sm text-red-600 mt-1">{errors[`support.faqs.${originalIndex}.answer`]}</p>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleFaqExpanded(originalIndex)}
                                                            className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            {isExpanded ? 'Show less' : 'Show more'}
                                                        </button>
                                                    </div>

                                                    {/* Category and Tags */}
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <div>
                                                            <Label htmlFor={`support.faqs.${originalIndex}.category`} className="text-sm font-semibold">
                                                                Category
                                                            </Label>
                                                            <TextInput
                                                                id={`support.faqs.${originalIndex}.category`}
                                                                type="text"
                                                                value={faq.category || ''}
                                                                onChange={(e) => updateFaq(originalIndex, 'category', e.target.value)}
                                                                className="mt-1 block w-full"
                                                                placeholder="e.g., Getting Started, Billing, Technical"
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label className="text-sm font-semibold mb-1 block">Tags</Label>
                                                            <div className="flex flex-wrap gap-2 mt-1">
                                                                {(faq.tags || []).map((tag, tagIndex) => (
                                                                    <Badge key={tagIndex} variant="outline" className="flex items-center gap-1">
                                                                        {tag}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeTag(originalIndex, tagIndex)}
                                                                            className="ml-1 hover:text-red-600"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </Badge>
                                                                ))}
                                                                <input
                                                                    type="text"
                                                                    placeholder="Add tag..."
                                                                    className="text-xs border-0 bg-transparent focus:outline-none focus:ring-0 p-0"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            const input = e.target as HTMLInputElement;
                                                                            if (input.value.trim()) {
                                                                                addTag(originalIndex, input.value);
                                                                                input.value = '';
                                                                            }
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => duplicateFaq(originalIndex)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                            Duplicate
                                                        </Button>
                                                        <Button 
                                                            type="button" 
                                                            variant="secondary" 
                                                            size="sm"
                                                            onClick={() => removeFaq(originalIndex)}
                                                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Other Support Settings */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                    <CardTitle className="text-xl font-bold">Support Settings</CardTitle>
                    <CardDescription>Configure support notifications and SLAs</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold">Email Notifications</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Enable or disable all support emails.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.support?.email_notifications_enabled ?? true}
                                    onCheckedChange={(value) =>
                                        setData('support', { ...data.support, email_notifications_enabled: value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold">Notify Admins</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Email platform admins on new tickets and replies.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.support?.notify_admins ?? true}
                                    onCheckedChange={(value) =>
                                        setData('support', { ...data.support, notify_admins: value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-sm font-semibold">Notify Customers</Label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Email tenants when agents reply.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.support?.notify_customers ?? true}
                                    onCheckedChange={(value) =>
                                        setData('support', { ...data.support, notify_customers: value })
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="support.sla_hours">SLA Hours</Label>
                            <TextInput
                                id="support.sla_hours"
                                type="number"
                                min="1"
                                value={data.support?.sla_hours ?? 48}
                                onChange={(e) => setData('support', { ...data.support, sla_hours: Number(e.target.value) })}
                                className="mt-1 block w-full"
                            />
                            {errors?.['support.sla_hours'] && (
                                <p className="text-sm text-red-600 mt-1">{errors['support.sla_hours']}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="support.first_response_hours">First Response SLA (hours)</Label>
                            <TextInput
                                id="support.first_response_hours"
                                type="number"
                                min="1"
                                value={data.support?.first_response_hours ?? 4}
                                onChange={(e) =>
                                    setData('support', { ...data.support, first_response_hours: Number(e.target.value) })
                                }
                                className="mt-1 block w-full"
                            />
                            {errors?.['support.first_response_hours'] && (
                                <p className="text-sm text-red-600 mt-1">{errors['support.first_response_hours']}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
