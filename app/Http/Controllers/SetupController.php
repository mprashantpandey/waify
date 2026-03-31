<?php

namespace App\Http\Controllers;

use App\Core\Billing\PlanResolver;
use App\Models\AccountUser;
use App\Models\AiKnowledgeItem;
use App\Modules\Broadcasts\Models\Campaign;
use App\Modules\Chatbots\Models\Bot;
use App\Modules\Ecommerce\Models\EcommerceProduct;
use App\Modules\WhatsApp\Models\WhatsAppConnection;
use App\Modules\WhatsApp\Models\WhatsAppConversation;
use App\Modules\WhatsApp\Models\WhatsAppContact;
use App\Modules\WhatsApp\Models\WhatsAppTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    public function __construct(
        protected PlanResolver $planResolver,
    ) {
    }

    public function index(Request $request): Response
    {
        $account = $request->attributes->get('account') ?? current_account();
        $user = $request->user();

        $availableModules = array_flip($this->planResolver->getAvailableModules($account));

        return Inertia::render('App/Setup', [
            'current_plan' => optional($this->planResolver->getAccountPlan($account))->only(['key', 'name']),
            'checklist' => $this->buildChecklist($account, $user),
            'features' => $this->buildFeatureStatuses($account, $availableModules),
        ]);
    }

    protected function buildChecklist($account, $user): array
    {
        $isPhoneVerifiedRequired = (bool) ($account->phone_verification_required ?? false);
        $isProfileComplete = !empty($user?->name) && !empty($user?->email) && !empty($user?->phone)
            && (!$isPhoneVerifiedRequired || !empty($user?->phone_verified_at));

        $hasConnection = WhatsAppConnection::query()->where('account_id', $account->id)->exists();
        $hasHealthyConnection = WhatsAppConnection::query()
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->where('webhook_subscribed', true)
            ->whereNull('webhook_last_error')
            ->exists();
        $hasTemplate = WhatsAppTemplate::query()->where('account_id', $account->id)->exists();
        $hasApprovedTemplate = WhatsAppTemplate::query()
            ->where('account_id', $account->id)
            ->where('status', 'approved')
            ->exists();
        $hasConversation = WhatsAppConversation::query()->where('account_id', $account->id)->exists();
        $hasTeamMember = AccountUser::query()
            ->where('account_id', $account->id)
            ->when($account->owner_id, fn ($query) => $query->where('user_id', '!=', $account->owner_id))
            ->exists();

        $items = [
            [
                'key' => 'profile',
                'label' => 'Complete your profile',
                'done' => $isProfileComplete,
                'href' => route('profile.edit'),
                'cta' => 'Open profile',
            ],
            [
                'key' => 'connection',
                'label' => 'Connect WhatsApp',
                'done' => $hasConnection,
                'href' => route('app.whatsapp.connections.create'),
                'cta' => 'Add number',
            ],
            [
                'key' => 'team',
                'label' => 'Invite a teammate',
                'done' => $hasTeamMember,
                'href' => route('app.team.index'),
                'cta' => 'Open team',
            ],
            [
                'key' => 'template',
                'label' => 'Create a template',
                'done' => $hasTemplate,
                'href' => route('app.whatsapp.templates.create'),
                'cta' => 'Create template',
            ],
            [
                'key' => 'template_approval',
                'label' => 'Get one template approved',
                'done' => $hasApprovedTemplate,
                'href' => route('app.whatsapp.templates.index'),
                'cta' => 'Review templates',
            ],
            [
                'key' => 'inbox',
                'label' => 'Send a test message',
                'done' => $hasHealthyConnection && $hasConversation,
                'href' => route('app.whatsapp.conversations.index'),
                'cta' => 'Open inbox',
            ],
        ];

        $completed = collect($items)->where('done', true)->count();

        return [
            'completed' => $completed,
            'total' => count($items),
            'progress_percent' => (int) floor(($completed / max(1, count($items))) * 100),
            'items' => $items,
        ];
    }

    protected function buildFeatureStatuses($account, array $availableModules): array
    {
        $connectionsCount = WhatsAppConnection::query()->where('account_id', $account->id)->count();
        $healthyConnections = WhatsAppConnection::query()
            ->where('account_id', $account->id)
            ->where('is_active', true)
            ->where('webhook_subscribed', true)
            ->whereNull('webhook_last_error')
            ->count();
        $templatesCount = WhatsAppTemplate::query()->where('account_id', $account->id)->count();
        $approvedTemplates = WhatsAppTemplate::query()
            ->where('account_id', $account->id)
            ->where('status', 'approved')
            ->count();
        $contactsCount = WhatsAppContact::query()->where('account_id', $account->id)->count();
        $campaignsCount = Campaign::query()->where('account_id', $account->id)->count();
        $botCount = class_exists(Bot::class)
            ? Bot::query()->where('account_id', $account->id)->count()
            : 0;
        $aiEnabled = (bool) ($account->ai_auto_reply_enabled ?? false);
        $knowledgeCount = AiKnowledgeItem::query()->where('account_id', $account->id)->count();
        $productCount = class_exists(EcommerceProduct::class)
            ? EcommerceProduct::query()->where('account_id', $account->id)->count()
            : 0;

        return [
            $this->featureCard(
                'whatsapp.cloud',
                'WhatsApp numbers',
                'Connect at least one number so your team can send and receive messages.',
                isset($availableModules['whatsapp.cloud']),
                $connectionsCount > 0 ? ($healthyConnections > 0 ? 'ready' : 'attention') : 'setup',
                $connectionsCount > 0
                    ? ($healthyConnections > 0 ? 'Ready to use' : 'Connected, but needs one more check')
                    : 'No number connected yet',
                route('app.whatsapp.connections.index'),
                $connectionsCount > 0 ? 'Review numbers' : 'Add number',
            ),
            $this->featureCard(
                'templates',
                'Templates',
                'Approved templates are required for broadcasts and messages outside the open chat window.',
                isset($availableModules['templates']),
                $approvedTemplates > 0 ? 'ready' : ($templatesCount > 0 ? 'attention' : 'setup'),
                $approvedTemplates > 0 ? 'At least one approved template is ready' : ($templatesCount > 0 ? 'Templates exist but still need approval' : 'No template created yet'),
                route('app.whatsapp.templates.index'),
                $templatesCount > 0 ? 'Review templates' : 'Create template',
            ),
            $this->featureCard(
                'broadcasts',
                'Campaigns',
                'Use campaigns when you have an approved template and an audience to send to.',
                isset($availableModules['broadcasts']),
                $campaignsCount > 0 ? 'ready' : ($approvedTemplates > 0 && $contactsCount > 0 ? 'setup' : 'blocked'),
                $campaignsCount > 0 ? 'Campaigns are available' : ($approvedTemplates > 0 && $contactsCount > 0 ? 'Ready for your first campaign' : 'Needs templates and contacts first'),
                route('app.broadcasts.index'),
                'Open campaigns',
            ),
            $this->featureCard(
                'automation.chatbots',
                'Chatbots',
                'Automate common replies and handoffs when your inbox starts getting repetitive work.',
                isset($availableModules['automation.chatbots']),
                $botCount > 0 ? 'ready' : 'setup',
                $botCount > 0 ? 'Reply flows are configured' : 'No chatbot flow configured yet',
                route('app.chatbots'),
                $botCount > 0 ? 'Open chatbots' : 'Set up chatbot',
            ),
            $this->featureCard(
                'ai',
                'AI assistant',
                'Use AI for reply help or automatic responses with your own approved answers.',
                isset($availableModules['ai']),
                $aiEnabled ? 'ready' : ($knowledgeCount > 0 ? 'setup' : 'setup'),
                $aiEnabled ? 'AI auto-reply is enabled' : ($knowledgeCount > 0 ? 'Knowledge base is ready, but auto-reply is off' : 'No AI setup yet'),
                route('app.ai.index'),
                'Open AI',
            ),
            $this->featureCard(
                'ecommerce',
                'Commerce',
                'Add products and collect orders through WhatsApp commerce conversations.',
                isset($availableModules['ecommerce']),
                $productCount > 0 ? 'ready' : 'setup',
                $productCount > 0 ? 'Product catalog is ready' : 'No products added yet',
                route('app.ecommerce.index'),
                $productCount > 0 ? 'Open commerce' : 'Add products',
            ),
        ];
    }

    protected function featureCard(
        string $key,
        string $label,
        string $description,
        bool $available,
        string $state,
        string $summary,
        string $href,
        string $cta,
    ): array {
        return [
            'key' => $key,
            'label' => $label,
            'description' => $description,
            'available' => $available,
            'state' => $available ? $state : 'locked',
            'summary' => $available ? $summary : 'Not included in your plan',
            'href' => $href,
            'cta' => $available ? $cta : 'View plans',
        ];
    }
}
