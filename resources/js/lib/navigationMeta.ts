export interface NavigationMeta {
    title: string;
    section: string;
    description: string;
    keywords?: string[];
    tips?: string[];
    quickActions?: Array<{
        label: string;
        route: string;
    }>;
}

export const NAVIGATION_META: Record<string, NavigationMeta> = {
    'app.dashboard': {
        title: 'Dashboard',
        section: 'Overview',
        description: 'Track setup progress, connection health, recent conversations, and the next actions that move your account forward.',
        keywords: ['overview', 'summary', 'setup', 'stats'],
        tips: ['Finish setup items first.', 'Watch connection health and alerts daily.', 'Use the quick widgets to jump into live work.'],
        quickActions: [
            { label: 'Open Inbox', route: 'app.whatsapp.conversations.index' },
            { label: 'View Connections', route: 'app.whatsapp.connections.index' },
        ],
    },
    'app.whatsapp.connections.index': {
        title: 'Connections',
        section: 'Messaging',
        description: 'Connect your WhatsApp numbers, see which ones are ready, and finish setup from one place.',
        keywords: ['whatsapp', 'phone number', 'setup', 'connection'],
        tips: ['Use clear names so your team can find the right number quickly.', 'Finish setup before creating templates or campaigns.', 'Open support if a number stays stuck.'],
        quickActions: [
            { label: 'Add Connection', route: 'app.whatsapp.connections.create' },
            { label: 'Open Templates', route: 'app.whatsapp.templates.index' },
        ],
    },
    'app.whatsapp.connections.create': {
        title: 'Add Connection',
        section: 'Messaging',
        description: 'Connect a WhatsApp Business Account and follow the guided steps to start using Zyptos.',
        keywords: ['connect', 'embedded signup', 'whatsapp setup'],
        tips: ['Choose the right onboarding path for a new or existing number.', 'Finish the Meta steps in one session if possible.', 'If setup stops, open support from the connection page.'],
        quickActions: [
            { label: 'Back to Connections', route: 'app.whatsapp.connections.index' },
        ],
    },
    'app.whatsapp.conversations.index': {
        title: 'Inbox',
        section: 'Messaging',
        description: 'Work live conversations, watch assignment changes, and keep unread counts and delivery states under control.',
        keywords: ['inbox', 'conversations', 'unread', 'assigned', 'messages'],
        tips: ['Reply from the newest unread threads first.', 'Recalculate unread if counts look stale.', 'Assignments should be explicit for busy teams.'],
        quickActions: [
            { label: 'Open Contacts', route: 'app.contacts.index' },
            { label: 'Open Templates', route: 'app.whatsapp.templates.index' },
        ],
    },
    'app.whatsapp.conversations.show': {
        title: 'Conversation',
        section: 'Messaging',
        description: 'Send replies, inspect delivery diagnostics, manage assignment, and work directly from the message timeline.',
        keywords: ['thread', 'conversation', 'delivery', 'assignment'],
        tips: ['Use templates outside the 24-hour window.', 'Check diagnostics before retrying failed sends.', 'Keep notes and ownership clear for handoffs.'],
        quickActions: [
            { label: 'Back to Inbox', route: 'app.whatsapp.conversations.index' },
        ],
    },
    'app.whatsapp.templates.index': {
        title: 'Templates',
        section: 'Messaging',
        description: 'Create, sync, review, and recover Meta templates, including hidden or missing ones that need attention.',
        keywords: ['templates', 'meta templates', 'approval', 'category', 'sync'],
        tips: ['Keep utility templates transactional.', 'Check the Recovery section for missing Meta rows.', 'Use exact failure diagnostics before editing content.'],
        quickActions: [
            { label: 'Create Template', route: 'app.whatsapp.templates.create' },
            { label: 'Open Broadcasts', route: 'app.broadcasts.index' },
        ],
    },
    'app.whatsapp.templates.create': {
        title: 'Create Template',
        section: 'Messaging',
        description: 'Prepare Meta-ready template content with the right category, media examples, and variables before submission.',
        keywords: ['create template', 'category', 'utility', 'marketing', 'media'],
        tips: ['Utility templates should be clearly transactional.', 'Media headers need valid samples.', 'Do not start or end body text with variables.'],
        quickActions: [
            { label: 'Back to Templates', route: 'app.whatsapp.templates.index' },
        ],
    },
    'app.broadcasts.index': {
        title: 'Broadcasts',
        section: 'Growth',
        description: 'Review campaigns, status rollups, blocked recipients, and recent sending performance in one place.',
        keywords: ['campaigns', 'broadcasts', 'bulk sends', 'preflight'],
        tips: ['Run preflight checks before every launch.', 'Blocked recipients usually signal consent or template issues.', 'Watch failure rollups after launch.'],
        quickActions: [
            { label: 'Create Campaign', route: 'app.broadcasts.create' },
            { label: 'Open Templates', route: 'app.whatsapp.templates.index' },
        ],
    },
    'app.broadcasts.create': {
        title: 'Create Campaign',
        section: 'Growth',
        description: 'Choose the audience, template, schedule, and guardrails before a broadcast goes live.',
        keywords: ['campaign', 'audience', 'schedule', 'send'],
        tips: ['Confirm template eligibility first.', 'Use tenant timezone when scheduling.', 'Review blocked-recipient reasons before launch.'],
        quickActions: [
            { label: 'Back to Broadcasts', route: 'app.broadcasts.index' },
            { label: 'Open Contacts', route: 'app.contacts.index' },
        ],
    },
    'app.contacts.index': {
        title: 'Contacts',
        section: 'Audience',
        description: 'Manage contact records, suppression state, tags, and segmentation before outreach or support operations.',
        keywords: ['contacts', 'suppression', 'segments', 'tags'],
        tips: ['Never market to suppressed contacts.', 'Keep consent notes clean and traceable.', 'Use filters before building campaigns.'],
        quickActions: [
            { label: 'Create Contact', route: 'app.contacts.create' },
            { label: 'Open Broadcasts', route: 'app.broadcasts.index' },
        ],
    },
    'app.team.index': {
        title: 'Team',
        section: 'Operations',
        description: 'Invite members, control access, and keep account ownership and inbox responsibility clear.',
        keywords: ['team', 'members', 'roles', 'invite'],
        tips: ['Keep ownership limited.', 'Use member role for inbox-only access.', 'Review role sprawl regularly.'],
        quickActions: [
            { label: 'Open Activity Logs', route: 'app.activity-logs' },
            { label: 'Open Settings', route: 'app.settings' },
        ],
    },
    'app.billing.index': {
        title: 'Billing',
        section: 'Billing',
        description: 'Handle renewals, past-due recovery, current plan status, invoices, and payment follow-up without leaving the page.',
        keywords: ['billing', 'renew', 'payment', 'invoice', 'subscription'],
        tips: ['Owners should resolve past-due states immediately.', 'Use paid invoices for record downloads.', 'Transactions explain most recovery issues.'],
        quickActions: [
            { label: 'Open Plans', route: 'app.billing.plans' },
            { label: 'Open Transactions', route: 'app.billing.transactions' },
        ],
    },
    'app.billing.history': {
        title: 'Billing History',
        section: 'Billing',
        description: 'Review paid, failed, and pending charges with the right recovery or reference action for each.',
        keywords: ['billing history', 'transactions', 'failed payment'],
        tips: ['Failed payments need recovery, not invoice download.', 'Use the latest paid invoice for accounts records.', 'Non-owners can review but not change billing.'],
        quickActions: [
            { label: 'Open Billing', route: 'app.billing.index' },
            { label: 'Open Plans', route: 'app.billing.plans' },
        ],
    },
    'app.billing.plans': {
        title: 'Plans',
        section: 'Billing',
        description: 'Compare plans, switch cleanly, and recover access without bouncing around multiple billing pages.',
        keywords: ['plans', 'upgrade', 'downgrade', 'renew'],
        tips: ['Owners can change plans directly.', 'Review billing recovery first if the account is blocked.', 'Plan changes should match actual usage, not guesswork.'],
        quickActions: [
            { label: 'Open Billing', route: 'app.billing.index' },
            { label: 'Open History', route: 'app.billing.history' },
        ],
    },
    'app.alerts.index': {
        title: 'Alerts',
        section: 'Operations',
        description: 'Review operational warnings, delivery failures, and recurring problems before they become customer-facing incidents.',
        keywords: ['alerts', 'failures', 'health', 'operations'],
        tips: ['Resolve queue and webhook issues first.', 'Use repeated failures as a signal, not noise.', 'Escalate anything that affects live sending.'],
        quickActions: [
            { label: 'Open Connections', route: 'app.whatsapp.connections.index' },
            { label: 'Open Inbox', route: 'app.whatsapp.conversations.index' },
        ],
    },
    'app.settings': {
        title: 'Settings',
        section: 'Operations',
        description: 'Update tenant-wide preferences, branding, billing behavior, and other operational settings in one place.',
        keywords: ['settings', 'preferences', 'tenant', 'configuration'],
        tips: ['Change only what you can explain later.', 'Keep defaults stable for the team.', 'Review integrations after major account changes.'],
        quickActions: [
            { label: 'Open Team', route: 'app.team.index' },
            { label: 'Open Billing', route: 'app.billing.index' },
        ],
    },
};

export const PAGE_META: Record<string, NavigationMeta> = {
    'App/Dashboard': NAVIGATION_META['app.dashboard'],
    'WhatsApp/Connections/Index': NAVIGATION_META['app.whatsapp.connections.index'],
    'WhatsApp/Connections/Create': NAVIGATION_META['app.whatsapp.connections.create'],
    'WhatsApp/Connections/Edit': NAVIGATION_META['app.whatsapp.connections.index'],
    'WhatsApp/Connections/EmbeddedWizard': NAVIGATION_META['app.whatsapp.connections.create'],
    'WhatsApp/Connections/HealthCheck': NAVIGATION_META['app.whatsapp.connections.index'],
    'WhatsApp/Connections/WebhookDiagnostics': NAVIGATION_META['app.whatsapp.connections.index'],
    'WhatsApp/Conversations/Index': NAVIGATION_META['app.whatsapp.conversations.index'],
    'WhatsApp/Conversations/Show': NAVIGATION_META['app.whatsapp.conversations.show'],
    'WhatsApp/Conversations/New': NAVIGATION_META['app.whatsapp.conversations.index'],
    'WhatsApp/Templates/Index': NAVIGATION_META['app.whatsapp.templates.index'],
    'WhatsApp/Templates/Create': NAVIGATION_META['app.whatsapp.templates.create'],
    'WhatsApp/Templates/Edit': NAVIGATION_META['app.whatsapp.templates.create'],
    'WhatsApp/Templates/Show': NAVIGATION_META['app.whatsapp.templates.index'],
    'WhatsApp/Templates/Send': NAVIGATION_META['app.whatsapp.templates.index'],
    'Broadcasts/Index': NAVIGATION_META['app.broadcasts.index'],
    'Broadcasts/Create': NAVIGATION_META['app.broadcasts.create'],
    'Broadcasts/Show': NAVIGATION_META['app.broadcasts.index'],
    'Contacts/Index': NAVIGATION_META['app.contacts.index'],
    'Contacts/Create': NAVIGATION_META['app.contacts.index'],
    'Contacts/Show': NAVIGATION_META['app.contacts.index'],
    'App/Team/Index': NAVIGATION_META['app.team.index'],
    'Billing/Index': NAVIGATION_META['app.billing.index'],
    'Billing/History': NAVIGATION_META['app.billing.history'],
    'Billing/Plans': NAVIGATION_META['app.billing.plans'],
    'Billing/Transactions': NAVIGATION_META['app.billing.history'],
    'Billing/PaymentDetails': NAVIGATION_META['app.billing.history'],
    'Billing/PastDue': NAVIGATION_META['app.billing.index'],
    'OperationalAlerts/Index': NAVIGATION_META['app.alerts.index'],
    'Settings/Index': NAVIGATION_META['app.settings'],
};

export function getNavigationMeta(routeName?: string | null): NavigationMeta | null {
    if (!routeName) return null;
    return NAVIGATION_META[routeName] ?? null;
}

export function getPageMeta(componentName?: string | null): NavigationMeta | null {
    if (!componentName) return null;
    return PAGE_META[componentName] ?? null;
}
