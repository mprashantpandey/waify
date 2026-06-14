<?php

namespace App\Services;

use App\Models\Plan;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Route;

class SeoService
{
    public function __construct(
        protected BrandingService $branding,
        protected PlatformSettingsService $settings,
    ) {}

    public function page(string $key, array $overrides = []): array
    {
        $pages = $this->pages();
        $page = $pages[$key] ?? $pages['landing'];

        $payload = array_replace_recursive($this->defaults(), $page, $overrides);
        $payload['url'] = $this->absoluteUrl($payload['path'] ?? '/');
        $payload['canonical'] = $payload['canonical'] ?? $payload['url'];
        $payload['image'] = $this->absoluteUrl($payload['image'] ?? '/images/marketing/zyptos-hero-dashboard.png');
        $payload['site_name'] = $this->platformName();
        $payload['locale'] = str_replace('-', '_', app()->getLocale() ?: 'en');
        $payload['robots'] = $payload['robots'] ?? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
        $payload['schemas'] = $this->schemasFor($key, $payload);

        unset($payload['path']);

        return $payload;
    }

    public function sitemapUrls(): Collection
    {
        return collect($this->pages())
            ->filter(fn (array $page) => ($page['sitemap'] ?? true) === true)
            ->map(fn (array $page) => [
                'loc' => $this->absoluteUrl($page['path']),
                'lastmod' => now()->toDateString(),
                'changefreq' => $page['changefreq'] ?? 'weekly',
                'priority' => $page['priority'] ?? '0.7',
            ])
            ->values();
    }

    public function pages(): array
    {
        return [
            'landing' => [
                'path' => '/',
                'title' => 'Zyptos | WhatsApp Marketing Platform for Sales, Support & Automation',
                'description' => 'Zyptos helps teams run WhatsApp campaigns, shared inbox, Meta templates, AI agents, automations, payments, leads, and support from one workspace.',
                'keywords' => 'WhatsApp marketing platform, WhatsApp Business API, WABA, WhatsApp automation, WhatsApp CRM, WhatsApp campaigns, Meta Leads',
                'type' => 'website',
                'priority' => '1.0',
                'changefreq' => 'daily',
            ],
            'pricing' => [
                'path' => '/pricing',
                'title' => 'Zyptos Pricing | WhatsApp Business Platform Plans',
                'description' => 'Compare Zyptos Starter, Pro, Business, and Enterprise plans for WhatsApp inbox, campaigns, automation, AI agents, billing, and integrations.',
                'keywords' => 'Zyptos pricing, WhatsApp marketing pricing, WhatsApp automation plan, WABA platform pricing',
                'priority' => '0.95',
                'changefreq' => 'daily',
            ],
            'about' => [
                'path' => '/about',
                'title' => 'About Zyptos | WhatsApp Operations Platform',
                'description' => 'Learn how Zyptos helps businesses manage WhatsApp sales, support, automation, campaigns, payments, and Meta integrations.',
                'priority' => '0.75',
            ],
            'contact' => [
                'path' => '/contact',
                'title' => 'Contact Zyptos | Sales, Support & WhatsApp Setup',
                'description' => 'Contact Zyptos for WhatsApp Business API setup, pricing, demos, migration help, billing, and platform support.',
                'priority' => '0.85',
            ],
            'faqs' => [
                'path' => '/faqs',
                'title' => 'Zyptos FAQs | WhatsApp API, Billing, Automations & Integrations',
                'description' => 'Answers about Zyptos workspaces, WhatsApp Business API setup, Meta templates, billing, AI agents, automations, QR mode, and integrations.',
                'priority' => '0.8',
            ],
            'knowledgebase' => [
                'path' => '/knowledge-base',
                'title' => 'Zyptos Knowledge Base | Setup Guides & Best Practices',
                'description' => 'Practical Zyptos guides for WhatsApp setup, campaigns, automations, Meta Leads, Google integrations, billing, permissions, and security.',
                'priority' => '0.8',
            ],
            'docs' => [
                'path' => '/docs',
                'title' => 'Zyptos Documentation | Workspace, Meta & Automation Guides',
                'description' => 'Documentation for Zyptos workspace setup, WhatsApp Cloud API, integrations, automations, payments, APIs, and operational safety.',
                'priority' => '0.75',
            ],
            'roadmap' => [
                'path' => '/roadmap',
                'title' => 'Zyptos Roadmap | Customer-Focused WhatsApp Platform Updates',
                'description' => 'See what Zyptos has shipped, what is improving next, and planned customer-facing upgrades for WhatsApp operations.',
                'priority' => '0.65',
            ],
            'help' => [
                'path' => '/help',
                'title' => 'Zyptos Help Center | WhatsApp Setup, Billing & Support',
                'description' => 'Get help with Zyptos WhatsApp setup, templates, campaigns, automations, payments, integrations, and troubleshooting.',
                'priority' => '0.75',
            ],
            'security' => [
                'path' => '/security',
                'title' => 'Zyptos Security | Access Control, Audit Logs & Data Protection',
                'description' => 'Review Zyptos security practices for encryption, role-based access, audit logs, credentials, webhooks, sessions, and incident readiness.',
                'priority' => '0.65',
            ],
            'privacy' => [
                'path' => '/privacy',
                'title' => 'Zyptos Privacy Policy',
                'description' => 'Read how Zyptos handles account, workspace, contact, billing, Meta, integration, support, and analytics data.',
                'priority' => '0.5',
                'changefreq' => 'monthly',
            ],
            'terms' => [
                'path' => '/terms',
                'title' => 'Zyptos Terms of Service',
                'description' => 'Terms for using Zyptos workspaces, WhatsApp Business API tools, campaigns, AI, payments, billing, and integrations.',
                'priority' => '0.5',
                'changefreq' => 'monthly',
            ],
            'refund' => [
                'path' => '/refund-policy',
                'title' => 'Zyptos Refund and Cancellation Policy',
                'description' => 'Understand Zyptos cancellations, renewals, payment proof review, invoice handling, and refund request process.',
                'priority' => '0.45',
                'changefreq' => 'monthly',
            ],
            'acceptableUse' => [
                'path' => '/acceptable-use',
                'title' => 'Zyptos Acceptable Use Policy',
                'description' => 'Messaging and automation rules for responsible Zyptos use, consent, opt-outs, campaigns, templates, and Meta policy compliance.',
                'priority' => '0.45',
                'changefreq' => 'monthly',
            ],
            'qrDisclaimer' => [
                'path' => '/qr-disclaimer',
                'title' => 'Zyptos QR WhatsApp Disclaimer',
                'description' => 'Important disclaimer for Zyptos unofficial WhatsApp QR connection mode, safety limits, and production Cloud API recommendation.',
                'priority' => '0.4',
                'changefreq' => 'monthly',
            ],
            'gdpr' => [
                'path' => '/gdpr',
                'title' => 'Zyptos GDPR Information',
                'description' => 'GDPR information for Zyptos customers, including data rights, processing, exports, deletion, and subprocessors.',
                'priority' => '0.4',
                'changefreq' => 'monthly',
            ],
            'cookies' => [
                'path' => '/cookies',
                'title' => 'Zyptos Cookie Policy',
                'description' => 'How Zyptos uses essential cookies, session cookies, preferences, and optional analytics cookies.',
                'priority' => '0.4',
                'changefreq' => 'monthly',
            ],
        ];
    }

    protected function defaults(): array
    {
        return [
            'title' => $this->platformName(),
            'description' => 'Zyptos is a WhatsApp marketing and operations platform for sales, support, campaigns, automations, AI agents, and integrations.',
            'keywords' => 'Zyptos, WhatsApp marketing, WhatsApp Business API',
            'image' => '/images/marketing/zyptos-hero-dashboard.png',
            'twitter_card' => 'summary_large_image',
            'type' => 'website',
        ];
    }

    protected function schemasFor(string $key, array $page): array
    {
        $schemas = [
            $this->organizationSchema(),
            $this->websiteSchema(),
            $this->softwareApplicationSchema(),
            $this->breadcrumbSchema($page),
        ];

        if ($key === 'pricing') {
            $schemas[] = $this->productSchema();
        }

        if ($key === 'faqs') {
            $schemas[] = $this->faqSchema();
        }

        return array_values(array_filter($schemas));
    }

    protected function organizationSchema(): array
    {
        $logo = $this->absoluteUrl($this->branding->getLogoUrl() ?: '/images/brand/zyptos-logo-dark.png');
        $sameAs = array_values(array_filter([
            $this->settings->get('branding.linkedin_url'),
            $this->settings->get('branding.facebook_url'),
            $this->settings->get('branding.instagram_url'),
            $this->settings->get('branding.youtube_url'),
        ]));

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            '@id' => $this->absoluteUrl('/#organization'),
            'name' => $this->platformName(),
            'url' => $this->absoluteUrl('/'),
            'logo' => $logo,
            'image' => $logo,
            'email' => $this->settings->get('branding.support_email') ?: $this->settings->get('general.support_email'),
            'telephone' => $this->settings->get('branding.support_phone') ?: '+91 94106 50131',
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => 'Ghanshyam Colony',
                'addressLocality' => 'Pilibhit',
                'addressRegion' => 'Uttar Pradesh',
                'addressCountry' => 'IN',
            ],
            'sameAs' => $sameAs ?: null,
        ]);
    }

    protected function websiteSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => $this->absoluteUrl('/#website'),
            'name' => $this->platformName(),
            'url' => $this->absoluteUrl('/'),
            'publisher' => ['@id' => $this->absoluteUrl('/#organization')],
            'inLanguage' => 'en-IN',
        ];
    }

    protected function softwareApplicationSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            '@id' => $this->absoluteUrl('/#software'),
            'name' => $this->platformName(),
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web, Android, iOS',
            'url' => $this->absoluteUrl('/'),
            'description' => $this->defaults()['description'],
            'publisher' => ['@id' => $this->absoluteUrl('/#organization')],
            'offers' => [
                '@type' => 'Offer',
                'priceCurrency' => 'INR',
                'price' => $this->lowestPlanPrice(),
                'availability' => 'https://schema.org/InStock',
                'url' => $this->absoluteUrl('/pricing'),
            ],
        ];
    }

    protected function productSchema(): array
    {
        $offers = Plan::query()
            ->where('is_active', true)
            ->whereNotIn('key', ['free', 'enterprise'])
            ->orderBy('price_monthly')
            ->get()
            ->map(fn (Plan $plan) => [
                '@type' => 'Offer',
                'name' => $plan->name,
                'description' => $plan->description,
                'priceCurrency' => strtoupper((string) ($plan->currency ?: $this->settings->get('payment.default_currency', 'INR'))),
                'price' => number_format(((int) $plan->price_monthly) / 100, 2, '.', ''),
                'availability' => 'https://schema.org/InStock',
                'url' => $this->absoluteUrl('/pricing'),
            ])
            ->values()
            ->all();

        return [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            '@id' => $this->absoluteUrl('/pricing#plans'),
            'name' => 'Zyptos WhatsApp Business Platform',
            'description' => 'Per-workspace WhatsApp inbox, campaigns, automations, AI agents, billing, and integrations.',
            'brand' => ['@id' => $this->absoluteUrl('/#organization')],
            'offers' => [
                '@type' => 'AggregateOffer',
                'priceCurrency' => 'INR',
                'lowPrice' => $this->lowestPlanPrice(),
                'offerCount' => max(count($offers), 1),
                'offers' => $offers,
            ],
        ];
    }

    protected function faqSchema(): array
    {
        $items = [
            ['Do I need my own WhatsApp Business Account?', 'Yes. Zyptos connects to your Meta WABA and guides you through phone registration, templates, webhooks, and team setup.'],
            ['How many WhatsApp numbers can one workspace connect?', 'One workspace connects one WhatsApp Business number. Use another workspace for another brand, client, or number.'],
            ['Are Meta conversation charges included?', 'No. Zyptos subscription fees and Meta conversation charges are separate. Meta charges depend on your WABA, country, and category.'],
            ['Can automations hand over to a human?', 'Yes. Zyptos flows can assign a chat, pause the bot, show status in the inbox, and let agents take over manually.'],
            ['Can I use my own AI and Razorpay keys?', 'Yes. Workspace owners can add workspace credentials where available, while Zyptos billing uses platform billing credentials.'],
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $item) => [
                '@type' => 'Question',
                'name' => $item[0],
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $item[1],
                ],
            ], $items),
        ];
    }

    protected function breadcrumbSchema(array $page): ?array
    {
        $url = $page['url'] ?? $this->absoluteUrl('/');
        if ($url === $this->absoluteUrl('/')) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => [
                [
                    '@type' => 'ListItem',
                    'position' => 1,
                    'name' => 'Home',
                    'item' => $this->absoluteUrl('/'),
                ],
                [
                    '@type' => 'ListItem',
                    'position' => 2,
                    'name' => Arr::get($page, 'title', $this->platformName()),
                    'item' => $url,
                ],
            ],
        ];
    }

    protected function lowestPlanPrice(): string
    {
        $price = Plan::query()
            ->where('is_active', true)
            ->whereNotIn('key', ['free', 'enterprise'])
            ->min('price_monthly');

        return number_format(((int) $price) / 100, 2, '.', '');
    }

    protected function platformName(): string
    {
        return $this->branding->getPlatformName() ?: 'Zyptos';
    }

    protected function absoluteUrl(string $path): string
    {
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $base = rtrim((string) ($this->settings->get('general.platform_url') ?: config('app.url') ?: url('/')), '/');

        return $base.'/'.ltrim($path, '/');
    }
}
