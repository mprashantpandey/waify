import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ShieldCheck, Users, Zap } from 'lucide-react';
import { Button, Card, MarketingLayout } from '@/Components/Public/Marketing';

export default function About() {
    return (
        <MarketingLayout page="about" wide>
            <Head title="About" />
            <Card className="p-6 sm:p-8">
                <p className="max-w-3xl text-lg leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">
                    Zyptos helps teams operate WhatsApp from a workspace-first dashboard: one WABA connection per workspace, shared inbox, campaigns, templates, automations, AI agents, Meta Leads, Google integrations, and GST-ready billing.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-4">
                    {[
                        ['Workspace-first', 'Separate users, contacts, billing, automations, and permissions by workspace.'],
                        ['One WABA', 'Each workspace connects one WhatsApp Business number for clean routing.'],
                        ['Automation ready', 'Use visual flows, AI-agent nodes, handoff, test mode, and run history.'],
                        ['Billing ready', 'Use bank/UPI or Razorpay one-time payments with GST invoice PDFs.'],
                    ].map(([title, body]) => (
                        <div key={title} className="rounded-xl border border-gray-100 p-4 text-left dark:border-slate-800">
                            <div className="text-sm font-bold text-waify-text dark:text-waify-dark-text">{title}</div>
                            <p className="mt-2 text-xs leading-relaxed text-waify-text-muted">{body}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                    [Zap, 'Operations first', 'Every screen is designed for repeated campaign, inbox, and billing work.'],
                    [ShieldCheck, 'Meta-ready', 'Embedded signup, webhook checks, WABA diagnostics, template sync, and lead-form sync are first-class.'],
                    [Users, 'Workspace aware', 'Users, roles, billing, settings, activity, and admin visibility stay properly separated.'],
                ].map(([Icon, title, body]) => (
                    <Card key={title as string} className="mkt-card-lift p-5">
                        <Icon className="mb-4 h-6 w-6 text-waify-green-dark" />
                        <h2 className="font-semibold">{title as string}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-waify-text-muted dark:text-waify-dark-text-muted">{body as string}</p>
                    </Card>
                ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href={route('register')}><Button><ArrowRight className="h-4 w-4" /> Start free</Button></Link>
                <Link href={route('contact')}><Button variant="secondary">Contact us</Button></Link>
            </div>
        </MarketingLayout>
    );
}
