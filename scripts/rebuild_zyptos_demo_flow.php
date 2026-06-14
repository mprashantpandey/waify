<?php

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Modules\Chatbots\Models\Bot;
use App\Modules\Chatbots\Models\BotEdge;
use App\Modules\Chatbots\Models\BotFlow;
use App\Modules\Chatbots\Models\BotNode;
use Illuminate\Support\Facades\DB;

$accountId = 5;
$bot = Bot::where('account_id', $accountId)
    ->where(function ($query) {
        $query->where('name', 'Zyptos Deep Demo Assistant')
            ->orWhere('name', 'Zyptos Demo Menu - low noise');
    })
    ->first();

if (! $bot) {
    $bot = Bot::create(
    [
        'account_id' => $accountId,
        'name' => 'Zyptos Deep Demo Assistant',
        'status' => 'active',
        'description' => 'Deep Zyptos sales/support/payment/AI demo automation.',
        'applies_to' => ['all_connections' => true, 'connection_ids' => []],
        'stop_on_first_flow' => true,
    ]
    );
}

$bot->forceFill([
    'name' => 'Zyptos Deep Demo Assistant',
    'description' => 'Deep test automation for pricing, payment links, media, demo booking, AI agents, and handoff.',
    'status' => 'active',
    'applies_to' => ['all_connections' => true, 'connection_ids' => []],
    'stop_on_first_flow' => true,
])->save();

$salesAgentId = DB::table('ai_agents')->where('account_id', $accountId)->where('role', 'sales')->where('is_active', true)->value('id');
$supportAgentId = DB::table('ai_agents')->where('account_id', $accountId)->where('role', 'support')->where('is_active', true)->value('id');
$humanAgentId = DB::table('accounts')->where('id', $accountId)->value('owner_id');

DB::transaction(function () use ($accountId, $bot, $salesAgentId, $supportAgentId, $humanAgentId) {
    BotFlow::where('account_id', $accountId)->where('bot_id', $bot->id)->delete();

    $makeFlow = function (string $name, array $trigger, int $priority, array $nodes) use ($accountId, $bot) {
        $flow = BotFlow::create([
            'account_id' => $accountId,
            'bot_id' => $bot->id,
            'name' => $name,
            'trigger' => $trigger,
            'enabled' => true,
            'priority' => $priority,
        ]);

        $previous = null;
        foreach ($nodes as $index => $nodeData) {
            $node = BotNode::create([
                'account_id' => $accountId,
                'bot_flow_id' => $flow->id,
                'type' => $nodeData['type'] ?? 'action',
                'config' => array_merge($nodeData['config'] ?? [], $index === 0 ? ['is_start' => true] : []),
                'sort_order' => $index + 1,
                'pos_x' => $nodeData['x'] ?? (120 + ($index * 290)),
                'pos_y' => $nodeData['y'] ?? 180,
            ]);

            if ($previous) {
                BotEdge::create([
                    'account_id' => $accountId,
                    'bot_flow_id' => $flow->id,
                    'from_node_id' => $previous->id,
                    'to_node_id' => $node->id,
                    'label' => 'next',
                    'sort_order' => $index,
                ]);
            }

            $previous = $node;
        }
    };

    $makeFlow('Main menu - pricing/payment/AI', [
        'type' => 'keyword',
        'keywords' => ['hi', 'hello', 'menu', 'start', 'help'],
        'match_type' => 'any',
        'whole_word' => true,
        'case_sensitive' => false,
        'cooldown_minutes' => 2,
    ], 10, [[
        'config' => [
            'action_type' => 'send_buttons',
            'header_text' => 'Zyptos demo',
            'body_text' => "Welcome to Zyptos. Choose a quick test below.\n\nYou can also type: pricing, payment, image, demo, support, human.\n\nThis bot demonstrates deterministic automation first, then AI-agent replies when selected.",
            'footer_text' => 'Low-noise demo flow',
            'buttons' => [
                ['id' => 'show_pricing', 'text' => 'Pricing'],
                ['id' => 'pay_link', 'text' => 'Pay link'],
                ['id' => 'ai_agent', 'text' => 'AI agent'],
            ],
        ],
    ]]);

    $pricingNodes = [
        ['config' => ['action_type' => 'send_media', 'media_type' => 'image', 'media_url' => 'https://zyptos.com/demo/zyptos-overview.png', 'caption' => 'Zyptos overview: inbox, automation, broadcasts, AI agents, payments, and analytics.']],
        ['config' => ['action_type' => 'send_text', 'message' => "Zyptos pricing test:\n\nStarter: WhatsApp CRM basics.\nGrowth: automation, broadcasts, AI agents, reports.\nScale: routing, webhooks, integrations.\n\nPricing page: https://zyptos.com/pricing\n\nReply payment to generate a Razorpay payment link, demo to book a walkthrough, or ai to let the sales AI qualify you."]],
        ['config' => ['action_type' => 'add_tag', 'tag_name' => 'Pricing Interest', 'color' => '#10B981']],
        ['config' => ['action_type' => 'create_deal', 'title' => 'Zyptos pricing lead', 'stage' => 'qualified', 'value' => 49900, 'currency' => 'INR', 'source' => 'chatbot_pricing_flow']],
        ['config' => ['action_type' => 'ai_agent_reply', 'agent_id' => $salesAgentId, 'agent_role' => 'sales', 'instruction' => 'Act as Zyptos sales agent. Ask one concise qualification question and recommend the best next step: demo, payment link, or human callback.']],
    ];

    $paymentNodes = [
        ['config' => ['action_type' => 'send_text', 'message' => 'Creating a Zyptos test payment link for INR 499. If Razorpay workspace credentials are configured, this will be a real dynamic link. Otherwise it falls back to the pricing page.']],
        ['config' => ['action_type' => 'send_payment_link', 'create_razorpay_link' => true, 'fallback_payment_url' => 'https://zyptos.com/pricing', 'amount' => 49900, 'currency' => 'INR', 'description' => 'Zyptos demo payment', 'message' => 'Here is your Zyptos payment link for {{currency}} {{amount}}: {{payment_url}}']],
        ['config' => ['action_type' => 'add_tag', 'tag_name' => 'Payment Intent', 'color' => '#F59E0B']],
        ['config' => ['action_type' => 'ai_agent_reply', 'agent_id' => $salesAgentId, 'agent_role' => 'sales', 'instruction' => 'The customer asked for payment. Explain what happens after payment and ask if they want onboarding help.']],
    ];

    $aiSalesNodes = [[
        'config' => ['action_type' => 'ai_agent_reply', 'agent_id' => $salesAgentId, 'agent_role' => 'sales', 'instruction' => 'You are Zyptos Sales Agent. Qualify the lead for WhatsApp CRM, automation, broadcasts, AI agents, payments, ecommerce recovery, and WABA setup. Be concise and ask one next-step question.'],
    ]];

    $makeFlow('Pricing path - media + deal + AI sales', [
        'type' => 'keyword',
        'keywords' => ['pricing', 'price', 'plans', 'show_pricing'],
        'match_type' => 'any',
        'whole_word' => false,
        'case_sensitive' => false,
    ], 20, $pricingNodes);

    $makeFlow('Button - pricing path', [
        'type' => 'button_reply',
        'button_id' => 'show_pricing',
    ], 21, $pricingNodes);

    $makeFlow('Payment path - dynamic Razorpay link', [
        'type' => 'keyword',
        'keywords' => ['payment', 'pay', 'checkout', 'pay_link', 'razorpay'],
        'match_type' => 'any',
        'whole_word' => false,
        'case_sensitive' => false,
    ], 30, $paymentNodes);

    $makeFlow('Button - payment path', [
        'type' => 'button_reply',
        'button_id' => 'pay_link',
    ], 31, $paymentNodes);

    $makeFlow('AI sales agent transfer', [
        'type' => 'keyword',
        'keywords' => ['ai', 'ai_agent', 'sales agent', 'sales ai', 'agent'],
        'match_type' => 'any',
        'whole_word' => false,
        'case_sensitive' => false,
    ], 40, $aiSalesNodes);

    $makeFlow('Button - AI sales agent transfer', [
        'type' => 'button_reply',
        'button_id' => 'ai_agent',
    ], 41, $aiSalesNodes);

    $makeFlow('Media/features brochure path', [
        'type' => 'keyword',
        'keywords' => ['image', 'brochure', 'features', 'feature', 'see_features'],
        'match_type' => 'any',
        'whole_word' => false,
        'case_sensitive' => false,
    ], 50, [
        ['config' => ['action_type' => 'send_media', 'media_type' => 'image', 'media_url' => 'https://zyptos.com/demo/zyptos-overview.png', 'caption' => 'Zyptos feature snapshot.']],
        ['config' => ['action_type' => 'send_text', 'message' => "Feature map:\n- Shared WhatsApp inbox\n- Chatbots and automation builder\n- AI sales/support agents\n- Broadcasts and templates\n- Leads, contacts, tags, deals\n- Payment links and ecommerce recovery\n- WABA health diagnostics\n\nReply ai for the sales AI or pricing for plans."]],
    ]);

    $makeFlow('Demo booking path', [
        'type' => 'keyword',
        'keywords' => ['demo', 'book demo', 'book_demo', 'walkthrough', 'call'],
        'match_type' => 'any',
        'whole_word' => false,
        'case_sensitive' => false,
    ], 60, [
        ['config' => ['action_type' => 'add_tag', 'tag_name' => 'Demo Requested', 'color' => '#3B82F6']],
        ['config' => ['action_type' => 'create_deal', 'title' => 'Zyptos demo request', 'stage' => 'demo_requested', 'value' => 0, 'currency' => 'INR', 'source' => 'chatbot_demo_flow']],
        ['config' => ['action_type' => 'send_text', 'message' => 'Demo request captured. Please reply with your company name, team size, and preferred time. A human can take over, or the AI sales agent can qualify you now.']],
        ['config' => ['action_type' => 'ai_agent_reply', 'agent_id' => $salesAgentId, 'agent_role' => 'sales', 'instruction' => 'The customer wants a demo. Ask for company name, use case, team size, and preferred time in one concise message.']],
    ]);

    $handoff = ['action_type' => 'handoff', 'priority' => 'high', 'status' => 'open', 'reason' => 'Customer requested human/support help'];
    if ($humanAgentId) {
        $handoff['agent_id'] = (int) $humanAgentId;
    }

    $makeFlow('Support/human path - AI support then handoff', [
        'type' => 'keyword',
        'keywords' => ['support', 'help me', 'human', 'talk_human', 'agent support', 'issue', 'problem'],
        'match_type' => 'any',
        'whole_word' => false,
        'case_sensitive' => false,
    ], 70, [
        ['config' => ['action_type' => 'add_tag', 'tag_name' => 'Support Needed', 'color' => '#EF4444']],
        ['config' => ['action_type' => 'ai_agent_reply', 'agent_id' => $supportAgentId, 'agent_role' => 'support', 'instruction' => 'You are Zyptos Support Agent. Triage the problem, ask for the exact issue and screenshot/error if needed, and mention that a human handoff has been marked.']],
        ['config' => $handoff],
    ]);
});

echo "Bot {$bot->id} rebuilt with deep flows.\n";
foreach (BotFlow::where('account_id', $accountId)->where('bot_id', $bot->id)->orderBy('priority')->withCount('nodes')->get() as $flow) {
    echo "{$flow->id}: {$flow->name} nodes={$flow->nodes_count} priority={$flow->priority}\n";
}
